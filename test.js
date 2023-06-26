const { distanceSensor } = require('./distance_sensor');

require('log-timestamp');
const GPIO = require('pigpio').Gpio;
const DISTANCE_SENSOR = require('./distance_sensor').distanceSensor;
DISTANCE_SENSOR.start();

// Setting up GPIO pins
// controlling LEDs
const HEAD_LIGHT_LED = new GPIO(5, { mode: GPIO.OUTPUT });
const TAIL_LIGHT_LED = new GPIO(6, { mode: GPIO.OUTPUT });
// controlling
const motor1onoff = new GPIO(10, { mode: GPIO.OUTPUT });
const motor11 = new GPIO(9, { mode: GPIO.OUTPUT });
const motor12 = new GPIO(11, { mode: GPIO.OUTPUT });
const motor2onoff = new GPIO(17, { mode: GPIO.OUTPUT });
const motor21 = new GPIO(27, { mode: GPIO.OUTPUT });
const motor22 = new GPIO(22, { mode: GPIO.OUTPUT });

function main(target, type) {
	var onOff = (type == "on") ? 1 : 0
	if (target == "forward") {
		motor11.digitalWrite(1);
		motor12.digitalWrite(0);
		motor1onoff.digitalWrite(onOff);
	}
	else if (target == "back") {
		motor11.digitalWrite(0);
		motor12.digitalWrite(1);
		motor1onoff.digitalWrite(onOff);

	}
	else if (target == "right") {
		motor21.digitalWrite(0);
		motor22.digitalWrite(1);
		motor2onoff.digitalWrite(onOff);
	}
	else if (target == "left") {
		motor21.digitalWrite(1);
		motor22.digitalWrite(0);
		motor2onoff.digitalWrite(onOff);

	}
	else if (target == "head_light") {
		HEAD_LIGHT_LED.digitalWrite(onOff);
	}
	else if (target == "tail_light") {
		TAIL_LIGHT_LED.digitalWrite(onOff);
	}
}
main("forward", "off");
main("back", "off");
main("left", "off");
main("right", "off");
main("head_light", "off");
main("tail_light", "off");
function test(mech) {
	main(mech, "on");
	setTimeout(function () {
		main(mech, "off");
	}, 500)
}
mechs = ["forward", "back", "right", "left", "head_light", "tail_light"]
let i = 0
let sequence = setInterval(function () {
	test(mechs[i])
	setTimeout(function () {
		console.log(mechs[i] + " test done")
		i++;
		if (i >= mechs.length) {
			console.log("distance " + DISTANCE_SENSOR.distance)
			i = 0;
		}
	}, 500)
}, 550)

process.on('SIGINT', function () {
	console.log("stopping test script");

	clearInterval(sequence);
	main("forward", "off");
	main("back", "off");
	main("left", "off");
	main("right", "off");
	main("head_light", "off");
	main("tail_light", "off");
	process.exit();
});
