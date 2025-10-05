# Low Temperature Control

Capstone Project for Computer Engineering, Chulalongkorn University

This Turborepo starter is maintained by the Turborepo core team.

## Folder Structure

### Apps

- `rice-shower`: Data Collector for LGG API
- `web`: Dashboard Application (Next.js)
- `lgg-api`: Lakeshore Management API (Python FastAPI app connecting USB Serial to Lakeshore Devices)
- `temperature-control`: TODO

### Packages (Internal)

- `api-client`: API Client for each API services using `openapi-generator`
- `config`: ESLint and TypeScript configurations
- `tsdb`: Database Schema for TimescaleDB
- `main-db`: TODO
- `ui`: React UI Component Library powered by Shadcn UI

## Setup

Use node.js with the version specified in `.nvmrc` file (currently `lts/jod` or 22 LTS).

Use pnpm (via Corepack)

todo: db setup guide + docker

## Develop

todo
