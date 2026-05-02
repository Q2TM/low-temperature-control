# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/heater-api/Dockerfile -t heater-api .
#
# In PSU mode the container talks to a programmable power supply over a
# CP2102 USB-UART adapter (typically /dev/ttyUSB0). Expose the device with
# `--device=/dev/ttyUSB0` (or via the `devices:` entry in compose).
#
# Note: the full uv workspace is synced (rather than `--package heater-api`)
# because heater-api's PSU repository depends on `pyserial`, which is only
# pulled in transitively via the `lakeshore` package in `lingangu-api`.

FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /workspace

COPY pyproject.toml uv.lock ./
COPY apps/ls-api/pyproject.toml ./apps/ls-api/
COPY apps/heater-api/pyproject.toml ./apps/heater-api/
COPY packages/api-client/src/python/lgg/pyproject.toml ./packages/api-client/src/python/lgg/
COPY packages/api-client/src/python/simulator/pyproject.toml ./packages/api-client/src/python/simulator/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-workspace

COPY apps/ls-api ./apps/ls-api
COPY apps/heater-api ./apps/heater-api
COPY packages/api-client/src/python/lgg ./packages/api-client/src/python/lgg
COPY packages/api-client/src/python/simulator ./packages/api-client/src/python/simulator

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev


FROM python:3.13-slim-bookworm

COPY --from=builder /workspace /workspace

ENV PATH="/workspace/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    STATE_PATH=/data/state.json

# WORKDIR matches dev cwd so the default `config.yaml` and `./docs/index.html`
# resolve. Mount config.yaml as a read-only file and /data as a writable
# volume for state.json persistence.
WORKDIR /workspace/apps/heater-api

EXPOSE 8001

CMD ["python", "main.py"]
