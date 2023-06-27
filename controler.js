require('log-timestamp');
const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { 'pingInterval': 2000 });
const DISTANCE_SENSOR = require('./handlers/distance_sensor').distanceSensor;
const { DRIVE_MOTOR, STEERING_MOTOR } = require('./handlers/motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./handlers/led_handler');
const { collisionAvoidance } = require('./handlers/emergency_braking')
const { FPS, takePhoto, getImgToStream } = require('./handlers/camera_handler.js');
const { stop } = require('./handlers/exit_handler');
const { getFormattedTime } = require('./handlers/date_handler.js');

DISTANCE_SENSOR.start();
//DISTANCE_SENSOR.setCallback = collisionAvoidance;
let distance = DISTANCE_SENSOR.getAvgDistance;

stop();

TAIL_LIGHT.light_state = 127
HEAD_LIGHT.on(63);
TAIL_LIGHT.on(TAIL_LIGHT.light_state);

HEAD_LIGHT.smooth();
TAIL_LIGHT.smooth();

var current_state = {
  forward: 0,
  back: 0,
  right: 0,
  left: 0
}
var dir = ''
var capturingMode = false
var controlsList = []

function captureDate() {
  if (capturingMode) {
    var controls = current_state
    var time = getFormattedTime()
    var objectTemp = {
      'time': time,
      'controls': controls,
      'distance': distance
    }
    controlsList.push(objectTemp)
    takePhoto(time, dir)
    setTimeout(function () { captureDate() }, 100)
  }
  else {
    var jsonFile = JSON.stringify({ 'controls_list': controlsList })
    var filename = `${dir}/${getFormattedTime('short')}.json`
    fs.writeFileSync(filename, jsonFile);
    setTimeout(function () {
      controlsList = []
    }, 2000)
  }

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
      dir = './gathered_data/' + getFormattedTime('short')
      fs.mkdirSync(dir)
    }
    captureDate()
  }
}

// starting server for controller communication
app.use(express.static('frontend-controler'))
server.listen(80);

// handling communication with controller
io.on('connection', (socket) => {
  socket.on('controls', msg => {
    var messageCon = JSON.parse(msg);
    console.log("received command turn " + messageCon.target + " " + messageCon.type);
    main(messageCon.target, messageCon.type);
  });
  socket.on('disconnect', () => {
    stop();
    console.log("connection lost");
  });
  console.log("controller connected");
  HEAD_LIGHT.stopSmooth();
  TAIL_LIGHT.stopSmooth();
  HEAD_LIGHT.blink(63, 255, 4, 150);
  TAIL_LIGHT.blink(63, 255, 4, 150);
})

// sending camera feed
setInterval(() => {
  const strImg = getImgToStream().toString('base64');
  io.emit('image', strImg);
}, 1000 / FPS)

//sending distance sensor
setInterval(() => {
  distance = DISTANCE_SENSOR.getAvgDistance;
  io.emit('distance', distance);
}, 1000 / 10)
