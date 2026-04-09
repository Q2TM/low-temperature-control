import * as z from "zod";

export const EnvironmentSchema = z.object({
  DATABASE_URL: z.string(),
});

export const environment = EnvironmentSchema.parse(process.env);
