import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { RiceShower } from "@repo/api-client";

const fetchClient = createFetchClient<RiceShower.Paths>({
  baseUrl: process.env.RICE_SHOWER_URL || "http://localhost:8100",
});

export const riceShower = createClient(fetchClient);
