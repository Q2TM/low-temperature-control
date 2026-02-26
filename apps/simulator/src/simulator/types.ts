import { Static, t } from "elysia";

import { simEnvSchema } from "./config";

export const simStateSchema = t.Object({
  config: simEnvSchema,
  state: t.Array(t.Array(t.Number())),
});

export type SimState = Static<typeof simStateSchema>;
