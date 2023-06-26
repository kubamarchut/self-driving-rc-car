const DRIVE_MOTOR = require('./motors_controller').DRIVE_MOTOR;
const STEERING_MOTOR = require('./motors_controller').STEERING_MOTOR;

process.on('SIGINT', function () {
	console.log("stopping test script");

	DRIVE_MOTOR.stop();
	STEERING_MOTOR.stop();
	main("head_light", "off");
	main("tail_light", "off");
	process.exit();
});