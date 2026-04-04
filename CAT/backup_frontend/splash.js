function closeSplash(){

const splash = document.getElementById("splashScreen")

if(!splash) return

splash.style.opacity="0"

setTimeout(()=>{
splash.remove()
},500)

}

window.addEventListener("load",()=>{

setTimeout(()=>{
closeSplash()
},2000)

})

setTimeout(()=>{
closeSplash()
},5000)