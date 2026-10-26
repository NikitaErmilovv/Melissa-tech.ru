(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/imperiya/01-rav4.jpg",
  "img/works/incoming/imperiya/02-infiniti-qx70.jpg",
  "img/works/incoming/imperiya/03-bmw-wash-bay.jpg",
  "img/works/incoming/imperiya/04-porsche-interior.jpg",
  "img/works/incoming/imperiya/05-porsche-engine.jpg",
  "img/works/incoming/imperiya/06-compression-test.jpg",
  "img/works/incoming/imperiya/07-renault-duster.jpg",
  "img/works/incoming/imperiya/08-subaru-interior.jpg",
  "img/works/incoming/imperiya/09-bmw-x5-service-pit.jpg",
  "img/works/incoming/imperiya/10-mercedes-engine.jpg",
  "img/works/incoming/imperiya/11-landcruiser-v8-engine.jpg",
  "img/works/incoming/imperiya/12-nissan-qashqai.jpg",
  "img/works/incoming/imperiya/13-uaz-patriot.jpg"
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

