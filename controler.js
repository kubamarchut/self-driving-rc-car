var BRAKING_ACC = 100;
var MARGIN_D = 5;

const Gpio = require('pigpio').Gpio;
const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const cv = require('opencv4nodejs');
let FPS = 30
const vCap = new cv.VideoCapture(0);

const controlsTypes = ["forward", "back", "right", "left"]

function avg(arr){
  return (arr[0]+arr[1]+arr[2])/3
}

function addZero(num, length){
  num = String(num)
  while (num.length < length) {
    num = "0" + num
  }
  return num
}

function getMs(){
  var date = new Date();
  return date.getTime()
}

var current_state = {
  forward: 0,
  back: 0,
  right: 0,
  left: 0,
}

function getControls(){
  return {
    forward: current_state.forward,
    back: current_state.back,
    right: current_state.right,
    left: current_state.left,
  }
}

function getFormattedTime(type) {
    var today = new Date();
    var y = today.getFullYear();
    var m = addZero(today.getMonth() + 1, 2);
    var d = addZero(today.getDate(), 2);
    var h = addZero(today.getHours(), 2);
    var mi = addZero(today.getMinutes(), 2);
    var s = addZero(today.getSeconds(), 2);
    var ms = addZero(today.getMilliseconds(), 3);

    var output = d + "." + m + "." + y + "_" + h + "-" + mi + "-" + s
    if (type != 'short') output += "-" + ms
    return output;
}

function takePhoto(filename, directory){
  const frame = vCap.read();
  image = cv.imencode('.jpeg', frame);
  console.log(dir);
  cv.imwrite(`${dir}/${filename}.jpg`, frame);
}

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(20, {mode: Gpio.OUTPUT});
const echo = new Gpio(21, {mode: Gpio.INPUT, alert: true});
var LED  = new Gpio(5, {mode: Gpio.OUTPUT});
var LED2 = new Gpio(6, {mode: Gpio.OUTPUT});
var motor1onoff = new Gpio(10, {mode: Gpio.OUTPUT});
var motor11 = new Gpio(9, {mode: Gpio.OUTPUT});
var motor12 = new Gpio(11, {mode: Gpio.OUTPUT});
var motor2onoff = new Gpio(17, {mode: Gpio.OUTPUT});
var motor21 = new Gpio(27, {mode: Gpio.OUTPUT});
var motor22 = new Gpio(22, {mode: Gpio.OUTPUT});

trigger.digitalWrite(0); // Make sure trigger is low

app.use(express.static('frontend-controler'))
server.listen(80);


// Trigger a distance measurement once per second{mode: Gpio.OUTPUT}
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 100);

let lights_state = 127
LED.digitalWrite(0);
LED2.digitalWrite(0);

LED.pwmWrite(63);
LED2.pwmWrite(lights_state);

let dutyCycle = 63;
let incCycle = 5;

let blinkingLEDs = setInterval(() => {
  dutyCycle += incCycle;
  LED.pwmWrite(dutyCycle);
  LED2.pwmWrite((dutyCycle));

  if (dutyCycle > 250) {
    incCycle = -5;
  }
  else if (dutyCycle < 16) {
    incCycle = 5;
  }
}, 20);
var dir = ''
var capturingMode = false
var controlsList = []
function captureDate(){
    if(capturingMode){
    var controls = getControls()
    var time = getFormattedTime()
    var objectTemp = {
      'time': time,
      'controls': controls,
      'distance': distance
    }
    controlsList.push(objectTemp)
    takePhoto(time, dir)
    setTimeout(function(){captureDate()}, 100)
  }
  else{
    var jsonFile = JSON.stringify({'controls_list': controlsList})
    var filename = `${dir}/${getFormattedTime('short')}.json`
    fs.writeFileSync(filename, jsonFile);
    setTimeout(function(){
      controlsList = []
    }, 2000)
  }

}



