require('log-timestamp');

const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { 'pingInterval': 2000 });
const DISTANCE_SENSOR = require('./distance_sensor').distanceSensor;
const { DRIVE_MOTOR, STEERING_MOTOR } = require('./motors_controller');
const { HEAD_LIGHT, TAIL_LIGHT } = require('./led_handler');
const { stop } = require('./exit_handler');
const getFormattedTime = require('./date_handler.js')

DISTANCE_SENSOR.start();
DISTANCE_SENSOR.setCallback = collisionAvoidance;
let distance = DISTANCE_SENSOR.getAvgDistance;

DRIVE_MOTOR.stop();
STEERING_MOTOR.stop();

const cv = require('opencv4nodejs');
let FPS = 30
const vCap = new cv.VideoCapture(0);

var current_state = {
  forward: 0,
  back: 0,
  right: 0,
  left: 0,
}

function getControls() {
  return {
    forward: current_state.forward,
    back: current_state.back,
    right: current_state.right,
    left: current_state.left,
  }
}

function takePhoto(filename, directory) {
  const frame = vCap.read();
  image = cv.imencode('.jpeg', frame);
  console.log(dir);
  cv.imwrite(`${dir}/${filename}.jpg`, frame);
}

app.use(express.static('frontend-controler'))
server.listen(80);

let lights_state = 127
HEAD_LIGHT.off();
TAIL_LIGHT.off();

HEAD_LIGHT.on(63);
TAIL_LIGHT.on(lights_state);

HEAD_LIGHT.smooth();
TAIL_LIGHT.smooth();

var dir = ''
var capturingMode = false
var controlsList = []
function captureDate() {
  if (capturingMode) {
    var controls = getControls()
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
  var onOff = (type == "on") ? 1 : 0
  if (target == "forward") {
    if (type == "on") DRIVE_MOTOR.forward();
    else DRIVE_MOTOR.stop();

    current_state.forward = onOff
  }
  else if (target == "back") {
    if (type == "on") DRIVE_MOTOR.backward();
    else DRIVE_MOTOR.stop();

    TAIL_LIGHT.on((type == "on") ? 255 : lights_state);

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
    lights_state = (type == "on") ? 255 : 63;
    TAIL_LIGHT.on(lights_state);
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

var BRAKING_ACC = 100;
var MARGIN_D = 5;

function collisionAvoidance(distance, oldDistance) {
  pre_dis = 50 * Math.pow((oldDistance - distance), 2) / BRAKING_ACC;
  pre_dis += MARGIN_D;
  if (pre_dis > distance && (oldDistance - distance) > 1 && distance < 50) {
    emergencyBraking(distance, oldDistance);
  }
  return pre_dis;
}
function emergencyBraking(distance, oldDistance) {
  main('forward', 'off');
  main('back', 'on');
  var breaking = setInterval(() => {
    if (oldDistance - distance < 5 || oldDistance == 101 || distance == 101) {
      main('back', 'off');
      console.log('emergency avoided')
      clearInterval(breaking);
    }
    else {
      console.log("still not");
    }
  }, 100)
}

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
  const frame = vCap.read();
  let image = frame.getRegion(new cv.Rect(0, 0, 640, 430)).resize(215, 320);
  image = cv.imencode('.jpeg', image, [parseInt(cv.IMWRITE_JPEG_QUALITY), 20]);

  const strImg = image.toString('base64');
  io.emit('image', strImg);
}, 1000 / FPS)
//sending distance sensor
setInterval(() => {
  distance = DISTANCE_SENSOR.getAvgDistance;
  io.emit('distance', distance);
}, 1000 / 10)
