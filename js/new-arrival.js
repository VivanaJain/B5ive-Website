/*scroll*/

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
    const cardW =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--rel-card-w"
        )
      ) || 240;
    const gap =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--rel-gap")
      ) || 22;
    // Because CSS changes viewport width at breakpoints, compute visible as:
    return Math.max(1, Math.floor((vw + gap) / (cardW + gap)));
  }

  function update() {
    const gap =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--rel-gap")
      ) || 22;
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
