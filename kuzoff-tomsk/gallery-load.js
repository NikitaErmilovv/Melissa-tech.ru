(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/rp/01-2gis.jpg",
  "img/works/incoming/rp/02-2gis.jpg",
  "img/works/incoming/rp/03-2gis.jpg",
  "img/works/incoming/rp/04-2gis.jpg",
  "img/works/incoming/rp/05-2gis.jpg",
  "img/works/incoming/rp/06-2gis.jpg",
  "img/works/incoming/rp/07-2gis.jpg",
  "img/works/incoming/rp/08-2gis.jpg",
  "img/works/incoming/rp/09-2gis.jpg",
  "img/works/incoming/rp/10-2gis.jpg",
  "img/works/incoming/rp/11-2gis.jpg",
  "img/works/incoming/rp/12-2gis.jpg",
  "img/works/incoming/rp/13-2gis.jpg",
  "img/works/incoming/rp/14-2gis.jpg",
  "img/works/incoming/rp/15-2gis.jpg",
  "img/works/incoming/rp/16-2gis.jpg"
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

