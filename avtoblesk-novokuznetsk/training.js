(function () {
  var DB = {};
  var loaded = false;

  function initials(name) {
    return String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(function (p) {
        return p[0].toUpperCase();
      })
      .join('');
  }

  function fill(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function applyStudent(code) {
    var s = DB[code];
    if (!s) return false;
    fill('[data-cert-code]', s.cert);
    fill('[data-cert-name]', s.name);
    fill('[data-cert-course]', s.course);
    fill('[data-cert-dates]', s.dates);
    fill('[data-cert-issued]', s.issued || '—');
    fill('[data-cert-phone]', s.phone || '');
    fill('[data-cert-email]', s.email || '');
    fill('[data-cert-group]', s.group || '');
    fill('[data-cert-teacher]', s.teacher || '');
    fill('[data-cert-initials]', initials(s.name));
    document.querySelectorAll('[data-cert-status]').forEach(function (el) {
      var done = s.status === 'ok';
      el.textContent = done ? '● Обучен' : '● Ожидает обучения';
      el.classList.toggle('is-ok', done);
      el.classList.toggle('is-accent', !done);
    });
    document.querySelectorAll('[data-cert-notes]').forEach(function (el) {
      el.innerHTML = (s.notes || [])
        .map(function (n) {
          return '<p>' + n + '</p>';
        })
        .join('');
    });
    return true;
  }

  var tabs = document.querySelectorAll('.cert-tab');
  var panels = document.querySelectorAll('[data-cert-panel]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
      });
      tab.classList.add('is-active');
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-cert-panel') !== tab.getAttribute('data-cert-tab');
      });
    });
  });

  var form = document.getElementById('cert-form');
  var input = document.getElementById('cert-no');
  var result = document.getElementById('cert-result');
  var msg = document.getElementById('cert-msg');

  function runCheck() {
    if (!form || !input || !result) return;
    if (!loaded) {
      msg.textContent = 'Загружаем базу сертификатов…';
      return;
    }
    var code = input.value.trim().toUpperCase();
    var s = DB[code];
    if (!s) {
      result.classList.remove('is-visible');
      msg.textContent = code
        ? 'Сертификат ' + code + ' не найден. Проверьте номер на сертификате.'
        : 'Введите номер сертификата.';
      return;
    }
    if (s.status !== 'ok') {
      result.classList.remove('is-visible');
      msg.textContent = 'Сертификат ' + code + ' ещё не выдан: обучение не завершено.';
      applyStudent(code);
      return;
    }
    applyStudent(code);
    msg.textContent = '';
    document.getElementById('res-name').textContent = s.name;
    document.getElementById('res-course').textContent = s.course;
    document.getElementById('res-dates').textContent = s.dates;
    document.getElementById('res-code').textContent = s.cert;
    result.classList.add('is-visible');
  }

  if (form && input && result) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      runCheck();
    });
  }

  fetch('./data/training.json?_=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      DB = {};
      (data.students || []).forEach(function (s) {
        if (s && s.cert) DB[String(s.cert).toUpperCase()] = s;
      });
      loaded = true;
      var fromUrl = new URLSearchParams(location.search).get('cert');
      if (fromUrl && input) {
        input.value = fromUrl.toUpperCase();
        runCheck();
      } else if (msg && msg.textContent.indexOf('Загружаем') === 0) {
        runCheck();
      }
    })
    .catch(function () {
      if (msg) msg.textContent = 'Не удалось загрузить базу сертификатов.';
    });
})();
