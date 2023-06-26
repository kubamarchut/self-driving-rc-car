require('log-timestamp');

const DISTANCE_SENSOR = require('./distance_sensor').distanceSensor;
const { DRIVE_MOTOR, STEERING_MOTOR } = require('./motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./led_handler');
const { main } = require('./car_steering_handler');
require('./exit_handler');

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
			console.log("distance " + DISTANCE_SENSOR.getDistance + " averaged: " + DISTANCE_SENSOR.getAvgDistance);
			i = 0;
		}
	}, 550);
}
