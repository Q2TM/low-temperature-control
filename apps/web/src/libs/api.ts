import { Configuration, QueryApi } from "@repo/api-client/rice-shower";

export const queryApi = new QueryApi(
  new Configuration({
    basePath: process.env.RICE_SHOWER_URL || "http://localhost:8100",
  }),
);
