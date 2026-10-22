(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;
  var dir = grid.getAttribute("data-photo-dir");
  var manifestUrl =
    "data/gallery-manifest.json?dir=" + encodeURIComponent(dir || "");

  function orderByImageSize(files) {
    return Promise.all(
      files.map(function (src, index) {
        return new Promise(function (resolve) {
          var probe = new Image();
          probe.onload = function () {
            resolve({
              src: src,
              w: probe.naturalWidth,
              h: probe.naturalHeight,
              index: index,
            });
          };
          probe.onerror = function () {
            resolve({ src: src, w: 0, h: 0, index: index });
          };
          probe.src = src;
        });
      })
    ).then(function (items) {
      items.sort(function (a, b) {
        if (a.w !== b.w) return a.w - b.w;
        if (a.h !== b.h) return a.h - b.h;
        return a.index - b.index;
      });
      return items.map(function (it) {
        return it.src;
      });
    });
  }

  fetch(manifestUrl)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var files = data.files || [];
      if (!files.length) return;
      return orderByImageSize(files).then(function (ordered) {
        grid.innerHTML = "";
        ordered.forEach(function (src) {
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
      });
    })
    .catch(function () {});
})();
