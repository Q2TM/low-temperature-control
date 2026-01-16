import "server-only";

import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { Heater, LGG } from "@repo/api-client";

export const heaterFetchClient = createFetchClient<Heater.Paths>({
  baseUrl: process.env.HEATER_URL,
});

export const heater = createClient(heaterFetchClient);

export const lakeshoreFetchClient = createFetchClient<LGG.Paths>({
  baseUrl: process.env.LAKESHORE_URL,
});

export const lakeshore = createClient(lakeshoreFetchClient);
