import time
try:
    import RPi.GPIO as GPIO
except Exception as e:
    print("RPi.GPIO not available:", e)
    raise

PIN = 18
FREQUENCY = 1


def main():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIN, GPIO.OUT)

    pwm = GPIO.PWM(PIN, FREQUENCY)
    pwm.start(0)
    print("PWM started on GPIO", PIN, "at", FREQUENCY, "Hz. Ctrl-C to stop.")

    try:
        while True:
            # Fade up
            for dc in range(0, 101, 2):  # 0..100 duty cycle in steps
                pwm.ChangeDutyCycle(dc)
                time.sleep(0.02)
            # Fade down
            for dc in range(100, -1, -2):
                pwm.ChangeDutyCycle(dc)
                time.sleep(0.02)
    except KeyboardInterrupt:
        print("\nStopped by user.")
    finally:
        pwm.stop()
        GPIO.cleanup()
        print("GPIO cleaned up.")


if __name__ == "__main__":
    main()
