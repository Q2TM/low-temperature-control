export * from "./schema";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createTsDbClient(databaseUrl: string) {
  const pgClient = postgres(databaseUrl);
  return drizzle(pgClient);
}
