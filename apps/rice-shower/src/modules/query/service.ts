import { record } from "@elysiajs/opentelemetry";
import { sql } from "drizzle-orm";

import { heaterMetrics, sensorMetrics } from "@repo/tsdb";

import { db } from "@/core/db";

import {
  QueryHeaterMetricsResponseType,
  QueryTempMetricsResponseType,
} from "./model";

type GetTemperatureDataParams = {
  instanceName: string;
  interval: number;
  channels: number[];
  timeStart: Date;
  timeEnd: Date;
};

type GetHeaterDataParams = {
  instanceName: string;
  interval: number;
  pins: number[];
  timeStart: Date;
  timeEnd: Date;
};

export async function getTemperatureData({
  instanceName,
  interval,
  channels,
  timeStart,
  timeEnd,
}: GetTemperatureDataParams): Promise<QueryTempMetricsResponseType> {
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
  const sqlQuery = record(
    "prepare-sql-query-temp",
    () => sql`
SELECT time_bucket(interval ${intervalSql}, ${sensorMetrics.time}) AS "time",
${sql.join(kelvinAndResistanceSql, sql`, `)}
FROM ${sensorMetrics}
WHERE ${sensorMetrics.time} >= ${timeStart.toISOString()} AND ${sensorMetrics.time} < ${timeEnd.toISOString()} AND ${sensorMetrics.instance} = ${instanceName}
GROUP BY 1
ORDER BY 1 ASC;
`,
  );

  const data = await record(
    "sql-query-temp",
    async () =>
      (await db.execute(sqlQuery)) as Array<{
        time: string;
        [key: `kelvin_${number}`]: number;
        [key: `resistance_${number}`]: number;
      }>,
  );

  const responseData = record("map-response-data-temp", () => ({
    dataPoints: data.length,
    metrics: data.map((entry) => ({
      time: entry.time,
      channels: channels.map((channel) => ({
        channel,
        kelvin: entry[`kelvin_${channel}`]!,
        resistance: entry[`resistance_${channel}`]!,
      })),
    })),
  }));

  return responseData;
}

export async function getHeaterData({
  instanceName,
  interval,
  pins,
  timeStart,
  timeEnd,
}: GetHeaterDataParams): Promise<QueryHeaterMetricsResponseType> {
  const intervalSql = sql.raw(`'${interval}s'`);
  const dutyCycleSql = pins.map(
    (pin) =>
      sql`avg(${heaterMetrics.dutyCycle}) FILTER (WHERE ${heaterMetrics.pinNumber} = ${pin}) AS "duty_cycle_${sql.raw(`${pin}`)}"`,
  );
  const powerWattsSql = pins.map(
    (pin) =>
      sql`avg(${heaterMetrics.powerWatts}) FILTER (WHERE ${heaterMetrics.pinNumber} = ${pin}) AS "power_watts_${sql.raw(`${pin}`)}"`,
  );
  const dutyCycleAndPowerSql = [...dutyCycleSql, ...powerWattsSql];

  // Fetch heater data from the database
  const sqlQuery = record(
    "prepare-sql-query-heater",
    () => sql`
SELECT time_bucket(interval ${intervalSql}, ${heaterMetrics.time}) AS "time",
${sql.join(dutyCycleAndPowerSql, sql`, `)}
FROM ${heaterMetrics}
WHERE ${heaterMetrics.time} >= ${timeStart.toISOString()} AND ${heaterMetrics.time} < ${timeEnd.toISOString()} AND ${heaterMetrics.instance} = ${instanceName}
GROUP BY 1
ORDER BY 1 ASC;
`,
  );

  const data = await record(
    "sql-query-heater",
    async () =>
      (await db.execute(sqlQuery)) as Array<{
        time: string;
        [key: `duty_cycle_${number}`]: number;
        [key: `power_watts_${number}`]: number;
      }>,
  );

  const responseData = record("map-response-data-heater", () => ({
    dataPoints: data.length,
    metrics: data.map((entry) => ({
      time: entry.time,
      pins: pins.map((pin) => ({
        pinNumber: pin,
        dutyCycle: entry[`duty_cycle_${pin}`]!,
        powerWatts: entry[`power_watts_${pin}`]!,
      })),
    })),
  }));

  return responseData;
}
