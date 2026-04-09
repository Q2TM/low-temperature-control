import { Elysia, t } from "elysia";

import { ScraperManager } from "@/modules/scrape/service";

import {
  CreateSystemBody,
  SystemListResponse,
  SystemModel,
  UpdateSystemBody,
} from "./model";
import {
  createSystem,
  deleteSystem,
  getSystem,
  listSystems,
  updateSystem,
} from "./service";

export const systemsController = new Elysia({
  prefix: "/systems",
  detail: {
    tags: ["Systems"],
  },
})
  .get(
    "/",
    async () => {
      return await listSystems();
    },
    {
      detail: {
        operationId: "listSystems",
        summary: "List Systems",
        description:
          "List all registered systems with their thermometers and heaters",
      },
      response: {
        200: SystemListResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, status }) => {
      const system = await getSystem(id);
      if (!system) {
        throw status(404, { error: "System not found" });
      }
      return system;
    },
    {
      detail: {
        operationId: "getSystem",
        summary: "Get System",
        description:
          "Get a single system by ID with its thermometers and heaters",
      },
      response: {
        200: SystemModel,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .post(
    "/",
    async ({ body, status }) => {
      try {
        const system = await createSystem(body);
        await ScraperManager.reloadSystems();
        return system;
      } catch (_error) {
        throw status(409, {
          error: `System with id '${body.id}' already exists`,
        });
      }
    },
    {
      detail: {
        operationId: "createSystem",
        summary: "Create System",
        description: "Register a new system with thermometers and heaters",
      },
      parse: "json",
      body: CreateSystemBody,
      response: {
        200: SystemModel,
        409: t.Object({ error: t.String() }),
      },
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body, status }) => {
      const system = await updateSystem(id, body);
      if (!system) {
        throw status(404, { error: "System not found" });
      }
      await ScraperManager.reloadSystems();
      return system;
    },
    {
      detail: {
        operationId: "updateSystem",
        summary: "Update System",
        description:
          "Update an existing system. Thermos/heaters are replaced if provided.",
      },
      parse: "json",
      body: UpdateSystemBody,
      response: {
        200: SystemModel,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, status }) => {
      const deleted = await deleteSystem(id);
      if (!deleted) {
        throw status(404, { error: "System not found" });
      }
      await ScraperManager.reloadSystems();
      return { success: true };
    },
    {
      detail: {
        operationId: "deleteSystem",
        summary: "Delete System",
        description:
          "Delete a system and all its associated thermometers and heaters",
      },
      response: {
        200: t.Object({ success: t.Boolean() }),
        404: t.Object({ error: t.String() }),
      },
    },
  );
