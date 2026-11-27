(function () {
  var ALBUMS = [
    {
      id: 'villa',
      href: 'villa.html',
      title: 'Вилла',
      kicker: 'Снаружи',
      lead: 'Фасад и окна',
      preview: '../photoHouse/Вилла/01.png?v=villa-photos-20261127',
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'Во дворе',
      lead: 'Подсветка и участок',
      preview: '../photoHouse/Территория у дома/01.jpg?v=villa-terr-inside-20261127',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Интерьер',
      lead: 'Кухня, лестница, гостиные',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg?v=villa-terr-inside-20261127',
    },
    {
      id: 'sanuzel',
      href: 'sanuzel.html',
      title: 'Санузел',
      kicker: 'Ванная',
      lead: 'Душевая и отделка',
      preview: '../photoHouse/Санузел/02.jpg?v=villa-sanuzel-20261127',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Досуг',
      kicker: 'На вилле',
      lead: 'Бассейн, бильярд и детская',
      preview: '../photoHouse/Досуг/01-basseyn.jpg?v=villa-dosug-20261127',
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