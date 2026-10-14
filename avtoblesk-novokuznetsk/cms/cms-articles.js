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
    return escapeHtml(String(p[2]).padStart(2, '0') + '.' + String(p[1]).padStart(2, '0') + '.' + p[0]);
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
    return sortArticles((data && data.articles ? data.articles : []).filter((a) => a && !a.hidden));
  }
  function articleUrl(article, base) {
    return (base || '') + 'works/' + encodeURIComponent(article.slug || '') + '/';
  }
  function slugify(title) {
    const map = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
      к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
      х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    return (
      String(title || '')
        .toLowerCase()
        .trim()
        .split('')
        .map((ch) => map[ch] || ch)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'article'
    );
  }
  window.AvtoCmsArticles = { escapeHtml, escapeAttr, formatDate, sortArticles, publicArticles, articleUrl, slugify };
})();
