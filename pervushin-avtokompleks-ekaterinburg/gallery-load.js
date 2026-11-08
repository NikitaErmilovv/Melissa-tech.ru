(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/pervushin/01-2gis.jpg",
  "img/works/incoming/pervushin/02-2gis.jpg",
  "img/works/incoming/pervushin/03-2gis.jpg",
  "img/works/incoming/pervushin/04-2gis.jpg",
  "img/works/incoming/pervushin/05-2gis.jpg",
  "img/works/incoming/pervushin/06-2gis.jpg",
  "img/works/incoming/pervushin/07-2gis.jpg",
  "img/works/incoming/pervushin/08-2gis.jpg",
  "img/works/incoming/pervushin/09-2gis.jpg",
  "img/works/incoming/pervushin/10-2gis.jpg",
  "img/works/incoming/pervushin/11-2gis.jpg",
  "img/works/incoming/pervushin/12-2gis.jpg",
  "img/works/incoming/pervushin/13-2gis.jpg",
  "img/works/incoming/pervushin/14-2gis.jpg",
  "img/works/incoming/pervushin/15-2gis.jpg",
  "img/works/incoming/pervushin/16-2gis.jpg"
];
  var GALLERY_EXCLUDE = new Set([
    "img/works/incoming/pervushin/01-2gis.jpg",
    "img/works/incoming/pervushin/02-2gis.jpg",
    "img/works/incoming/pervushin/05-2gis.jpg",
    "img/works/incoming/pervushin/06-2gis.jpg",
    "img/works/incoming/pervushin/12-2gis.jpg",
    "img/works/incoming/pervushin/14-2gis.jpg",
    "img/works/incoming/pervushin/24-yandex.jpg",
    "img/works/incoming/pervushin/56-yandex.jpg"
  ]);
  var photoDir = grid.getAttribute('data-photo-dir') || '';
  var manifestUrl = photoDir
    ? 'data/gallery-manifest.json?dir=' + encodeURIComponent(photoDir)
    : 'data/gallery-manifest.json';

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
    var list = (files || []).filter(function (src) { return !GALLERY_EXCLUDE.has(src); });
    render(list);
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

