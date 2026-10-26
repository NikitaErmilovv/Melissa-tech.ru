(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = [
  "img/works/incoming/klyaksa/01-studio-black-suv.jpg",
  "img/works/incoming/klyaksa/02-studio-interior-work.jpg",
  "img/works/incoming/klyaksa/03-interior-ppf.jpg",
  "img/works/incoming/klyaksa/04-headlight-polish.jpg",
  "img/works/incoming/klyaksa/05-interior-detailing.jpg",
  "img/works/incoming/klyaksa/06-soundproofing.jpg",
  "img/works/incoming/klyaksa/07-lexus-wash-bay.jpg",
  "img/works/incoming/klyaksa/08-engine-bay.jpg",
  "img/works/incoming/klyaksa/09-tint-kia-sportage.jpg",
  "img/works/incoming/klyaksa/10-tint-solaris-chameleon.jpg",
  "img/works/incoming/klyaksa/11-wrap-red-roof.jpg",
  "img/works/incoming/klyaksa/12-skyline-custom.jpg",
  "img/works/incoming/klyaksa/13-studio-wide.jpg",
  "img/works/incoming/klyaksa/14-bay-curtains.jpg",
  "img/works/incoming/klyaksa/15-audi-wash-bay.jpg"
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

