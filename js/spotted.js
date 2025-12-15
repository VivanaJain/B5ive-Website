// WISHLIST (heart) TOGGLE
document.querySelectorAll(".wish-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const active = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!active));

    btn.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" },
      ],
      { duration: 200 }
    );
  });
});

// ADD TO CART BUTTON TOGGLE
document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const pressed = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!pressed));

    if (!pressed) {
      btn.textContent = "Added to Cart";
    } else {
      btn.textContent = "Add To Cart";
    }

    btn.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-5px)" },
        { transform: "translateY(0)" },
      ],
      { duration: 250 }
    );
  });
});

// ACCORDION (smooth open/close + toggle right-column overflow)
(function () {
  const headers = document.querySelectorAll(".acc-header");
  const rightCol = document.querySelector(".product-info");

  if (!headers.length) return;

  // helper to update right column overflow
  function updateRightColOverflow() {
    const anyOpen = !!document.querySelector(".acc-item.active");
    if (!rightCol) return;
    if (anyOpen) {
      rightCol.classList.add("allow-overflow");
    } else {
      rightCol.classList.remove("allow-overflow");
    }
  }

  // close an item
  function closeItem(item) {
    const content = item.querySelector(".acc-content");
    item.classList.remove("active");
    if (content) {
      content.style.maxHeight = null;
    }
  }

  // open an item
  function openItem(item) {
    const content = item.querySelector(".acc-content");
    item.classList.add("active");
    if (content) {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }

  headers.forEach((header) => {
    header.addEventListener("click", (e) => {
      const item = header.parentElement;
      const currentlyOpen = document.querySelector(".acc-item.active");

      // if another item is open, close it
      if (currentlyOpen && currentlyOpen !== item) {
        closeItem(currentlyOpen);
      }

      // toggle clicked item
      if (item.classList.contains("active")) {
        closeItem(item);
      } else {
        openItem(item);
      }

      // update right column overflow after a tiny delay so class reflects DOM state
      setTimeout(updateRightColOverflow, 10);
    });
  });

  // initialize: ensure any .active items have proper maxHeight set
  document.querySelectorAll(".acc-item").forEach((it) => {
    const content = it.querySelector(".acc-content");
    if (it.classList.contains("active") && content) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else if (content) {
      content.style.maxHeight = null;
    }
  });

  // run once to set right column correctly on load
  updateRightColOverflow();
})();
// Related products slider - one card per arrow click
(function () {
  const track = document.getElementById("relTrack");
  const prev = document.querySelector(".rel-prev");
  const next = document.querySelector(".rel-next");
  const viewport = document.getElementById("relViewport");
  if (!track || !prev || !next || !viewport) return;

  const cards = Array.from(track.children);
  let index = 0;

  // compute visible count based on viewport width and CSS breakpoints
  function visibleCount() {
    const vw = viewport.getBoundingClientRect().width;
    const cardW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rel-card-w')) || 240;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rel-gap')) || 22;
    // Because CSS changes viewport width at breakpoints, compute visible as:
    return Math.max(1, Math.floor((vw + gap) / (cardW + gap)));
  }

  function update() {
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rel-gap')) || 22;
    // get actual rendered card width (supports responsive fallback)
    const cardRect = cards[0].getBoundingClientRect();
    const cardW = cardRect.width;
    const translate = index * (cardW + gap);
    track.style.transform = `translateX(-${Math.round(translate)}px)`;

    // toggle arrows
    const maxIndex = Math.max(0, cards.length - visibleCount());
    prev.disabled = index === 0;
    next.disabled = index >= maxIndex;
  }

  // Prev / Next: move by 1 card per click
  prev.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    update();
  });
  next.addEventListener("click", () => {
    const maxIndex = Math.max(0, cards.length - visibleCount());
    index = Math.min(maxIndex, index + 1);
    update();
  });

  // recalc on resize (debounced)
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      // clamp index
      const maxIndex = Math.max(0, cards.length - visibleCount());
      if (index > maxIndex) index = maxIndex;
      update();
    }, 120);
  });

  // initial
  window.addEventListener("load", update);
  // also try immediate
  setTimeout(update, 50);
})();
