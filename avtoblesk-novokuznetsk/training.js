(function () {
  var DB = window.TRAINING_DB || {};

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2)
      .map(function (p) { return p[0].toUpperCase(); }).join('');
  }

  function fill(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
  }

  function applyStudent(code) {
    var s = DB[code];
    if (!s) return false;
    fill('[data-cert-code]', s.cert);
    fill('[data-cert-name]', s.name);
    fill('[data-cert-course]', s.course);
    fill('[data-cert-dates]', s.dates);
    fill('[data-cert-issued]', s.issued);
    fill('[data-cert-phone]', s.phone);
    fill('[data-cert-email]', s.email);
    fill('[data-cert-group]', s.group);
    fill('[data-cert-teacher]', s.teacher);
    fill('[data-cert-initials]', initials(s.name));
    document.querySelectorAll('[data-cert-status]').forEach(function (el) {
      var done = s.status === 'ok';
      el.textContent = done ? '● Обучен' : '● Ожидает обучения';
      el.classList.toggle('is-ok', done);
      el.classList.toggle('is-accent', !done);
    });
    document.querySelectorAll('[data-cert-notes]').forEach(function (el) {
      el.innerHTML = s.notes.map(function (n) { return '<p>' + n + '</p>'; }).join('');
    });
    return true;
  }

  if (window.TRAINING_DEFAULT) applyStudent(window.TRAINING_DEFAULT);

  /* --- вкладки проверки --- */
  var tabs = document.querySelectorAll('.cert-tab');
  var panels = document.querySelectorAll('[data-cert-panel]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-cert-panel') !== tab.getAttribute('data-cert-tab');
      });
    });
  });

  /* --- проверка сертификата --- */
  var form = document.getElementById('cert-form');
  var input = document.getElementById('cert-no');
  var result = document.getElementById('cert-result');
  var msg = document.getElementById('cert-msg');

  if (form && input && result) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = input.value.trim().toUpperCase();
      if (!applyStudent(code)) {
        result.classList.remove('is-visible');
        msg.textContent = code
          ? 'Сертификат ' + code + ' не найден. Проверьте номер на бланке.'
          : 'Введите номер сертификата.';
        return;
      }
      var s = DB[code];
      msg.textContent = '';
      document.getElementById('res-name').textContent = s.name;
      document.getElementById('res-course').textContent = s.course;
      document.getElementById('res-dates').textContent = s.dates;
      document.getElementById('res-code').textContent = s.cert;
      result.classList.add('is-visible');
    });

    var fromUrl = new URLSearchParams(location.search).get('cert');
    if (fromUrl) {
      input.value = fromUrl.toUpperCase();
      form.dispatchEvent(new Event('submit'));
    }
  }

  /* --- демо-панель: переключение вида --- */
  var views = document.querySelectorAll('.crm-view');
  var navItems = document.querySelectorAll('.crm-nav-item');
  var crmTitle = document.getElementById('crm-title');
  var crmSub = document.getElementById('crm-sub');
  var lastListView = 'dashboard';

  function navFor(view) {
    return [].filter.call(navItems, function (i) {
      return i.getAttribute('data-crm-view') === view;
    })[0];
  }

  function showView(name, clicked) {
    var active = null;
    views.forEach(function (view) {
      var match = view.getAttribute('data-crm-panel') === name;
      view.hidden = !match;
      if (match) active = view;
    });
    navItems.forEach(function (i) { i.classList.remove('is-active'); });
    var navItem = clicked || navFor(name);
    if (navItem) navItem.classList.add('is-active');
    if (active && crmTitle && active.getAttribute('data-crm-title')) {
      crmTitle.textContent = active.getAttribute('data-crm-title');
      crmSub.textContent = active.getAttribute('data-crm-sub') || '';
    }
    if (name !== 'student') lastListView = name;
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = item.getAttribute('data-crm-view');
      if (target) showView(target, item);
    });
  });

  var backBtn = document.querySelector('.crm-back');
  if (backBtn) {
    backBtn.addEventListener('click', function () { showView(lastListView); });
  }

  document.querySelectorAll('[data-crm-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyStudent(btn.getAttribute('data-crm-open'));
      showView('student');
      document.querySelector('.crm-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* --- поиск и фильтры в списке обучающихся --- */
  var search = document.getElementById('crm-search');
  var byStatus = document.getElementById('crm-filter-status');
  var byCourse = document.getElementById('crm-filter-course');
  var table = document.getElementById('crm-students');

  if (table) {
    var rows = [].slice.call(table.querySelectorAll('tbody tr'));
    var counter = document.getElementById('crm-students-count');
    var empty = document.getElementById('crm-students-empty');

    function filterRows() {
      var query = (search.value || '').trim().toLowerCase();
      var status = byStatus.value;
      var course = byCourse.value;
      var shown = 0;
      rows.forEach(function (row) {
        var cert = row.querySelector('[data-crm-open]').getAttribute('data-crm-open');
        var student = DB[cert] || {};
        var hit = row.getAttribute('data-crm-row').indexOf(query) !== -1
          && (!status || student.status === status)
          && (!course || student.course === course);
        row.hidden = !hit;
        if (hit) shown++;
      });
      counter.textContent = shown;
      empty.hidden = shown !== 0;
    }

    [search, byStatus, byCourse].forEach(function (el) {
      el.addEventListener('input', filterRows);
      el.addEventListener('change', filterRows);
    });
  }

  /* --- переключатели в настройках --- */
  document.querySelectorAll('.crm-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* --- демо-действия --- */
  var toast = document.getElementById('crm-toast');
  var toastTimer;
  document.querySelectorAll('[data-crm-demo]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!toast) return;
      toast.textContent = 'Демо-режим: «' + btn.textContent.trim() + '» — действие появится в рабочей версии';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
    });
  });
})();
