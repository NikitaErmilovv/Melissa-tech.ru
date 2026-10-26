(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var dir = grid.getAttribute('data-photo-dir');
  var manifestUrl = 'data/gallery-manifest.json';
  fetch(manifestUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var files = data.files || [];
      if (!files.length) return;
      grid.innerHTML = '';
      files.forEach(function (src) {
        var a = document.createElement('a');
        a.className = 'g g--media';
        a.href = src;
        a.setAttribute('data-lightbox', 'work');
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        a.appendChild(img);
        grid.appendChild(a);
      });
    })
    .catch(function () {});
})();
