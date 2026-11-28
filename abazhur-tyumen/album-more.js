(function () {
      var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Фасад',
      lead: 'Терраса и вход',
      preview: '../photoHouse/Дом/01.jpg?v=abazhur-20261128',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Чан',
      kicker: 'На дворе',
      lead: 'Уличный чан',
      preview: '../photoHouse/Купель и сауна/01.jpg?v=abazhur-20261128',
    },
    {
      id: 'sauna',
      href: 'sauna.html',
      title: 'Сауна',
      kicker: 'Парная',
      lead: 'Внутри дома',
      preview: '../photoHouse/Сауна/01.jpg?v=abazhur-20261128',
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