const Gpio = require('pigpio').Gpio;
const express = require('express');
const fs = require('fs');

var LED  = new Gpio(5, {mode: Gpio.OUTPUT});
var LED2 = new Gpio(6, {mode: Gpio.OUTPUT});
var motor1onoff = new Gpio(10, {mode: Gpio.OUTPUT});
var motor11 = new Gpio(9, {mode: Gpio.OUTPUT});
var motor12 = new Gpio(11, {mode: Gpio.OUTPUT});
var motor2onoff = new Gpio(17, {mode: Gpio.OUTPUT});
var motor21 = new Gpio(27, {mode: Gpio.OUTPUT});
var motor22 = new Gpio(22, {mode: Gpio.OUTPUT});


//const app = express();
//app.use(express.static('project'))
//app.listen(80)

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

function main(target, type){
	if(target == "forward-back"){
    if(type >= 0){
  		motor11.digitalWrite(1);
  		motor12.digitalWrite(0);
  		motor1onoff.pwmWrite(type);
      LED2.pwmWrite((type >= 0) ? 255: lights_state);
    }
    else{
      motor11.digitalWrite(0);
  		motor12.digitalWrite(1);
  		motor1onoff.pwmWrite(-type);
      LED2.pwmWrite((type < 0) ? 255: lights_state);
    }
	}
	else if(target == "right-left"){
    if(type >= 0){
      motor21.digitalWrite(1);
      motor22.digitalWrite(0);
      motor2onoff.pwmWrite(type);
    }
    else{
      motor21.digitalWrite(0);
  		motor22.digitalWrite(1);
  		motor2onoff.pwmWrite(-type);
    }
	}
	else if(target == "light"){
		LED.pwmWrite((type == 255) ? 255: 63);
    lights_state = (type == 255) ? 255: 63;
    LED2.pwmWrite((type == 255) ? 255: 63);
	}
}
var WebSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response) {
});
server.listen(1337, function() { });
 console.log('listening')
// create the server
wsServer = new WebSocketServer({
  httpServer: server
});
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

  last_commands = [2,2,2,2,2]
  connection.on('message', function(message) {
    var messageCon = JSON.parse(message.utf8Data);
    controls = ['forward-back', 'right-left', 'light']
    last_commands = messageCon
    for(let i = 0; i < messageCon.length; i++){
      console.log(last_commands)
      main(controls[i], parseInt(Number(messageCon[i])*255))
    }
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});
