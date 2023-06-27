const GPIO = require('pigpio').Gpio;

// setting up motors pins
const MOTOR_DRIVE_PINS = [10, 9, 11];
const MOTOR_STEERING_PINS = [17, 27, 22];

class MotorController {
    constructor(onOffPin, firstPin, secondPin) {
        this.onOffPin = new GPIO(onOffPin, { mode: GPIO.OUTPUT });
        this.firstPin = new GPIO(firstPin, { mode: GPIO.OUTPUT });
        this.secondPin = new GPIO(secondPin, { mode: GPIO.OUTPUT });
    }
    stop() {
        this.onOffPin.digitalWrite(0);
    }
}

class DriveController extends MotorController {
    forward() {
        this.firstPin.digitalWrite(1);
        this.secondPin.digitalWrite(0);
        this.onOffPin.digitalWrite(1);
    }
    backward() {
        this.firstPin.digitalWrite(0);
        this.secondPin.digitalWrite(1);
        this.onOffPin.digitalWrite(1);
    }
}

class SteerController extends MotorController {
    right() {
        this.firstPin.digitalWrite(0);
        this.secondPin.digitalWrite(1);
        this.onOffPin.digitalWrite(1);
    }
    left() {
        this.firstPin.digitalWrite(1);
        this.secondPin.digitalWrite(0);
        this.onOffPin.digitalWrite(1);
    }
}

exports.DRIVE_MOTOR = new DriveController(...MOTOR_DRIVE_PINS);
exports.STEERING_MOTOR = new SteerController(...MOTOR_STEERING_PINS);