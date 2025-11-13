import createClient from "openapi-fetch";

import type { Heater, LGG } from "@repo/api-client";

import { environment } from "./environment";

export const lggClient = createClient<LGG.Paths>({
  baseUrl: environment.LGG_URL,
});

export const heaterClient = createClient<Heater.Paths>({
  baseUrl: environment.HEATER_URL,
});
