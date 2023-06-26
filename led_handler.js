const GPIO = require('pigpio').Gpio;

// Setting up GPIO pins
const HEAD_LIGHT_LED = 5;
const TAIL_LIGHT_LED = 6;

class CarLight {
    constructor(pin) {
        this.ledPin = new GPIO(pin, { mode: GPIO.OUTPUT });
    }
    on() {
        this.ledPin.digitalWrite(1);
    }
    off() {
        this.ledPin.digitalWrite(0);
    }
}

exports.HEAD_LIGHT = new CarLight(HEAD_LIGHT_LED);
exports.TAIL_LIGHT = new CarLight(TAIL_LIGHT_LED);