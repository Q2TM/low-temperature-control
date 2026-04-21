import threading
import serial
from typing import Optional
import time


class PowerSupplyRepository():
    def send_frame(self, frame: str): ...
    def read_frame(self): ...
    def set_voltage(self, v: float): ...
    def read_voltage(self): ...
    def set_current(self, i: float): ...
    def read_current(self): ...
    def power_on(self): ...
    def power_off(self): ...
    def pc_connect(self): ...
    def pc_disconnect(self): ...


class ProgrammablePowerSupplyRepository(PowerSupplyRepository):
    def __init__(self, port: str, baudrate: int = 9600):
        self._lock = threading.RLock()
        self.port = port
        self.baudrate = baudrate
        self.ser: Optional[serial.Serial] = None
        self._current = 0.0
        self.ser = serial.Serial(
            port=port,          # /dev/ttyUSB0 on Raspberry Pi
            baudrate=baudrate,
            bytesize=8,
            parity='N',
            stopbits=1,
            timeout=1
        )

    def __del__(self):
        if self.ser and self.ser.is_open:
            self.ser.close()

    def _validate_value(self, value: float, name: str, min_val: float, max_val: float):
        """Validate value is in range and has correct decimal places."""
        if value < min_val or value > max_val:
            raise ValueError(f"{name} must be between {min_val} and {max_val}")
        value_str = f"{value:.3f}"
        parts = value_str.split('.')
        if len(parts[0]) > 3 or len(parts[1]) > 3:
            raise ValueError(
                f"{name} must have at most 3 digits before and after the decimal point")

    def send_frame(self, frame: str):
        with self._lock:
            time.sleep(0.01)              # ≥ 3.5 char silence
            try:
                self.ser.write(frame.encode('ascii'))
                self.ser.flush()
            except (serial.SerialException, PermissionError) as e:
                # Keep running; outer layer handles error and stops output if necessary
                raise RuntimeError(
                    f"PSU write failed: {type(e).__name__}: {e}")
            time.sleep(0.01)

    def read_frame(self):
        with self._lock:
            buf = ""
            while True:
                ch = self.ser.read(1).decode('ascii', errors='ignore')
                if not ch:
                    return None
                if not buf and ch != '<':
                    return None
                buf += ch
                if ch == '>':
                    return buf

    def set_voltage(self, value):
        with self._lock:
            self._validate_value(value, "Voltage", 0, 31)
            value_str = f"{int(float(value) * 1000):06d}"
            frame = f"<01{value_str}000>"

            self.send_frame(frame)
            print("Sent frame:", frame)
            return self.read_frame()

    def read_voltage(self):
        with self._lock:
            self.send_frame("<02000000000>")
            resp = self.read_frame()

            if not resp:
                print("read_voltage failed: no response frame")
                return None
            if len(resp) != 13 or not (resp.startswith("<") and resp.endswith(">")):
                print(f"read_voltage failed: invalid frame format: {resp!r}")
                return None

            raw_value = resp[3:10]
            if not raw_value.isdigit():
                print(f"read_voltage failed: non-numeric payload: {resp!r}")
                if raw_value[0:2] == "OK":
                    print(
                        f"This is set_current/voltage response: {resp!r}, not a voltage reading")
                return None

            value = int(raw_value) / 10000

            # Inspect cap value, to be fixed later (voltage does not exceed 12 V)
            if value > 12:
                print(
                    f"==========================================================================================")
                print(f"Voltage capped at 12 V, original: {value}")
                print(
                    f"==========================================================================================")
                # value = 12

            print("Received frame:", resp, "Value:", value)
            return value

    def set_current(self, value):
        with self._lock:
            self._validate_value(value, "Current", 0, 10)
            value_str = f"{int(float(value) * 1000):06d}"
            frame = f"<03{value_str}000>"

            self.send_frame(frame)
            print("Sent frame:", frame)
            return self.read_frame()

    def read_current(self):
        with self._lock:
            self.send_frame("<04000000000>")
            resp = self.read_frame()

            if not resp:
                print("read_current failed: no response frame")
                return None
            if len(resp) != 13 or not (resp.startswith("<") and resp.endswith(">")):
                print(f"read_current failed: invalid frame format: {resp!r}")
                return None

            raw_value = resp[3:10]
            if not raw_value.isdigit():
                print(f"read_current failed: non-numeric payload: {resp!r}")
                if raw_value[0:2] == "OK":
                    print(
                        f"This is set_current/voltage response: {resp!r}, not a current reading")
                return None

            value = int(raw_value) / 10000

            # Inspect cap value, to be fixed later (current does not exceed 2.08 A)
            if value > 2.08 * 2:
                print(
                    f"==========================================================================================")
                print(
                    f"Current capped at 2.08 * 2 = 4.16 A, original: {value}")
                print(
                    f"==========================================================================================")
                # value = 2.08

            print("Received frame:", resp, "Value:", value)
            return value

    def power_on(self):
        with self._lock:
            self.send_frame("<07000000000>")
            return self.read_frame()

    def power_off(self):
        with self._lock:
            self.send_frame("<08000000000>")
            return self.read_frame()

    def pc_connect(self):
        with self._lock:
            self.send_frame("<09100000000>")
            return self.read_frame()

    def pc_disconnect(self):
        with self._lock:
            self.send_frame("<09200000000>")
            return self.read_frame()
