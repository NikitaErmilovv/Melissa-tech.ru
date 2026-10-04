(function () {
  var bar = document.getElementById("topbar");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && bar) {
    burger.addEventListener("click", function () {
      var open = bar.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (menu && bar && burger) {
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        bar.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  var light = document.getElementById("light");
  var lightImg = light && light.querySelector("img");
  document.querySelectorAll("[data-full]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!light || !lightImg) return;
      lightImg.src = button.getAttribute("data-full");
      lightImg.alt = (button.querySelector("img") || {}).alt || "";
      if (typeof light.showModal === "function") light.showModal();
    });
  });
})();
