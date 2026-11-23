(function () {
  function enableDragScroll(scroller) {
    let down = false;
    let startX = 0;
    let startLeft = 0;

    scroller.addEventListener("pointerdown", (event) => {
      if (!scroller.closest(".story-board")?.classList.contains("is-open")) return;
      down = true;
      startX = event.clientX;
      startLeft = scroller.scrollLeft;
      scroller.classList.add("is-dragging");
      scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener("pointermove", (event) => {
      if (!down) return;
      scroller.scrollLeft = startLeft - (event.clientX - startX);
    });
    const stop = () => {
      down = false;
      scroller.classList.remove("is-dragging");
    };
    scroller.addEventListener("pointerup", stop);
    scroller.addEventListener("pointercancel", stop);
  }

  document.querySelectorAll("[data-service-story]").forEach((root) => {
    const board = root.querySelector(".story-board");
    const cover = root.querySelector(".story-main");
    const thumbs = root.querySelector(".story-thumbs");
    if (!board || !cover || !thumbs) return;

    cover.addEventListener("click", () => {
      const open = board.classList.toggle("is-open");
      cover.setAttribute("aria-expanded", open ? "true" : "false");
    });

    enableDragScroll(thumbs);
  });
})();
