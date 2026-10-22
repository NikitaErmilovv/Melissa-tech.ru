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
  var WA = '79130052315';
  var TG = 'mromand2';
  var MAX_URL = 'https://web.max.ru/241205876';
  var phrases = {
    'wash.html': 'Здравствуйте! Хочу записаться на детейлинг-мойку.',
    'bay.html': 'Здравствуйте! Хочу записаться на мойку подкапотного пространства.',
    'wrap.html': 'Здравствуйте! Хочу записаться на оклейку.',
    'polish.html': 'Здравствуйте! Хочу записаться на полировку.',
    'interior.html': 'Здравствуйте! Хочу записаться на химчистку салона.',
    'sound.html': 'Здравствуйте! Хочу записаться на шумоизоляцию.',
    'paint.html': 'Здравствуйте! Хочу записаться на покраску.',
    'anticor.html': 'Здравствуйте! Хочу записаться на антикоррозийную обработку.',
    'chips.html': 'Здравствуйте! Хочу записаться на ремонт сколов и царапин.',
    'optics.html': 'Здравствуйте! Хочу записаться на ремонт оптики.',
    'pdr.html': 'Здравствуйте! Хочу записаться на удаление вмятин.'
  };
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var base = phrases[file] || 'Здравствуйте! Хочу записаться в D2 Detailing.';
  var openWrap = null;

  function closePick() {
    if (!openWrap) return;
    openWrap.classList.remove('is-open');
    var pick = openWrap.querySelector('.book-pick');
    if (pick) pick.hidden = true;
    openWrap = null;
  }

  function maxHref() {
    if (/Android/i.test(navigator.userAgent)) {
      return (
        'intent://web.max.ru/241205876#Intent;scheme=https;package=ru.oneme.app;S.browser_fallback_url=' +
        encodeURIComponent(MAX_URL) +
        ';end'
      );
    }
    return MAX_URL;
  }

  function messageFor(btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === 'ЗАКАЗАТЬ ТРАНСФЕР') return 'Здравствуйте! Хочу заказать трансфер на Tesla.';
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
    pick.innerHTML = '<span class="book-pick-label">Куда написать</span><a data-ch="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a><a data-ch="tg" target="_blank" rel="noopener noreferrer">Telegram</a><a data-ch="max" target="_blank" rel="noopener noreferrer">Max</a>';
    pick.querySelector('[data-ch="max"]').href = maxHref();
    wrap.appendChild(pick);
    if (btn.tagName === 'A') btn.setAttribute('href', '#booking');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var msg = encodeURIComponent(messageFor(btn));
      pick.querySelector('[data-ch="wa"]').href = 'https://wa.me/' + WA + '?text=' + msg;
      pick.querySelector('[data-ch="tg"]').href = 'https://t.me/' + TG + '?text=' + msg;
      pick.querySelector('[data-ch="max"]').href = maxHref();
      if (openWrap && openWrap !== wrap) closePick();
      var willOpen = pick.hidden;
      pick.hidden = !willOpen;
      wrap.classList.toggle('is-open', willOpen);
      openWrap = willOpen ? wrap : null;
    });
  }

  document.querySelectorAll('a.button').forEach(function (btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === 'ОНЛАЙН ЗАПИСЬ' || text === 'ЗАПИСАТЬСЯ' || text === 'ЗАКАЗАТЬ ТРАНСФЕР') attachBook(btn);
  });
  document.querySelectorAll('a[href*="max.ru"]').forEach(function (a) {
    a.setAttribute('href', maxHref());
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  var quote = document.querySelector('#wrap-cfg #quote');
  if (quote) {
    quote.setAttribute('href', 'tel:+79130052315');
    quote.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'tel:+79130052315';
    });
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
      var endRect = lastItem.getBoundingClientRect();
      var lineX = fRect.left + fRect.width / 2 - tRect.left;
      line.style.left = Math.round(lineX) + 'px';
      line.style.marginLeft = '-1px';
      line.style.top = fRect.top - tRect.top + fRect.height / 2 + 'px';
      line.style.bottom = Math.max(0, tRect.bottom - endRect.bottom) + 'px';
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
