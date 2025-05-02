const terminalContent = document.getElementById("terminalContent");
const logContent = document.getElementById("logContent");
const input = document.getElementById("cmdInput");

const terminalWindow = document.getElementById("terminalWindow");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeBtn = document.getElementById("close");
const pButton = document.getElementById("pButton");

const slides = document.querySelectorAll("#imageSlider .slide");
const prevBtn = document.querySelector("#imageSlider .prev");
const nextBtn = document.querySelector("#imageSlider .next");
const slider = document.getElementById("imageSlider");

let isMaximized = false;
let isMinimized = false;

let current = 0;
let interval;

const originalSize = {
  width: terminalWindow.offsetWidth,
  height: terminalWindow.offsetHeight,
  top: terminalWindow.offsetTop,
  left: terminalWindow.offsetLeft,
};

window.addEventListener("DOMContentLoaded", () => {
  terminalWindow.style.display = "flex";
  const welcomeLine = document.createElement("div");
  welcomeLine.innerHTML = `<span class="cmd-text">Welcome to Poko Website!</span>`;
  terminalContent.appendChild(welcomeLine);

  // Show prompt on load
  const promptLine = document.createElement("div");
  promptLine.innerHTML = `<span class="prompt">poko@pokomiko:~$ </span><span class="cmd-text"></span>`;
  terminalContent.appendChild(promptLine);
  terminalContent.scrollTop = terminalContent.scrollHeight; // Scroll to the bottom
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();

    // Display entered command regardless of content
    const cmdLine = document.createElement("div");
    //cmdLine.innerHTML = `<span class="prompt">poko@pokomiko:~$ </span><span class="cmd-text">${cmd}</span>`;
    terminalContent.appendChild(cmdLine);

    if (cmd === "clear") {
      terminalContent.innerHTML = ""; // Clear the terminal screen
      const logLine = document.createElement("div");
      logLine.textContent = "[LOG] Command Clear!";
      logContent.appendChild(logLine);
    } else if (cmd !== "") {
      const response = document.createElement("div");
      response.innerHTML = `bash: ${cmd}: command not found`;
      terminalContent.appendChild(response);

      const logLine = document.createElement("div");
      logLine.textContent = `[LOG] ${cmd} command not found`;
      logContent.appendChild(logLine);
    }

    // Show the next prompt
    const promptLine = document.createElement("div");
    promptLine.innerHTML = `<span class="prompt">poko@pokomiko:~$ </span><span class="cmd-text"></span>`;
    terminalContent.appendChild(promptLine);

    input.value = "";
    input.focus();
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }
});

minimizeBtn.onclick = () => {
  terminalWindow.classList.add("minimizing");
  setTimeout(() => {
    terminalWindow.style.display = "none";
    terminalWindow.classList.remove("minimizing");
    isMinimized = true;
    pButton.style.display = "flex";
  }, 300);
};

maximizeBtn.onclick = () => {
  if (!isMaximized) {
    terminalWindow.style.top = "0";
    terminalWindow.style.left = "0";
    terminalWindow.style.width = "100vw";
    terminalWindow.style.height = "100vh";
    isMaximized = true;
  } else {
    terminalWindow.style.width = originalSize.width + "px";
    terminalWindow.style.height = originalSize.height + "px";
    terminalWindow.style.top = originalSize.top + "px";
    terminalWindow.style.left = originalSize.left + "px";
    isMaximized = false;
  }
};

closeBtn.onclick = () => {
  terminalWindow.classList.add("closing");
  setTimeout(() => {
    terminalWindow.style.display = "none";
    terminalWindow.classList.remove("closing");
    isMinimized = false;
    pButton.style.display = "flex";
  }, 300);
};

pButton.onclick = () => {
  terminalWindow.style.display = "flex";
  isMinimized = false;
  pButton.style.display = "flex";
};

// Smooth dragging
let isDragging = false;
let offsetX, offsetY;

const titleBar = document.getElementById("titleBar");

titleBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - terminalWindow.offsetLeft;
  offsetY = e.clientY - terminalWindow.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    terminalWindow.style.left = `${e.clientX - offsetX}px`;
    terminalWindow.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) slide.classList.add("active");
  });
}

function nextSlide() {
  current = (current + 1) % slides.length;
  showSlide(current);
}

function prevSlide() {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
}

function startAutoSlide() {
  interval = setInterval(nextSlide, 8000);
}

function stopAutoSlide() {
  clearInterval(interval);
}

// Event listeners
nextBtn.addEventListener("click", () => {
  nextSlide();
  stopAutoSlide();
  startAutoSlide();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  stopAutoSlide();
  startAutoSlide();
});

slider.addEventListener("mouseenter", stopAutoSlide);
slider.addEventListener("mouseleave", startAutoSlide);

// Touch events for swipe
let touchStartX = 0;

slider.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});

slider.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  if (touchEndX - touchStartX > 50) {
    prevSlide();
  } else if (touchStartX - touchEndX > 50) {
    nextSlide();
  }
});

// Init
showSlide(current);
startAutoSlide();
