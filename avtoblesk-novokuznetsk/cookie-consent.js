(function () {
  var KEY = 'avtoblesk_cookie_consent_v1';
  if (location.pathname.indexOf('/cms/') !== -1) return;
  try {
    if (localStorage.getItem(KEY) === '1') return;
  } catch (_) {
    return;
  }

  var legalHref = 'legal.html#cookies';
  if (location.pathname.split('/').pop() === 'legal.html') legalHref = '#cookies';

  var bar = document.createElement('div');
  bar.className = 'cookie-banner';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Уведомление о cookie');
  bar.innerHTML =
    '<p>Мы используем файлы cookie для работы сайта, настроек и интерактивных блоков (в том числе 3D-конфигуратора). Продолжая пользоваться сайтом, вы соглашаетесь с ' +
    '<a href="' +
    legalHref +
    '">политикой cookie</a>.</p>' +
    '<button type="button" class="cookie-banner-accept">Принять</button>';

  document.body.appendChild(bar);

  bar.querySelector('.cookie-banner-accept').addEventListener('click', function () {
    try {
      localStorage.setItem(KEY, '1');
    } catch (_) {}
    bar.classList.add('is-hidden');
    setTimeout(function () {
      bar.remove();
    }, 400);
  });
})();
