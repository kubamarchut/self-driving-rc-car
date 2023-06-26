require('log-timestamp');
const GPIO = require('pigpio').Gpio;

const DISTANCE_SENSOR = require('./distance_sensor').distanceSensor;
const DRIVE_MOTOR = require('./motors_controller').DRIVE_MOTOR;
const STEERING_MOTOR = require('./motors_controller').STEERING_MOTOR;
require('./exit_handler');

DISTANCE_SENSOR.start();

// Setting up GPIO pins
const HEAD_LIGHT_LED = new GPIO(5, { mode: GPIO.OUTPUT });
const TAIL_LIGHT_LED = new GPIO(6, { mode: GPIO.OUTPUT });


function main(target, type) {
	var onOff = (type == "on") ? 1 : 0
	if (target == "forward") {
		if (onOff == 1) DRIVE_MOTOR.forward();
		else DRIVE_MOTOR.stop();
	}
	else if (target == "back") {
		if (onOff == 1) DRIVE_MOTOR.backward();
		else DRIVE_MOTOR.stop();
	}
	else if (target == "right") {
		if (onOff == 1) STEERING_MOTOR.right();
		else STEERING_MOTOR.stop();
	}
	else if (target == "left") {
		if (onOff == 1) STEERING_MOTOR.left();
		else STEERING_MOTOR.stop();
	}
	else if (target == "head_light") {
		HEAD_LIGHT_LED.digitalWrite(onOff);
	}
	else if (target == "tail_light") {
		TAIL_LIGHT_LED.digitalWrite(onOff);
	}
}
DRIVE_MOTOR.stop();
STEERING_MOTOR.stop();
main("head_light", "off");
main("tail_light", "off");
function test(mech) {
	main(mech, "on");
	setTimeout(function () {
		main(mech, "off");
	}, 500)
}
let mechs = ["forward", "back", "right", "left", "head_light", "tail_light"];
let i = 0;

setInterval(function () {
	test(mechs[i]);
	setTimeout(function () {
		console.log(mechs[i] + " test done")
		i++;
		if (i >= mechs.length) {
			console.log("distance " + DISTANCE_SENSOR.distance)
			i = 0;
		}
	}, 500)
}, 550)
