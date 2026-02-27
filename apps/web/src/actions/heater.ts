"use server";

import { heaterFetchClient } from "@/libs/serverApi";

export async function getHeaterStatus(channelId: number) {
  try {
    const { data, error } = await heaterFetchClient.GET(
      "/pid/{channel_id}/status",
      {
        params: { path: { channel_id: channelId } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater status:", error);
    return null;
  }
}

export async function getHeaterConfig(channelId: number) {
  try {
    const { data, error } = await heaterFetchClient.GET(
      "/config/{channel_id}/all",
      {
        params: { path: { channel_id: channelId } },
      },
    );

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater config:", error);
    return null;
  }
}

export async function setTargetTemperature(channelId: number, target: number) {
  try {
    const { data, error } = await heaterFetchClient.POST(
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

export async function startPID(channelId: number) {
  try {
    const { data, error } = await heaterFetchClient.POST(
      "/pid/{channel_id}/start",
      {
        params: { path: { channel_id: channelId } },
      },
    );

    if (error) {
      return { success: false, error: "Failed to start PID controller" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to start PID:", error);
    return { success: false, error: "Failed to start PID controller" };
  }
}

export async function stopPID(channelId: number) {
  try {
    const { data, error } = await heaterFetchClient.POST(
      "/pid/{channel_id}/stop",
      {
        params: { path: { channel_id: channelId } },
      },
    );

    if (error) {
      return { success: false, error: "Failed to stop PID controller" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to stop PID:", error);
    return { success: false, error: "Failed to stop PID controller" };
  }
}

export async function getPIDParameters(channelId: number) {
  try {
    const { data, error } = await heaterFetchClient.GET(
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
) {
  try {
    const { data, error } = await heaterFetchClient.POST(
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
