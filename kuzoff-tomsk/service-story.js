(function () {
  function enableDragScroll(scroller) {
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
      scroller.scrollLeft = startLeft - dx;
    });
    const snapToNearest = () => {
      const items = [...scroller.querySelectorAll(".story-card")];
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

    cover.addEventListener("click", () => {
      if (board.classList.contains("is-open")) return;
      board.classList.add("is-open");
      cover.setAttribute("aria-expanded", "true");
      cards.forEach((card) => card.classList.add("is-lit"));
    });

    enableDragScroll(board);
  });
})();
