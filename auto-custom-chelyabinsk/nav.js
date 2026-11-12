(function () {
  var burger = document.querySelector('.nav-burger');
  var panel = document.querySelector('.nav-mobile-menu');
  if (!burger || !panel) return;

  function setOpen(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  burger.addEventListener('click', function () {
    setOpen(!panel.classList.contains('is-open'));
  });

  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();

(function () {
  var WA = '79000623277';
  var EMAIL = 'auto.custom174@gmail.com';
  var phrases = {
    'wash.html': 'Здравствуйте! Хочу записаться на детейлинг-мойку.',
    'wrap.html': 'Здравствуйте! Хочу записаться на оклейку плёнкой.',
    'risk.html': 'Здравствуйте! Хочу записаться на оклейку зон риска.',
    'armor.html': 'Здравствуйте! Хочу записаться на бронирование стёкол.',
    'polish.html': 'Здравствуйте! Хочу записаться на полировку.',
    'ceramic.html': 'Здравствуйте! Хочу записаться на керамическое покрытие.',
    'antichrome.html': 'Здравствуйте! Хочу записаться на антихром.',
    'sound.html': 'Здравствуйте! Хочу записаться на шумоизоляцию.',
  };
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var base = phrases[file] || 'Здравствуйте! Хочу записаться в Auto Custom.';
  var openWrap = null;

  function closePick() {
    if (!openWrap) return;
    openWrap.classList.remove('is-open');
    var pick = openWrap.querySelector('.book-pick');
    if (pick) pick.hidden = true;
    openWrap = null;
  }

  function messageFor(btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === 'ПОЛУЧИТЬ РАСЧЁТ') return 'Здравствуйте! Нужен расчёт по оклейке автомобиля.';
    return base;
  }

  function attachBook(btn) {
    if (!btn || btn.closest('.book-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'book-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    var pick = document.createElement('div');
    pick.className = 'book-pick';
    pick.hidden = true;
    pick.innerHTML = '<span class="book-pick-label">Куда написать</span><a data-ch="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a><a data-ch="mail" target="_blank" rel="noopener noreferrer">Email</a>';
    wrap.appendChild(pick);
    if (btn.tagName === 'A') btn.setAttribute('href', '#booking');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var msg = encodeURIComponent(messageFor(btn));
      pick.querySelector('[data-ch="wa"]').href = 'https://wa.me/' + WA + '?text=' + msg;
      pick.querySelector('[data-ch="mail"]').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Запись в Auto Custom') + '&body=' + msg;
      if (openWrap && openWrap !== wrap) closePick();
      var willOpen = pick.hidden;
      pick.hidden = !willOpen;
      wrap.classList.toggle('is-open', willOpen);
      openWrap = willOpen ? wrap : null;
    });
  }

  document.querySelectorAll('a.button').forEach(function (btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === 'ОНЛАЙН ЗАПИСЬ' || text === 'ЗАПИСАТЬСЯ') attachBook(btn);
  });

  var quote = document.querySelector('#wrap-cfg #quote');
  if (quote) {
    quote.setAttribute('href', 'tel:+79000623277');
  }

  document.addEventListener('click', function (e) {
    if (!openWrap) return;
    if (openWrap.contains(e.target)) return;
    closePick();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePick();
  });
})();

(function () {
  function lastStepTextBottom(item) {
    var content = item.querySelector('.service-timeline-content');
    if (!content) return item.getBoundingClientRect().bottom;
    var parts = content.querySelectorAll('h3, p, .service-step-bullets');
    if (!parts.length) return content.getBoundingClientRect().bottom;
    var bottom = 0;
    parts.forEach(function (el) {
      var b = el.getBoundingClientRect().bottom;
      if (b > bottom) bottom = b;
    });
    return bottom;
  }

  function alignServiceTimelineLines() {
    document.querySelectorAll('.service-timeline').forEach(function (timeline) {
      var line = timeline.querySelector('.service-timeline-line');
      var items = timeline.querySelectorAll('.service-timeline-item');
      if (!line || !items.length) return;
      var tRect = timeline.getBoundingClientRect();

      items.forEach(function (item) {
        var dot = item.querySelector('.service-timeline-dot');
        var heading = item.querySelector('.service-timeline-content h3');
        if (!dot || !heading) return;
        var pos = window.getComputedStyle(dot).position;
        if (pos === 'static' || pos === 'relative') {
          dot.style.top = '';
          return;
        }
        var iRect = item.getBoundingClientRect();
        var hRect = heading.getBoundingClientRect();
        var dotH = dot.offsetHeight || 28;
        dot.style.top = Math.round(hRect.top - iRect.top + (hRect.height - dotH) / 2) + 'px';
      });

      var firstDot = items[0].querySelector('.service-timeline-dot');
      var lastItem = items[items.length - 1];
      if (!firstDot || !lastItem) return;
      var fRect = firstDot.getBoundingClientRect();
      var textBottom = lastStepTextBottom(lastItem);
      var lineX = fRect.left + fRect.width / 2 - tRect.left;
      line.style.left = Math.round(lineX) + 'px';
      line.style.marginLeft = '-1px';
      line.style.top = fRect.top - tRect.top + fRect.height / 2 + 'px';
      line.style.bottom = Math.max(0, tRect.bottom - textBottom) + 'px';
    });
  }

  function bootTimelines() {
    alignServiceTimelineLines();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTimelines);
  } else {
    bootTimelines();
  }
  window.addEventListener('load', bootTimelines);
  window.addEventListener('resize', bootTimelines);
})();
