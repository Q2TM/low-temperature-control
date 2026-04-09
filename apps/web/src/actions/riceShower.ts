"use server";

import { riceShowerFetchClient } from "@/libs/serverApi";

export async function getTempMetrics(params: {
  systemId: string;
  channels: number[];
  timeStart: number;
  timeEnd: number;
  interval: number;
}) {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/query/thermo/{system_id}",
      {
        params: {
          path: { system_id: params.systemId },
          query: {
            channels: params.channels,
            time_start: params.timeStart,
            time_end: params.timeEnd,
            interval: params.interval,
          },
        },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch temp metrics:", error);
    return null;
  }
}

export async function getHeaterMetrics(params: {
  systemId: string;
  channels: number[];
  timeStart: number;
  timeEnd: number;
  interval: number;
}) {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/query/heater/{system_id}",
      {
        params: {
          path: { system_id: params.systemId },
          query: {
            channels: params.channels,
            time_start: params.timeStart,
            time_end: params.timeEnd,
            interval: params.interval,
          },
        },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater metrics:", error);
    return null;
  }
}
