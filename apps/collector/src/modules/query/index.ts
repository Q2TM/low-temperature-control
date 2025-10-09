import { Elysia, t } from "elysia";

import { QueryMetricsRequestQuery, QueryMetricsResponse } from "./model";
import { getTemperatureData } from "./service";

export const queryController = new Elysia({
  prefix: "/query",
  detail: {
    tags: ["Query"],
  },
}).get(
  ":instance_name",
  async ({
    params: { instance_name },
    query: { interval, channels, time_start, time_end },
    status,
  }) => {
    try {
      return await getTemperatureData({
        instanceName: instance_name,
        interval,
        channels,
        timeStart: time_start,
        timeEnd: time_end,
      });
    } catch (error) {
      console.error(error);
      throw status(500, { error: `${error}` });
    }
  },
  {
    query: QueryMetricsRequestQuery,
    response: {
      200: QueryMetricsResponse,
      500: t.Object({ error: t.String() }),
    },
    detail: {
      operationId: "getMetrics",
      summary: "Get Metrics",
      description: "Query metrics data from time series database",
    },
  },
);
