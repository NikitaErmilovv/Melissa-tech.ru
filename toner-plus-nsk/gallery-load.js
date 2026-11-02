(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;
  var FALLBACK_FILES = [
    "img/works/toner-plus/07-lexus-studio.jpg",
    "img/works/toner-plus/08-mercedes-tint-work.jpg",
    "img/works/toner-plus/09-subaru-studio.jpg",
    "img/works/toner-plus/02-mercedes-studio.jpg",
    "img/works/toner-plus/03-suv-studio.jpg",
    "img/works/toner-plus/05-haval-toner.jpg",
    "img/works/toner-plus/10-chameleon-windshield.jpg",
    "img/works/toner-plus/04-omoda-studio.jpg",
    "img/works/toner-plus/06-subaru-city.jpg",
    "img/works/toner-plus/01-mercedes-snow.jpg",
  ];
  var manifestUrl = "data/gallery-manifest.json";

  function render(files) {
    if (!files.length) return;
    grid.innerHTML = "";
    files.forEach(function (src) {
      var a = document.createElement("a");
      a.className = "g g--media";
      a.href = src;
      a.setAttribute("data-lightbox", "work");
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Тонировка — работа Тонер Плюс";
      img.loading = "lazy";
      img.decoding = "async";
      a.appendChild(img);
      grid.appendChild(a);
    });
  }

  function load(files) {
    render(files || []);
  }

  fetch(manifestUrl)
    .then(function (r) {
      if (!r.ok) throw new Error("manifest status");
      var ct = (r.headers.get("content-type") || "").toLowerCase();
      if (ct.indexOf("json") === -1) throw new Error("manifest not json");
      return r.json();
    })
    .then(function (data) {
      var files = data.files || [];
      if (files.length) load(files);
      else load(FALLBACK_FILES);
    })
    .catch(function () {
      load(FALLBACK_FILES);
    });
})();
