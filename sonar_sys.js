function avg(arr){
  let sum = 0;
  for(let i = 0; i < arr.length; i++){
    sum += arr[i]
  }
  return sum / arr.length
}

const Gpio = require('pigpio').Gpio;
// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(20, {mode: Gpio.OUTPUT});
let echo = new Gpio(21, {mode: Gpio.INPUT, alert: true});

trigger.digitalWrite(0); // Make sure trigger is low

let distances = new Array(3).fill(0);

// Trigger a distance measurement once per second{mode: Gpio.OUTPUT}
let triggering = setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 100);

let old_distance = 0, distance = 0;

echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      old_distance = distance
      distance = (diff / 2 / MICROSECDONDS_PER_CM);
      c_dis = distance;
      if(distance > 1 && distance < 1600){
        distance = distance
      }
      else{
        distance = 400;
      }
      distances.shift();
      distances.push(distance);
      distance = avg(distances)
      console.log(c_dis.toFixed(2), distance.toFixed(2));
    }
});
