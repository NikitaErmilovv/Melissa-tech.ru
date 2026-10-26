(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/prime38/01-2gis.jpg",
  "img/works/incoming/prime38/02-2gis.jpg",
  "img/works/incoming/prime38/03-2gis.jpg",
  "img/works/incoming/prime38/04-2gis.jpg",
  "img/works/incoming/prime38/05-2gis.jpg",
  "img/works/incoming/prime38/06-2gis.jpg",
  "img/works/incoming/prime38/07-2gis.jpg",
  "img/works/incoming/prime38/08-2gis.jpg",
  "img/works/incoming/prime38/09-2gis.jpg",
  "img/works/incoming/prime38/10-2gis.jpg",
  "img/works/incoming/prime38/11-2gis.jpg",
  "img/works/incoming/prime38/12-2gis.jpg",
  "img/works/incoming/prime38/13-2gis.jpg",
  "img/works/incoming/prime38/14-2gis.jpg",
  "img/works/incoming/prime38/15-2gis.jpg",
  "img/works/incoming/prime38/16-user-anticor.png",
  "img/works/incoming/prime38/17-user-prep.png",
  "img/works/incoming/prime38/18-user-exterior.jpg",
  "img/works/incoming/prime38/19-user-landcruiser-summer.png",
  "img/works/incoming/prime38/20-user-landcruiser-winter.png",
  "img/works/incoming/prime38/21-user-blue-side.png",
  "img/works/incoming/prime38/22-user-bmw-x6.png",
  "img/works/incoming/prime38/23-user-xtrail-orange.png",
  "img/works/incoming/prime38/24-user-lexus-wheel.png"
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

