(function () {
  const root = document.getElementById('articles-feed');
  if (!root || !window.AvtoCmsArticles) return;

  const base = window.AvtoCmsApi ? window.AvtoCmsApi.siteBase() : '';

  fetch(base + 'data/articles.json?_=' + Date.now())
    .then((r) => (r.ok ? r.json() : { articles: [] }))
    .then((data) => window.AvtoCmsArticles.renderFeed(root, data, base))
    .catch(() => {
      root.innerHTML = '<p class="intro">Не удалось загрузить список работ.</p>';
    });
})();
