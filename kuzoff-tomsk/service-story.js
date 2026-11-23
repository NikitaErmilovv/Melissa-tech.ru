(function () {
  function enableDragScroll(scroller, maxLeft) {
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    scroller.addEventListener("pointerdown", (event) => {
      if (!scroller.classList.contains("is-open")) return;
      down = true;
      moved = false;
      startX = event.clientX;
      startLeft = scroller.scrollLeft;
      scroller.classList.add("is-dragging");
      scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener("pointermove", (event) => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      scroller.scrollLeft = Math.max(0, Math.min(maxLeft(), startLeft - dx));
    });
    const snapToNearest = () => {
      const items = [...scroller.querySelectorAll(".story-card.is-lit, .story-card--cover")];
      if (!items.length) return;
      const left = scroller.scrollLeft;
      let best = items[0];
      let bestDist = Infinity;
      items.forEach((card) => {
        const dist = Math.abs(card.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = card;
        }
      });
      scroller.scrollTo({ left: best.offsetLeft, behavior: "smooth" });
    };
    const stop = () => {
      if (down && moved) snapToNearest();
      down = false;
      scroller.classList.remove("is-dragging");
    };
    scroller.addEventListener("pointerup", stop);
    scroller.addEventListener("pointercancel", stop);
    scroller.addEventListener("click", (event) => {
      if (moved) event.preventDefault();
    }, true);
  }

  document.querySelectorAll("[data-service-story]").forEach((root) => {
    const board = root.querySelector(".story-board");
    const cover = root.querySelector(".story-card--cover");
    const cards = [...root.querySelectorAll(".story-card")];
    if (!board || !cover || !cards.length) return;

    let unlocked = 0;
    cards[0].classList.add("is-lit");

    const maxLeft = () => cards[unlocked].offsetLeft;

    const unlockNext = () => {
      if (unlocked >= cards.length - 1) return;
      unlocked += 1;
      board.classList.add("is-open");
      cover.setAttribute("aria-expanded", "true");
      cards[unlocked].classList.add("is-lit");
      board.scrollTo({ left: cards[unlocked].offsetLeft, behavior: "smooth" });
    };

    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        if (index === unlocked || index === unlocked + 1) {
          unlockNext();
          return;
        }
        if (index < unlocked) {
          board.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        }
      });
    });

    enableDragScroll(board, maxLeft);
  });
})();
