(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;

  var ITEMS = [
    { src: "img/works/incoming/pervushin/67-user-touareg-wash.jpg", pos: "center 42%" },
    { src: "img/works/incoming/pervushin/68-user-lancer.jpg", pos: "center 40%" },
    { src: "img/works/incoming/pervushin/69-user-infiniti.jpg", pos: "center 38%" },
    { src: "img/works/incoming/pervushin/70-user-porsche-tires.jpg", pos: "center 45%" },
    { src: "img/works/incoming/pervushin/71-user-headlights.jpg", pos: "center 40%" },
    { src: "img/works/incoming/pervushin/72-user-bmw-alignment.jpg", pos: "center 42%" },
    { src: "img/works/incoming/pervushin/73-user-engine-bay.jpg", pos: "center 50%" },
    { src: "img/works/home/tires.jpg?v=1", pos: "center 40%" },
    { src: "img/works/home/polish.jpg?v=1", pos: "center 38%" },
    { src: "img/works/home/sound.jpg?v=1", pos: "center 42%" },
    { src: "img/works/home/balancing.jpg?v=1", pos: "center 45%" },
  ];

  grid.innerHTML = "";
  ITEMS.forEach(function (item) {
    var el = document.createElement("div");
    el.className = "photo";
    el.setAttribute("role", "img");
    el.style.backgroundImage = "url('" + item.src + "')";
    el.style.backgroundPosition = item.pos || "center";
    grid.appendChild(el);
  });
})();
