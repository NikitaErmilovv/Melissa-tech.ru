(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var FILES = [
    "img/works/incoming/pervushin/67-user-touareg-wash.jpg",
    "img/works/incoming/pervushin/68-user-lancer.jpg",
    "img/works/incoming/pervushin/69-user-infiniti.jpg",
    "img/works/incoming/pervushin/70-user-porsche-tires.jpg",
    "img/works/incoming/pervushin/71-user-headlights.jpg",
    "img/works/incoming/pervushin/72-user-bmw-alignment.jpg",
    "img/works/incoming/pervushin/73-user-engine-bay.jpg"
  ];

  grid.innerHTML = "";
  FILES.forEach(function (src) {
    var a = document.createElement("a");
    a.className = "g g--media";
    a.href = src;
    a.setAttribute("data-lightbox", "work");
    var img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    a.appendChild(img);
    grid.appendChild(a);
  });
})();
