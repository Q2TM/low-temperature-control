import { eq } from "drizzle-orm";

import { systemHeaters, systems, systemThermos } from "@repo/tsdb";

import { db } from "@/core/db";

export type SystemWithRelations = {
  id: string;
  displayName: string;
  location: string | null;
  thermoUrl: string;
  heaterUrl: string;
  enabled: boolean;
  thermos: { channel: number; label: string | null }[];
  heaters: { channel: number; label: string | null }[];
  createdAt: string;
  updatedAt: string;
};

async function enrichSystem(
  system: typeof systems.$inferSelect,
): Promise<SystemWithRelations> {
  const [thermos, heaters] = await Promise.all([
    db
      .select({
        channel: systemThermos.channel,
        label: systemThermos.label,
      })
      .from(systemThermos)
      .where(eq(systemThermos.systemId, system.id)),
    db
      .select({
        channel: systemHeaters.channel,
        label: systemHeaters.label,
      })
      .from(systemHeaters)
      .where(eq(systemHeaters.systemId, system.id)),
  ]);

  return {
    id: system.id,
    displayName: system.displayName,
    location: system.location,
    thermoUrl: system.thermoUrl,
    heaterUrl: system.heaterUrl,
    enabled: system.enabled,
    thermos,
    heaters,
    createdAt: system.createdAt.toISOString(),
    updatedAt: system.updatedAt.toISOString(),
  };
}

export async function listSystems(): Promise<SystemWithRelations[]> {
  const allSystems = await db.select().from(systems);
  return Promise.all(allSystems.map(enrichSystem));
}

export async function getSystem(
  id: string,
): Promise<SystemWithRelations | null> {
  const [system] = await db.select().from(systems).where(eq(systems.id, id));
  if (!system) return null;
  return enrichSystem(system);
}

export async function createSystem(input: {
  id: string;
  displayName: string;
  location?: string | null;
  thermoUrl: string;
  heaterUrl: string;
  enabled?: boolean;
  thermos: { channel: number; label: string | null }[];
  heaters: { channel: number; label: string | null }[];
}): Promise<SystemWithRelations> {
  const [system] = await db
    .insert(systems)
    .values({
      id: input.id,
      displayName: input.displayName,
      location: input.location ?? null,
      thermoUrl: input.thermoUrl,
      heaterUrl: input.heaterUrl,
      enabled: input.enabled ?? true,
    })
    .returning();

  if (!system) throw new Error("Failed to create system");

  if (input.thermos.length > 0) {
    await db.insert(systemThermos).values(
      input.thermos.map((t) => ({
        systemId: system.id,
        channel: t.channel,
        label: t.label,
      })),
    );
  }

  if (input.heaters.length > 0) {
    await db.insert(systemHeaters).values(
      input.heaters.map((h) => ({
        systemId: system.id,
        channel: h.channel,
        label: h.label,
      })),
    );
  }

  return enrichSystem(system);
}

export async function updateSystem(
  id: string,
  input: {
    displayName?: string;
    location?: string | null;
    thermoUrl?: string;
    heaterUrl?: string;
    enabled?: boolean;
    thermos?: { channel: number; label: string | null }[];
    heaters?: { channel: number; label: string | null }[];
  },
): Promise<SystemWithRelations | null> {
  const updates: Partial<typeof systems.$inferInsert> = {};
  if (input.displayName !== undefined) updates.displayName = input.displayName;
  if (input.location !== undefined) updates.location = input.location;
  if (input.thermoUrl !== undefined) updates.thermoUrl = input.thermoUrl;
  if (input.heaterUrl !== undefined) updates.heaterUrl = input.heaterUrl;
  if (input.enabled !== undefined) updates.enabled = input.enabled;
  updates.updatedAt = new Date();

  const [system] = await db
    .update(systems)
    .set(updates)
    .where(eq(systems.id, id))
    .returning();

  if (!system) return null;

  // Replace thermos if provided
  if (input.thermos !== undefined) {
    await db.delete(systemThermos).where(eq(systemThermos.systemId, id));
    if (input.thermos.length > 0) {
      await db.insert(systemThermos).values(
        input.thermos.map((t) => ({
          systemId: id,
          channel: t.channel,
          label: t.label,
        })),
      );
    }
  }

  // Replace heaters if provided
  if (input.heaters !== undefined) {
    await db.delete(systemHeaters).where(eq(systemHeaters.systemId, id));
    if (input.heaters.length > 0) {
      await db.insert(systemHeaters).values(
        input.heaters.map((h) => ({
          systemId: id,
          channel: h.channel,
          label: h.label,
        })),
      );
    }
  }

  return enrichSystem(system);
}

export async function deleteSystem(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(systems)
    .where(eq(systems.id, id))
    .returning({ id: systems.id });
  return !!deleted;
}
