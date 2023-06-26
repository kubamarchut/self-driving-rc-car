require('log-timestamp');

const DISTANCE_SENSOR = require('./distance_sensor').distanceSensor;
const { DRIVE_MOTOR, STEERING_MOTOR } = require('./motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./led_handler');
require('./exit_handler');

function main(target, onOff) {
	if (target == "forward") {
		if (onOff == "on") DRIVE_MOTOR.forward();
		else DRIVE_MOTOR.stop();
	}
	else if (target == "back") {
		if (onOff == "on") DRIVE_MOTOR.backward();
		else DRIVE_MOTOR.stop();
	}
	else if (target == "right") {
		if (onOff == "on") STEERING_MOTOR.right();
		else STEERING_MOTOR.stop();
	}
	else if (target == "left") {
		if (onOff == "on") STEERING_MOTOR.left();
		else STEERING_MOTOR.stop();
	}
	else if (target == "head_light") {
		if (onOff == "on") HEAD_LIGHT.on();
		else HEAD_LIGHT.off();
	}
	else if (target == "tail_light") {
		if (onOff == "on") TAIL_LIGHT.on();
		else TAIL_LIGHT.off();
	}
}
function test(mech) {
	main(mech, "on");
	setTimeout(function () { main(mech, "off") }, 500)
}

DISTANCE_SENSOR.start();
DRIVE_MOTOR.stop();
STEERING_MOTOR.stop();
HEAD_LIGHT.off();
TAIL_LIGHT.off();

HEAD_LIGHT.smooth();
TAIL_LIGHT.smooth();
setTimeout(() => { HEAD_LIGHT.stopSmooth(); HEAD_LIGHT.blink(63, 255, 4, 150) }, 2000);
setTimeout(() => { TAIL_LIGHT.stopSmooth(); TAIL_LIGHT.blink(63, 255, 4, 150) }, 2000);

setTimeout(mainTest, 3000)

function mainTest() {
	let mechanisms = ["forward", "back", "right", "left", "head_light", "tail_light"];
	let i = 0;
	setInterval(function () {
		test(mechanisms[i]);
		console.log(mechanisms[i] + " test")
		i++;
		if (i >= mechanisms.length) {
			console.log("distance " + DISTANCE_SENSOR.distance);
			i = 0;
		}
	}, 550);
}
