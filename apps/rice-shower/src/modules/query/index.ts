import { Elysia, t } from "elysia";

import {
  QueryHeaterMetricsRequest,
  QueryHeaterMetricsResponse,
  QueryTempMetricsRequest,
  QueryTempMetricsResponse,
} from "./model";
import { getHeaterData, getTemperatureData } from "./service";

export const queryController = new Elysia({
  prefix: "/query",
  detail: {
    tags: ["Query"],
  },
})
  .get(
    "temp/:instance_name",
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
      detail: {
        operationId: "getTempMetrics",
        summary: "Get Temperature Metrics",
        description: "Query temperature metrics data from time series database",
      },
      query: QueryTempMetricsRequest,
      response: {
        200: QueryTempMetricsResponse,
        500: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "heater/:instance_name",
    async ({
      params: { instance_name },
      query: { interval, pins, time_start, time_end },
      status,
    }) => {
      try {
        return await getHeaterData({
          instanceName: instance_name,
          interval,
          pins,
          timeStart: time_start,
          timeEnd: time_end,
        });
      } catch (error) {
        console.error(error);
        throw status(500, { error: `${error}` });
      }
    },
    {
      detail: {
        operationId: "getHeaterMetrics",
        summary: "Get Heater Metrics",
        description: "Query heater metrics data from time series database",
      },
      query: QueryHeaterMetricsRequest,
      response: {
        200: QueryHeaterMetricsResponse,
        500: t.Object({ error: t.String() }),
      },
    },
  );
