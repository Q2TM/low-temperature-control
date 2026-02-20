import { z } from "zod";

const thermometerSchema = z.object({
  type: z.literal("thermometer"),
  position: z.tuple([z.number(), z.number()]),
  name: z.string(),
  thermoChannel: z.number(),
});

const heaterSchema = z.object({
  type: z.literal("heater"),
  position: z.tuple([z.number(), z.number()]),
  name: z.string(),
  heaterPin: z.number(),
  heaterPower: z.number(),
});

const instrumentSchema = z.union([thermometerSchema, heaterSchema]);

const simEnvSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  size: z.tuple([z.number(), z.number()]),
  instruments: z.array(instrumentSchema),
  externalTemperature: z.number(),
  externalConductivity: z.number(), // Unit: W/K
  internalConductivity: z.number(), // Unit: W/K
});

export const configSchema = z.object({
  environments: z.array(simEnvSchema),
});

export type SimEnvConfig = z.infer<typeof simEnvSchema>;
