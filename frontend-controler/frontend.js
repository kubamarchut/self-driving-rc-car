const BTNs = document.querySelectorAll('button');
const Distance = document.querySelector('.distance');

var recording = false

function startCountDown(n){
  startValue = 3
  if(n === undefined) n = startValue
  if (recording) n = 0
  if (n >= 0) {
    BTNs[BTNs.length - 1].innerHTML = n
    n--
    if(n < 0){
    BTNs[BTNs.length - 1].innerHTML = ''
    var inside = ''
    if(!recording){
      inside = '<div class="icon"><svg height="35" width="35" class="blinking"><circle cx="17.5" cy="17.5" r="8" fill="red" /></svg></div><div class="des">Press to stop</div>'
    }
    else{
      inside = '<div class="icon"><ion-icon class="cpu" name="hardware-chip-outline"></ion-icon></div><div class="des">Gather data</div>'
    }
    BTNs[BTNs.length - 1].innerHTML = inside
    setTimeout(function(){BTNs[BTNs.length - 1].classList.remove('activated');}, 300)
    recording = !recording
    socket.emit('controls', `{"target":"record_data",  "type":"${recording ? "on": "off"}"}`);
    }
    else{
      BTNs[BTNs.length - 1].classList.add('spin');
      setTimeout(function(){BTNs[BTNs.length - 1].classList.remove('spin');}, 900)
      setTimeout(function(){startCountDown(n)}, 1000)
    }
  }
}

var socket = io();
socket.on("connect", () => {
  var html = document.getElementsByTagName('html')[0];
  html.style.cssText = "--led-color: #0f0";
});
socket.on('image', (data)=>{
  let image = document.querySelector('.screen').children[0];
  image.src = `data:image/jpeg;base64,${data}`
});
socket.on('distance', (data)=>{
  while(data.length < 6){
    data = '0' + data;
  }
  Distance.innerHTML = data;
});
socket.on("disconnect", () => {
  var html = document.getElementsByTagName('html')[0];
  html.style.cssText = "--led-color: #f00";
});



let BTNsArr = Array.from(BTNs);
for (let i = 0; i < BTNsArr.length; i++) {
  BTNsArr[i].addEventListener('touchstart', sendCommand)
}
for (let i = 2; i < BTNsArr.length; i++) {
  BTNsArr[i].addEventListener('touchend', sendCommand)
}
var control = [false, false]
function sendCommand(e){
  var commandTarget = e.currentTarget.getAttribute('data-target');
  if(commandTarget.endsWith('light')){
    var index = BTNsArr.indexOf(e.currentTarget);
    console.log('touch');
    socket.emit('controls', `{"target":"${commandTarget}", "type":"${(control[index] == false) ? "on": "off"}"}`);
    control[index] = !control[index];

  }
  else if(commandTarget == 'dr_button' && e.type == "touchstart"){
    e.currentTarget.classList.add('activated')
    setTimeout(startCountDown, 1000)
  }
  else socket.emit('controls', `{"target":"${commandTarget}", "type":"${e.type == "touchstart" ? "on": "off"}"}`);

}
