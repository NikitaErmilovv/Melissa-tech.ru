(function () {
  function syncBeforeWidth(slider, beforeImg) {
    beforeImg.style.width = slider.offsetWidth + "px";
  }

  function setPosition(slider, beforeWrap, handle, percent) {
    var pos = Math.max(0, Math.min(100, percent));
    beforeWrap.style.width = pos + "%";
    handle.style.left = pos + "%";
    slider.dataset.position = String(pos);
  }

  function initSlider(slider) {
    var beforeWrap = slider.querySelector(".ba-before-wrap");
    var beforeImg = slider.querySelector(".ba-before");
    var handle = slider.querySelector(".ba-handle");
    if (!beforeWrap || !beforeImg || !handle) return;

    function resize() {
      syncBeforeWidth(slider, beforeImg);
    }

    resize();
    window.addEventListener("resize", resize);

    setPosition(slider, beforeWrap, handle, 50);

    function move(clientX) {
      var rect = slider.getBoundingClientRect();
      if (!rect.width) return;
      setPosition(slider, beforeWrap, handle, ((clientX - rect.left) / rect.width) * 100);
    }

    slider.addEventListener("pointerdown", function (event) {
      slider.setPointerCapture(event.pointerId);
      move(event.clientX);
    });

    slider.addEventListener("pointermove", function (event) {
      if (slider.hasPointerCapture(event.pointerId)) {
        move(event.clientX);
      }
    });
  }

  document.querySelectorAll("[data-ba]").forEach(initSlider);
})();
