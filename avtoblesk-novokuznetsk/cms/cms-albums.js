(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function normalizeUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url, location.href);
      let p = u.pathname;
      if (p.startsWith('/')) p = p.slice(1);
      return p + (u.search || '');
    } catch (_) {
      return url.replace(/^\.\//, '');
    }
  }

  function mediaItemHtml(item) {
    const url = normalizeUrl(item.url || '');
    if (item.type === 'video') {
      return (
        '<div class="g g--video">' +
        '<video src="' +
        escapeAttr(url) +
        '" controls playsinline preload="metadata"></video></div>'
      );
    }
    return (
      '<a class="g g--media" href="' +
      escapeAttr(url) +
      '" data-lightbox="works">' +
      '<img src="' +
      escapeAttr(url) +
      '" alt="" loading="lazy" decoding="async"></a>'
    );
  }

  function albumSectionHtml(album, index) {
    const kicker = album.kicker || String(index + 1).padStart(2, '0');
    const items = (album.items || []).map(mediaItemHtml).join('');
    return (
      '<section class="section work-block" data-cms-album>' +
      '<div class="section-head"><div><div class="kicker cms-album-kicker">' +
      escapeHtml(kicker) +
      '</div><h2 class="cms-album-title">' +
      escapeHtml(album.title || 'Работы') +
      '</h2></div></div>' +
      '<div class="gallery gallery--portfolio">' +
      items +
      '</div></section>'
    );
  }

  function renderAlbumsRoot(root, albums) {
    if (!root || !albums || !albums.length) return;
    root.innerHTML = albums.map(albumSectionHtml).join('');
  }

  function collectAlbums(root) {
    if (!root) return null;
    return Array.from(root.querySelectorAll('[data-cms-album]')).map((sec, i) => {
      const items = [];
      sec.querySelectorAll('.g--media img').forEach((img) => {
        items.push({ type: 'image', url: normalizeUrl(img.getAttribute('src') || '') });
      });
      sec.querySelectorAll('.g--video video').forEach((v) => {
        items.push({ type: 'video', url: normalizeUrl(v.getAttribute('src') || '') });
      });
      return {
        kicker: sec.querySelector('.cms-album-kicker')?.textContent.trim() || String(i + 1).padStart(2, '0'),
        title: sec.querySelector('.cms-album-title')?.textContent.trim() || '',
        items,
      };
    });
  }

  function migratePortfolio(flat) {
    if (!flat || !flat.length) return null;
    return [
      {
        kicker: '01',
        title: 'Работы студии',
        items: flat.map((it) => ({ type: 'image', url: it.url || '' })),
      },
    ];
  }

  window.AvtoCmsAlbums = {
    escapeHtml,
    escapeAttr,
    normalizeUrl,
    mediaItemHtml,
    albumSectionHtml,
    renderAlbumsRoot,
    collectAlbums,
    migratePortfolio,
  };
})();
