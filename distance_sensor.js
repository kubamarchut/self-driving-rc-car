const GPIO = require('pigpio').Gpio;
// The number of microseconds it takes sound to travel 1cm at 20 degrees celsius
const MICROSECONDS_PER_CM = 1e6 / 34321;

function avg(arr) {
    return (arr[0] + arr[1] + arr[2]) / 3
}

// controlling HC-SR04 sensor
const DISTANCE_SENSOR_PINS = [20, 21];

class DistanceSensor {
    constructor(triggerPin, echoPin, callback = undefined) {
        this.sensorTrigger = new GPIO(triggerPin, { mode: GPIO.OUTPUT });
        this.sensorEcho = new GPIO(echoPin, { mode: GPIO.INPUT, alert: true });
        this.sensorTrigger.digitalWrite(0);
        this.distances = new Array(3).fill(0);
        this.minMax = [2, 200];
        this.callback = callback;
    }
    start() {
        // Trigger a distance measurement once per second{mode: GPIO.OUTPUT}
        setInterval(() => {
            this.sensorTrigger.trigger(10, 1); // Set trigger high for 10 microseconds
        }, 100);

        let startTick;
        this.sensorEcho.on('alert', (level, tick) => {
            if (level == 1) {
                startTick = tick;
            } else {
                const endTick = tick;
                const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic

                let distance = (diff / 2 / MICROSECONDS_PER_CM);
                if (distance < this.minMax[0] || distance > this.minMax[1]) {
                    distance = (2 + 200) / 2;
                }
                this.distances.shift();
                this.distances.push(distance);
                if (this.callback != undefined) this.callback(this.distances[2], this.distances[1])
            }
        });
    }
    get getDistance() {
        return this.distances[2].toFixed(2);
    }
    get getOldDistance() {
        return this.distances[1].toFixed(2);
    }
    get getAvgDistance() {
        return avg(this.distances).toFixed(2);
    }
}

exports.distanceSensor = new DistanceSensor(...DISTANCE_SENSOR_PINS);