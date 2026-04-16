let currentUser = null;
let currentRole = null;

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

async function performLogin() {
  const user = document.getElementById('username')?.value.trim();
  const pass = document.getElementById('password')?.value;
  const status = document.getElementById('loginStatus');

  if (!user || !pass) {
    if (status) { status.innerText = 'Please enter username and password.'; status.style.color = '#ef4444'; }
    return;
  }

  if (status) { status.innerText = 'Logging in...'; status.style.color = '#00e5ff'; }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user.username;
      currentRole = data.user.role;
      
      // Navigate to home after login
      showPage('home');
      console.log(`Logged in as ${data.user.username} (${data.user.role})`);
    } else {
      if (status) {
        status.innerText = data.message || 'Login failed.';
        status.style.color = '#ef4444';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (status) {
      status.innerText = 'Server unavailable. Make sure at 3000.';
      status.style.color = '#ef4444';
    }
  }
}

function login() { performLogin(); }

showPage("login")


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