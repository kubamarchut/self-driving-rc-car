require('log-timestamp');
const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(20, {mode: Gpio.OUTPUT});
const echo = new Gpio(21, {mode: Gpio.INPUT, alert: true});
const LED  = new Gpio(5, {mode: Gpio.OUTPUT});
const LED2 = new Gpio(6, {mode: Gpio.OUTPUT});
const motor1onoff = new Gpio(10, {mode: Gpio.OUTPUT});
const motor11 = new Gpio(9, {mode: Gpio.OUTPUT});
const motor12 = new Gpio(11, {mode: Gpio.OUTPUT});
const motor2onoff = new Gpio(17, {mode: Gpio.OUTPUT});
const motor21 = new Gpio(27, {mode: Gpio.OUTPUT});
const motor22 = new Gpio(22, {mode: Gpio.OUTPUT});

trigger.digitalWrite(0); // Make sure trigger is low


// Trigger a distance measurement once per second{mode: Gpio.OUTPUT}
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 100);


function main(target, type){
  var onOff = (type == "on") ? 1: 0
	if(target == "forward"){
		motor11.digitalWrite(1);
		motor12.digitalWrite(0);
		motor1onoff.digitalWrite(onOff);
	}
	else if(target == "back"){
		motor11.digitalWrite(0);
		motor12.digitalWrite(1);
		motor1onoff.digitalWrite(onOff);

	}
	else if(target == "right"){
		motor21.digitalWrite(0);
		motor22.digitalWrite(1);
		motor2onoff.digitalWrite(onOff);
	}
	else if(target == "left"){
		motor21.digitalWrite(1);
		motor22.digitalWrite(0);
		motor2onoff.digitalWrite(onOff);

	}
	else if(target == "head_light"){
		LED.digitalWrite(onOff);
	}
	else if(target == "tail_light"){
        LED2.digitalWrite(onOff);
	}
}
main("forward", "off");
main("back", "off");
main("left", "off");
main("right", "off");
main("head_light", "off");
main("tail_light", "off");
function test(mech){
    main(mech, "on");
    setTimeout(function(){
        main(mech, "off");
    }, 500)
}
mechs = ["forward", "back", "right", "left", "head_light", "tail_light"]
let i = 0
let sequence = setInterval(function(){
    test(mechs[i])
    setTimeout(function(){
      console.log(mechs[i] + " test done")
      i++;
      if(i >= mechs.length) i = 0;
    }, 500)
}, 550)

process.on('SIGINT', function() {
    console.log("stopping test script");
    
    main("forward", "off");
    main("back", "off");
    main("left", "off");
    main("right", "off");
    main("head_light", "off");
    main("tail_light", "off");
    process.exit();
});
