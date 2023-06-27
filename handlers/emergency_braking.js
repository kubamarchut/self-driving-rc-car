const { DRIVE_MOTOR } = require('./motors_controller');

const BRAKING_ACC = 100;
const MARGIN_D = 5;

function collisionAvoidance(distance, oldDistance) {
  pre_dis = 50 * Math.pow((oldDistance - distance), 2) / BRAKING_ACC;
  pre_dis += MARGIN_D;
  if (pre_dis > distance && (oldDistance - distance) > 1 && distance < 50) {
    emergencyBraking(distance, oldDistance);
  }
  return pre_dis;
}
function emergencyBraking(distance, oldDistance) {
  DRIVE_MOTOR.stop();
  DRIVE_MOTOR.backward()
  let breaking = setInterval(() => {
    if (oldDistance - distance < 5) {
      DRIVE_MOTOR.stop();
      console.log('emergency avoided')
      clearInterval(breaking);
    }
    else {
      console.log("still not");
    }
  }, 100)
}

exports.collisionAvoidance = collisionAvoidance;