(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = ["img/works/incoming/works/01-2gis.jpg", "img/works/incoming/works/02-2gis.jpg", "img/works/incoming/works/03-2gis.jpg", "img/works/incoming/works/04-2gis.jpg", "img/works/incoming/works/05-2gis.jpg", "img/works/incoming/works/06-2gis.jpg", "img/works/incoming/works/07-2gis.jpg", "img/works/incoming/works/08-2gis.jpg", "img/works/incoming/works/09-2gis.jpg", "img/works/incoming/works/10-2gis.jpg", "img/works/incoming/works/11-2gis.jpg", "img/works/incoming/works/12-2gis.jpg", "img/works/incoming/works/13-2gis.jpg", "img/works/incoming/works/14-2gis.jpg", "img/works/incoming/works/15-2gis.jpg", "img/works/incoming/works/16-2gis.jpg"];
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

