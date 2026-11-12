(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
    'img/works/incoming/auto-custom/01.jpg',
    'img/works/incoming/auto-custom/02.jpg',
    'img/works/incoming/auto-custom/03.jpg',
    'img/works/incoming/auto-custom/04.jpg',
    'img/works/incoming/auto-custom/05.jpg',
    'img/works/incoming/auto-custom/06.jpg',
    'img/works/incoming/auto-custom/07.jpg',
    'img/works/incoming/auto-custom/08.jpg',
    'img/works/incoming/auto-custom/09.jpg',
    'img/works/incoming/auto-custom/10.jpg',
    'img/works/incoming/auto-custom/11.jpg',
    'img/works/incoming/auto-custom/12.jpg',
    'img/works/incoming/auto-custom/13.jpg'
  ];
  var manifestUrl = 'data/gallery-manifest.json';

  function render(files) {
    if (!files.length) return;
    grid.innerHTML = '';
    files.forEach(function (src) {
      var a = document.createElement('a');
      a.className = 'g g--media';
      a.href = src;
      a.setAttribute('data-gallery', '');
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      a.appendChild(img);
      grid.appendChild(a);
    });
  }

  function loadManifest() {
    fetch(manifestUrl, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : FALLBACK_FILES; })
      .then(function (data) {
        var files = Array.isArray(data) ? data : FALLBACK_FILES;
        render(files);
      })
      .catch(function () { render(FALLBACK_FILES); });
  }

  loadManifest();
})();
