import threading
import time
import random
import numpy as np
from lakeshore.model_240_enums import Model240Enums
from dataclasses import dataclass


@dataclass
class MockCurveHeader:
    curve_name: str
    serial_number: str
    curve_data_format: Model240Enums.CurveFormat
    temperature_limit: float
    coefficient: Model240Enums.Coefficients


class MockCurve:
    """Mock class to simulate
    curve data generation for testing purposes.
    range of sensor unit is [0, 2]
    temperature range can be set by with during generate_random_curve
    """

    def __init__(self) -> None:
        self.data: dict[int, list[tuple[float, float]]] = {}
        self.header: dict[int, MockCurveHeader] = {}
        self.poly: dict[int, np.poly1d] = {}
        for i in range(1, 9):
            self.header[i] = MockCurveHeader(
                curve_name=f"Curve {i}",
                serial_number=f"SN{i}",
                curve_data_format=Model240Enums.CurveFormat.VOLTS_PER_KELVIN,
                temperature_limit=400.0,
                coefficient=Model240Enums.Coefficients.NEGATIVE
            ) 
            self.data[i], self.poly[i] = self.generate_random_curve(10, 100) # (sensor unit, temperature kelvin)

        

    def generate_random_curve(self, temp_start: int, temp_end: int) -> tuple[list[tuple[float, float]], np.poly1d]:
        """
        Docstring for generate_random_curve

        :param self: Description
        :param temp_start: Description
        :type temp_start: int
        :param temp_end: Description
        :type temp_end: int
        """
        data_points = []
        resistances = []
        temperatures = []
        for i in range(1, 201):
            # (sensor unit, temperature kelvin)
            # sensor and temp have inverse relation
            sensor_unit = i / 100 - random.uniform(0, 0.005)      
            temperature_kelvin = (
                201 - i)/200 * (temp_end - temp_start) + temp_start + random.uniform(-1, 1) * 5

            resistances.append(sensor_unit)
            temperatures.append(temperature_kelvin)
            data_points.append((sensor_unit, temperature_kelvin))

        # Polynomial fitting (e.g., 3rd-degree polynomial fit)
        coefficients = np.polyfit(resistances, temperatures, 3)        

        return data_points, np.poly1d(coefficients) # Create a polynomial object
    
    


class MockRoomTempSensor:
    """
    Mocks a sensor that reads room temperature as resistance (0-2),
    updates value every 1 second in a background thread.
    Uses a lock to prevent race conditions.
    """
    def __init__(self, curve: MockCurve) -> None:
        self.curve = curve
        self._resistance = 0.0
        self._lock = threading.Lock()
        self._running = True
        self._thread = threading.Thread(target=self._update_loop, daemon=True)
        self._thread.start()
        

    def _update_loop(self):
        while self._running:
            value = random.uniform(0, 2)
            with self._lock:
                self._resistance = value
            time.sleep(1)

    def get_reading(self, channel:int) -> tuple[float, float, float, float]:
        kelvin = float(self.curve.poly[channel](self._resistance))
        celcius = kelvin - 273.15
        fahrenheit = celcius * 9/5 + 32
        return celcius, fahrenheit, kelvin, self._resistance

    def stop(self):
        self._running = False
        self._thread.join()
        
    

if __name__ == "__main__":
    from pprint import pprint
    c = MockCurve()
    sensor = MockRoomTempSensor(c)
    
    for i in range(100):
        pprint(sensor.get_reading(1))
        time.sleep(0.2)