function main(target, type){
  var onOff = (type == "on") ? 1: 0
	if(target == "forward"){
		motor11.digitalWrite(1);
		motor12.digitalWrite(0);
		motor1onoff.digitalWrite(onOff);

    current_state.forward = onOff
	}
	else if(target == "back"){
		motor11.digitalWrite(0);
		motor12.digitalWrite(1);
		motor1onoff.digitalWrite(onOff);

    LED2.pwmWrite((type == "on") ? 255: lights_state);

    current_state.back = onOff
	}
	else if(target == "right"){
		motor21.digitalWrite(0);
		motor22.digitalWrite(1);
		motor2onoff.digitalWrite(onOff);

    current_state.right = onOff
	}
	else if(target == "left"){
		motor21.digitalWrite(1);
		motor22.digitalWrite(0);
		motor2onoff.digitalWrite(onOff);

    current_state.left = onOff
	}
	else if(target == "head_light"){
		LED.pwmWrite((type == "on") ? 255: 63);
	}
	else if(target == "tail_light"){
    lights_state = (type == "on") ? 255: 63;
    LED2.pwmWrite((type == "on") ? 255: 63);
	}
  else if(target == "record_data"){
    capturingMode = (type == "on") ? true : false
    if (capturingMode){
      fs.mkdirSync('./gathered_data/'+getFormattedTime('short'))
      dir = './gathered_data/'+getFormattedTime('short')
    }
    captureDate()
  }
}

let distance;
let distance_old;
let distances = new Array(3).fill(0);

const watchHCSR04 = () => {
  let startTick;

  echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      distance_old = distance;
      distance = (diff / 2 / MICROSECDONDS_PER_CM);
      if(distance > 1 && distance < 1600){
        distance = distance
      }
      else{
        distance = 400;
      }
      distances.shift();
      distances.push(distance);
      distance = avg(distances).toFixed(2);
      //colisionAvoidance();
      /*distance = (distance < 0.5 || distance > 600) ? 'out of range' : distance
      if(distance < 4){
        main('forward', 'off')
    		main('back', 'on')
      }
      else if(distance < 4.1){
        main('back', 'off')
      }*/
    }
  });
};


watchHCSR04();

function colisionAvoidance(){
  pre_dis=50*Math.pow((distance_old - distance), 2)/BRAKING_ACC;
  pre_dis += MARGIN_D;
  if (pre_dis > distance && (distance_old - distance) > 1 && distance < 50){
    emergency_braking();
  }
  return pre_dis;
}
function emergency_braking(){
  main('forward', 'off');
  main('back', 'on');
  var breaking = setInterval( () => {
    if(distance_old - distance < 5){
      main('back', 'off');
      console.log('emergency avoided')
      clearInterval(breaking);
    }
    else{
      console.log("still not");
    }
  }, 100)
}

function welcomeLights(){
  LED.pwmWrite(255);
  LED2.pwmWrite(255);
  setTimeout(function(){
    LED.pwmWrite(63);
    LED2.pwmWrite(lights_state);
  }, 150)
  setTimeout(function(){
    LED.pwmWrite(255);
    LED2.pwmWrite(255);
  }, 300)
  setTimeout(function(){
    LED.pwmWrite(63);
    LED2.pwmWrite(lights_state);
  }, 450)
}

io.on('connection', (socket) => {
  socket.on('controls', msg => {
    var messageCon = JSON.parse(msg);
    console.log("Recived command turn " + messageCon.target + " " + messageCon.type);
    main(messageCon.target, messageCon.type);
  });
  console.log("controler connected");
  clearInterval(blinkingLEDs)
  welcomeLights();

})


setInterval(()=>{
  const frame = vCap.read();
  let image = frame.getRegion(new cv.Rect(0, 0, 640, 430)).resize(215, 320);
  image = cv.imencode('.jpeg', image, [parseInt(cv.IMWRITE_JPEG_QUALITY), 20]);

  const strImg = image.toString('base64');
  io.emit('image', strImg);
}, 1000 / FPS)

setInterval(()=>{
  io.emit('distance', distance);
}, 1000 / 10)
