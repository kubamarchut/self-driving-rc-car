const GPIO = require('pigpio').Gpio;

// Setting up GPIO pins
const HEAD_LIGHT_LED = new GPIO(5, { mode: GPIO.OUTPUT });
const TAIL_LIGHT_LED = new GPIO(6, { mode: GPIO.OUTPUT });

const HEAD_LIGHT = {
    on: function () {
        HEAD_LIGHT_LED.digitalWrite(1);
        console.log("test")
    },
    off: function () {
        HEAD_LIGHT_LED.digitalWrite(0);
        console.log("test off");
    }
}

const TAIL_LIGHT = {
    on: function () {
        TAIL_LIGHT_LED.digitalWrite(1);
    },
    off: function () {
        TAIL_LIGHT_LED.digitalWrite(0);
    }
}

exports.HEAD_LIGHT = HEAD_LIGHT
exports.TAIL_LIGHT = TAIL_LIGHT