(function () {
  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    const p = String(iso).split('-');
    if (p.length !== 3) return escapeHtml(iso);
    return escapeHtml(+p[2] + '.' + p[1] + '.' + p[0]);
  }

  function sortArticles(list) {
    return list.slice().sort((a, b) => {
      const pa = a.pinned ? 1 : 0;
      const pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      const oa = a.order || 0;
      const ob = b.order || 0;
      if (oa !== ob) return ob - oa;
      return String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''));
    });
  }

  function publicArticles(data) {
    const raw = data && data.articles ? data.articles : [];
    return sortArticles(raw.filter((a) => a && !a.hidden));
  }

  function articleUrl(article, base) {
    const slug = article.slug || '';
    return (base || '') + 'works/' + encodeURIComponent(slug) + '/';
  }

  function cardHtml(article, base) {
    const href = articleUrl(article, base);
    const cover = article.cover || (article.gallery && article.gallery[0]) || '';
    const img = cover
      ? '<img src="' + escapeAttr(base + cover) + '" alt="" loading="lazy" decoding="async">'
      : '<span class="article-card-placeholder"></span>';
    const pin = article.pinned ? '<span class="article-card-pin">Закреплено</span>' : '';
    return (
      '<a class="article-card" href="' +
      escapeAttr(href) +
      '">' +
      '<div class="article-card-media">' +
      img +
      pin +
      '</div>' +
      '<div class="article-card-body">' +
      '<time class="article-card-date">' +
      formatDate(article.publishedAt) +
      '</time>' +
      '<h2 class="article-card-title">' +
      escapeHtml(article.title) +
      '</h2>' +
      '<p class="article-card-excerpt">' +
      escapeHtml(article.excerpt || '') +
      '</p>' +
      '<span class="article-card-more">Читать →</span>' +
      '</div></a>'
    );
  }

  function renderFeed(root, data, base) {
    if (!root) return;
    const list = publicArticles(data);
    if (!list.length) {
      root.innerHTML = '<p class="intro">Пока нет опубликованных материалов.</p>';
      return;
    }
    root.innerHTML = '<div class="article-feed">' + list.map((a) => cardHtml(a, base)).join('') + '</div>';
  }

  function slugify(title) {
    const map = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
      к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
      х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    let out = String(title || '').toLowerCase().trim();
    out = out
      .split('')
      .map((ch) => map[ch] || ch)
      .join('');
    out = out.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return out || 'article';
  }

  window.AvtoCmsArticles = {
    escapeHtml,
    escapeAttr,
    formatDate,
    sortArticles,
    publicArticles,
    articleUrl,
    cardHtml,
    renderFeed,
    slugify,
  };
})();
