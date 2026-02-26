import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { stringify } from "yaml";

import { sanitizeForOas30 } from "./openapi-sanitize";
import { simulatorController } from "./simulator";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Simulator (LT Capstone)",
          description:
            "Simulator for Foam Box, works as stub/mocks for lgg-api and heater-api.",
          version: "0.1.0",
        },
        tags: [
          {
            name: "Simulator",
            description: "Endpoints related to simulator functionalities",
          },
        ],
      },
    }),
  )
  .use(
    opentelemetry({
      serviceName: "simulator",
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    }),
  )
  .use(simulatorController)
  .listen(8101);

const appUrl = `http://${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${appUrl} as ${app.server?.development ? "dev" : "non-dev"}`,
);

if (app.server?.development) {
  const openapiSpec = await fetch(appUrl + "/openapi/json").then((r) =>
    r.json(),
  );

  // Post-process to fix TypeBox JSON Schema → OpenAPI 3.0 incompatibilities
  sanitizeForOas30(openapiSpec);

  await Bun.write("docs/openapi.json", JSON.stringify(openapiSpec, null, 2));
  await Bun.write("docs/openapi.yaml", stringify(openapiSpec));
  console.log(
    "📝 OpenAPI spec has been saved to docs/openapi.json and docs/openapi.yaml ✅",
  );
  console.log(
    `📖 Swagger Page is available at \x1b[1m${appUrl}/openapi\x1b[0m`,
  );
}
