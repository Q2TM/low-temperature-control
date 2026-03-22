"use server";

import { riceShowerFetchClient } from "@/libs/serverApi";

export async function getTempMetrics(params: {
  instanceName: string;
  channels: number[];
  timeStart: number;
  timeEnd: number;
  interval: number;
}) {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/query/temp/{instance_name}",
      {
        params: {
          path: { instance_name: params.instanceName },
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
  instanceName: string;
  pins: number[];
  timeStart: number;
  timeEnd: number;
  interval: number;
}) {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/query/heater/{instance_name}",
      {
        params: {
          path: { instance_name: params.instanceName },
          query: {
            pins: params.pins,
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
