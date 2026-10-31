(function () {
  var form = document.getElementById('booking-form');
  if (!form) return;
  var error = document.getElementById('booking-error');
  var send = document.getElementById('booking-send');
  var tgLink = document.getElementById('booking-send-tg');
  var maxLink = document.getElementById('booking-send-max');
  var telegram = (window.STUDIO_MESSENGERS && window.STUDIO_MESSENGERS.tg) || '+79191213344';

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

    if (!name || !phone || !arrive || !depart || !guests) {
      error.textContent = 'Заполните имя, телефон, даты и число гостей.';
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
