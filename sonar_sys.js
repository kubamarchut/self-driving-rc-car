function avg(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum / arr.length
}

const Gpio = require('pigpio').Gpio;
// The number of microseconds it takes sound to travel 1cm at 20 degrees celsius
const MICROSECONDS_PER_CM = 1e6 / 34321;

const trigger = new Gpio(20, { mode: Gpio.OUTPUT });
let echo = new Gpio(21, { mode: Gpio.INPUT, alert: true });

trigger.digitalWrite(0); // Make sure trigger is low

let distances = new Array(3).fill(0);

let echoDetected = true;
// Trigger a distance measurement once per second{mode: Gpio.OUTPUT}
let triggering = setInterval(() => {
  if (echoDetected) {
    trigger.trigger(10, 1); // Set trigger high for 10 microseconds
    echoDetected = false;
  }
}, 100);

let old_distance = 0, distance = 0;

echo.on('alert', (level, tick) => {
  if (level == 1) {
    startTick = tick;
  } else {
    echoDetected = true;
    const endTick = tick;
    const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic

    let distance = (diff / 2 / MICROSECONDS_PER_CM);
    if (distance < 2 || distance > 400) {
      distance = Infinity;
    }
    distances.shift();
    distances.push(distance);

    console.log(distances[2].toFixed(2), avg(distances).toFixed(2))
  }
});
