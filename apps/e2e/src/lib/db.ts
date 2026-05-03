import { fileURLToPath } from "node:url";
import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { waitFor } from "./wait";

/** Absolute path to the `packages/tsdb` drizzle migrations folder. */
export function tsdbMigrationsFolder(): string {
  // this file: apps/e2e/src/lib/db.ts → repo root is 4 levels up
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../../../packages/tsdb/src/drizzle");
}

/**
 * Wait until the database accepts connections, then run all drizzle
 * migrations against it. Safe to run repeatedly (drizzle tracks applied
 * migrations in `__drizzle_migrations`).
 */
export async function migrateTsdb(databaseUrl: string): Promise<void> {
  await waitFor(
    async () => {
      const probe = postgres(databaseUrl, { max: 1, connect_timeout: 2 });
      try {
        await probe`select 1`;
        return true;
      } finally {
        await probe.end({ timeout: 1 });
      }
    },
    { label: "tsdb to accept connections", timeoutMs: 60_000, intervalMs: 1000 },
  );

  const client = postgres(databaseUrl, { max: 1 });
  try {
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: tsdbMigrationsFolder() });
  } finally {
    await client.end({ timeout: 5 });
  }
}
