function plotGraph(){

let freq=parseFloat(document.getElementById("graphFreq").value)
let volt=parseFloat(document.getElementById("graphVolt").value)

let canvas=document.getElementById("graphCanvas")
let ctx=canvas.getContext("2d")

ctx.clearRect(0,0,400,200)

ctx.beginPath()

for(let x=0;x<400;x++){

let y=100+Math.sin(x/freq)*volt*5

if(!freq || !volt){
alert("Enter frequency and voltage")
return
}

ctx.lineTo(x,y)

}

ctx.strokeStyle="#00ffcc"
ctx.stroke()

}