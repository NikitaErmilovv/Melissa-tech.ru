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

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    try {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    } catch (err) { /* ignore */ }
    return Promise.resolve();
  }

  function showMaxTip() {
    var tip = document.querySelector('.max-open-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'max-open-tip';
      tip.setAttribute('role', 'status');
      tip.textContent = 'Номер ' + MAX_PHONE + ' скопирован. В MAX: Контакты → Найти по номеру.';
      document.body.appendChild(tip);
    }
    tip.classList.add('is-visible');
    clearTimeout(showMaxTip._timer);
    showMaxTip._timer = setTimeout(function () {
      tip.classList.remove('is-visible');
    }, 4200);
  }

  function openMax(msg) {
    var text = msg || 'Здравствуйте! Хочу записаться в D2 Detailing.';
    var sharePath = 'max.ru/%3Ashare?text=' + encodeURIComponent(text);
    var shareHttps = 'https://max.ru/:share?text=' + encodeURIComponent(text);
    copyToClipboard(MAX_PHONE).then(showMaxTip);
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href =
        'intent://' + sharePath +
        '#Intent;scheme=https;package=ru.oneme.app;S.browser_fallback_url=' +
        encodeURIComponent('https://web.max.ru/') + ';end';
      return;
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = shareHttps;
      return;
    }
    window.open('https://web.max.ru/', '_blank', 'noopener,noreferrer');
  }

  function bindMaxLink(el, getMsg) {
    if (!el || el.dataset.maxBound === '1') return;
    el.dataset.maxBound = '1';
    el.setAttribute('href', 'https://web.max.ru/');
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openMax(typeof getMsg === 'function' ? getMsg() : getMsg);
    });
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
      bindMaxLink(pick.querySelector('[data-ch="max"]'), function () {
        return messageFor(btn);
      });
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
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    bindMaxLink(a);
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
