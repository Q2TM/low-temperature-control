# Low Temperature Control

Capstone Project for Computer Engineering, Chulalongkorn University

## Folder Structure

### Apps

- `collector` (Rice Shower): Data Collector for Lingangu API and Temperature API. It also serves as a TSDB query server for the dashboard app. (Bun + Elysia)
- `ls-api` (Lingangu API): Lakeshore Management API (Python FastAPI app connecting USB Serial to Lakeshore Devices)
- `temp-api` (Temperature API): TODO (FastAPI)
- `web` (Almond Eye): Dashboard Application (Next.js)

### Packages (Internal)

- `api-client`: API Client for each API services using `openapi-generator`
- `config`: ESLint and TypeScript configurations
- `tsdb`: Database Schema for TimescaleDB
- `main-db`: TODO
- `ui`: React UI Component Library powered by Shadcn UI

## Setup

This repository has two languages and three runtimes: TypeScript (Node.js and Bun) and Python.

### Node.js and pnpm (Package Manager)

Use node.js with the version specified in `.nvmrc` file (currently `lts/jod` or 22 LTS). Running `node -v` should output v22.x.x.

Recommend using `nvm` (Node Version Manager) to manage Node.js versions. Install `nvm` from [nvm-sh/nvm](https://github.com/nvm-sh/nvm).

Run `corepack enable` to enable Corepack, then run `pnpm -v` to verify that the version of pnpm matches the version specified in `package.json`.

### Bun

Install Bun from [bun.com](https://bun.com).

Note that pnpm is still used as the package manager for Bun projects. You can run `pnpm dev` which will delegate to Bun.

### Python + UV

Install Python with version specified in `.python-version` file (currently `3.13`) and use `uv` (Universal Version Manager) to manage Python versions. Install `uv` from [astral-sh/uv](https://github.com/astral-sh/uv) and run `uv sync` to install the dependencies.

### Docker

Make sure you have Docker Desktop or Orbstack installed.

These are the container you will be running for local developments:

- timescaledb: TimescaleDB (A time-series database built on PostgreSQL)
- (Optional) grafana: Grafana (For testing SQL queries locally)

You can run these containers using `docker-compose.yaml` file provided in the root of this repository:

```bash
docker compose up -d
```

## Architecture Diagram

![](./docs/arch-v1.webp)

To run everything locally, follow these steps:

1. Make sure timescaledb is running via Docker and .env are all setup (Put .env besides .env.example files)
2. Starts Lingangu API (Lakeshore Management API) then call `/api/v1/connect` to connect to Lakeshore devices via USB Serial. (We will make this automatically in the future)
3. Starts Temperature API
4. Starts Rice Shower (`apps/collector`)
5. Starts Almond Eye (`apps/web`)

### URLs

- Lingangu API Swagger will be available at `http://localhost:8000/docs`
- Rice Shower Swagger will be available at `http://localhost:8001/openapi`
- Almond Eye Dashboard will be available at `http://localhost:3000`

## Contribution

### OpenAPI and Codegen

When making changes to the API Server (Lingangu API, Temperature API, or Rice Shower), the swagger files located at `docs/**` of that project will be automatically generated upon server start.

However, you still have to run `pnpm codegen` in the root of the repository to regenerate the API Client packages used in other projects.

Please make sure to do this step before creating a pull request.
