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
        self._lock = threading.Lock()
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

    def send_frame(self, frame: str):
        time.sleep(0.01)              # ≥ 3.5 char silence
        try:
            self.ser.write(frame.encode('ascii'))
            self.ser.flush()
        except (serial.SerialException, PermissionError) as e:
            # Keep running; outer layer handles error and stops output if necessary
            raise RuntimeError(f"PSU write failed: {type(e).__name__}: {e}")

    def read_frame(self):
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

    def set_voltage(self, v):
        if v < 0 or v > 31:
            raise ValueError("Voltage must be between 0 and 31 V")
        value_split = str(v).split('.')
        if len(value_split[0]) > 3 or len(value_split[1]) > 3:
            raise ValueError(
                "Voltage must have at most 3 digits before and after the decimal point")
        value_str = f"{int(float(v) * 1000):06d}"
        frame = f"<01{value_str}000>"
        self.send_frame(frame)
        print("Sent frame:", frame)
        return self.read_frame()

    def read_voltage(self):
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
        print("Received frame:", resp, "Value:", value)
        return value

    def set_current(self, i):
        if i < 0 or i > 10:
            raise ValueError("Current must be between 0 and 10 A")
        value_split = str(i).split('.')
        if len(value_split[0]) > 3 or len(value_split[1]) > 3:
            raise ValueError(
                "Current must have at most 3 digits before and after the decimal point")
        value_str = f"{int(float(i) * 1000):06d}"
        frame = f"<03{value_str}000>"
        self.send_frame(frame)
        print("Sent frame:", frame)
        return self.read_frame()

    def read_current(self):
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
        print("Received frame:", resp, "Value:", value)
        return value

    def power_on(self):
        self.send_frame("<07000000000>")
        return self.read_frame()

    def power_off(self):
        self.send_frame("<08000000000>")
        return self.read_frame()

    def pc_connect(self):
        self.send_frame("<09100000000>")
        return self.read_frame()

    def pc_disconnect(self):
        self.send_frame("<09200000000>")
        return self.read_frame()
