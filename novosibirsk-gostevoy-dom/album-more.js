(function () {
  var PHOTO_V = 'ngd-photos-20261125';
  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Загородный',
      lead: 'Гостевой дом и двор',
      preview: '../photoHouse/Дом/01.jpg?v=' + PHOTO_V,
    },
    {
      id: 'bassein',
      href: 'bassein.html',
      title: 'Бассейн',
      kicker: 'Отдых',
      lead: 'Тёплая вода под куполом',
      preview: '../photoHouse/Бассейн/01.jpg?v=' + PHOTO_V,
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'Во дворе',
      lead: 'Газон и зелёный двор',
      preview: '../photoHouse/Территория у дома/01.jpg?v=' + PHOTO_V,
    },
    {
      id: 'banya',
      href: 'banya.html',
      title: 'Баня',
      kicker: 'Пар и отдых',
      lead: 'Деревянная парная',
      preview: '../photoHouse/Баня/01.jpg?v=' + PHOTO_V,
    },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.querySelectorAll('[data-album-more-slot]').forEach(function (slot) {
    var current = slot.getAttribute('data-album-current');
    if (!current) return;
    var others = ALBUMS.filter(function (a) {
      return a.id !== current;
    });
    if (!others.length) return;

    var root = document.createElement('div');
    root.className = 'album-more';

    var head = document.createElement('div');
    head.className = 'album-more-head';
    head.innerHTML =
      '<div class="kicker">Ещё фото</div><h2 class="album-more-heading">Другие альбомы</h2>';
    root.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'album-more-grid';
    others.forEach(function (album) {
      var a = document.createElement('a');
      a.className = 'album-more-card';
      a.href = album.href;
      a.setAttribute('aria-label', 'Открыть альбом: ' + album.title);
      a.innerHTML =
        '<span class="album-more-thumb" style="background-image:url(\'' +
        escapeHtml(album.preview).replace(/'/g, '%27') +
        '\')"></span>' +
        '<span class="album-more-meta">' +
        '<span class="kicker">' +
        escapeHtml(album.kicker) +
        '</span>' +
        '<span class="album-more-title">' +
        escapeHtml(album.title) +
        '</span>' +
        '<span class="album-more-lead">' +
        escapeHtml(album.lead) +
        '</span>' +
        '</span>';
      grid.appendChild(a);
    });
    root.appendChild(grid);
    slot.appendChild(root);
  });
})();