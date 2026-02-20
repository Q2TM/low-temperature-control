# Heater API

API Server that controls multiple heaters via GPIO with PID Logic. Supports multi-channel temperature control with independent PID controllers for each heater.

## Features

- **Multi-Channel Support**: Control multiple heaters simultaneously with independent PID controllers
- **YAML Configuration**: Define heater channels statically in a YAML configuration file
- **PID Control**: Individual PID control loop for each channel with customizable parameters
- **Temperature Monitoring**: Read temperature from Lakeshore Model 240 sensor channels
- **Error Tracking**: Comprehensive error statistics per channel
- **RESTful API**: Control and monitor all channels via HTTP endpoints

## Configuration

### Setup

1. Copy the example configuration file:

   ```bash
   cp config.example.yaml config.yaml
   ```

2. Edit `config.yaml` to define your heater channels:
   ```yaml
   channels:
     - channel_id: "heater_1"
       name: "Primary Heater"
       gpio_pin: 18 # GPIO BCM pin number
       sensor_channel: 1 # Lakeshore sensor channel
       enabled: true
   ```

### Configuration Options

- `channel_id`: Unique identifier for the channel (used in API endpoints)
- `name`: Human-readable name for the channel
- `gpio_pin`: GPIO BCM pin number (0-40) for PWM control
- `sensor_channel`: Lakeshore Model 240 sensor channel number (≥1)
- `enabled`: Whether the channel should be initialized (true/false)

### Custom Config Path

By default, the API loads `config.yaml` from the application directory. You can specify a custom path using the `CONFIG_PATH` environment variable:

```bash
export CONFIG_PATH=/path/to/custom/config.yaml
```

## API Endpoints

### Channel Management

- `GET /channels` - List all configured channels
- `GET /channels/{channel_id}` - Get specific channel information
- `GET /channels/status/all` - Get PID status for all enabled channels

### Configuration (per channel)

- `GET /config/{channel_id}/target-temp` - Get target temperature
- `POST /config/{channel_id}/target-temp` - Set target temperature
- `GET /config/{channel_id}/pid-parameters` - Get PID parameters
- `POST /config/{channel_id}/pid-parameters` - Set PID parameters
- `GET /config/{channel_id}/all` - Get all configuration

### PID Control (per channel)

- `POST /pid/{channel_id}/start` - Start PID controller
- `POST /pid/{channel_id}/stop` - Stop PID controller
- `GET /pid/{channel_id}/status` - Get comprehensive PID status

## Environment Variables

- `GPIO_MODE`: Set to `MOCK` for development or `REAL` for production with actual GPIO
- `CONFIG_PATH`: Path to configuration file (default: `config.yaml`)
- `ENVIRONMENT`: Set to `DEVELOPMENT` to enable OpenAPI spec generation

## Example Usage

```bash
# List all channels
curl http://localhost:8001/channels

# Start PID controller for heater_1
curl -X POST http://localhost:8001/pid/heater_1/start

# Set target temperature to 25°C
curl -X POST http://localhost:8001/config/heater_1/target-temp \
  -H "Content-Type: application/json" \
  -d '{"target": 25.0}'

# Get status
curl http://localhost:8001/pid/heater_1/status
```

## Development

See the [API documentation](http://localhost:8001/docs) when running in development mode.
