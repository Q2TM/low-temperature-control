"use server";

import type { RiceShower } from "@repo/api-client";

import { riceShowerFetchClient } from "@/libs/serverApi";

type ExperimentResponse =
  RiceShower.Operations["getExperiment"]["responses"]["200"]["content"]["application/json"];

export type Experiment = ExperimentResponse;
export type ExperimentStatus = Experiment["status"];
export type ExperimentStopReason = NonNullable<Experiment["stopReason"]>;

type StartExperimentBody =
  RiceShower.Operations["startExperiment"]["requestBody"]["content"]["application/json"];
type UpdateExperimentBody =
  RiceShower.Operations["updateExperiment"]["requestBody"]["content"]["application/json"];

type ListQuery =
  RiceShower.Operations["listExperiments"]["parameters"]["query"];

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "error" in error) {
    const e = (error as { error?: unknown }).error;
    if (typeof e === "string") return e;
  }
  return fallback;
}

export async function listExperiments(filters: ListQuery = {}) {
  try {
    const { data, error } = await riceShowerFetchClient.GET("/experiments/", {
      params: { query: filters },
    });
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("Failed to list experiments:", error);
    return null;
  }
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/experiments/{id}",
      { params: { path: { id } } },
    );
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("Failed to fetch experiment:", error);
    return null;
  }
}

export async function getActiveExperiment(
  systemId: string,
  channel: number,
): Promise<Experiment | null> {
  try {
    const { data, error } = await riceShowerFetchClient.GET(
      "/experiments/active",
      { params: { query: { systemId, channel } } },
    );
    if (error || !data) return null;
    return data.experiment;
  } catch (error) {
    console.error("Failed to fetch active experiment:", error);
    return null;
  }
}

export async function startExperiment(input: StartExperimentBody) {
  try {
    const { data, error } = await riceShowerFetchClient.POST("/experiments/", {
      body: input,
    });
    if (error) {
      return {
        success: false as const,
        error: errorMessage(error, "Failed to start experiment"),
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to start experiment:", error);
    return { success: false as const, error: "Failed to start experiment" };
  }
}

export async function stopExperiment(id: string) {
  try {
    const { data, error } = await riceShowerFetchClient.POST(
      "/experiments/{id}/stop",
      { params: { path: { id } } },
    );
    if (error) {
      return {
        success: false as const,
        error: errorMessage(error, "Failed to stop experiment"),
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to stop experiment:", error);
    return { success: false as const, error: "Failed to stop experiment" };
  }
}

export async function updateExperiment(
  id: string,
  input: UpdateExperimentBody,
) {
  try {
    const { data, error } = await riceShowerFetchClient.PATCH(
      "/experiments/{id}",
      { params: { path: { id } }, body: input },
    );
    if (error) {
      return {
        success: false as const,
        error: errorMessage(error, "Failed to update experiment"),
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to update experiment:", error);
    return { success: false as const, error: "Failed to update experiment" };
  }
}

export async function deleteExperiment(id: string) {
  try {
    const { data, error } = await riceShowerFetchClient.DELETE(
      "/experiments/{id}",
      { params: { path: { id } } },
    );
    if (error) {
      return {
        success: false as const,
        error: errorMessage(error, "Failed to delete experiment"),
      };
    }
    return { success: true as const, data: data! };
  } catch (error) {
    console.error("Failed to delete experiment:", error);
    return { success: false as const, error: "Failed to delete experiment" };
  }
}
