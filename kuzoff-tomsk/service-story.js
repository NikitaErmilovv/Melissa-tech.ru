(function () {
  document.querySelectorAll("[data-service-story]").forEach((root) => {
    const board = root.querySelector(".story-board");
    const cover = root.querySelector(".story-main");
    if (!board || !cover) return;

    cover.addEventListener("click", () => {
      const open = board.classList.toggle("is-open");
      cover.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
})();
