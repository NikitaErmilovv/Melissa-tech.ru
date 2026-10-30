(function () {
  var form = document.getElementById('booking-form');
  if (!form) return;
  var error = document.getElementById('booking-error');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    var phone = String(data.get('phone') || '').trim();
    var arrive = String(data.get('arrive') || '');
    var depart = String(data.get('depart') || '');
    var guests = String(data.get('guests') || '').trim();
    var channel = String(data.get('channel') || 'WhatsApp');
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
      'Имя: ' + name,
      'Телефон: ' + phone,
      'Заезд: ' + arrive,
      'Выезд: ' + depart,
      'Гостей: ' + guests,
      'Удобнее связаться: ' + channel
    ];
    if (comment) lines.push('Комментарий: ' + comment);
    var text = encodeURIComponent(lines.join('\n'));

    if (channel === 'Telegram') {
      window.open('https://t.me/+79191213344?text=' + text, '_blank', 'noopener');
      return;
    }
    if (channel === 'Звонок') {
      window.location.href = 'tel:+79191213344';
      return;
    }
    window.open('https://wa.me/79191213344?text=' + text, '_blank', 'noopener');
  });
})();
