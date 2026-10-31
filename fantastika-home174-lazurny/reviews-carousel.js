(function () {
  var roots = document.querySelectorAll("[data-reviews-carousel]");
  if (!roots.length) return;

  function stars(n) {
    var r = Math.max(1, Math.min(5, n | 0));
    return "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(0, 5 - r);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function init(root) {
    var track = root.querySelector(".reviews-track");
    var prev = root.querySelector(".reviews-nav--prev");
    var next = root.querySelector(".reviews-nav--next");
    var index = 0;
    var slides = [];
    var autoplay = null;
    var paused = false;

    function perView() {
      if (window.matchMedia("(max-width: 768px)").matches) return 1;
      if (window.matchMedia("(max-width: 1100px)").matches) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, slides.length - perView());
    }

    function go(i, animate) {
      index = Math.max(0, Math.min(maxIndex(), i));
      var card = track.querySelector(".review");
      var gap = 12;
      var w = card ? card.offsetWidth + gap : 0;
      track.style.transition = animate ? "transform .45s ease" : "none";
      track.style.transform = "translate3d(" + -index * w + "px,0,0)";
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
    }

    function render(items) {
      var list = (items || []).filter(function (it) {
        return it && (it.text || it.rating);
      });
      if (!list.length) {
        track.innerHTML =
          '<div class="review"><div class="stars">★★★★★</div><p>Отзывы загружаются…</p><small>2ГИС</small></div>';
        return;
      }
      slides = list;
      track.innerHTML = list
        .map(function (it) {
          var text = escapeHtml(String(it.text || "").replace(/\s+/g, " ").trim());
          return (
            '<article class="review">' +
            '<div class="stars" aria-label="Оценка ' +
            (it.rating || 5) +
            ' из 5">' +
            stars(it.rating || 5) +
            "</div>" +
            "<p>«" +
            text +
            "»</p>" +
            "<small>" +
            escapeHtml(it.name || "Клиент") +
            " · 2ГИС</small>" +
            "</article>"
          );
        })
        .join("");
      index = 0;
      go(0, false);
      startAutoplay();
    }

    function stepAuto() {
      if (paused || !slides.length) return;
      go(index >= maxIndex() ? 0 : index + 1, true);
    }

    function startAutoplay() {
      if (autoplay) clearInterval(autoplay);
      autoplay = setInterval(stepAuto, 4500);
    }

    if (prev)
      prev.addEventListener("click", function () {
        go(index - 1, true);
        startAutoplay();
      });
    if (next)
      next.addEventListener("click", function () {
        go(index + 1, true);
        startAutoplay();
      });
    window.addEventListener("resize", function () {
      go(index, false);
    });
    root.addEventListener("pointerenter", function () {
      paused = true;
    });
    root.addEventListener("pointerleave", function () {
      paused = false;
    });

    var urls = root.getAttribute("data-reviews-src")
      ? [root.getAttribute("data-reviews-src")]
      : ["data/reviews-2gis.json", "../data/reviews-2gis.json"];

    (function loadNext(i) {
      if (i >= urls.length) {
        track.innerHTML =
          '<div class="review"><p>Не удалось загрузить отзывы 2ГИС.</p><small><a href="https://2gis.ru/chelyabinsk/geo/70000001098642477" target="_blank" rel="noopener">Открыть на 2ГИС</a></small></div>';
        return;
      }
      fetch(urls[i] + (urls[i].indexOf("?") >= 0 ? "&" : "?") + "v=r2")
        .then(function (r) {
          if (!r.ok) throw new Error("fail");
          return r.json();
        })
        .then(render)
        .catch(function () {
          loadNext(i + 1);
        });
    })(0);
  }

  roots.forEach(function (root) {
    if (!("IntersectionObserver" in window)) {
      init(root);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      obs.disconnect();
      init(root);
    }, { rootMargin: "160px 0px" });
    obs.observe(root);
  });
})();
