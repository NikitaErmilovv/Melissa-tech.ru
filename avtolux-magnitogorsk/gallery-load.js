(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
    "img/works/incoming/autolux/01.jpg",
    "img/works/incoming/autolux/02.jpg",
    "img/works/incoming/autolux/03.jpg",
    "img/works/incoming/autolux/04.jpg",
    "img/works/incoming/autolux/05.jpg",
    "img/works/incoming/autolux/06.jpg",
    "img/works/incoming/autolux/07.jpg",
    "img/works/incoming/autolux/08.jpg",
    "img/works/incoming/autolux/09.jpg",
    "img/works/incoming/autolux/10.jpg",
    "img/works/incoming/autolux/11.jpg",
    "img/works/incoming/autolux/12.jpg"
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
