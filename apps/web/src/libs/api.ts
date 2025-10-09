import { Configuration, QueryApi } from "@repo/api-client/rice-shower";

export const queryApi = new QueryApi(
  new Configuration({
    basePath: "http://localhost:8001",
  }),
);
