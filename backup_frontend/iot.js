let led=false

function toggleLED(){

led=!led

document.getElementById("ledState").innerText=
led?"LED ON":"LED OFF"

}

function readSensor(){

let value=Math.floor(Math.random()*100)

document.getElementById("sensorValue").innerText=
"Sensor="+value

}