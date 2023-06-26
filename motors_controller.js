
const GPIO = require('pigpio').Gpio;

// setting up motors pins
const MOTOR_DRIVE_ON_OFF = new GPIO(10, { mode: GPIO.OUTPUT });
const MOTOR_DRIVE_1 = new GPIO(9, { mode: GPIO.OUTPUT });
const MOTOR_DRIVE_2 = new GPIO(11, { mode: GPIO.OUTPUT });
const MOTOR_STEERING_ON_OFF = new GPIO(17, { mode: GPIO.OUTPUT });
const MOTOR_STEERING_1 = new GPIO(27, { mode: GPIO.OUTPUT });
const MOTOR_STEERING_2 = new GPIO(22, { mode: GPIO.OUTPUT });

const DRIVE_MOTOR = {
    forward: function () {
        MOTOR_DRIVE_1.digitalWrite(1);
        MOTOR_DRIVE_2.digitalWrite(0);
        MOTOR_DRIVE_ON_OFF.digitalWrite(1);
    },
    backward: function () {
        MOTOR_DRIVE_1.digitalWrite(0);
        MOTOR_DRIVE_2.digitalWrite(1);
        MOTOR_DRIVE_ON_OFF.digitalWrite(1);
    },
    stop: function () {
        MOTOR_DRIVE_ON_OFF.digitalWrite(0);
    }
}

const STEERING_MOTOR = {
    right: function () {
        MOTOR_STEERING_1.digitalWrite(0);
        MOTOR_STEERING_2.digitalWrite(1);
        MOTOR_STEERING_ON_OFF.digitalWrite(1);
    },
    left: function () {
        MOTOR_STEERING_1.digitalWrite(1);
        MOTOR_STEERING_2.digitalWrite(0);
        MOTOR_STEERING_ON_OFF.digitalWrite(1);
    },
    stop: function () {
        MOTOR_STEERING_ON_OFF.digitalWrite(0);
    }
}

exports.DRIVE_MOTOR = DRIVE_MOTOR;
exports.STEERING_MOTOR = STEERING_MOTOR;