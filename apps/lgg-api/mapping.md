# Mapping

As of lakeshore (Python SDK) 1.8.1

GenericInstrument (Base Class) has methods: `connect_usb` and `disconnect_usb`

**Note**: HTTP verbs and endpoints reflect current implementation. Missing methods are implemented as 501 Not Implemented endpoints.

**Response Models**: Most endpoints now return structured response objects:

- `OperationResult`: Standard response for operations with `is_success`, `message`, and optional `error` fields
- `MonitorResp`: Contains `kelvin` (temperature) and `sensor` (raw value) fields only
- `InputParameter`: Complete input channel configuration object
- `CurveHeader`, `CurveDataPoint`, `CurveDataPoints`: Curve-related response objects
- `IdentificationResp`, `StatusResp`, `Brightness`: Device-specific response objects

| LS Method                          | Short Description              | Repo Method                        | Endpoint                                         | Note                                            |
| ---------------------------------- | ------------------------------ | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------- | --- |
| **Device Management**              |
| `connect_usb`                      | Connect to USB device          | `connect`                          | `POST /api/v1/device/connect`                    | Returns OperationResult object                  |
| `disconnect_usb`                   | Disconnect from USB device     | `disconnect`                       | `POST /api/v1/device/disconnect`                 | Returns OperationResult object                  |
| `get_identification`               | Get device identification info | `get_identification`               | `GET /api/v1/device/identification`              | Returns manufacturer, model, serial, firmware   |
| `get_channel_reading_status`       | Get channel status flags       | `get_status`                       | `GET /api/v1/device/status/{channel}`            | Returns bit status dictionary                   |
| `set_modname`                      | Set module name                | `set_modname`                      | `PUT /api/v1/device/module-name`                 | Returns OperationResult object                  |
| `get_modname`                      | Get module name                | `get_modname`                      | `GET /api/v1/device/module-name`                 | Returns string                                  |
| `set_brightness`                   | Set display brightness         | `set_brightness`                   | `PUT /api/v1/device/brightness`                  | Returns OperationResult object                  |
| `get_brightness`                   | Get display brightness         | `get_brightness`                   | `GET /api/v1/device/brightness`                  | Returns Brightness object                       |
| **Temperature Readings**           |
| `get_celsius_reading`              | Get temperature in Celsius     | `get_monitor`                      | `GET /api/v1/reading/monitor/{channel}`          | Not available - use kelvin conversion           |
| `get_fahrenheit_reading`           | Get temperature in Fahrenheit  | `get_monitor`                      | `GET /api/v1/reading/monitor/{channel}`          | Not available - use kelvin conversion           |
| `get_kelvin_reading`               | Get temperature in Kelvin      | `get_monitor`                      | `GET /api/v1/reading/monitor/{channel}`          | Returns MonitorResp with kelvin field           |
| `get_sensor_reading`               | Get raw sensor reading         | `get_monitor`                      | `GET /api/v1/reading/monitor/{channel}`          | Returns MonitorResp with sensor field           |
| **Input Configuration**            |
| `get_input_parameter`              | Get input channel parameters   | `get_input_parameter`              | `GET /api/v1/reading/input/{channel}`            | Returns InputParameter object                   |
| `set_input_parameter`              | Set input channel parameters   | `set_input_config`                 | `PUT /api/v1/reading/input/{channel}`            | Returns OperationResult object                  |
| `get_sensor_name`                  | Get sensor channel name        | `get_input_parameter`              | `GET /api/v1/reading/input/{channel}`            | Part of InputParameter response                 |
| `set_sensor_name`                  | Set sensor channel name        | `set_input_config`                 | `PUT /api/v1/reading/input/{channel}`            | Part of InputParameter, returns OperationResult |
| `get_filter`                       | Get channel filter parameter   | `get_input_parameter`              | `GET /api/v1/reading/input/{channel}`            | Part of InputParameter response                 |
| `set_filter`                       | Set channel filter parameter   | `set_input_config`                 | `PUT /api/v1/reading/input/{channel}`            | Part of InputParameter, returns OperationResult |
| **Curve Management**               |
| `get_curve_header`                 | Get curve header parameters    | `get_curve_header`                 | `GET /api/v1/curve/{channel}/header`             | Returns CurveHeader object                      |
| `set_curve_header`                 | Set curve header parameters    | `set_curve_header`                 | `PUT /api/v1/curve/{channel}/header`             | Returns OperationResult object                  |
| `get_curve_data_point`             | Get single curve data point    | `get_curve_data_point`             | `GET /api/v1/curve/{channel}/data-point/{index}` | Returns CurveDataPoint object                   |
| `set_curve_data_point`             | Set single curve data point    | `set_curve_data_point`             | `PUT /api/v1/curve/{channel}/data-point/{index}` | Returns OperationResult object                  |
| -                                  | Get all curve data points      | `get_curve_data_points`            | `GET /api/v1/curve/{channel}/data-points`        | Returns CurveDataPoints object with all data    |
| `delete_curve`                     | Delete user curve              | `delete_curve`                     | `DELETE /api/v1/curve/{channel}`                 | Returns OperationResult object                  |     |
| **Sensor Units Reading**           |
| `get_sensor_units_channel_reading` | Get sensor units value         | `get_sensor_units_channel_reading` | `GET /api/v1/reading/sensor-units/{channel}`     | Returns 501 Not Implemented                     |
| **Factory Reset**                  |
| `set_factory_defaults`             | Reset to factory defaults      | `set_factory_defaults`             | `DELETE /api/v1/device/factory-defaults`         | Returns OperationResult object                  |

Note: Profibus is not implemented.
