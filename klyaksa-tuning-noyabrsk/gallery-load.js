(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;
  var dir = grid.getAttribute("data-photo-dir");
  var manifestUrl =
    "data/gallery-manifest.json?dir=" + encodeURIComponent(dir || "");

  var GROUP_ORDER = ["landscape", "square", "portrait"];

  function classify(w, h) {
    var r = w / h;
    if (r >= 1.12) return "landscape";
    if (r <= 0.88) return "portrait";
    return "square";
  }

  function loadMeta(src) {
    return new Promise(function (resolve) {
      var probe = new Image();
      probe.onload = function () {
        resolve({
          src: src,
          kind: classify(probe.naturalWidth, probe.naturalHeight),
        });
      };
      probe.onerror = function () {
        resolve({ src: src, kind: "landscape" });
      };
      probe.src = src;
    });
  }

  function makeTile(src) {
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
    return a;
  }

  fetch(manifestUrl)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var files = data.files || [];
      if (!files.length) return;
      return Promise.all(files.map(loadMeta)).then(function (items) {
        var buckets = { landscape: [], square: [], portrait: [] };
        items.forEach(function (it) {
          buckets[it.kind].push(it);
        });
        var ordered = [];
        GROUP_ORDER.forEach(function (kind) {
          buckets[kind].forEach(function (it) {
            ordered.push(it);
          });
        });
        grid.innerHTML = "";
        ordered.forEach(function (it) {
          grid.appendChild(makeTile(it.src));
        });
      });
    })
    .catch(function () {});
})();
