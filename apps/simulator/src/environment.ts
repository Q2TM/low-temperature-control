import { Value } from "@sinclair/typebox/value";
import { Static, t } from "elysia";

export const environmentSchema = t.Object({
  DATABASE_URL: t.String(),
  LGG_URL: t.String({ default: "http://localhost:8000" }),
  CONFIG_FILE: t.String({ default: "./config.yaml" }),
});

export type Environment = Static<typeof environmentSchema>;

export const environment = Value.Parse(environmentSchema, process.env);
