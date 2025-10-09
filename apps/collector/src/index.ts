import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { stringify } from "yaml";

import { queryController } from "./modules/query";
import { scrapeController } from "./modules/scrape";
import { Scraper } from "./modules/scrape/service";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Rice Shower (LT Capstone)",
          description:
            "API Web Server that scrape Lakeshore Metrics and save it to time-series database, then allow user to query the data.",
          version: "0.1.0",
        },
      },
    }),
  )
  .use(queryController)
  .use(scrapeController)
  .listen(8001);

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
}

Scraper.initialize();
