function ohmCalc(){

let V=parseFloat(document.getElementById("voltage").value)
let R=parseFloat(document.getElementById("resistance").value)

let I=V/R
let P=V*I

document.getElementById("ohmResult").innerText=
"Current="+I.toFixed(2)+"A Power="+P.toFixed(2)+"W"

}

function powerCalc(){

let V=parseFloat(document.getElementById("v_p").value)
let I=parseFloat(document.getElementById("i_p").value)

let P=V*I

document.getElementById("powerResult").innerText="Power="+P.toFixed(2)+"W"

}

function dividerCalc(){

let Vin=parseFloat(document.getElementById("vin").value)
let R1=parseFloat(document.getElementById("r1").value)
let R2=parseFloat(document.getElementById("r2").value)

let Vout=Vin*(R2/(R1+R2))

document.getElementById("dividerResult").innerText="Vout="+Vout.toFixed(2)+"V"

}