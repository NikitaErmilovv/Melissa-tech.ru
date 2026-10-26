(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/mir-tonirovki/01-kia-optima-tint.jpg",
  "img/works/incoming/mir-tonirovki/02-sandero-stepway.jpg",
  "img/works/incoming/mir-tonirovki/03-kia-rio-ppf-hood.jpg",
  "img/works/incoming/mir-tonirovki/04-range-rover-tint.jpg",
  "img/works/incoming/mir-tonirovki/05-camaro-tint.jpg",
  "img/works/incoming/mir-tonirovki/06-bmw-tint.jpg",
  "img/works/incoming/mir-tonirovki/07-infiniti-qx80.jpg",
  "img/works/incoming/mir-tonirovki/08-aveo-tint.jpg",
  "img/works/incoming/mir-tonirovki/09-mazda-polish.jpg",
  "img/works/incoming/mir-tonirovki/10-kia-rio-gold.jpg"
];
  var manifestUrl = 'data/gallery-manifest.json';

  function render(files) {
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
  }

  function load(files) {
    render(files || []);
  }

  fetch(manifestUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('manifest status');
      var ct = (r.headers.get('content-type') || '').toLowerCase();
      if (ct.indexOf('json') === -1) throw new Error('manifest not json');
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

