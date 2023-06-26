const GPIO = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celsius
const MICROSECONDS_PER_CM = 1e6 / 34321;

// controlling HC-SR04 sensor
const SENSOR_TRIGGER = new GPIO(20, { mode: GPIO.OUTPUT });
const SENSOR_ECHO = new GPIO(21, { mode: GPIO.INPUT, alert: true });

SENSOR_TRIGGER.digitalWrite(0); // Make sure trigger is low

const HCSR04 = {
    distance: undefined,

    start: function () {
        // Trigger a distance measurement once per second{mode: GPIO.OUTPUT}
        setInterval(() => {
            SENSOR_TRIGGER.trigger(10, 1); // Set trigger high for 10 microseconds
        }, 100);

        let startTick;
        SENSOR_ECHO.on('alert', (level, tick) => {
            if (level == 1) {
                startTick = tick;
            } else {
                const endTick = tick;
                const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic

                this.distance = (diff / 2 / MICROSECONDS_PER_CM);
                if (this.distance < 2 || this.distance > 200) {
                    this.distance = undefined;
                }
            }
        });
    }
}

exports.distanceSensor = HCSR04;