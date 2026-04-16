function showPage(pageId) {
  // Hide all pages first
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
    page.style.display = "none";
    page.style.visibility = "hidden";
    page.style.opacity = "0";
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
    target.style.display = "block";
    target.style.visibility = "visible";
    target.style.opacity = "1";
    console.log(`Navigated to: ${pageId}`);
  }
}