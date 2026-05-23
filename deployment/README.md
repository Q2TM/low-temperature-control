# Docker Deployment

This compose file runs the application services for lab hardware deployment:

- `ls-api`
- `heater-api`
- `rice-shower`
- `web`

The infrastructure services, such as TimescaleDB and OpenTelemetry Collector, are
defined in the root `docker-compose.yaml`.

## Run Order

Start the root compose first so the shared Docker network and infrastructure
services exist:

```bash
docker compose -f docker-compose.yaml up -d
```

Then start the deployment compose:

```bash
docker compose -f deployment/docker-compose.yaml up -d
```

The deployment compose uses the external `rice-shower` network created by the
root compose. If the app containers cannot reach `tsdb`, `otel-collector`,
`ls-api`, or `heater-api`, confirm they are attached to this network:

```bash
docker network inspect rice-shower
```

## Service URLs

Inside Docker, services should use Docker service names:

- `ls-api`: `http://ls-api:8000`
- `heater-api`: `http://heater-api:8001`
- `rice-shower`: `http://rice-shower:8100`
- `tsdb`: `tsdb:5432`
- `otel-collector`: `http://otel-collector:4317`

From the host machine:

- Lakeshore API: `http://localhost:8000`
- Heater API: `http://localhost:8001`
- Rice Shower API: `http://localhost:8100`
- Web Dashboard: `http://localhost:3100`

## Lab Hardware Serial Devices

The lab hardware appears as USB serial devices on the host. The observed setup
was:

- Lakeshore Model 240: `/dev/ttyUSB1`
- PSU USB-UART bridge: `/dev/ttyUSB0`

The `/dev/ttyUSB*` number is assigned by the host in the order devices are
detected. If devices are unplugged and plugged back in, the same physical device
can move from `/dev/ttyUSB0` to `/dev/ttyUSB1`, swap with another device, or
even become a higher number such as `/dev/ttyUSB2`. Use `/dev/serial/by-id` to
identify which physical device is which:

```bash
ls -la /dev/serial/by-id/
```

Observed stable IDs:

```text
usb-Silicon_Labs_240-8P_Temperature_Input_Module_LSA2DJ4-if00-port0 -> ../../ttyUSB1
usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0 -> ../../ttyUSB0
```

These `by-id` paths are stable for the same physical device because they are
based on USB identity and serial information. They can change if the hardware is
replaced with a different serial number.

## Docker Device Mapping Caveat

For the Lakeshore API, the Python Lakeshore driver checks the serial device path
that it opens. In deployment, map the host serial device to the same path inside
the container and set `LAKESHORE_COM_PORT` to that same in-container path.

Working example from the lab:

```yaml
ls-api:
  environment:
    LAKESHORE_COM_PORT: /dev/ttyUSB1
  devices:
    - "${LS_SERIAL_DEVICE:-/dev/ttyUSB1}:/dev/ttyUSB1"

heater-api:
  devices:
    - "${PSU_SERIAL_DEVICE:-/dev/ttyUSB0}:/dev/ttyUSB0"
```

If the host paths change after reconnecting USB devices, resolve the stable
`by-id` symlink on the host and pass the resolved `/dev/ttyUSB*` path:

```bash
readlink -f /dev/serial/by-id/usb-Silicon_Labs_240-8P_Temperature_Input_Module_LSA2DJ4-if00-port0
readlink -f /dev/serial/by-id/usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0
```

Then override the compose defaults when starting the deployment:

```bash
LS_SERIAL_DEVICE=/dev/ttyUSB1 PSU_SERIAL_DEVICE=/dev/ttyUSB0 \
  docker compose -f deployment/docker-compose.yaml up -d
```

Make sure `LAKESHORE_COM_PORT` in `deployment/docker-compose.yaml` matches the
in-container Lakeshore path.

## Verification

Check that `ls-api` can talk to the real Lakeshore device:

```bash
curl http://localhost:8000/api/v1/device/module-name
```

Expected response for the tested lab device:

```text
"Bashame Meme"
```

Check that `rice-shower` can reach `ls-api` through the Docker network:

```bash
docker exec rice-shower curl http://ls-api:8000/api/v1/device/module-name
```

## Troubleshooting

If `rice-shower` reports it cannot connect to `ls-api`, check that both
containers are attached to the `rice-shower` network.

If `ls-api` returns service unavailable, check:

- the physical Lakeshore is plugged in
- the host path in `LS_SERIAL_DEVICE` points to the Lakeshore device
- the `devices` mapping exposes the same path used by `LAKESHORE_COM_PORT`
- the image was rebuilt after changes to `apps/ls-api/services/lakeshore.py`

If `rice-shower` cannot connect to the database, check:

- root compose is running
- `rice-tsdb` is attached to the `rice-shower` network
- `DATABASE_URL` points to `tsdb:5432` from inside Docker
- the configured database name matches the database created by the root compose
