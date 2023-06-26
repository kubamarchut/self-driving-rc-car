var BRAKING_ACC = 100;
var MARGIN_D = 5;

const Gpio = require('pigpio').Gpio;
const express = require('express');
const fs = require('fs');
const MjpegDecoder = require('mjpeg-decoder');
const controlsTypes = ["forward", "back", "right", "left"]

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

function getControls(){
  let res = '';
  if (current_state.left == 1){
    res += 'left '
  }
  else if (current_state.right == 1){
    res += 'right '
  }
  else if (current_state.forward == 1){
    res+= 'forward'
  }
  else if (current_state.back == 1){
    res+= 'back'
  }
  return res
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



const app = express();
app.use(express.static('project'))
app.get('/stream', function(req, res){
  res.sendFile( __dirname + "/stream/index.html" );
})
const videoStream = require('raspberrypi-node-camera-web-streamer');
videoStream.acceptConnections(app, {
    width: 320,
    height: 180,
    fps: 10,
    encoding: 'JPEG',
    quality: 7 //lower is faster
}, '/stream.mjpg', false);
app.listen(80)


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
    (async function() {
      const decoder = MjpegDecoder.decoderForSnapshot('http://127.0.0.1/stream.mjpg');

      decoder.on('abort', (reason, err) => {
      });

      try {
        const frame = await decoder.takeSnapshot();
        var filename = `${dir}/${getFormattedTime()}.jpeg`
        fs.writeFileSync(filename, frame);
      } catch (e) {
        console.error(e);
      }
    })()
    var controls = getControls()
    var time = getFormattedTime()
    var objectTemp = {
      'time': time,
      'controls': controls,
      'distance': distance
    }
    controlsList.push(objectTemp)
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


var current_state = {
  forward: 0,
  back: 0,
  right: 0,
  left: 0,
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
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.

});
server.listen(1337, function() { });
 console.log('listening')
// create the server
wsServer = new WebSocketServer({
  httpServer: server
});
var distance;
var distance_old;
// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  clearInterval(blinkingLEDs);
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
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    var messageCon = JSON.parse(message.utf8Data);
    console.log("Turn " + messageCon.target + messageCon.type);
    main(messageCon.target, messageCon.type)
  });

  setInterval( () => {connection.sendUTF(distance)}, 100);

  connection.on('close', function(connection) {
    // close user connection
  });
});

const watchHCSR04 = () => {
  let startTick;

  echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      distance_old = distance;
      distance = (diff / 2 / MICROSECDONDS_PER_CM).toFixed(2);
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
