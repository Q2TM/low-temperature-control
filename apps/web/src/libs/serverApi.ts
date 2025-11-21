import "server-only";

import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { Heater } from "@repo/api-client";

export const heaterFetchClient = createFetchClient<Heater.Paths>({
  baseUrl: process.env.HEATER_URL,
});

export const heater = createClient(heaterFetchClient);
