import { Value } from "@sinclair/typebox/value";
import { parse } from "yaml";

import { environment } from "@/environment";

import { configSchema, SimEnvConfig } from "./config";
import { SimState } from "./types";

const configRaw = await Bun.file(environment.CONFIG_FILE).text();

const allConfigs = Value.Parse(configSchema, parse(configRaw));

const thermoMap = new Map<number, Simulator>();
const heaterMap = new Map<number, Simulator>();

const enabledConfigs = allConfigs.environments.filter(
  (config) => config.enabled,
);

if (enabledConfigs.length === 0) {
  throw new Error("No enabled environments found in configuration");
}

function posKey(x: number, y: number): string {
  return `${x},${y}`;
}

class Simulator {
  readonly temperature = new Map<string, number>(); // "x,y" -> temperature
  readonly heaterOutput = new Map<number, number>(); // pin -> output (0 to 1)

  constructor(
    readonly config: SimEnvConfig,
    readonly intervalSec = 0.2, // 0.2 seconds
  ) {
    const [width, height] = this.config.size;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.temperature.set(posKey(x, y), this.config.externalTemperature);
      }
    }

    setInterval(() => this.loop(), this.intervalSec * 1000);
  }

  private loop() {
    const [width, height] = this.config.size;
    const tempDiffs = new Map<string, number>();

    // Calculate all temperature differences first
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const key = posKey(x, y);
        const currentTemp = this.temperature.get(key)!;
        let diff = 0;

        // Check if this tile has a heater
        const heater = this.config.instruments.find(
          (inst) =>
            inst.type === "heater" &&
            inst.position[0] === x &&
            inst.position[1] === y,
        );

        if (heater && heater.type === "heater") {
          const heaterOutput = this.heaterOutput.get(heater.heaterPin) ?? 0;
          diff += heaterOutput * heater.heaterPower * this.intervalSec;
        }

        // External temperature difference
        diff +=
          (this.config.externalTemperature - currentTemp) *
          this.config.externalConductivity *
          this.intervalSec;

        // Adjacent tiles (4 directions)
        const adjacentPositions = [
          [x - 1, y], // left
          [x + 1, y], // right
          [x, y - 1], // up
          [x, y + 1], // down
        ] as [number, number][];

        for (const [adjX, adjY] of adjacentPositions) {
          // Check boundaries
          if (adjX >= 0 && adjX < width && adjY >= 0 && adjY < height) {
            const adjacentTemp = this.temperature.get(posKey(adjX, adjY))!;
            diff +=
              (adjacentTemp - currentTemp) *
              this.config.internalConductivity *
              this.intervalSec;
          }
        }

        tempDiffs.set(key, diff);
      }
    }

    // Apply all temperature changes
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const key = posKey(x, y);
        const currentTemp = this.temperature.get(key)!;
        const diff = tempDiffs.get(key)!;
        this.temperature.set(key, currentTemp + diff);
      }
    }
  }

  getTemperature(channel: number) {
    const instrument = this.config.instruments.find(
      (inst) => inst.type === "thermometer" && inst.thermoChannel === channel,
    );
    if (!instrument) return undefined;
    return this.temperature.get(posKey(...instrument.position));
  }

  setHeaterOutput(pin: number, value: number) {
    this.heaterOutput.set(pin, Math.max(0, Math.min(1, value)));
  }

  getState() {
    const [width, height] = this.config.size;
    const state: number[][] = [];
    for (let x = 0; x < width; x++) {
      const row: number[] = [];
      for (let y = 0; y < height; y++) {
        row.push(this.temperature.get(posKey(x, y))!);
      }
      state.push(row);
    }
    return { config: this.config, state } satisfies SimState;
  }
}

export const simulators = enabledConfigs.map((config) => {
  const sim = new Simulator(config);

  const [width, height] = config.size;

  config.instruments.forEach((instrument) => {
    const [x, y] = instrument.position;

    // Validate position is within bounds
    if (x < 0 || x >= width || y < 0 || y >= height) {
      throw new Error(
        `Instrument "${instrument.name}" at position [${x}, ${y}] is out of bounds ` +
          `for environment "${config.name}" with size [${width}, ${height}]`,
      );
    }

    if (instrument.type === "thermometer") {
      if (thermoMap.has(instrument.thermoChannel)) {
        throw new Error(
          `Duplicate thermometer channel ${instrument.thermoChannel} found in environment "${config.name}"`,
        );
      }
      thermoMap.set(instrument.thermoChannel, sim);
    } else if (instrument.type === "heater") {
      if (heaterMap.has(instrument.heaterPin)) {
        throw new Error(
          `Duplicate heater pin ${instrument.heaterPin} found in environment "${config.name}"`,
        );
      }
      heaterMap.set(instrument.heaterPin, sim);
    }
  });

  return sim;
});

/**
 * @returns temperature in celcius, or undefined if simulator with given channel not found
 */
export function getTemperature(channel: number) {
  const sim = thermoMap.get(channel);

  return sim?.getTemperature(channel);
}

/**
 * @returns true if successful, false if simulator with given pin not found
 */
export function setHeaterOutput(pin: number, value: number) {
  const sim = heaterMap.get(pin);

  if (!sim) return false;

  sim.setHeaterOutput(pin, value);
  return true;
}
