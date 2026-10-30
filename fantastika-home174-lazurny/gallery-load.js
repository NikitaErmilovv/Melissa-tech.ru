(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/fantastika/01-2gis.jpg",
  "img/works/incoming/fantastika/02-2gis.jpg",
  "img/works/incoming/fantastika/03-2gis.jpg",
  "img/works/incoming/fantastika/04-2gis.jpg",
  "img/works/incoming/fantastika/05-2gis.jpg",
  "img/works/incoming/fantastika/06-2gis.jpg",
  "img/works/incoming/fantastika/07-2gis.jpg",
  "img/works/incoming/fantastika/08-2gis.jpg",
  "img/works/incoming/fantastika/09-2gis.jpg",
  "img/works/incoming/fantastika/10-2gis.jpg",
  "img/works/incoming/fantastika/11-2gis.jpg",
  "img/works/incoming/fantastika/12-2gis.jpg",
  "img/works/incoming/fantastika/13-2gis.jpg",
  "img/works/incoming/fantastika/14-2gis.jpg",
  "img/works/incoming/fantastika/15-2gis.jpg",
  "img/works/incoming/fantastika/16-2gis.jpg",
  "img/works/incoming/fantastika/17-2gis.jpg",
  "img/works/incoming/fantastika/18-2gis.jpg",
  "img/works/incoming/fantastika/19-2gis.jpg",
  "img/works/incoming/fantastika/20-2gis.jpg",
  "img/works/incoming/fantastika/21-2gis.jpg",
  "img/works/incoming/fantastika/22-2gis.jpg",
  "img/works/incoming/fantastika/23-2gis.jpg",
  "img/works/incoming/fantastika/24-2gis.jpg",
  "img/works/incoming/fantastika/25-2gis.jpg",
  "img/works/incoming/fantastika/26-2gis.jpg",
  "img/works/incoming/fantastika/27-2gis.jpg",
  "img/works/incoming/fantastika/28-2gis.jpg",
  "img/works/incoming/fantastika/29-2gis.jpg",
  "img/works/incoming/fantastika/30-2gis.jpg",
  "img/works/incoming/fantastika/31-2gis.jpg",
  "img/works/incoming/fantastika/32-2gis.jpg",
  "img/works/incoming/fantastika/33-2gis.jpg",
  "img/works/incoming/fantastika/34-2gis.jpg",
  "img/works/incoming/fantastika/35-2gis.jpg",
  "img/works/incoming/fantastika/36-2gis.jpg",
  "img/works/incoming/fantastika/37-2gis.jpg",
  "img/works/incoming/fantastika/38-2gis.jpg",
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

