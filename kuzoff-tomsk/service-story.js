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
    const stop = () => {
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

    let opening = false;

    cover.addEventListener("click", () => {
      if (board.classList.contains("is-open") || opening) return;
      opening = true;
      board.classList.add("is-open");
      cover.setAttribute("aria-expanded", "true");

      cards.forEach((card, index) => {
        if (index === 0) {
          card.classList.add("is-lit");
          return;
        }
        window.setTimeout(() => {
          card.classList.add("is-lit");
          board.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        }, index * 220);
      });
    });

    enableDragScroll(board);
  });
})();
