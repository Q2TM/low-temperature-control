import { z } from "zod";

const simEnvConfigSchema = z.object({
  name: z.string(),
  lakeshoreChannel: z.number(),
  coolerPower: z.number(),
  gpioPin: z.number(),
  heatDissipation: z.number(),
  heaterPower: z.number(),
  externalTemperature: z.number(),
});

export const configSchema = z.object({
  environments: z.array(simEnvConfigSchema),
});

export type SimEnvConfig = z.infer<typeof simEnvConfigSchema>;
