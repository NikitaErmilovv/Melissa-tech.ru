(function () {
  function bind(root) {
    const mainImg = root.querySelector(".story-main img");
    const mainLabel = root.querySelector(".story-main-label");
    if (!mainImg || !mainLabel) return;

    root.querySelectorAll(".story-thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const thumb = btn.querySelector("img");
        if (!thumb) return;
        const nextSrc = btn.getAttribute("data-src") || thumb.getAttribute("src");
        const nextLabel = btn.getAttribute("data-label") || "";
        const prevSrc = mainImg.getAttribute("src");
        const prevLabel = mainLabel.textContent.trim();

        mainImg.setAttribute("src", nextSrc);
        mainImg.setAttribute("alt", nextLabel);
        mainLabel.textContent = nextLabel;

        thumb.setAttribute("src", prevSrc);
        btn.setAttribute("data-src", prevSrc);
        btn.setAttribute("data-label", prevLabel);
      });
    });
  }

  document.querySelectorAll("[data-service-story]").forEach(bind);
})();
