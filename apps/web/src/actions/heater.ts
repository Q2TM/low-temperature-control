"use server";

import { createHeaterClient } from "@/libs/serverApi";
import { resolveSystem } from "@/libs/systemRegistry";

async function getClient(systemId: string) {
  const system = await resolveSystem(systemId);
  if (!system) throw new Error(`System '${systemId}' not found`);
  return createHeaterClient(system.heaterUrl);
}

export async function getHeaterStatus(channelId: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET("/pid/{channel_id}/status", {
      params: { path: { channel_id: channelId } },
    });

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater status:", error);
    return null;
  }
}

export async function getHeaterConfig(channelId: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET("/config/{channel_id}/all", {
      params: { path: { channel_id: channelId } },
    });

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater config:", error);
    return null;
  }
}

export async function setTargetTemperature(
  channelId: number,
  target: number,
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.POST(
      "/config/{channel_id}/target-temp",
      {
        params: { path: { channel_id: channelId } },
        body: { target },
      },
    );

    if (error) {
      return { success: false, error: "Failed to set target temperature" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set target temperature:", error);
    return { success: false, error: "Failed to set target temperature" };
  }
}

export async function startPID(channelId: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.POST("/pid/{channel_id}/start", {
      params: { path: { channel_id: channelId } },
    });

    if (error) {
      return { success: false, error: "Failed to start PID controller" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to start PID:", error);
    return { success: false, error: "Failed to start PID controller" };
  }
}

export async function stopPID(channelId: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.POST("/pid/{channel_id}/stop", {
      params: { path: { channel_id: channelId } },
    });

    if (error) {
      return { success: false, error: "Failed to stop PID controller" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to stop PID:", error);
    return { success: false, error: "Failed to stop PID controller" };
  }
}

export async function getPIDParameters(channelId: number, systemId: string) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.GET(
      "/config/{channel_id}/pid-parameters",
      {
        params: { path: { channel_id: channelId } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch PID parameters:", error);
    return null;
  }
}

export async function setPIDParameters(
  channelId: number,
  params: {
    kp: number;
    ki: number;
    kd: number;
  },
  systemId: string,
) {
  try {
    const client = await getClient(systemId);
    const { data, error } = await client.POST(
      "/config/{channel_id}/pid-parameters",
      {
        params: { path: { channel_id: channelId } },
        body: params,
      },
    );

    if (error) {
      return { success: false, error: "Failed to set PID parameters" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set PID parameters:", error);
    return { success: false, error: "Failed to set PID parameters" };
  }
}
