(function (global) {
  var PROD_TRAINING = 'https://autoblesk42.ru/training.html';

  function trainingUrl(cert) {
    var base = PROD_TRAINING;
    var code = cert ? String(cert).trim().toUpperCase() : '';
    if (code) return base + '?cert=' + encodeURIComponent(code) + '#verify';
    return base;
  }

  function imgHtml(cert) {
    var url = trainingUrl(cert);
    return (
      '<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=' +
      encodeURIComponent(url) +
      '" width="88" height="88" alt="QR-код: страница обучения АвтоБлеск">'
    );
  }

  function fill(root, cert) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.cert-qr').forEach(function (el) {
      el.innerHTML = imgHtml(cert);
      el.removeAttribute('aria-hidden');
    });
  }

  global.AvtoCertQr = {
    trainingUrl: trainingUrl,
    imgHtml: imgHtml,
    fill: fill,
  };
})(window);
