import createClient from "openapi-fetch";

import type { LGG } from "@repo/api-client";

import { environment } from "./environment";

export const client = createClient<LGG.Paths>({
  baseUrl: environment.LGG_URL,
});
