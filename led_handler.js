const GPIO = require('pigpio').Gpio;

// Setting up GPIO pins
const HEAD_LIGHT_LED = 5;
const TAIL_LIGHT_LED = 6;

class CarLight {
    constructor(pin) {
        this.ledPin = new GPIO(pin, { mode: GPIO.OUTPUT });
        this.min = 63;
        this.max = 255;
        this.i = 0;
        this.rept = 4;
        this.delay = 150;
    }
    on(intensity) {
        if (arguments.length == 0) this.ledPin.digitalWrite(1);
        else this.ledPin.pwmWrite(intensity);
    }
    off() {
        this.ledPin.digitalWrite(0);
    }
    blink(min = this.min, max = this.max, rept = this.rept, delay = this.delay) {
        this.i = 0;
        this.min = min;
        this.max = max;
        this.rept = rept;
        this.delay = delay;
        this.blinkLoop();
    }
    blinkLoop() {
        setTimeout(() => {
            this.ledPin.pwmWrite((this.i % 2 == 0) ? this.min : this.max);
            this.i++;
            if (this.i <= this.rept) {
                this.blinkLoop();
            }
        }, this.delay)
    }
    smooth() {
        let dutyCycle = 63;
        let incCycle = 5;

        this.blinkingInterval = setInterval(() => {
            dutyCycle += incCycle;
            this.ledPin.pwmWrite(dutyCycle);

            if (dutyCycle > 250) incCycle = -5;
            else if (dutyCycle < 15) incCycle = 5;
        }, 20);
    }
    stopSmooth() {
        clearInterval(this.blinkingInterval);
    }
}

exports.HEAD_LIGHT = new CarLight(HEAD_LIGHT_LED);
exports.TAIL_LIGHT = new CarLight(TAIL_LIGHT_LED);