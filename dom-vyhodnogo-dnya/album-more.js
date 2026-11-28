(function () {
    var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Снаружи',
      lead: 'Фасад, терраса и двор',
      preview: '../photoHouse/Дом/01.jpg?v=dom-vyhodnogo-20261129',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Внутри',
      kicker: 'Интерьер',
      lead: 'Спальня и кухня',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg?v=dom-vyhodnogo-20261129',
    },
    {
      id: 'basseyn',
      href: 'basseyn.html',
      title: 'Бассейн',
      kicker: 'В доме',
      lead: 'Крытый бассейн',
      preview: '../photoHouse/Бассейн/01.jpg?v=dom-vyhodnogo-20261129',
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