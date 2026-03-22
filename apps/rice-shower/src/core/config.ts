import { parse } from "yaml";
import * as z from "zod";

import { environment } from "./environment";

const sensorSchema = z.object({
  instance: z.string(),
  channel: z.number(),
});

const heaterSchema = z.object({
  instance: z.string(),
  pin: z.number(),
});

export const configSchema = z.object({
  scrape: z.object({
    sensors: z.array(sensorSchema),
    heaters: z.array(heaterSchema),
  }),
});

export type Config = z.infer<typeof configSchema>;

const configRaw = await Bun.file(environment.CONFIG_FILE).text();

export const config = configSchema.parse(parse(configRaw));
