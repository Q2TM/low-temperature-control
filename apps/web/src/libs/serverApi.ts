import "server-only";

import createFetchClient from "openapi-fetch";

import type { Heater, LGG, RiceShower } from "@repo/api-client";

export const heaterFetchClient = createFetchClient<Heater.Paths>({
  baseUrl: process.env.HEATER_URL,
});

export const lakeshoreFetchClient = createFetchClient<LGG.Paths>({
  baseUrl: process.env.LAKESHORE_URL,
});

export const riceShowerFetchClient = createFetchClient<RiceShower.Paths>({
  baseUrl: process.env.RICE_SHOWER_URL,
});
