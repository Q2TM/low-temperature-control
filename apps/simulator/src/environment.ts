import { z } from "zod";

export const environmentSchema = z.object({
  DATABASE_URL: z.string(),
  LGG_URL: z.url().optional().default("http://localhost:8000"),
  CONFIG_FILE: z.string().default("./config.yaml"),
});

export const environment = environmentSchema.parse(process.env);
