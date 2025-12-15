/* ============================================================
   1) SALE SCROLLER – FULLY WORKING
============================================================ */
(function () {
  const speed = 120; // px/sec
  const track = document.getElementById("saleTrack");
  const text = document.getElementById("saleText");
  if (!track || !text) return;

  let clones = [];
  let width = 0;
  let offset = 0;
  let last = null;
  let running = true;
  let raf = null;

  function build() {
    clones.forEach((c) => c.remove());
    clones = [];

    text.style.display = "inline-block";
    const parentW = track.parentElement
      ? track.parentElement.getBoundingClientRect().width
      : window.innerWidth;

    // first duplicate
    const c1 = text.cloneNode(true);
    c1.setAttribute("aria-hidden", "true");
    track.appendChild(c1);
    clones.push(c1);

    width = text.getBoundingClientRect().width || 0;

    let total = width;
    while (width > 0 && total < parentW * 1.6) {
      const extra = text.cloneNode(true);
      extra.setAttribute("aria-hidden", "true");
      track.appendChild(extra);
      clones.push(extra);
      total += width;
    }

    offset = offset % width;
    track.style.transform = `translateX(${offset}px)`;
  }

  function loop(t) {
    raf = null;
    if (!running) return;

    if (last == null) last = t;
    const dt = (t - last) / 1000;
    last = t;

    offset -= speed * dt;

    if (width > 0 && Math.abs(offset) >= width) {
      offset += width * Math.floor(Math.abs(offset) / width);
    }

    track.style.transform = `translateX(${offset}px)`;
    start();
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
  }

  function resume() {
    running = true;
    last = null;
    start();
  }

  track.addEventListener("mouseenter", pause);
  track.addEventListener("mouseleave", resume);

  window.addEventListener("resize", () => {
    offset = 0;
    build();
  });

  window.addEventListener("load", () => {
    build();
    start();
  });
})();

/* ============================================================
   2) SCRATCH CARD – UNCHANGED (FULLY WORKING)
============================================================ */
(function () {
  const canvas = document.getElementById("scratchLayer");
  const reward = document.getElementById("scratchReward");
  const claimBtn = document.getElementById("claimRewardBtn");
  const hiddenImg = document.getElementById("hiddenImage");
  if (!canvas || !reward || !hiddenImg) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let rect = canvas.parentElement.getBoundingClientRect();
  let isDrawing = false;
  let thresholdReached = false;
  let dpr = window.devicePixelRatio || 1;
  let animatingAutoClear = false;

  function resizeCanvas() {
    rect = canvas.parentElement.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#3b6fa6";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function getXY(e) {
    const p = (e.touches && e.touches[0]) || e;
    return { x: (p.clientX || 0) - rect.left, y: (p.clientY || 0) - rect.top };
  }

  function pointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();

    rect = canvas.parentElement.getBoundingClientRect();
    resizeCanvas();

    isDrawing = true;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = Math.max(28, Math.round(rect.width * 0.04));

    const p = getXY(e);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(12, ctx.lineWidth / 2), 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function pointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const p = getXY(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function pointerUp() {
    isDrawing = false;
    ctx.beginPath();
    setTimeout(checkPercentage, 100);
  }

  function checkPercentage() {
    if (thresholdReached || animatingAutoClear) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;

      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) cleared++;
      }

      const total = canvas.width * canvas.height;
      const percent = (cleared / total) * 100;

      if (percent > 50) {
        thresholdReached = true;
        autoClear();
      }
    } catch (err) {
      thresholdReached = true;
      autoClear();
    }
  }

  function autoClear() {
    animatingAutoClear = true;

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    canvas.style.display = "none";
    hiddenImg.classList.add("visible");
    reward.classList.add("visible");
    claimBtn.style.display = "inline-block";
    animatingAutoClear = false;
  }

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);

  claimBtn.addEventListener("click", () => {
    window.location.href = "/shop";
  });
})();

/* ============================================================
   3) NAV ACTIVE STATE — UNCHANGED
============================================================ */
(function () {
  function hrefPath(a) {
    try {
      const url = new URL(a, location.origin);
      return url.pathname.replace(/\/+$/, "");
    } catch {
      return null;
    }
  }

  const currentPath = location.pathname.replace(/\/+$/, "");

  function applyActive() {
    document.querySelectorAll(".nav-link").forEach((a) => {
      const path = hrefPath(a.getAttribute("href"));
      if (path === currentPath) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", applyActive);
  applyActive();
})();

/* ============================================================
   4) COPY BUTTONS — CLEAN + WORKING + TICK ICON
============================================================ */
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-copy");

    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "✔";
      btn.classList.add("copied");

      setTimeout(() => {
        btn.textContent = "📋";
        btn.classList.remove("copied");
      }, 1500);
    });
  });
});
/* --- small UI helpers: hero slow zoom + reveal on scroll --- */
(function () {
  // add loaded class to hero image to gently scale it
  const heroImg = document.querySelector(".hero-img");
  if (heroImg) {
    if (heroImg.complete) {
      heroImg.classList.add("loaded");
    } else {
      heroImg.addEventListener("load", () => heroImg.classList.add("loaded"));
      // safety fallback: mark loaded after short timeout
      setTimeout(() => heroImg.classList.add("loaded"), 1200);
    }
  }

  // IntersectionObserver for simple reveal (fade + slide up)
  const revealEls = document.querySelectorAll(
    ".featured-section, .newin-section, .spotted-section, .editorial-section, .features-strip, .newsletter-section"
  );

  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    revealEls.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
  } else {
    // fallback: reveal all
    revealEls.forEach((el) => el.classList.add("in-view"));
  }
})();
/* ============================================================
back to top============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backToTop");

  function checkShowButton() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  }

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", checkShowButton);
  window.addEventListener("resize", checkShowButton);

  checkShowButton();
});
