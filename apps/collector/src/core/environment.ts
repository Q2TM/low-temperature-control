import * as z from "zod";

export const EnvironmentSchema = z.object({
  DATABASE_URL: z.string(),
  LGG_URL: z.url().default("http://localhost:8000"),
});

export const environment = EnvironmentSchema.parse(process.env);
