"use server";

import { heaterFetchClient } from "@/libs/serverApi";

export async function getHeaterStatus() {
  try {
    const { data, error } = await heaterFetchClient.GET("/pid/status");

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater status:", error);
    return null;
  }
}

export async function getHeaterConfig() {
  try {
    const { data, error } = await heaterFetchClient.GET("/config/all");

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch heater config:", error);
    return null;
  }
}

export async function setTargetTemperature(target: number) {
  try {
    const { data, error } = await heaterFetchClient.POST(
      "/config/target-temp",
      {
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
