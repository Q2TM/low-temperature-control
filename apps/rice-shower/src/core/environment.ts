import * as z from "zod";

const parseNumberArray = (value: string): number[] => {
  return value.split(",").map((v) => parseInt(v.trim(), 10));
};

export const EnvironmentSchema = z.object({
  DATABASE_URL: z.string(),
  LGG_URL: z.url().default("http://localhost:8000"),
  HEATER_URL: z.url().default("http://localhost:8001"),
  SCRAPE_CHANNELS: z
    .string()
    .default("1")
    .transform(parseNumberArray)
    .describe("Comma-separated list of LGG channels to scrape"),
  SCRAPE_PINS: z
    .string()
    .default("18")
    .transform(parseNumberArray)
    .describe("Comma-separated list of heater pins to scrape"),
});

export const environment = EnvironmentSchema.parse(process.env);
