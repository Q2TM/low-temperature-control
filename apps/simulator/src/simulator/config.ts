import { Static, t } from "elysia";

const thermometerSchema = t.Object({
  type: t.Literal("thermometer"),
  position: t.Tuple([t.Number(), t.Number()]),
  name: t.String(),
  thermoChannel: t.Number(),
});

const heaterSchema = t.Object({
  type: t.Literal("heater"),
  position: t.Tuple([t.Number(), t.Number()]),
  name: t.String(),
  heaterPin: t.Number(),
  heaterPower: t.Number(),
});

const instrumentSchema = t.Union([thermometerSchema, heaterSchema]);

export const simEnvSchema = t.Object({
  name: t.String(),
  enabled: t.Boolean(),
  size: t.Tuple([t.Number(), t.Number()]),
  instruments: t.Array(instrumentSchema),
  externalTemperature: t.Number(),
  externalConductivity: t.Number(), // Unit: W/K
  internalConductivity: t.Number(), // Unit: W/K
});

export const configSchema = t.Object({
  environments: t.Array(simEnvSchema),
});

export type SimEnvConfig = Static<typeof simEnvSchema>;
