const GPIO = require('pigpio').Gpio;

// Setting up GPIO pins
const HEAD_LIGHT_LED = 5;
const TAIL_LIGHT_LED = 6;

class CarLight {
    constructor(pin, light_state=255) {
        this.ledPin = new GPIO(pin, { mode: GPIO.OUTPUT });
        this.i = 0;
        this.light_state = light_state;
    }
    on(intensity) {
        if (arguments.length == 0) this.ledPin.digitalWrite(1);
        else this.ledPin.pwmWrite(intensity);
    }
    off() {
        this.ledPin.digitalWrite(0);
    }
    blink(min = 63, max = 255, rept = 4, delay = 150) {
        this.i = 0;
        this.blinkLoop(min, max, rept, delay);
    }
    blinkLoop(min, max, rept, delay) {
        setTimeout(() => {
            this.ledPin.pwmWrite((this.i % 2 == 0) ? min : max);
            this.i++;
            if (this.i <= rept) {
                this.blinkLoop(min, max, rept, delay);
            }
        }, delay)
    }
    smooth(start = 63, step = 5) {
        let dutyCycle = start;
        let incCycle = step;

        this.blinkingInterval = setInterval(() => {
            dutyCycle += incCycle;
            this.ledPin.pwmWrite(dutyCycle);

            if (dutyCycle > 250) incCycle = -step;
            else if (dutyCycle < 15) incCycle = step;
        }, 20);
    }
    stopSmooth() {
        clearInterval(this.blinkingInterval);
    }
}

exports.HEAD_LIGHT = new CarLight(HEAD_LIGHT_LED);
exports.TAIL_LIGHT = new CarLight(TAIL_LIGHT_LED);