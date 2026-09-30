(function () {
  var links = [];
  var index = 0;
  var root = null;

  function collect() {
    links = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.className = "media-lightbox";
    root.hidden = true;
    root.innerHTML =
      '<button type="button" class="media-lightbox-close" aria-label="Закрыть">×</button>' +
      '<button type="button" class="media-lightbox-nav media-lightbox-prev" aria-label="Предыдущее">‹</button>' +
      '<button type="button" class="media-lightbox-nav media-lightbox-next" aria-label="Следующее">›</button>' +
      '<div class="media-lightbox-stage"><img class="media-lightbox-img" alt=""></div>';
    document.body.appendChild(root);

    root.addEventListener("click", function (e) {
      if (e.target === root) close();
    });
    root.querySelector(".media-lightbox-close").addEventListener("click", close);
    root.querySelector(".media-lightbox-prev").addEventListener("click", function () {
      show(index - 1);
    });
    root.querySelector(".media-lightbox-next").addEventListener("click", function () {
      show(index + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (root.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    return root;
  }

  function show(i) {
    if (!links.length) return;
    collect();
    index = (i + links.length) % links.length;
    var href = links[index].getAttribute("href");
    ensureRoot();
    var img = root.querySelector(".media-lightbox-img");
    img.src = href;
    root.hidden = false;
    document.documentElement.classList.add("media-lightbox-open");
    root.querySelector(".media-lightbox-prev").disabled = links.length < 2;
    root.querySelector(".media-lightbox-next").disabled = links.length < 2;
  }

  function close() {
    if (!root) return;
    root.hidden = true;
    document.documentElement.classList.remove("media-lightbox-open");
    var img = root.querySelector(".media-lightbox-img");
    img.removeAttribute("src");
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-lightbox]");
    if (!link) return;
    e.preventDefault();
    collect();
    var i = links.indexOf(link);
    if (i >= 0) show(i);
  });
})();
