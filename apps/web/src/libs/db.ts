import { createTsDbClient } from "@repo/tsdb";

export const db = createTsDbClient(process.env.DATABASE_URL!);
