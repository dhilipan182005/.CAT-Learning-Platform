function showPage(id){

const pages=document.querySelectorAll(".page")

pages.forEach(p=>{
p.style.display="none"
})

const active=document.getElementById(id)

if(active){
active.style.display="block"
}

}


showPage("home")


/* slides */

let slides=document.querySelectorAll(".slide")
let slideIndex=0

function showSlide(i){

slides.forEach(s=>s.classList.remove("active"))

slides[i].classList.add("active")

}

function nextSlide(){

slideIndex++

if(slideIndex>=slides.length)
slideIndex=0

showSlide(slideIndex)

}

function prevSlide(){

slideIndex--

if(slideIndex<0)
slideIndex=slides.length-1

showSlide(slideIndex)

}
/* ============================= */
/* ANALYSIS PAGE SWITCHER */
/* ============================= */

function openAnalysis(id){

let blocks=document.querySelectorAll(".analysisBlock")

blocks.forEach(b=>{
b.style.display="none"
})

let selected=document.getElementById(id)

if(selected){
selected.style.display="block"
}

}

window.onload=function(){
showPage("home")
}