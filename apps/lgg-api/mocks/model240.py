from dataclasses import dataclass
from lakeshore.model_240_enums import Model240Enums
from mocks.curve_data import MockCurve, MockCurveHeader, MockRoomTempSensor
# from lakeshore.model_240 import Model240InputParameter


@dataclass
class MockInputParameter:
    sensor_type: Model240Enums.SensorTypes
    temperature_unit: Model240Enums.Units
    auto_range_enable: bool
    current_reversal_enable: bool
    input_enable: bool
    input_range: int




class MockModel240:
    """Mock implementation of Lakeshore Model240 for testing."""

    def __init__(self):
        """Initialize mock device with default values."""
        self.connected = True
        self.modname = "Mock Model240"
        self.brightness = 50
        self._sensor_names: dict[int, str] = {
            i: f"Sensor {i}" for i in range(1, 9)}
        self._filters: dict[int, str | None] = {
            i: "No filter" for i in range(1, 9)}
        
        self._input_params: dict[int, MockInputParameter] = {
            i: MockInputParameter(
                sensor_type=Model240Enums.SensorTypes.NTC_RTD,
                temperature_unit=Model240Enums.Units.KELVIN,
                auto_range_enable=True,
                current_reversal_enable=False,
                input_enable=True,
                input_range=1

            ) for i in range(1, 9)
        }
        
        self.curve = MockCurve()
        self.room_temp_sensor = MockRoomTempSensor(self.curve)
        
        
    def disconnect_usb(self):
        """Disconnect the mock device."""
        self.connected = False

    def get_identification(self):
        """Get device identification information."""
        return {
            "manufacturer": "Mock Lakeshore",
            "model": "Model240",
            "serial number": "12345",
            "firmware version": "1.0",
        }

    def get_modname(self):
        return self.modname

    def set_modname(self, modname: str):
        """Set the device modname."""
        self.modname = modname

    def set_brightness(self, brightness: int):
        """Set the display brightness."""
        if not 0 <= brightness <= 100:
            raise ValueError("Brightness must be between 0 and 100")
        self.brightness = brightness

    def get_sensor_name(self, channel: int) -> str:
        """Get the sensor name for a channel."""
        self._validate_channel(channel)
        return self._sensor_names[channel]

    def set_sensor_name(self, channel: int, name: str):
        """Set the sensor name for a channel."""
        self._validate_channel(channel)
        self._sensor_names[channel] = name

    def get_filter(self, channel: int) -> str | None:
        """Get the filter setting for a channel."""
        self._validate_channel(channel)
        return self._filters[channel]

    def set_filter(self, channel: int, filter_setting: str):
        """Set the filter for a channel."""
        self._validate_channel(channel)
        self._filters[channel] = filter_setting

    def get_input_parameter(self, channel: int) -> MockInputParameter:
        """Get input parameters for a channel."""
        self._validate_channel(channel)
        return self._input_params[channel]

    def set_input_parameter(self, channel: int, params: MockInputParameter):
        """Set input parameters for a channel."""
        self._validate_channel(channel)
        self._input_params[channel] = params

    def get_celsius_reading(self, channel: int) -> float:
        """Get temperature reading in Celsius."""
        self._validate_channel(channel)
        return self.room_temp_sensor.get_reading(channel)[0]

    def get_fahrenheit_reading(self, channel: int) -> float:
        """Get temperature reading in Fahrenheit."""
        self._validate_channel(channel)
        return self.room_temp_sensor.get_reading(channel)[1]

    def get_kelvin_reading(self, channel: int) -> float:
        """Get temperature reading in Kelvin."""
        self._validate_channel(channel)
        return self.room_temp_sensor.get_reading(channel)[2]

    def get_sensor_reading(self, channel: int) -> float:
        """Get raw sensor reading."""
        self._validate_channel(channel)
        return self.room_temp_sensor.get_reading(channel)[3]

    def get_channel_reading_status(self, channel: int):
        """Get channel reading status."""
        self._validate_channel(channel)
        return {
            "invalid reading": False,
            "": False,
            "temp under range": False,
            "temp over range": False,
            "sensor units over range": False,
            "sensor units under range": False
        }

    def get_curve_header(self, channel: int) -> MockCurveHeader:
        """Get curve header for a channel."""
        self._validate_channel(channel)
        return self.curve.header[channel]

    def set_curve_header(self, channel: int, header: MockCurveHeader):
        """Set curve header for a channel."""
        self._validate_channel(channel)
        self.curve.header[channel] = header

    def get_curve_data_point(self, channel: int, index: int) -> str:
        """Get curve data point as 'sensor,temperature' string."""
        self._validate_channel(channel)
        if not 1 <= index <= 200:
            raise ValueError("Index must be between 1 and 200")
        sensor, temp = self.curve.data[channel][index-1]
        return f"{sensor},{temp}"

    def set_curve_data_point(self, channel: int, index: int, sensor: float, temperature: float):
        """Set curve data point."""
        self._validate_channel(channel)
        if not 1 <= index <= 200:
            raise ValueError("Index must be between 1 and 200")
        self.curve.data[channel][index-1] = (sensor, temperature)

    def _validate_channel(self, channel: int):
        """Validate channel number."""
        if not 1 <= channel <= 8:
            raise ValueError("Channel must be between 1 and 8")
