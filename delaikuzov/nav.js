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
  var MAX_PHONE = '+79130052315';
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

  function maxHref(msg) {
    var text = encodeURIComponent(msg || 'Здравствуйте! Хочу записаться в D2 Detailing.');
    var path = 'max.ru/' + MAX_PHONE + '?text=' + text;
    if (/Android/i.test(navigator.userAgent)) {
      return 'intent://' + path + '#Intent;scheme=https;package=ru.oneme.app;S.browser_fallback_url=https%3A%2F%2Fweb.max.ru%2F;end';
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return 'https://' + path;
    }
    return 'https://web.max.ru/';
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
    wrap.appendChild(pick);
    if (btn.tagName === 'A') btn.setAttribute('href', '#booking');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var msg = encodeURIComponent(messageFor(btn));
      pick.querySelector('[data-ch="wa"]').href = 'https://wa.me/' + WA + '?text=' + msg;
      pick.querySelector('[data-ch="tg"]').href = 'https://t.me/' + TG + '?text=' + msg;
      pick.querySelector('[data-ch="max"]').href = maxHref(messageFor(btn));
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
