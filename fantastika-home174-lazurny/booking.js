(function () {
  var form = document.getElementById('booking-form');
  if (!form) return;
  var error = document.getElementById('booking-error');
  var send = document.getElementById('booking-send');
  var tgLink = document.getElementById('booking-send-tg');
  var maxLink = document.getElementById('booking-send-max');
  var telegram = (window.STUDIO_MESSENGERS && window.STUDIO_MESSENGERS.tg) || '+79191213344';
  var phoneInput = form.querySelector('input[name="phone"]');

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

    var phoneNational = nationalDigits(phone);
    phone = phoneNational.length ? formatPhone(phoneNational) : '';
    if (!name || !phone || !arrive || !depart || !guests) {
      error.textContent = 'Заполните имя, телефон, даты и число гостей.';
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
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 10) {
      error.textContent = 'Дом рассчитан на 10 человек.';
      if (send) send.hidden = true;
      return;
    }
    if (nights < 2) {
      error.textContent = 'Бронируем от двух суток. Выберите выезд хотя бы через два дня после заезда.';
      if (send) send.hidden = true;
      return;
    }
    error.textContent = '';

    var lines = [
      'Здравствуйте! Хочу забронировать Fantastika home 174, пос. Лазурный.',
      '',
      'Имя: ' + name,
      'Телефон: ' + phone,
      'Заезд: ' + formatDate(arrive),
      'Выезд: ' + formatDate(depart),
      'Суток: ' + nights,
      'Гостей: ' + guests
    ];
    if (comment) lines.push('Комментарий: ' + comment);
    var text = encodeURIComponent(lines.join('\n'));
    var phonePath = telegram.charAt(0) === '+' ? telegram : '+' + telegram;
    if (tgLink) tgLink.href = 'https://t.me/' + phonePath + '?text=' + text;
    if (maxLink) maxLink.href = 'https://max.ru/:share?text=' + text;
    if (send) send.hidden = false;
  });
})();
