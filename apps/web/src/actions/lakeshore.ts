"use server";

import { createLakeshoreClient } from "@/libs/serverApi";
import { resolveSystem } from "@/libs/systemRegistry";

async function getClient(systemId: string) {
  const system = await resolveSystem(systemId);
  if (!system) throw new Error(`System '${systemId}' not found`);
  return createLakeshoreClient(system.thermoUrl);
}

/** Live temperature from Lakeshore (independent of heater PID loop). */
export async function getLakeshoreTemperatureCelsius(
  channel: number,
  systemId: string,
): Promise<number | null> {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET(
      "/api/v1/reading/monitor/{channel}",
      {
        params: { path: { channel } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data.kelvin - 273.15;
  } catch (error) {
    console.error("Failed to fetch Lakeshore monitor reading:", error);
    return null;
  }
}

export async function getCurveHeader(channel: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET("/api/v1/curve/{channel}/header", {
      params: { path: { channel } },
    });

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
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.PUT("/api/v1/curve/{channel}/header", {
      params: { path: { channel } },
      body: header,
    });

    if (error) {
      return { success: false, error: "Failed to set curve header" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set curve header:", error);
    return { success: false, error: "Failed to set curve header" };
  }
}

export async function getAllCurveDataPoints(channel: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET(
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

export async function getCurveDataPoint(
  channel: number,
  index: number,
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET(
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
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.PUT(
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

export async function setCurveDataPoints(
  channel: number,
  dataPoints: { temperature: number; sensor: number }[],
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.PUT(
      "/api/v1/curve/{channel}/data-points",
      {
        params: { path: { channel } },
        body: { dataPoints },
      },
    );

    if (error) {
      return { success: false, error: "Failed to set curve data points" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set curve data points:", error);
    return { success: false, error: "Failed to set curve data points" };
  }
}

export async function deleteCurve(channel: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.DELETE("/api/v1/curve/{channel}", {
      params: { path: { channel } },
    });

    if (error) {
      return { success: false, error: "Failed to delete curve" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to delete curve:", error);
    return { success: false, error: "Failed to delete curve" };
  }
}
