import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { stringify } from "yaml";

import { queryController } from "./modules/query";
import { scrapeController } from "./modules/scrape";
import { Scraper } from "./modules/scrape/service";

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3100",
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "Rice Shower (LT Capstone)",
          description:
            "API Web Server that scrape Lakeshore Metrics and save it to time-series database, then allow user to query the data.",
          version: "0.1.0",
        },
        tags: [
          {
            name: "Query",
            description:
              "Endpoints for querying collected data from time-series database",
          },
          {
            name: "Scrape",
            description:
              "Endpoints for getting metrics/status from the scraper",
          },
        ],
      },
    }),
  )
  .use(
    opentelemetry({
      serviceName: "rice-shower",
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 15000,
      }),
    }),
  )
  .use(queryController)
  .use(scrapeController)
  .listen(8100);

const appUrl = `http://${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${appUrl} as ${app.server?.development ? "dev" : "non-dev"}`,
);

if (app.server?.development) {
  const openapiSpec = await fetch(appUrl + "/openapi/json").then((r) =>
    r.json(),
  );

  await Bun.write("docs/openapi.json", JSON.stringify(openapiSpec, null, 2));
  await Bun.write("docs/openapi.yaml", stringify(openapiSpec));
  console.log(
    "📝 OpenAPI spec has been saved to docs/openapi.json and docs/openapi.yaml ✅",
  );
  console.log(
    `📖 Swagger Page is available at \x1b[1m${appUrl}/openapi\x1b[0m`,
  );
}

Scraper.initialize();
