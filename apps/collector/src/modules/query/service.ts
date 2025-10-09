import { sql } from "drizzle-orm";

import { sensorMetrics } from "@repo/tsdb";

import { db } from "@/core/db";

import { QueryMetricsResponseType } from "./model";

type getTemperatureDataParams = {
  instanceName: string;
  // Seconds
  interval: number;
  channels: number[];
  timeStart: Date;
  timeEnd: Date;
};

export async function getTemperatureData({
  instanceName,
  interval,
  channels,
  timeStart,
  timeEnd,
}: getTemperatureDataParams): Promise<QueryMetricsResponseType> {
  const intervalSql = sql.raw(`'${interval}s'`);
  const kelvinSql = channels.map(
    (channel) =>
      sql`avg(${sensorMetrics.tempKelvin}) FILTER (WHERE ${sensorMetrics.channel} = ${channel}) AS "kelvin_${sql.raw(`${channel}`)}"`,
  );
  const resistanceSql = channels.map(
    (channel) =>
      sql`avg(${sensorMetrics.resistanceOhms}) FILTER (WHERE ${sensorMetrics.channel} = ${channel}) AS "resistance_${sql.raw(`${channel}`)}"`,
  );
  const kelvinAndResistanceSql = [...kelvinSql, ...resistanceSql];

  // Fetch temperature data from the database
  const data = (await db.execute(sql`
SELECT time_bucket(interval ${intervalSql}, ${sensorMetrics.time}) AS "time",
${sql.join(kelvinAndResistanceSql, sql`, `)}
FROM ${sensorMetrics}
WHERE ${sensorMetrics.time} >= ${timeStart.toISOString()} AND ${sensorMetrics.time} < ${timeEnd.toISOString()} AND ${sensorMetrics.instance} = ${instanceName}
GROUP BY 1
ORDER BY 1 ASC;
`)) as Array<{
    time: string;
    [key: `kelvin_${number}`]: number;
    [key: `resistance_${number}`]: number;
  }>;

  return {
    dataPoints: data.length,
    metrics: data.map((entry) => ({
      time: entry.time,
      channels: channels.map((channel) => ({
        channel,
        kelvin: entry[`kelvin_${channel}`]!,
        resistance: entry[`resistance_${channel}`]!,
      })),
    })),
  };
}
