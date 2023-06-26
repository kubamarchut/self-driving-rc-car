const { DRIVE_MOTOR, STEERING_MOTOR } = require('./motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./led_handler');

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
    else if (target == "record_data") {
        capturingMode = (onOff == "on") ? true : false
        if (capturingMode) {
            fs.mkdirSync('./gathered_data/' + getFormattedTime('short'))
            dir = './gathered_data/' + getFormattedTime('short')
        }
        captureDate()
    }
}

exports.main = main;