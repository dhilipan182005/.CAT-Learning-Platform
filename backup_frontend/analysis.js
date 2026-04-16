function seriesRes(){

let input=document.getElementById("seriesR").value.split(",")

let total=0

input.forEach(r=>{
total+=parseFloat(r)
})

document.getElementById("seriesResult").innerText=
"Total="+total+"Ω"

}

function parallelRes(){

let input=document.getElementById("parallelR").value.split(",")

let sum=0

input.forEach(r=>{
sum+=1/parseFloat(r)
})

let result=1/sum

document.getElementById("parallelResult").innerText=
"Equivalent="+result.toFixed(2)+"Ω"

}

function rlcCalc(){

let R=parseFloat(document.getElementById("rlcR").value)
let L=parseFloat(document.getElementById("rlcL").value)
let C=parseFloat(document.getElementById("rlcC").value)
let f=parseFloat(document.getElementById("rlcF").value)

let XL=2*Math.PI*f*L
let XC=1/(2*Math.PI*f*C)

let Z=Math.sqrt(R*R+(XL-XC)*(XL-XC))

document.getElementById("rlcResult").innerText="Impedance="+Z.toFixed(2)+"Ω"

}