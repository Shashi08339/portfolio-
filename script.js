// script.js

// PARALLAX FOLLOW ON HERO
const layers = document.querySelectorAll(".layer");
window.addEventListener("mousemove", (e) => {
  const { innerWidth, innerHeight } = window;
  const x = (e.clientX / innerWidth - 0.5) * 2;
  const y = (e.clientY / innerHeight - 0.5) * 2;

  layers.forEach((layer) => {
    const depth = parseFloat(layer.dataset.depth || "0.3");
    const translateX = -x * 20 * depth;
    const translateY = -y * 16 * depth;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });
});

// CUSTOM CURSOR
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

const moveCursor = (e) => {
  const { clientX, clientY } = e;
  cursorDot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  cursorOutline.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
};

window.addEventListener("mousemove", moveCursor);

// Grow outline on interactive elements
const interactive = document.querySelectorAll("button, a, .work-card");
interactive.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursorOutline.style.setProperty("--cursor-scale", "1.6");
    cursorOutline.firstElementChild.style.width = "44px";
    cursorOutline.firstElementChild.style.height = "44px";
  });
  el.addEventListener("mouseleave", () => {
    cursorOutline.style.setProperty("--cursor-scale", "1");
    cursorOutline.firstElementChild.style.width = "32px";
    cursorOutline.firstElementChild.style.height = "32px";
  });
});

// SCROLL REVEAL
const revealEls = document.querySelectorAll("[data-reveal], .section, .work-card, .about-card, .hero-title, .hero-sub, .hero-cta");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealEls.forEach((el) => {
  el.setAttribute("data-reveal", "");
  observer.observe(el);
});

// TILT EFFECT FOR WORK CARDS
const tiltCards = document.querySelectorAll("[data-tilt]");
tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;

    card.style.transform = `
      perspective(800px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-4px)
      scale(1.01)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});
