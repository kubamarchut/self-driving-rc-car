const { DRIVE_MOTOR, STEERING_MOTOR } = require('./motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./led_handler');
const fs = require('fs');

let current_state = {
    forward: 0,
    back: 0,
    right: 0,
    left: 0
}

function main(target, type) {
    let onOff = (type == "on") ? 1 : 0
    if (target == "forward") {
        if (type == "on") DRIVE_MOTOR.forward();
        else DRIVE_MOTOR.stop();

        current_state.forward = onOff
    }
    else if (target == "back") {
        if (type == "on") DRIVE_MOTOR.backward();
        else DRIVE_MOTOR.stop();

        TAIL_LIGHT.on((type == "on") ? 255 : TAIL_LIGHT.light_state);

        current_state.back = onOff
    }
    else if (target == "right") {
        if (type == "on") STEERING_MOTOR.right();
        else STEERING_MOTOR.stop();

        current_state.right = onOff
    }
    else if (target == "left") {
        if (type == "on") STEERING_MOTOR.left();
        else STEERING_MOTOR.stop();

        current_state.left = onOff
    }
    else if (target == "head_light") {
        HEAD_LIGHT.on((type == "on") ? 255 : 63);
    }
    else if (target == "tail_light") {
        TAIL_LIGHT.light_state = (type == "on") ? 255 : 63;
        TAIL_LIGHT.on(TAIL_LIGHT.light_state);
    }
    else if (target == "record_data") {
        capturingMode = (type == "on") ? true : false
        if (capturingMode) {
            fs.mkdirSync('./gathered_data/' + getFormattedTime('short'))
            dir = './gathered_data/' + getFormattedTime('short')
        }
        captureDate()
    }
}

exports.main = main;
exports.current_state = current_state;