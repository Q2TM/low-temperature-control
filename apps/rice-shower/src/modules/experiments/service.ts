import { and, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import createClient from "openapi-fetch";

import type { Heater } from "@repo/api-client";
import { experiments, systems } from "@repo/tsdb";

import { db } from "@/core/db";

import { ExperimentType } from "./model";

function createHeaterClient(baseUrl: string) {
  return createClient<Heater.Paths>({ baseUrl });
}

function serialize(
  row: typeof experiments.$inferSelect,
): ExperimentType {
  return {
    id: row.id,
    name: row.name,
    systemId: row.systemId,
    channel: row.channel,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt?.toISOString() ?? null,
    startSetpoint: row.startSetpoint,
    startKp: row.startKp,
    startKi: row.startKi,
    startKd: row.startKd,
    stopReason: row.stopReason,
    stopDetail: row.stopDetail,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ExperimentError extends Error {
  constructor(
    public readonly code:
      | "system_not_found"
      | "channel_not_registered"
      | "already_running"
      | "pid_already_active"
      | "pid_start_failed"
      | "not_running"
      | "is_running",
    message: string,
  ) {
    super(message);
  }
}

async function getSystemOrThrow(systemId: string) {
  const [system] = await db
    .select()
    .from(systems)
    .where(eq(systems.id, systemId));
  if (!system) {
    throw new ExperimentError(
      "system_not_found",
      `System '${systemId}' not found`,
    );
  }
  return system;
}

async function getRunningForChannel(systemId: string, channel: number) {
  const [row] = await db
    .select()
    .from(experiments)
    .where(
      and(
        eq(experiments.systemId, systemId),
        eq(experiments.channel, channel),
        eq(experiments.status, "running"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function startExperiment(input: {
  name: string;
  systemId: string;
  channel: number;
  notes?: string | null;
}): Promise<ExperimentType> {
  const system = await getSystemOrThrow(input.systemId);

  const existing = await getRunningForChannel(input.systemId, input.channel);
  if (existing) {
    throw new ExperimentError(
      "already_running",
      `Experiment '${existing.name}' is already running on channel ${input.channel}`,
    );
  }

  const heater = createHeaterClient(system.heaterUrl);

  // Snapshot current PID parameters BEFORE starting so the row reflects what
  // will be in effect for the run.
  const { data: status, error: statusError } = await heater.GET(
    "/channels/{channel_id}/status",
    { params: { path: { channel_id: input.channel } } },
  );
  if (statusError || !status) {
    throw new ExperimentError(
      "channel_not_registered",
      `Heater channel ${input.channel} not registered on system '${input.systemId}'`,
    );
  }
  if (status.pid.isActive) {
    throw new ExperimentError(
      "pid_already_active",
      `PID is already running on channel ${input.channel}; stop it before starting an experiment`,
    );
  }

  const startSetpoint = status.pid.target;
  const startKp = status.pid.parameters.kp;
  const startKi = status.pid.parameters.ki;
  const startKd = status.pid.parameters.kd;

  // Start the PID loop. We do this BEFORE the insert so a failure here means
  // no row is created.
  const { error: startError } = await heater.POST(
    "/pid/{channel_id}/start",
    { params: { path: { channel_id: input.channel } } },
  );
  if (startError) {
    throw new ExperimentError(
      "pid_start_failed",
      `Failed to start PID on channel ${input.channel}: ${JSON.stringify(startError)}`,
    );
  }

  const startedAt = new Date();
  const [row] = await db
    .insert(experiments)
    .values({
      name: input.name,
      systemId: input.systemId,
      channel: input.channel,
      status: "running",
      startedAt,
      startSetpoint,
      startKp,
      startKi,
      startKd,
      notes: input.notes ?? null,
    })
    .returning();

  if (!row) {
    // Insert failed (e.g. partial-unique race) — try to roll back the PID start
    // so we don't leave an orphan running heater.
    await heater
      .POST("/pid/{channel_id}/stop", {
        params: { path: { channel_id: input.channel } },
      })
      .catch(() => undefined);
    throw new Error("Failed to insert experiment row");
  }

  return serialize(row);
}

export async function stopExperiment(id: string): Promise<ExperimentType> {
  const [row] = await db.select().from(experiments).where(eq(experiments.id, id));
  if (!row) {
    throw new ExperimentError("not_running", `Experiment '${id}' not found`);
  }
  if (row.status !== "running") {
    throw new ExperimentError(
      "not_running",
      `Experiment '${id}' is not running`,
    );
  }

  const system = await getSystemOrThrow(row.systemId);
  const heater = createHeaterClient(system.heaterUrl);

  let stopReason: "manual" | "external_stop" = "manual";
  let stopDetail: string | null = null;

  const { error: stopError } = await heater.POST(
    "/pid/{channel_id}/stop",
    { params: { path: { channel_id: row.channel } } },
  );
  if (stopError) {
    // Operator wanted to stop; record the row anyway with the failure detail.
    stopReason = "external_stop";
    stopDetail = `Heater stop call failed: ${JSON.stringify(stopError)}`;
  }

  const endedAt = new Date();
  const [updated] = await db
    .update(experiments)
    .set({
      status: "completed",
      endedAt,
      stopReason,
      stopDetail,
      updatedAt: endedAt,
    })
    .where(eq(experiments.id, id))
    .returning();

  if (!updated) throw new Error("Failed to update experiment");
  return serialize(updated);
}

export async function listExperiments(filters: {
  systemId?: string;
  channel?: number;
  status?: "running" | "completed" | "aborted";
  nameContains?: string;
  startedAfter?: Date;
  startedBefore?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; experiments: ExperimentType[] }> {
  const conditions = [];
  if (filters.systemId)
    conditions.push(eq(experiments.systemId, filters.systemId));
  if (filters.channel !== undefined)
    conditions.push(eq(experiments.channel, filters.channel));
  if (filters.status) conditions.push(eq(experiments.status, filters.status));
  if (filters.nameContains)
    conditions.push(ilike(experiments.name, `%${filters.nameContains}%`));
  if (filters.startedAfter)
    conditions.push(gte(experiments.startedAt, filters.startedAfter));
  if (filters.startedBefore)
    conditions.push(lte(experiments.startedAt, filters.startedBefore));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(experiments)
      .where(whereClause)
      .orderBy(desc(experiments.startedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(experiments).where(whereClause),
  ]);

  return {
    total: totalResult[0]?.value ?? 0,
    experiments: rows.map(serialize),
  };
}

export async function getExperiment(
  id: string,
): Promise<ExperimentType | null> {
  const [row] = await db
    .select()
    .from(experiments)
    .where(eq(experiments.id, id));
  return row ? serialize(row) : null;
}

export async function getActiveExperiment(
  systemId: string,
  channel: number,
): Promise<ExperimentType | null> {
  const row = await getRunningForChannel(systemId, channel);
  return row ? serialize(row) : null;
}

export async function updateExperiment(
  id: string,
  patch: { name?: string; notes?: string | null },
): Promise<ExperimentType | null> {
  const updates: Partial<typeof experiments.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.notes !== undefined) updates.notes = patch.notes;

  const [row] = await db
    .update(experiments)
    .set(updates)
    .where(eq(experiments.id, id))
    .returning();
  return row ? serialize(row) : null;
}

export async function deleteExperiment(id: string): Promise<boolean> {
  const [row] = await db
    .select({ status: experiments.status })
    .from(experiments)
    .where(eq(experiments.id, id));
  if (!row) return false;
  if (row.status === "running") {
    throw new ExperimentError(
      "is_running",
      `Cannot delete a running experiment; stop it first`,
    );
  }
  const [deleted] = await db
    .delete(experiments)
    .where(eq(experiments.id, id))
    .returning({ id: experiments.id });
  return !!deleted;
}

/**
 * Reconcile: if PID has stopped (auto or external) but we still show the
 * experiment as running, finalize it. Called by the scraper after each
 * heater poll cycle so we self-heal without web action.
 */
export async function reconcileFromHeaterStatus(input: {
  systemId: string;
  channel: number;
  pidIsActive: boolean;
  lastStopReason: "overheat" | "sensor_timeout" | null | undefined;
  lastStopAt: string | null | undefined;
  lastStopDetail: string | null | undefined;
  currentPid: {
    target: number;
    kp: number;
    ki: number;
    kd: number;
  };
}): Promise<void> {
  if (input.pidIsActive) return;

  const running = await getRunningForChannel(input.systemId, input.channel);
  if (!running) return;

  const reason: "overheat" | "sensor_timeout" | "external_stop" =
    input.lastStopReason ?? "external_stop";
  const endedAt = input.lastStopAt ? new Date(input.lastStopAt) : new Date();

  await db
    .update(experiments)
    .set({
      status: "aborted",
      endedAt,
      stopReason: reason,
      stopDetail: input.lastStopDetail ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(experiments.id, running.id),
        eq(experiments.status, "running"),
      ),
    );
}

