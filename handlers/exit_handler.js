const DRIVE_MOTOR = require('./motors_controller').DRIVE_MOTOR;
const STEERING_MOTOR = require('./motors_controller').STEERING_MOTOR;
const HEAD_LIGHT = require('./led_handler').HEAD_LIGHT;
const TAIL_LIGHT = require('./led_handler').TAIL_LIGHT;

function stop() {
    DRIVE_MOTOR.stop();
	STEERING_MOTOR.stop();
    HEAD_LIGHT.off();
	TAIL_LIGHT.off();
}

process.on('SIGINT', function () {
	console.log("stopping script");

	stop();
    process.exit();
});

exports.stop = stop;