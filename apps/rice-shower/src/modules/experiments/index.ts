import { Elysia, t } from "elysia";

import {
  ActiveExperimentQuery,
  ActiveExperimentResponse,
  ExperimentListResponse,
  ExperimentModel,
  ListExperimentsQuery,
  StartExperimentBody,
  UpdateExperimentBody,
} from "./model";
import {
  deleteExperiment,
  ExperimentError,
  getActiveExperiment,
  getExperiment,
  listExperiments,
  startExperiment,
  stopExperiment,
  updateExperiment,
} from "./service";

export const experimentsController = new Elysia({
  prefix: "/experiments",
  detail: {
    tags: ["Experiments"],
  },
})
  .get(
    "/",
    async ({ query }) => {
      return await listExperiments({
        systemId: query.systemId,
        channel: query.channel,
        status: query.status,
        nameContains: query.nameContains,
        startedAfter: query.startedAfter,
        startedBefore: query.startedBefore,
        limit: query.limit,
        offset: query.offset,
      });
    },
    {
      detail: {
        operationId: "listExperiments",
        summary: "List Experiments",
        description:
          "List experiments with optional filters by system, channel, status, name, and start-time range. Sorted by startedAt desc.",
      },
      query: ListExperimentsQuery,
      response: {
        200: ExperimentListResponse,
      },
    },
  )
  .get(
    "/active",
    async ({ query }) => {
      const experiment = await getActiveExperiment(
        query.systemId,
        query.channel,
      );
      return { experiment };
    },
    {
      detail: {
        operationId: "getActiveExperiment",
        summary: "Get Active Experiment",
        description:
          "Return the currently running experiment for a given (systemId, channel), or null if none.",
      },
      query: ActiveExperimentQuery,
      response: {
        200: ActiveExperimentResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, status }) => {
      const exp = await getExperiment(id);
      if (!exp) throw status(404, { error: "Experiment not found" });
      return exp;
    },
    {
      detail: {
        operationId: "getExperiment",
        summary: "Get Experiment",
        description: "Get a single experiment by id.",
      },
      response: {
        200: ExperimentModel,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .post(
    "/",
    async ({ body, status }) => {
      try {
        return await startExperiment(body);
      } catch (e) {
        if (e instanceof ExperimentError) {
          if (e.code === "system_not_found")
            throw status(404, { error: e.message });
          if (
            e.code === "channel_not_registered" ||
            e.code === "pid_start_failed"
          )
            throw status(502, { error: e.message });
          if (e.code === "already_running" || e.code === "pid_already_active")
            throw status(409, { error: e.message });
        }
        console.error(e);
        throw status(500, {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      detail: {
        operationId: "startExperiment",
        summary: "Start Experiment",
        description:
          "Create an experiment and start the PID loop. Captures setpoint and Kp/Ki/Kd as the experiment's start snapshot. Refuses if PID is already active or another experiment is running on the same channel.",
      },
      parse: "json",
      body: StartExperimentBody,
      response: {
        200: ExperimentModel,
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
        502: t.Object({ error: t.String() }),
      },
    },
  )
  .post(
    "/:id/stop",
    async ({ params: { id }, status }) => {
      try {
        return await stopExperiment(id);
      } catch (e) {
        if (e instanceof ExperimentError) {
          if (e.code === "not_running") throw status(404, { error: e.message });
          if (e.code === "system_not_found")
            throw status(404, { error: e.message });
        }
        console.error(e);
        throw status(500, {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      detail: {
        operationId: "stopExperiment",
        summary: "Stop Experiment",
        description:
          "Stop a running experiment. Calls the heater PID stop endpoint and finalizes the experiment row.",
      },
      response: {
        200: ExperimentModel,
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, status }) => {
      const updated = await updateExperiment(id, body);
      if (!updated) throw status(404, { error: "Experiment not found" });
      return updated;
    },
    {
      detail: {
        operationId: "updateExperiment",
        summary: "Update Experiment",
        description: "Update an experiment's name or notes (no other fields).",
      },
      parse: "json",
      body: UpdateExperimentBody,
      response: {
        200: ExperimentModel,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, status }) => {
      try {
        const deleted = await deleteExperiment(id);
        if (!deleted) throw status(404, { error: "Experiment not found" });
        return { success: true };
      } catch (e) {
        if (e instanceof ExperimentError && e.code === "is_running") {
          throw status(409, { error: e.message });
        }
        throw e;
      }
    },
    {
      detail: {
        operationId: "deleteExperiment",
        summary: "Delete Experiment",
        description:
          "Delete a non-running experiment. Refuses to delete a running one.",
      },
      response: {
        200: t.Object({ success: t.Boolean() }),
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
      },
    },
  );
