# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/ls-api/Dockerfile -t ls-api .
#
# Lakeshore Model 240 enumerates as a USB CDC serial device (typically
# /dev/ttyACM0). Expose it to the container with `--device=/dev/ttyACM0`
# (or via the `devices:` entry in compose). The host kernel/usb-acm driver
# is assumed to be installed on the host.

FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /workspace

# Workspace manifests first for cacheable dependency resolution. All members
# must be present so uv can read the workspace graph from the root pyproject.
COPY pyproject.toml uv.lock ./
COPY apps/ls-api/pyproject.toml ./apps/ls-api/
COPY apps/heater-api/pyproject.toml ./apps/heater-api/
COPY packages/api-client/src/python/lgg/pyproject.toml ./packages/api-client/src/python/lgg/
COPY packages/api-client/src/python/simulator/pyproject.toml ./packages/api-client/src/python/simulator/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-workspace --package lingangu-api

# Source for ls-api and the workspace packages it consumes.
COPY apps/ls-api ./apps/ls-api
COPY packages/api-client/src/python/simulator ./packages/api-client/src/python/simulator

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --package lingangu-api


FROM python:3.13-slim-bookworm

COPY --from=builder /workspace /workspace

ENV PATH="/workspace/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# WORKDIR matches dev cwd so app.py's `./docs/index.html` resolves.
WORKDIR /workspace/apps/ls-api

EXPOSE 8000

CMD ["python", "main.py"]
