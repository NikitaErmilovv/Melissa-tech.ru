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

  function rowHtml(article, base) {
    const href = articleUrl(article, base);
    const cover = article.cover || (article.gallery && article.gallery[0]) || '';
    const pin = article.pinned
      ? '<span class="article-row-pin">Закреплено</span>'
      : '';
    const media = cover
      ? '<a class="article-row-media" href="' +
        escapeAttr(href) +
        '" tabindex="-1" aria-hidden="true"><img src="' +
        escapeAttr(base + cover) +
        '" alt="" loading="lazy" decoding="async"></a>'
      : '<a class="article-row-media article-row-media--empty" href="' +
        escapeAttr(href) +
        '" tabindex="-1" aria-hidden="true"><span>АвтоБлеск</span></a>';
    return (
      '<article class="article-row' +
      (article.pinned ? ' article-row--pinned' : '') +
      '">' +
      media +
      '<div class="article-row-body">' +
      pin +
      '<time class="article-row-date" datetime="' +
      escapeAttr(article.publishedAt || '') +
      '">' +
      formatDate(article.publishedAt) +
      '</time>' +
      '<h2 class="article-row-title"><a href="' +
      escapeAttr(href) +
      '">' +
      escapeHtml(article.title) +
      '</a></h2>' +
      '<p class="article-row-excerpt">' +
      escapeHtml(article.excerpt || '') +
      '</p>' +
      '<a class="button dark article-row-btn" href="' +
      escapeAttr(href) +
      '">Читать статью</a>' +
      '</div></article>'
    );
  }

  function feedInnerHtml(data, base) {
    const list = publicArticles(data);
    if (!list.length) {
      return '<p class="intro">Пока нет опубликованных материалов. Загляните позже.</p>';
    }
    return (
      '<div class="article-feed article-feed--magazine">' +
      list.map((a) => rowHtml(a, base)).join('') +
      '</div>'
    );
  }

  function renderFeed(root, data, base) {
    if (!root) return;
    root.innerHTML = feedInnerHtml(data, base);
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
    rowHtml,
    feedInnerHtml,
    renderFeed,
    slugify,
  };
})();
