(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/proffkar/01-kia-quoris.png",
  "img/works/incoming/proffkar/03-honda-motion.png",
  "img/works/incoming/proffkar/04-mini-countryman.png",
  "img/works/incoming/proffkar/05-headlight.png",
  "img/works/incoming/proffkar/06-wheel-rim.png",
  "img/works/incoming/proffkar/07-mercedes.png",
  "img/works/incoming/proffkar/08-macan.png",
  "img/works/incoming/proffkar/09-paint-bumper.png",
  "img/works/incoming/proffkar/hero-home.png"
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

