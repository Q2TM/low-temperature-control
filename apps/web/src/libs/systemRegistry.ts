import "server-only";

import { cache } from "react";

import { getSystems, type System } from "@/actions/systems";

/**
 * Cached system registry — deduplicated per request via React cache.
 */
export const getCachedSystems = cache(async (): Promise<System[]> => {
  return getSystems();
});

export async function resolveSystem(systemId: string): Promise<System | null> {
  const systems = await getCachedSystems();
  return systems.find((s) => s.id === systemId) ?? null;
}

export async function getDefaultSystemId(): Promise<string | null> {
  const systems = await getCachedSystems();
  if (systems.length === 0) return null;
  return systems[0]!.id;
}
