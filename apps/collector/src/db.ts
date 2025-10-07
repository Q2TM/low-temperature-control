import { createTsDbClient } from "@repo/tsdb";

import { environment } from "./environment";

export const db = createTsDbClient(environment.DATABASE_URL);
