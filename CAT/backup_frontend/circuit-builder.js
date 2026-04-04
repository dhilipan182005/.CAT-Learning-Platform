let workspace
let componentList=[]

window.addEventListener("DOMContentLoaded",()=>{

workspace=document.getElementById("workspace")

if(!workspace){
console.warn("Workspace not found")
}

})

function addComponent(type){

let comp=document.createElementNS("http://www.w3.org/2000/svg","text")

if(type==="resistor") comp.textContent="⎍"
if(type==="capacitor") comp.textContent="||"
if(type==="inductor") comp.textContent="∿∿"

comp.setAttribute("x",100)
comp.setAttribute("y",100)
comp.setAttribute("fill","yellow")

workspace.appendChild(comp)

componentList.push({
type:type,
value:1,
element:comp
})

}