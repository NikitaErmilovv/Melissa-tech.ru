(function () {
  var form = document.getElementById('booking-form');
  if (!form) return;
  var error = document.getElementById('booking-error');
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
      return;
    }
    if (depart < arrive) {
      error.textContent = 'Дата выезда должна быть не раньше заезда.';
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
      'Гостей: ' + guests
    ];
    if (comment) lines.push('Комментарий: ' + comment);
    var text = encodeURIComponent(lines.join('\n'));
    var phonePath = telegram.charAt(0) === '+' ? telegram : '+' + telegram;
    window.open('https://t.me/' + phonePath + '?text=' + text, '_blank', 'noopener');
  });
})();
