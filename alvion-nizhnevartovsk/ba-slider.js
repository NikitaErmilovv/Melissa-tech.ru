(function () {
  function setPosition(slider, beforeWrap, handle, percent) {
    var pos = Math.max(0, Math.min(100, percent));
    beforeWrap.style.width = pos + "%";
    handle.style.left = pos + "%";
    slider.dataset.position = String(pos);
    slider.setAttribute("aria-valuenow", String(Math.round(pos)));
  }

  function initSlider(slider) {
    var beforeWrap = slider.querySelector(".ba-before-wrap");
    var beforeImg = slider.querySelector(".ba-before");
    var handle = slider.querySelector(".ba-handle");
    if (!beforeWrap || !beforeImg || !handle) return;

    function resize() {
      beforeImg.style.width = slider.offsetWidth + "px";
    }

    function move(clientX) {
      var rect = slider.getBoundingClientRect();
      if (!rect.width) return;
      setPosition(slider, beforeWrap, handle, ((clientX - rect.left) / rect.width) * 100);
    }

    function nudge(delta) {
      setPosition(slider, beforeWrap, handle, parseFloat(slider.dataset.position || "50") + delta);
    }

    resize();
    window.addEventListener("resize", resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(slider);
    slider.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", resize);
    });

    setPosition(slider, beforeWrap, handle, 50);

    slider.setAttribute("role", "slider");
    slider.setAttribute("tabindex", "0");
    slider.setAttribute("aria-valuemin", "0");
    slider.setAttribute("aria-valuemax", "100");
    slider.setAttribute("aria-label", "Сравнение до и после");

    slider.addEventListener("pointerdown", function (event) {
      slider.setPointerCapture(event.pointerId);
      slider.classList.add("is-dragging");
      move(event.clientX);
    });

    slider.addEventListener("pointermove", function (event) {
      if (slider.hasPointerCapture(event.pointerId)) move(event.clientX);
    });

    ["pointerup", "pointercancel"].forEach(function (name) {
      slider.addEventListener(name, function () {
        slider.classList.remove("is-dragging");
      });
    });

    slider.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") nudge(-4);
      else if (event.key === "ArrowRight") nudge(4);
      else if (event.key === "Home") nudge(-100);
      else if (event.key === "End") nudge(100);
      else return;
      event.preventDefault();
    });
  }

  document.querySelectorAll("[data-ba]").forEach(initSlider);
})();
