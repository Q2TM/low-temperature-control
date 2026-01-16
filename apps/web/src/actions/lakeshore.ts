"use server";

import { lakeshoreFetchClient } from "@/libs/serverApi";

export async function getCurveHeader(channel: number) {
  try {
    const { data, error } = await lakeshoreFetchClient.GET(
      "/api/v1/curve/{channel}/header",
      {
        params: { path: { channel } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch curve header:", error);
    return null;
  }
}

export async function setCurveHeader(
  channel: number,
  header: {
    curveName: string;
    serialNumber: string;
    curveDataFormat: 2 | 3 | 4;
    temperatureLimit: number;
    coefficient: 1 | 2;
  },
) {
  try {
    const { data, error } = await lakeshoreFetchClient.PUT(
      "/api/v1/curve/{channel}/header",
      {
        params: { path: { channel } },
        body: header,
      },
    );

    if (error) {
      return { success: false, error: "Failed to set curve header" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set curve header:", error);
    return { success: false, error: "Failed to set curve header" };
  }
}

export async function getAllCurveDataPoints(channel: number) {
  try {
    const { data, error } = await lakeshoreFetchClient.GET(
      "/api/v1/curve/{channel}/data-points",
      {
        params: { path: { channel } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch curve data points:", error);
    return null;
  }
}

export async function getCurveDataPoint(channel: number, index: number) {
  try {
    const { data, error } = await lakeshoreFetchClient.GET(
      "/api/v1/curve/{channel}/data-point/{index}",
      {
        params: { path: { channel, index } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch curve data point:", error);
    return null;
  }
}

export async function setCurveDataPoint(
  channel: number,
  index: number,
  dataPoint: {
    temperature: number;
    sensor: number;
  },
) {
  try {
    const { data, error } = await lakeshoreFetchClient.PUT(
      "/api/v1/curve/{channel}/data-point/{index}",
      {
        params: { path: { channel, index } },
        body: dataPoint,
      },
    );

    if (error) {
      return { success: false, error: "Failed to set curve data point" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set curve data point:", error);
    return { success: false, error: "Failed to set curve data point" };
  }
}

export async function deleteCurve(channel: number) {
  try {
    const { data, error } = await lakeshoreFetchClient.DELETE(
      "/api/v1/curve/{channel}",
      {
        params: { path: { channel } },
      },
    );

    if (error) {
      return { success: false, error: "Failed to delete curve" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to delete curve:", error);
    return { success: false, error: "Failed to delete curve" };
  }
}
