from contextlib import asynccontextmanager
from threading import Lock
from fastapi import FastAPI
from lakeshore import Model240, Model240InputParameter, Model240CurveHeader
import os

from constants.env import USE_MOCK
from mocks.model240 import MockModel240

from typing import Self
from collections.abc import AsyncGenerator
from schemas.curve import CurveDataPoint, CurveHeader
from schemas.curve import CurveDataPoints
from exceptions.lakeshore import DeviceNotConnectedError, ChannelError
from schemas.reading import InputParameter, MonitorResp
from schemas.device import IdentificationResp, StatusResp, Brightness

from fastapi import Request, HTTPException


class LakeshoreService:
    """Service layer for interacting with the Lakeshore Model240 device."""
    device: Model240 | None = None

    def __new__(cls) -> Self:
        """
        Singleton pattern, only one instance of LakeshoreService exists.

        :param cls: LakeshoreService class
        :return: Instance of LakeshoreService
        :rtype: Self
        """

        if not hasattr(cls, '_instance'):
            cls._instance = super().__new__(cls)
        return cls._instance

    def connect(self) -> None:
        """
        Connect to the Model240 device.

        :param self: LakeshoreService instance
        :return: True if connected, None if error occurred
        :rtype: bool | None
        """
        try:
            if LakeshoreService.device is None:
                if os.getenv(USE_MOCK):
                    print("Using MockModel240")
                    LakeshoreService.device = MockModel240()  # type: ignore
                else:
                    LakeshoreService.device = Model240()
        except Exception as e:
            raise HTTPException(503, f"Connection failed: {e}")

    def disconnect(self) -> None:
        """
        Disconnect from the Model240 device.

        :param self: LakeshoreService instance
        :return: True if disconnected, None if error occurred
        :rtype: bool | None
        """
        if LakeshoreService.device:
            try:
                LakeshoreService.device.disconnect_usb()
                LakeshoreService.device = None
            except Exception as e:
                raise HTTPException(503, f"Connection failed: {e}")

    def get_device(self) -> Model240:
        """
        Get the connected Model240 device or raise an error if not connected.

        :param self: LakeshoreService instance
        :return: Connected Model240 device
        :rtype: Model240
        """
        if not LakeshoreService.device:
            raise DeviceNotConnectedError()
        return LakeshoreService.device

    @asynccontextmanager
    @staticmethod
    async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
        """
        Lifespan context manager to handle application startup and shutdown.

        :param app: FastAPI application instance
        :type app: FastAPI
        :return: Lifespan context manager
        :rtype: AsyncGenerator[None, None]
        """
        app.state.lock = Lock()
        yield
        LakeshoreService().disconnect()

    # =========== Device Methods ===========

    def get_identification(self) -> IdentificationResp:
        """
        Return model240's identification parameters.

        :param self: LakeshoreService instance
        :return: Identification parameters
        :rtype: IdentificationResp
        """
        device = self.get_device()
        identification = device.get_identification()
        return IdentificationResp(
            manufacturer=identification['manufacturer'],
            model=identification['model'],
            serial_number=identification['serial number'],
            firmware_version=identification['firmware version']
        )

    def get_status(self, request: Request, channel: int) -> StatusResp:
        """
        Returns the current status indicator of the specified channel

        The integer returned represents the sum of the bit weighting of the channel status flag bits. A “000”
        response indicates a valid reading is present.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number (1-8)
        :type channel: int
        :return: Current status indicator of the specified channel
        :rtype: StatusResp
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            status = device.get_channel_reading_status(channel)
            return StatusResp(
                invalid_reading=status['invalid reading'],
                temp_under_range=status['temp under range'],
                temp_over_range=status['temp over range'],
                sensor_units_over_range=status['sensor units over range'],
                sensor_units_under_range=status['sensor units under range']
            )

    def get_modname(self, request: Request) -> str:
        """
        Return the Model240's module name.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :return: Model240's module name
        :rtype: str
        """
        with request.app.state.lock:
            device = self.get_device()
            return device.get_modname()

    def set_modname(self, request: Request, modname: str) -> None:
        """
        Set the Model240's module name.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param modname: New module name
        :type modname: str
        """
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_modname(modname)
            except Exception as e:
                raise HTTPException(503, f"Update failed: {e}")

    def get_brightness(self, request: Request) -> Brightness:
        """
        Get the current brightness level of the Model240.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :return: Current brightness level
        :rtype: Brightness | None
        """
        with request.app.state.lock:
            try:
                device = self.get_device()
                brightness = int(device.query("BRIGT?"))
                if not 0 <= brightness <= 4:
                    raise HTTPException(400, "Invalid brightness level")
            except Exception as e:
                raise HTTPException(503, f"Get brightness failed: {e}")
            return Brightness(brightness=brightness * 25)

    def set_brightness(self, request: Request, brightness: int) -> None:
        """
        Set the brightness level of the Model240's panel display.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param brightness: New brightness level
        :type brightness: int
        """
        if not 0 <= brightness <= 100:
            raise HTTPException(
                400, "Brightness must be between 0 and 100")
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_brightness(brightness)
            except ValueError as e:
                raise HTTPException(400, f"Invalid brightness value: {e}")
            except Exception as e:
                raise HTTPException(503, f"Update failed: {e}")

    # =========== Reading Methods ===========
    def get_input_parameter(self, request: Request, channel: int) -> InputParameter:
        """
        Get the parameter details for the specified channel.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        :return: Input parameter details
        :rtype: InputParameter
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            input_param = device.get_input_parameter(channel).__dict__
            return InputParameter(sensor_name=device.get_sensor_name(channel), **input_param, filter=device.get_filter(channel))

    def set_input_config(self, request: Request, input_param: InputParameter, channel: int) -> None:
        """
        Set the input configuration for the specified channel, including filter and sensor name.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param input_param: Description
        :type input_param: InputParameter
        :param channel: Description
        :type channel: int
        """
        inp: Model240InputParameter = Model240InputParameter(
            sensor=input_param.sensor_type,
            auto_range_enable=input_param.auto_range_enable,
            current_reversal_enable=input_param.current_reversal_enable,
            units=input_param.temperature_unit,
            input_enable=input_param.input_enable,
            input_range=input_param.input_range
        )
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_input_parameter(channel, inp)
                if input_param.filter:
                    device.set_filter(channel, input_param.filter)
                if input_param.sensor_name:
                    device.set_sensor_name(
                        channel, input_param.sensor_name)
            except Exception as e:
                raise HTTPException(503, f"Update failed: {e}")

    def get_monitor(self, request: Request, channel: int) -> MonitorResp:
        """
        Return the temperature readings (Kelvin, Ohm) for the specified channel.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        :return: Temperature readings for the specified channel
        :rtype: MonitorResp
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            # celsius = device.get_celsius_reading(channel)
            # farenheit = device.get_fahrenheit_reading(channel)
            kelvin = device.get_kelvin_reading(channel)
            sensor = device.get_sensor_reading(channel)
            return MonitorResp(
                kelvin=kelvin,
                sensor=sensor
            )

    # =========== Curve Methods ===========

    def get_curve_header(self, request: Request, channel: int) -> CurveHeader:
        """
        Returns parameters set on a particular user curve header.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        :return: Curve header information for the specified channel
        :rtype: CurveHeader
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            return CurveHeader(**device.get_curve_header(channel).__dict__)

    def get_curve_data_point(self, request: Request, channel: int, index: int) -> CurveDataPoint:
        """
        Returns a standard or user curve data point.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        :param index: Data point index
        :type index: int
        :return: Curve data point for the specified channel and index
        :rtype: CurveDataPoint
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            sensor, temp = str(device.get_curve_data_point(
                channel, index)).split(',')
            return CurveDataPoint(
                temperature=float(temp),
                sensor=float(sensor)
            )

    def get_curve_data_points(self, request: Request, channel: int) -> CurveDataPoints:
        """
        Return all curve data points for the specified channel.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        :return: Curve data points for the specified channel
        :rtype: CurveDataPoints
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            device = self.get_device()
            raw_data = [device.get_curve_data_point(
                channel, i).split(',') for i in range(1, 201)]
            sensors = [dp[0] for dp in raw_data]
            temperatures = [dp[1] for dp in raw_data]
            return CurveDataPoints(
                channel=channel,
                temperatures=list(map(float, temperatures)),
                sensors=list(map(float, sensors))
            )

    def set_curve_header(self, request: Request, curve_header: CurveHeader, channel: int) -> None:
        """
        Configures the user curve header.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param curve_header: Curve header information
        :type curve_header: CurveHeader
        :param channel: Channel number
        :type channel: int
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        curve_header_resp = Model240CurveHeader(
            curve_name=curve_header.curve_name,
            serial_number=curve_header.serial_number,
            curve_data_format=curve_header.curve_data_format,
            temperature_limit=curve_header.temperature_limit,
            coefficient=curve_header.coefficient
        )
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_curve_header(channel, curve_header_resp)
            except Exception as e:
                raise HTTPException(503, f"Update failed: {e}")

    def set_curve_data_point(self, request: Request, data_point: CurveDataPoint, channel: int, index: int) -> None:
        """
        Configures a user curve point.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param data_point: Curve data point information
        :type data_point: CurveDataPoint
        :param channel: Channel number
        :type channel: int
        :param index: Curve point index
        :type index: int
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_curve_data_point(
                    channel, index, data_point.sensor, data_point.temperature)
            except Exception as e:
                raise HTTPException(503, f"Update failed: {e}")

    def delete_curve(self, request: Request, channel: int) -> None:
        """
        Deletes the user curve.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        :param channel: Channel number
        :type channel: int
        """
        if not 1 <= channel <= 8:
            raise ChannelError(channel)
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.delete_curve(channel)
            except Exception as e:
                raise HTTPException(503, f"Delete curve failed: {e}")

    def set_factory_defaults(self, request: Request) -> None:
        """
        Restore the Model240 to factory default settings.

        :param self: LakeshoreService instance
        :param request: FastAPI request object
        :type request: Request
        """
        with request.app.state.lock:
            try:
                device = self.get_device()
                device.set_factory_defaults()
            except Exception as e:
                raise HTTPException(503, f"Factory reset failed: {e}")
