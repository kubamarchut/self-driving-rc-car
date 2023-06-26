let d = new Date();
let dist_arr = new Array(50).fill({x:0, y:0});
let labelarr = new Array(50);
for (var i = 0; i < labelarr.length; i++) {
  labelarr[i] = i;
}
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelarr,
      datasets: [{
        data: dist_arr,
        backgroundColor: "lightblue",
        borderColor: "lightblue",
        fill: false,
        lineTension: 0,
        radius: 5
      }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                min: 1,
                max: 400
            }
        },
        animation: {
          duration: 0.01
      }
    }
});

const Button = document.querySelectorAll('button');
const Distance = document.querySelector('.distance');

var recording = false

function startCountDown(n){
  startValue = 3
  if(n === undefined) n = startValue
  if (recording) n = 0
  if (n >= 0) {
    Button[Button.length - 1].innerHTML = n
    n--
    if(n < 0){
    Button[Button.length - 1].innerHTML = ''
    var inside = ''
    if(!recording){
      inside = '<div class="icon"><svg height="35" width="35" class="blinking"><circle cx="17.5" cy="17.5" r="8" fill="red" /></svg></div><div class="des">Press to stop</div>'
    }
    else{
      inside = '<div class="icon"><ion-icon class="cpu" name="hardware-chip-outline"></ion-icon></div><div class="des">Gather data</div>'
    }
    Button[Button.length - 1].innerHTML = inside
    setTimeout(function(){Button[Button.length - 1].classList.remove('activated');}, 300)
    recording = !recording
    connection.send(`{"target":"record_data",  "type":"${recording ? "on": "off"}"}`)
    }
    else{
      Button[Button.length - 1].classList.add('spin');
      setTimeout(function(){Button[Button.length - 1].classList.remove('spin');}, 900)
      setTimeout(function(){startCountDown(n)}, 1000)
    }
  }
}

  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  var connection = new WebSocket('ws://192.168.0.50:1337');

  connection.onopen = function () {
    var html = document.getElementsByTagName('html')[0];
    html.style.cssText = "--led-color: #0f0";
  };

  connection.onerror = function (error) {
    var html = document.getElementsByTagName('html')[0];
    html.style.cssText = "--led-color: #f00";
  };

  connection.onmessage = function (message) {
    // try to decode json (I assume that each message
    // from server is json)
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ',
          message.data);
      return;
    }
    dist_arr.shift();
    dist_arr.push({x: 50 , y:message.data});
    for (var i = 0; i < dist_arr.length; i++) {
      dist_arr[i].x = i;
    }
    myChart.data.dataset = dist_arr;
    myChart.update()
    var distanceFromServer = message.data.toString();
    while(distanceFromServer.length < 6){
      distanceFromServer = '0' + distanceFromServer;
    }
    Distance.innerHTML = distanceFromServer;
  };

var buttons = Array.from(Button);
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('touchstart', sendCommand)
}
for (var i = 2; i < buttons.length; i++) {
  buttons[i].addEventListener('touchend', sendCommand)
}
var control = [false, false]
function sendCommand(e){
  var commandTarget = e.currentTarget.getAttribute('data-target');
  if(commandTarget.endsWith('light')){
    var index = buttons.indexOf(e.currentTarget);
    connection.send(`{"target":"${commandTarget}", "type":"${(control[index] == false) ? "on": "off"}"}`)
    control[index] = !control[index];

  }
  else if(commandTarget == 'dr_button' && e.type == "touchstart"){
    e.currentTarget.classList.add('activated')
    setTimeout(startCountDown, 1000)
  }
  else connection.send(`{"target":"${commandTarget}", "type":"${e.type == "touchstart" ? "on": "off"}"}`);

}
