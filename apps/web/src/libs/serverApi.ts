import "server-only";

import createFetchClient from "openapi-fetch";

import type { Heater, LGG, RiceShower } from "@repo/api-client";

export const riceShowerFetchClient = createFetchClient<RiceShower.Paths>({
  baseUrl: process.env.RICE_SHOWER_URL,
});

export function createHeaterClient(baseUrl: string) {
  return createFetchClient<Heater.Paths>({ baseUrl });
}

export function createLakeshoreClient(baseUrl: string) {
  return createFetchClient<LGG.Paths>({ baseUrl });
}
