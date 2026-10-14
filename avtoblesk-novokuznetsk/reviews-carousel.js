(function () {
  var root = document.querySelector('[data-reviews-carousel]');
  if (!root) return;

  var track = root.querySelector('.reviews-track');
  var dots = root.querySelector('.reviews-dots');
  var prev = root.querySelector('.reviews-nav--prev');
  var next = root.querySelector('.reviews-nav--next');
  var index = 0;
  var slides = [];
  var autoplay = null;
  var paused = false;

  function stars(n) {
    var r = Math.max(1, Math.min(5, n | 0));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render(items) {
    var list = (items || []).filter(function (it) {
      return it && (it.text || it.rating);
    });
    list.sort(function (a, b) {
      var ta = String(a.text || '').replace(/\s+/g, ' ').trim();
      var tb = String(b.text || '').replace(/\s+/g, ' ').trim();
      return tb.length - ta.length;
    });
    if (!list.length) {
      track.innerHTML = '<div class="review"><div class="review-stars">★★★★★</div><div class="review-text">Отзывы загружаются…</div><div class="review-meta">2ГИС</div></div>';
      return;
    }
    slides = list;
    track.innerHTML = list
      .map(function (it) {
        var text = escapeHtml(String(it.text || '').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim());
        var date = it.date ? ' · ' + escapeHtml(it.date) : '';
        return (
          '<article class="review">' +
          '<div class="review-stars" aria-label="Оценка ' + (it.rating || 5) + ' из 5">' + stars(it.rating || 5) + '</div>' +
          '<div class="review-text">«' + text + '»</div>' +
          '<div class="review-meta">' + escapeHtml(it.name || 'Клиент') + date + ' · 2ГИС</div>' +
          '</article>'
        );
      })
      .join('');
    if (dots) dots.innerHTML = '';
    index = 0;
    go(0, false);
    startAutoplay();
  }

  function perView() {
    if (window.matchMedia('(max-width: 768px)').matches) return 1;
    if (window.matchMedia('(max-width: 1100px)').matches) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - perView());
  }

  function go(i, animate) {
    index = Math.max(0, Math.min(maxIndex(), i));
    var card = track.querySelector('.review');
    var gap = 10;
    var w = card ? card.offsetWidth + gap : 0;
    track.style.transition = animate ? 'transform .45s ease' : 'none';
    track.style.transform = 'translate3d(' + -index * w + 'px,0,0)';
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= maxIndex();
  }

  function stepAuto() {
    if (paused || !slides.length) return;
    go(index >= maxIndex() ? 0 : index + 1, true);
  }

  function startAutoplay() {
    if (autoplay) clearInterval(autoplay);
    autoplay = setInterval(stepAuto, 4500);
  }

  if (prev) prev.addEventListener('click', function () { go(index - 1, true); startAutoplay(); });
  if (next) next.addEventListener('click', function () { go(index + 1, true); startAutoplay(); });
  window.addEventListener('resize', function () { go(index, false); });

  root.addEventListener('pointerenter', function () { paused = true; });
  root.addEventListener('pointerleave', function () { paused = false; });

  function load(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('fail');
      return r.json();
    });
  }

  load('/api/reviews-2gis.json')
    .catch(function () { return load('./cms/api.php?action=reviews-2gis'); })
    .catch(function () { return load('./data/reviews-2gis.json?_=' + Date.now()); })
    .then(render)
    .catch(function () {
      track.innerHTML =
        '<div class="review"><p>Не удалось загрузить отзывы 2ГИС.</p><small><a href="https://2gis.ru/novokuznetsk/firm/70000001098503533/tab/reviews" target="_blank" rel="noopener">Открыть на 2ГИС</a></small></div>';
    });
})();
