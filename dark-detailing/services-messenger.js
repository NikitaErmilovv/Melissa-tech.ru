(function () {
  var WA = '79096155666';
  var TG = 'dark_detailing';
  var VK = 'dark_detailing56';
  var openWrap = null;

  function closePick() {
    if (!openWrap) return;
    openWrap.classList.remove('is-open');
    var pick = openWrap.querySelector('.book-pick');
    if (pick) pick.hidden = true;
    openWrap = null;
  }

  function messageFor(serviceName) {
    return (
      'Здравствуйте! Интересует услуга «' +
      serviceName +
      '» в Dark Detailing. Хочу записаться и узнать стоимость.'
    );
  }

  function attachMessenger(btn, serviceName) {
    var wrap = document.createElement('div');
    wrap.className = 'book-wrap service-book-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    var pick = document.createElement('div');
    pick.className = 'book-pick';
    pick.hidden = true;
    pick.innerHTML =
      '<span class="book-pick-label">Куда написать</span>' +
      '<a data-ch="tg" target="_blank" rel="noopener noreferrer">Telegram</a>' +
      '<a data-ch="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
      '<a data-ch="vk" target="_blank" rel="noopener noreferrer">ВКонтакте</a>';
    wrap.appendChild(pick);

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var msg = encodeURIComponent(messageFor(serviceName));
      pick.querySelector('[data-ch="wa"]').href = 'https://wa.me/' + WA + '?text=' + msg;
      pick.querySelector('[data-ch="tg"]').href = 'https://t.me/' + TG + '?text=' + msg;
      pick.querySelector('[data-ch="vk"]').href =
        'https://vk.me/' + VK + '?message=' + msg;
      if (openWrap && openWrap !== wrap) closePick();
      var willOpen = pick.hidden;
      pick.hidden = !willOpen;
      wrap.classList.toggle('is-open', willOpen);
      openWrap = willOpen ? wrap : null;
    });
  }

  document.querySelectorAll('.service-list .service-row').forEach(function (row) {
    var titleEl = row.querySelector('h3');
    if (!titleEl || row.querySelector('.service-msg-btn')) return;
    var serviceName = titleEl.textContent.replace(/\s+/g, ' ').trim();
    var actions = document.createElement('div');
    actions.className = 'service-row-actions';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button dark service-msg-btn';
    btn.textContent = 'НАПИСАТЬ';
    actions.appendChild(btn);
    row.appendChild(actions);
    attachMessenger(btn, serviceName);
  });

  document.addEventListener('click', function (e) {
    if (!openWrap) return;
    if (!openWrap.contains(e.target)) closePick();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePick();
  });
})();
