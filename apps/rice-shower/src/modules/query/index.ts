import { Elysia, t } from "elysia";

import {
  QueryHeaterMetricsRequest,
  QueryHeaterMetricsResponse,
  QueryThermoMetricsRequest,
  QueryThermoMetricsResponse,
} from "./model";
import { getHeaterData, getThermoData } from "./service";

export const queryController = new Elysia({
  prefix: "/query",
  detail: {
    tags: ["Query"],
  },
})
  .get(
    "thermo/:system_id",
    async ({
      params: { system_id },
      query: { interval, channels, time_start, time_end },
      status,
    }) => {
      try {
        return await getThermoData({
          systemId: system_id,
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
        operationId: "getThermoMetrics",
        summary: "Get Thermometer Metrics",
        description: "Query thermometer metrics data from time series database",
      },
      query: QueryThermoMetricsRequest,
      response: {
        200: QueryThermoMetricsResponse,
        500: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "heater/:system_id",
    async ({
      params: { system_id },
      query: { interval, channels, time_start, time_end },
      status,
    }) => {
      try {
        return await getHeaterData({
          systemId: system_id,
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
