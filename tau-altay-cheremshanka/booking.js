(function () {
  var form = document.getElementById('booking-form');
  if (!form) return;
  var error = document.getElementById('booking-error');
  var send = document.getElementById('booking-send');
  var tgLink = document.getElementById('booking-send-tg');
  var waLink = document.getElementById('booking-send-wa');
  var messengers = window.STUDIO_MESSENGERS || {};
  var telegram = messengers.tg || '+79835829604';
  var whatsapp = String(messengers.wa || '79835829604').replace(/\D/g, '');
  var phoneInput = form.querySelector('input[name="phone"]');
  var cabinAny = form.querySelector('#booking-cabin-any');

  function nationalDigits(raw) {
    var digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) === '7') digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function formatPhone(national) {
    var d = national || '';
    if (!d) return '+7';
    if (d.length < 3) return '+7 (' + d;
    var out = '+7 (' + d.slice(0, 3) + ')';
    if (d.length === 3) return out;
    out += ' ' + d.slice(3, Math.min(6, d.length));
    if (d.length <= 6) return out;
    out += '-' + d.slice(6, Math.min(8, d.length));
    if (d.length <= 8) return out;
    return out + '-' + d.slice(8, 10);
  }

  function caretAfter(formatted, count) {
    var seen = 0;
    var passedCountry = false;
    for (var i = 0; i < formatted.length; i++) {
      if (!/\d/.test(formatted.charAt(i))) continue;
      if (!passedCountry) {
        passedCountry = true;
        continue;
      }
      seen += 1;
      if (seen === count) return i + 1;
    }
    return formatted.length;
  }

  function selectedCabins() {
    return Array.prototype.filter.call(
      form.querySelectorAll('input[name="cabin"]:checked'),
      function (node) { return node.value !== 'any'; }
    ).map(function (node) { return node.value; });
  }

  function cabinLabel(value) {
    if (value === 'any') return 'Любой свободный';
    return 'Домик ' + value;
  }

  function cabinSummary() {
    if (cabinAny && cabinAny.checked) return 'Любой свободный домик';
    var picked = selectedCabins();
    if (!picked.length) return '';
    return picked.map(cabinLabel).join(', ');
  }

  if (cabinAny) {
    form.querySelectorAll('input[name="cabin"]').forEach(function (box) {
      box.addEventListener('change', function () {
        if (box.value === 'any' && box.checked) {
          form.querySelectorAll('input[name="cabin"]').forEach(function (other) {
            if (other.value !== 'any') other.checked = false;
          });
        } else if (box.value !== 'any' && box.checked && cabinAny) {
          cabinAny.checked = false;
        }
      });
    });
  }

  if (phoneInput) {
    var phonePrev = '';
    phoneInput.addEventListener('input', function () {
      var raw = phoneInput.value;
      var digits = raw.replace(/\D/g, '');
      if ((phonePrev === '+7' || phonePrev === '+7 ') && raw.length < phonePrev.length && nationalDigits(raw).length === 0) {
        phoneInput.value = '';
        phonePrev = '';
        return;
      }
      if (!digits) {
        phoneInput.value = '';
        phonePrev = '';
        return;
      }
      var before = raw.slice(0, phoneInput.selectionStart || 0).replace(/\D/g, '');
      var country = digits.charAt(0) === '7' || digits.charAt(0) === '8';
      var nationalBefore = before.length - (country && before.length ? 1 : 0);
      if (nationalBefore < 0) nationalBefore = 0;
      var national = nationalDigits(raw);
      var formatted = formatPhone(national);
      phoneInput.value = formatted;
      phonePrev = formatted;
      var pos = caretAfter(formatted, Math.min(nationalBefore, national.length));
      phoneInput.setSelectionRange(pos, pos);
    });
    phoneInput.addEventListener('blur', function () {
      if (nationalDigits(phoneInput.value).length === 0) {
        phoneInput.value = '';
        phonePrev = '';
      }
    });
  }

  function formatDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    var phone = String(data.get('phone') || '').trim();
    var arrive = String(data.get('arrive') || '');
    var depart = String(data.get('depart') || '');
    var guests = String(data.get('guests') || '').trim();
    var comment = String(data.get('comment') || '').trim();
    var cabins = cabinSummary();

    var phoneNational = nationalDigits(phone);
    phone = phoneNational.length ? formatPhone(phoneNational) : '';
    if (!name || !phone || !arrive || !depart || !guests) {
      error.textContent = 'Заполните имя, телефон, даты и число гостей.';
      if (send) send.hidden = true;
      return;
    }
    if (!cabins) {
      error.textContent = 'Выберите домик (1–3) или «Любой свободный».';
      if (send) send.hidden = true;
      return;
    }
    if (phoneNational.length < 10) {
      error.textContent = 'Введите телефон полностью: +7 и ещё 10 цифр.';
      if (send) send.hidden = true;
      return;
    }
    var arriveMs = Date.parse(arrive + 'T00:00:00Z');
    var departMs = Date.parse(depart + 'T00:00:00Z');
    var nights = (Number.isFinite(arriveMs) && Number.isFinite(departMs))
      ? Math.round((departMs - arriveMs) / 86400000)
      : 0;
    var guestCount = parseInt(guests, 10);
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 4) {
      error.textContent = 'В одном домике — до 4 гостей.';
      if (send) send.hidden = true;
      return;
    }
    if (nights < 1) {
      error.textContent = 'Выберите выезд позже даты заезда.';
      if (send) send.hidden = true;
      return;
    }
    error.textContent = '';

    var lines = [
      messengers.defaultMessage || 'Здравствуйте! Хочу забронировать домик Тау Алтай, пос. Черемшанка.',
      '',
      'Имя: ' + name,
      'Телефон: ' + phone,
      'Домик: ' + cabins,
      'Заезд: ' + formatDate(arrive),
      'Выезд: ' + formatDate(depart),
      'Суток: ' + nights,
      'Гостей: ' + guests
    ];
    if (comment) lines.push('Комментарий: ' + comment);
    var text = encodeURIComponent(lines.join('\n'));
    var phonePath = telegram.charAt(0) === '+' ? telegram : '+' + telegram;
    if (tgLink) tgLink.href = 'https://t.me/' + phonePath + '?text=' + text;
    if (waLink) waLink.href = 'https://wa.me/' + whatsapp + '?text=' + text;
    if (send) send.hidden = false;
  });
})();