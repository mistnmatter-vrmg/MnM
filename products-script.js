// Product Slider
let index = 0;
const slides = document.getElementById("slides");
const total = slides ? slides.children.length : 0;

function show() {
  if (slides) {
    slides.style.transform = `translateX(-${index * 100}%)`;
  }
}

function next() {
  index = (index + 1) % total;
  show();
}

function prev() {
  index = (index - 1 + total) % total;
  show();
}

// Auto-play slider
let autoPlayInterval;

function startAutoPlay() {
  autoPlayInterval = setInterval(next, 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
  startAutoPlay();
  
  // Pause on hover
  const slider = document.querySelector(".slider");
  if (slider) {
    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
  }
  
  // Scroll effects
  initScrollEffects();
});

// Scroll Effects
function initScrollEffects() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Keyboard navigation
document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowLeft") {
    prev();
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000);
  } else if (e.key === "ArrowRight") {
    next();
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000);
  }
});

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;

const sliderElement = document.querySelector(".slider");
if (sliderElement) {
  sliderElement.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  sliderElement.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    next();
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000);
  }
  if (touchEndX > touchStartX + 50) {
    prev();
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000);
  }
}

// Make functions globally accessible
window.next = next;
window.prev = prev;
