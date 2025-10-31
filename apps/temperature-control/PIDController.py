import time
import threading
import os
import RPi.GPIO as GPIO
import requests


class PIDController:
    PWM_PIN = 18
    PWM_FREQUENCY = 0.2  # Hz
    BASE_URL = "http://localhost:8001"

    # For Testing without actual Lakeshore device
    current_temp = 7

    def __init__(self, Kp, Ki, Kd, setpoint):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.setpoint = setpoint
        self.integral = 0
        self.last_error = 0

    def PID_update(self, measurement):
        error = self.setpoint - measurement
        self.integral += error
        derivative = error - self.last_error
        output = (self.Kp * error) + (self.Ki * self.integral) + \
            (self.Kd * derivative)
        self.last_error = error
        return output

    def get_temperature(self):
        # TODO Call Lakeshore API to get actual temperature
        # response = requests.get(f"{self.BASE_URL}/api/temp/status")
        # data = response.json()
        # return data["current_temp"]  # Placeholder value

        return self.current_temp  # Placeholder for testing

    def set_setpoint(self, setpoint):
        self.setpoint = setpoint
        self.integral = 0
        self.last_error = 0

    def set_coefficients(self, Kp, Ki, Kd):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd


def fetch_new_config():
    # TODO Implement actual fetching logic, e.g., from a file or database
    # Now just be manually querying via terminal
    print("Enter new PID configuration:")
    new_setpoint = float(input("Enter new setpoint (°C): "))
    new_Kp = float(input("Enter new Kp: "))
    new_Ki = float(input("Enter new Ki: "))
    new_Kd = float(input("Enter new Kd: "))
    new_temp = float(input("Enter current temperature (°C): "))
    return {
        'setpoint': new_setpoint,
        'Kp': new_Kp,
        'Ki': new_Ki,
        'Kd': new_Kd,
        'current_temp': new_temp
    }


def update_config_from_terminal(pid):
    while True:
        try:
            new_config = fetch_new_config()
            if new_config:
                pid.set_setpoint(new_config['setpoint'])
                pid.set_coefficients(
                    new_config['Kp'], new_config['Ki'], new_config['Kd'])
                print("Configuration updated.")
                print(
                    f"New setpoint: {new_config['setpoint']}, Kp: {new_config['Kp']}, Ki: {new_config['Ki']}, Kd: {new_config['Kd']}")
                PIDController.current_temp = new_config['current_temp']
        except ValueError:
            print("Invalid.")
        time.sleep(10)


def update_config_from_api(pid):
    while True:
        try:
            response = requests.get(f"{pid.BASE_URL}/api/temp/parameters")
            if response.status_code == 200:
                data = response.json()
                pid.set_setpoint(data['setpoint'])
                pid.set_coefficients(data['kp'], data['ki'], data['kd'])
                print("Configuration updated from API.")
                print(
                    f"New setpoint: {data['setpoint']}, Kp: {data['kp']}, Ki: {data['ki']}, Kd: {data['kd']}")
            else:
                print("Failed to fetch config from API.")
        except Exception as e:
            print("Error fetching config from API:", e)
        time.sleep(4)


def update_config_from_file(pid, filename="pid_config.txt"):
    last_mtime = 0
    while True:
        if os.path.exists(filename):
            mtime = os.path.getmtime(filename)
            if mtime != last_mtime:
                last_mtime = mtime
                with open(filename) as f:
                    lines = f.readlines()
                    try:
                        pid.set_setpoint(float(lines[0]))
                        pid.set_coefficients(
                            float(lines[1]), float(lines[2]), float(lines[3]))
                        print("Config updated from file.")
                    except Exception as e:
                        print("Error reading config:", e)
        time.sleep(1)


def main():
    pid = PIDController(1.0, 0.1, 0.05, 10)
    PWM_PIN = pid.PWM_PIN
    PWM_FREQUENCY = pid.PWM_FREQUENCY

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PWM_PIN, GPIO.OUT)
    pwm = GPIO.PWM(PWM_PIN, PWM_FREQUENCY)
    pwm.start(0)

    config_thread = threading.Thread(
        target=update_config_from_terminal, args=(pid,), daemon=True)
    config_thread.start()

    try:
        while True:
            current_temp = pid.get_temperature()
            control_signal = pid.PID_update(current_temp)
            duty_cycle = max(0, min(100, control_signal))
            pwm.ChangeDutyCycle(duty_cycle)
            # print(
            #     f"Current Temp: {current_temp}, Control Signal: {control_signal}, Duty Cycle: {duty_cycle}")
            print(
                f'Duty Cycle: {duty_cycle:.2f}% | Setpoint: {pid.setpoint}°C | Current Temp: {current_temp}°C')
            time.sleep(5)
    except KeyboardInterrupt:
        print("Exiting...")

    finally:
        pwm.stop()
        GPIO.cleanup()


if __name__ == "__main__":
    main()
