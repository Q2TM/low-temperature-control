import { parse } from "yaml";

import { environment } from "@/environment";

import { configSchema, SimEnvConfig } from "./types";

const configRaw = await Bun.file(environment.CONFIG_FILE).text();

const allConfigs = configSchema.parse(parse(configRaw));

class Simulator {
  currentTemperature: number;
  heaterOutput = 0;

  constructor(
    readonly config: SimEnvConfig,
    readonly intervalSec = 0.2, // 0.2 seconds
  ) {
    this.currentTemperature = config.externalTemperature;

    setInterval(() => this.loop(), this.intervalSec * 1000);
  }

  private loop() {
    const power =
      -this.config.coolerPower +
      (this.config.externalTemperature - this.currentTemperature) *
        this.config.heatDissipation +
      this.heaterOutput * this.config.heaterPower;

    this.currentTemperature += power * this.intervalSec;
  }

  getTemperature() {
    return this.currentTemperature;
  }

  setHeaterOutput(value: number) {
    this.heaterOutput = Math.max(0, Math.min(1, value));
  }
}

export const simulators = allConfigs.environments.map(
  (config) => new Simulator(config),
);

/**
 * @returns temperature in celcius, or undefined if simulator with given channel not found
 */
export function getTemperature(channel: number) {
  const sim = simulators.find((s) => s.config.lakeshoreChannel === channel);

  return sim?.getTemperature();
}

/**
 * @returns true if successful, false if simulator with given pin not found
 */
export function setHeaterOutput(pin: number, value: number) {
  const sim = simulators.find((s) => s.config.gpioPin === pin);

  if (!sim) return false;

  sim.setHeaterOutput(value);
  return true;
}
