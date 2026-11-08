(function () {
  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Загородный',
      lead: 'Терраса, панорамные окна и подсветка',
      preview: '../photoHouse/Дом/guest-02.jpg',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Внутри дома',
      lead: 'Спальни и гостиная в дереве',
      preview: '../photoHouse/Комнаты - Внутри дома/06ad80b5-f3cd-4bd1-b7ba-5a92a5be3ed6.jpg',
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'Во дворе',
      lead: 'Мангал, костёр и вечер на воздухе',
      preview: '../photoHouse/Территория у дома/1f48198f-5b70-4a94-a2a9-c8547c740f15.jpg',
    },
    {
      id: 'banya',
      href: 'banya.html',
      title: 'Баня',
      kicker: 'Баня, парная',
      lead: 'Парная, душ и зона отдыха',
      preview: '../photoHouse/Баня/04-parnaya.jpg',
    },
    {
      id: 'chan',
      href: 'chan.html',
      title: 'Чан',
      kicker: 'На огне',
      lead: 'Дровяной чан у дома',
      preview: '../photoHouse/Чан/bbe3a123-5ab9-41f6-9ad4-054a705e1b93.jpg',
    },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.querySelectorAll('[data-album-more]').forEach(function (root) {
    var current = root.getAttribute('data-album-current');
    if (!current) return;
    var others = ALBUMS.filter(function (a) {
      return a.id !== current;
    });
    if (!others.length) return;

    var head = document.createElement('div');
    head.className = 'album-more-head';
    head.innerHTML =
      '<div class="kicker">Ещё фото</div><h2 class="album-more-heading">Другие <span class="title-kino-line">альбомы</span></h2>';
    root.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'album-more-grid';
    others.forEach(function (album) {
      var a = document.createElement('a');
      a.className = 'album-more-card';
      a.href = album.href;
      a.innerHTML =
        '<span class="album-more-thumb"><img src="' +
        escapeHtml(album.preview) +
        '" alt="" loading="lazy" decoding="async"></span>' +
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
  });
})();
