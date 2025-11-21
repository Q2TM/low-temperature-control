import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { RiceShower } from "@repo/api-client";

const rsClient = createFetchClient<RiceShower.Paths>({
  baseUrl: process.env.NEXT_PUBLIC_RICE_SHOWER_URL,
});

export const riceShower = createClient(rsClient);
