"use server";

import type { RiceShower } from "@repo/api-client";

import { riceShowerFetchClient } from "@/libs/serverApi";

type SystemResponse =
  RiceShower.Operations["listSystems"]["responses"]["200"]["content"]["application/json"][number];

export type System = SystemResponse;
export type SystemThermo = System["thermos"][number];
export type SystemHeater = System["heaters"][number];

type CreateSystemBody =
  RiceShower.Operations["createSystem"]["requestBody"]["content"]["application/json"];
type UpdateSystemBody =
  RiceShower.Operations["updateSystem"]["requestBody"]["content"]["application/json"];

export async function getSystems(): Promise<System[]> {
  try {
    const { data, error } = await riceShowerFetchClient.GET("/systems/");
    if (error || !data) return [];
    return data;
  } catch (error) {
    console.error("Failed to fetch systems:", error);
    return [];
  }
}

export async function getSystemById(id: string): Promise<System | null> {
  try {
    const { data, error } = await riceShowerFetchClient.GET("/systems/{id}", {
      params: { path: { id } },
    });
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("Failed to fetch system:", error);
    return null;
  }
}

export async function createSystemAction(input: CreateSystemBody) {
  try {
    const { data, error } = await riceShowerFetchClient.POST("/systems/", {
      body: input,
    });
    if (error) {
      return {
        success: false as const,
        error: (error as { error?: string }).error ?? "Failed to create system",
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to create system:", error);
    return { success: false as const, error: "Failed to create system" };
  }
}

export async function updateSystemAction(id: string, input: UpdateSystemBody) {
  try {
    const { data, error } = await riceShowerFetchClient.PUT("/systems/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) {
      return {
        success: false as const,
        error: (error as { error?: string }).error ?? "Failed to update system",
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to update system:", error);
    return { success: false as const, error: "Failed to update system" };
  }
}

export async function deleteSystemAction(id: string) {
  try {
    const { data, error } = await riceShowerFetchClient.DELETE(
      "/systems/{id}",
      {
        params: { path: { id } },
      },
    );
    if (error) {
      return {
        success: false as const,
        error: (error as { error?: string }).error ?? "Failed to delete system",
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to delete system:", error);
    return { success: false as const, error: "Failed to delete system" };
  }
}
