(function () {
  var root = document.getElementById("gallery-grid");
  if (!root) return;
  var dir = root.getAttribute("data-photo-dir");
  var manifestUrl =
    "data/gallery-manifest.json?dir=" + encodeURIComponent(dir || "");

  var GROUP_ORDER = ["landscape", "square", "portrait"];
  var GROUP_CLASS = {
    landscape: "gallery--ratio-43",
    square: "gallery--ratio-11",
    portrait: "gallery--ratio-34",
  };

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

  function renderGrouped(items) {
    var buckets = { landscape: [], square: [], portrait: [] };
    items.forEach(function (it) {
      buckets[it.kind].push(it);
    });

    root.innerHTML = "";
    var any = false;
    GROUP_ORDER.forEach(function (kind) {
      var list = buckets[kind];
      if (!list.length) return;
      any = true;
      var block = document.createElement("div");
      block.className = "gallery-size-group";
      var grid = document.createElement("div");
      grid.className =
        "gallery gallery--portfolio gallery--uniform " + GROUP_CLASS[kind];
      list.forEach(function (it) {
        grid.appendChild(makeTile(it.src));
      });
      block.appendChild(grid);
      root.appendChild(block);
    });
    if (!any) return;
  }

  fetch(manifestUrl)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var files = data.files || [];
      if (!files.length) return;
      return Promise.all(files.map(loadMeta)).then(renderGrouped);
    })
    .catch(function () {});
})();
