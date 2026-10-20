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
  var openPick = null;

  function closePick() {
    if (!openPick) return;
    openPick.hidden = true;
    openPick = null;
  }

  function messageFor(btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === 'ЗАКАЗАТЬ ТРАНСФЕР') return 'Здравствуйте! Хочу заказать трансфер на Tesla.';
    return base;
  }

  document.querySelectorAll('a.button').forEach(function (btn) {
    var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text !== 'ОНЛАЙН ЗАПИСЬ' && text !== 'ЗАПИСАТЬСЯ' && text !== 'ЗАКАЗАТЬ ТРАНСФЕР') return;
    var pick = document.createElement('div');
    pick.className = 'book-pick';
    pick.hidden = true;
    pick.innerHTML = '<span class="book-pick-label">Куда написать</span><a data-ch="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a><a data-ch="tg" target="_blank" rel="noopener noreferrer">Telegram</a>';
    btn.insertAdjacentElement('afterend', pick);
    btn.setAttribute('href', '#booking');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var msg = encodeURIComponent(messageFor(btn));
      pick.querySelector('[data-ch="wa"]').href = 'https://wa.me/' + WA + '?text=' + msg;
      pick.querySelector('[data-ch="tg"]').href = 'https://t.me/' + TG + '?text=' + msg;
      if (openPick && openPick !== pick) openPick.hidden = true;
      var willOpen = pick.hidden;
      pick.hidden = !willOpen;
      openPick = willOpen ? pick : null;
    });
  });

  document.addEventListener('click', function (e) {
    if (!openPick) return;
    if (e.target.closest('.book-pick') || e.target.closest('a.button')) return;
    closePick();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePick();
  });
})();
