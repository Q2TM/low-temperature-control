import { record } from "@elysiajs/opentelemetry";
import { sql } from "drizzle-orm";

import { heaterMetrics, thermoMetrics } from "@repo/tsdb";

import { db } from "@/core/db";

import {
  QueryHeaterMetricsResponseType,
  QueryThermoMetricsResponseType,
} from "./model";

type GetThermoDataParams = {
  systemId: string;
  interval: number;
  channels: number[];
  timeStart: Date;
  timeEnd: Date;
};

type GetHeaterDataParams = {
  systemId: string;
  interval: number;
  channels: number[];
  timeStart: Date;
  timeEnd: Date;
};

export async function getThermoData({
  systemId,
  interval,
  channels,
  timeStart,
  timeEnd,
}: GetThermoDataParams): Promise<QueryThermoMetricsResponseType> {
  const intervalSql = sql.raw(`'${interval}s'`);
  const kelvinSql = channels.map(
    (channel) =>
      sql`avg(${thermoMetrics.tempKelvin}) FILTER (WHERE ${thermoMetrics.channel} = ${channel}) AS "kelvin_${sql.raw(`${channel}`)}"`,
  );

  const sqlQuery = record(
    "prepare-sql-query-thermo",
    () => sql`
SELECT time_bucket(interval ${intervalSql}, ${thermoMetrics.time}) AS "time",
${sql.join(kelvinSql, sql`, `)}
FROM ${thermoMetrics}
WHERE ${thermoMetrics.time} >= ${timeStart.toISOString()} AND ${thermoMetrics.time} < ${timeEnd.toISOString()} AND ${thermoMetrics.systemId} = ${systemId}
GROUP BY 1
ORDER BY 1 ASC;
`,
  );

  const data = await record(
    "sql-query-thermo",
    async () =>
      (await db.execute(sqlQuery)) as Array<{
        time: string;
        [key: `kelvin_${number}`]: number;
      }>,
  );

  const responseData = record("map-response-data-thermo", () => {
    const metrics = data.flatMap((entry) => {
      const channelData = channels.map((channel) => ({
        channel,
        kelvin: entry[`kelvin_${channel}`],
      }));

      const validChannels = channelData.filter(
        (ch): ch is { channel: number; kelvin: number } => ch.kelvin != null,
      );

      if (validChannels.length === 0) return [];

      return [{ time: entry.time, channels: validChannels }];
    });

    return { dataPoints: metrics.length, metrics };
  });

  return responseData;
}

export async function getHeaterData({
  systemId,
  interval,
  channels,
  timeStart,
  timeEnd,
}: GetHeaterDataParams): Promise<QueryHeaterMetricsResponseType> {
  const intervalSql = sql.raw(`'${interval}s'`);
  const powerWattsSql = channels.map(
    (channel) =>
      sql`avg(${heaterMetrics.powerWatts}) FILTER (WHERE ${heaterMetrics.channel} = ${channel}) AS "power_watts_${sql.raw(`${channel}`)}"`,
  );

  const sqlQuery = record(
    "prepare-sql-query-heater",
    () => sql`
SELECT time_bucket(interval ${intervalSql}, ${heaterMetrics.time}) AS "time",
${sql.join(powerWattsSql, sql`, `)}
FROM ${heaterMetrics}
WHERE ${heaterMetrics.time} >= ${timeStart.toISOString()} AND ${heaterMetrics.time} < ${timeEnd.toISOString()} AND ${heaterMetrics.systemId} = ${systemId}
GROUP BY 1
ORDER BY 1 ASC;
`,
  );

  const data = await record(
    "sql-query-heater",
    async () =>
      (await db.execute(sqlQuery)) as Array<{
        time: string;
        [key: `power_watts_${number}`]: number;
      }>,
  );

  const responseData = record("map-response-data-heater", () => {
    const metrics = data.flatMap((entry) => {
      const channelData = channels.map((channel) => ({
        channel,
        powerWatts: entry[`power_watts_${channel}`],
      }));

      const validChannels = channelData.filter(
        (ch): ch is { channel: number; powerWatts: number } =>
          ch.powerWatts != null,
      );

      if (validChannels.length === 0) return [];

      return [{ time: entry.time, channels: validChannels }];
    });

    return { dataPoints: metrics.length, metrics };
  });

  return responseData;
}
