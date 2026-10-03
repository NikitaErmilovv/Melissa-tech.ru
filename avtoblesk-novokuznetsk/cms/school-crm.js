(function () {
  const esc = (s) =>
    window.AvtoCmsAlbums ? window.AvtoCmsAlbums.escapeHtml(String(s ?? '')) : String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const attr = (s) =>
    window.AvtoCmsAlbums ? window.AvtoCmsAlbums.escapeAttr(String(s ?? '')) : esc(s).replace(/"/g, '&quot;');

  let store = { settings: {}, courses: [], users: [], students: [] };
  let tokenFn = () => '';
  let go = () => {};
  let openCert = '';
  let toastTimer;

  function toast(msg) {
    const el = document.getElementById('cms-school-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  async function persist() {
    const res = await window.AvtoCmsApi.saveTraining(store, tokenFn());
    if (!res || !res.ok) throw new Error('save');
  }

  async function saveQuiet() {
    try {
      await persist();
      toast('Сохранено');
    } catch (_) {
      toast('Не удалось сохранить. Войдите снова.');
    }
  }

  function initials(name) {
    return String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  function nextCert() {
    const prefix = store.settings.certPrefix || 'AB-2026-';
    let max = 0;
    store.students.forEach((s) => {
      const m = String(s.cert || '').match(/(\d+)$/);
      if (m) max = Math.max(max, +m[1]);
    });
    return prefix + String(max + 1).padStart(3, '0');
  }

  function studentByCert(cert) {
    return store.students.find((s) => s.cert === cert);
  }

  function courseCounts() {
    const map = {};
    store.students.forEach((s) => {
      map[s.course] = (map[s.course] || 0) + 1;
    });
    return map;
  }

  function issuedCount() {
    return store.students.filter((s) => s.status === 'ok').length;
  }

  function waitCount() {
    return store.students.filter((s) => s.status !== 'ok').length;
  }

  function monthBars() {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const counts = Array(12).fill(0);
    store.students.forEach((s) => {
      const m = String(s.issued || s.registered || '').match(/\.(\d{2})\.(\d{4})/);
      if (m) counts[+m[1] - 1] += 1;
    });
    const max = Math.max(1, ...counts);
    return months
      .map((label, i) => '<div><i style="height:' + Math.round((counts[i] / max) * 100) + '%"></i><small>' + label + '</small></div>')
      .join('');
  }

  function donutCss() {
    const map = courseCounts();
    const total = store.students.length || 1;
    const colors = ['#e10600', '#ff5a4a', '#9a1a14', '#5c0e0b', '#3a0908'];
    let acc = 0;
    const stops = Object.keys(map).map((name, i) => {
      const start = acc;
      acc += (map[name] / total) * 100;
      return colors[i % colors.length] + ' ' + start.toFixed(1) + '% ' + acc.toFixed(1) + '%';
    });
    return stops.length ? 'conic-gradient(' + stops.join(',') + ')' : 'conic-gradient(#333 0 100%)';
  }

  function legendHtml() {
    const map = courseCounts();
    const total = store.students.length || 1;
    return Object.keys(map)
      .map((name) => {
        const pct = Math.round((map[name] / total) * 100);
        return '<div><span>' + esc(name) + '</span><b>' + pct + '%</b></div>';
      })
      .join('');
  }

  function pillStatus(st) {
    return st === 'ok'
      ? '<span class="crm-pill">● Обучен</span>'
      : '<span class="crm-pill is-wait">● Ожидает</span>';
  }

  function courseStatus(st) {
    return st === 'active'
      ? '<span class="crm-pill">● Активен</span>'
      : '<span class="crm-pill is-wait">● Набор группы</span>';
  }

  function userStatus(st) {
    return st === 'active'
      ? '<span class="crm-pill">● Активен</span>'
      : '<span class="crm-pill is-wait">● Доступ ограничен</span>';
  }

  function studentRows(filter) {
    const q = (filter.query || '').toLowerCase();
    const st = filter.status || '';
    const course = filter.course || '';
    return store.students
      .filter((s) => {
        const hay = [s.name, s.course, s.cert, s.phone, s.email].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1 && (!st || s.status === st) && (!course || s.course === course);
      })
      .map(
        (s) =>
          '<tr>' +
          '<td>' +
          esc(s.name) +
          '</td><td>' +
          esc(s.course) +
          '</td><td>' +
          esc(s.dates) +
          '</td><td>' +
          pillStatus(s.status) +
          '</td><td>' +
          esc(s.cert) +
          '</td><td><button type="button" class="crm-link" data-open-student="' +
          attr(s.cert) +
          '">Смотреть</button></td></tr>'
      )
      .join('');
  }

  function bindOpen(root) {
    root.querySelectorAll('[data-open-student]').forEach((btn) => {
      btn.onclick = () => {
        openCert = btn.getAttribute('data-open-student');
        go('school-student');
      };
    });
  }

  function renderDashboard() {
    const root = document.getElementById('cms-school-dashboard');
    if (!root) return;
    const total = store.students.length;
    const activeCourses = store.courses.filter((c) => c.status === 'active').length;
    root.innerHTML =
      '<div class="crm-cards">' +
      '<div class="crm-card"><div class="crm-card-top">Всего обучающихся<span class="crm-card-ico">◫</span></div><b>' +
      total +
      '</b><small>в базе школы</small></div>' +
      '<div class="crm-card"><div class="crm-card-top">Активные курсы<span class="crm-card-ico">◷</span></div><b>' +
      activeCourses +
      '</b><small>из ' +
      store.courses.length +
      ' программ</small></div>' +
      '<div class="crm-card"><div class="crm-card-top">Выдано сертификатов<span class="crm-card-ico">✓</span></div><b>' +
      issuedCount() +
      '</b><small>статус «обучен»</small></div>' +
      '<div class="crm-card"><div class="crm-card-top">Ожидают обучения<span class="crm-card-ico">◔</span></div><b>' +
      waitCount() +
      '</b><small>в процессе</small></div></div>' +
      '<div class="crm-charts"><div class="crm-box"><h4>Динамика по датам выдачи</h4><div class="crm-months">' +
      monthBars() +
      '</div></div><div class="crm-box"><h4>Курсы по популярности</h4><div class="cms-school-donut-row"><div class="cms-school-donut" style="background:' +
      donutCss() +
      '"><div><b>' +
      total +
      '</b><span>чел.</span></div></div><div class="crm-legend">' +
      legendHtml() +
      '</div></div></div></div>' +
      '<div class="crm-box" style="margin-top:14px"><h4>Последние обучающиеся</h4><div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>ФИО</th><th>Курс</th><th>Даты</th><th>Статус</th><th>Сертификат</th><th></th></tr></thead><tbody>' +
      studentRows({ query: '', status: '', course: '' }) +
      '</tbody></table></div></div>';
    bindOpen(root);
  }

  function renderStudents() {
    const root = document.getElementById('cms-school-students');
    if (!root) return;
    const courses = [...new Set(store.students.map((s) => s.course).concat(store.courses.map((c) => c.name)))];
    root.innerHTML =
      '<div class="crm-box"><div class="crm-toolbar">' +
      '<input class="crm-input" type="search" id="sch-search" placeholder="Поиск по ФИО, курсу или номеру">' +
      '<select class="crm-select" id="sch-status"><option value="">Все статусы</option><option value="ok">Обучен</option><option value="wait">Ожидает</option></select>' +
      '<select class="crm-select" id="sch-course"><option value="">Все курсы</option>' +
      courses.map((c) => '<option value="' + attr(c) + '">' + esc(c) + '</option>').join('') +
      '</select>' +
      '<button type="button" class="crm-btn is-accent" id="sch-add-student">Добавить ученика</button>' +
      '</div><div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>ФИО</th><th>Курс</th><th>Даты</th><th>Статус</th><th>Сертификат</th><th></th></tr></thead><tbody id="sch-tbody"></tbody></table></div>' +
      '<p class="crm-empty" id="sch-empty" hidden>Ничего не найдено.</p>' +
      '<p class="crm-hint">Показано <b id="sch-count">0</b> из ' +
      store.students.length +
      ' записей</p></div>';

    const paint = () => {
      const filter = {
        query: document.getElementById('sch-search').value,
        status: document.getElementById('sch-status').value,
        course: document.getElementById('sch-course').value,
      };
      const html = studentRows(filter);
      document.getElementById('sch-tbody').innerHTML = html;
      const n = document.getElementById('sch-tbody').querySelectorAll('tr').length;
      document.getElementById('sch-count').textContent = n;
      const empty = document.getElementById('sch-empty');
      empty.textContent = store.students.length
        ? 'Ничего не найдено.'
        : 'Пока нет учеников. Нажмите «Добавить ученика».';
      empty.hidden = n !== 0;
      bindOpen(root);
    };
    ['sch-search', 'sch-status', 'sch-course'].forEach((id) => {
      document.getElementById(id).oninput = paint;
      document.getElementById(id).onchange = paint;
    });
    document.getElementById('sch-add-student').onclick = () => editStudent(null);
    paint();
  }

  function renderCerts() {
    const root = document.getElementById('cms-school-certs');
    if (!root) return;
    const issued = store.students.filter((s) => s.status === 'ok');
    root.innerHTML =
      '<div class="crm-box"><div class="crm-toolbar"><h4 style="margin:0">Выданные сертификаты</h4>' +
      '<a class="crm-btn" href="../training.html?cert=' +
      encodeURIComponent((issued[0] && issued[0].cert) || 'AB-2026-001') +
      '#verify" target="_blank" rel="noopener">Открыть проверку на сайте</a></div>' +
      (issued.length
        ? '<div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>Номер</th><th>ФИО</th><th>Курс</th><th>Выдан</th><th></th></tr></thead><tbody>' +
          issued
            .map(
              (s) =>
                '<tr><td>' +
                esc(s.cert) +
                '</td><td>' +
                esc(s.name) +
                '</td><td>' +
                esc(s.course) +
                '</td><td>' +
                esc(s.issued) +
                '</td><td><button type="button" class="crm-link" data-cert-view="' +
                attr(s.cert) +
                '">Просмотр</button> · <button type="button" class="crm-link" data-cert-pdf="' +
                attr(s.cert) +
                '">PDF</button> · <button type="button" class="crm-link" data-open-student="' +
                attr(s.cert) +
                '">Карточка</button></td></tr>'
            )
            .join('') +
          '</tbody></table></div>'
        : '<p class="cms-admin-note">Пока нет выданных сертификатов. Добавьте ученика со статусом «Обучен» или используйте демо-запись AB-2026-001 в базе.</p>') +
      '</div>';
    bindOpen(root);
    root.querySelectorAll('[data-cert-view]').forEach((btn) => {
      btn.onclick = () => {
        const s = studentByCert(btn.getAttribute('data-cert-view'));
        if (!s) return;
        modal(
          '<h3>Сертификат ' +
            esc(s.cert) +
            '</h3><div class="cms-cert-preview-box">' +
            certCardHtml(s) +
            '</div><div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="m-pdf">Скачать PDF</button><button type="button" class="crm-btn" id="m-close">Закрыть</button></div>'
        );
        document.getElementById('m-pdf').onclick = () => printCert(s);
        document.getElementById('m-close').onclick = closeModal;
      };
    });
    root.querySelectorAll('[data-cert-pdf]').forEach((btn) => {
      btn.onclick = () => {
        const s = studentByCert(btn.getAttribute('data-cert-pdf'));
        if (s) printCert(s);
      };
    });
  }

  function renderCourses() {
    const root = document.getElementById('cms-school-courses');
    if (!root) return;
    const counts = courseCounts();
    const active = store.courses.filter((c) => c.status === 'active').length;
    const popular = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    root.innerHTML =
      '<div class="crm-cards">' +
      '<div class="crm-card"><div class="crm-card-top">Активных программ</div><b>' +
      active +
      '</b><small>из ' +
      store.courses.length +
      '</small></div>' +
      '<div class="crm-card"><div class="crm-card-top">Учеников на курсах</div><b>' +
      store.students.length +
      '</b><small>в базе</small></div>' +
      '<div class="crm-card"><div class="crm-card-top">Самый популярный</div><b>' +
      (popular ? popular[1] : 0) +
      '</b><small>' +
      esc(popular ? popular[0] : '—') +
      '</small></div></div>' +
      '<div class="crm-box" style="margin-top:14px"><div class="crm-toolbar"><h4 style="margin:0">Каталог программ</h4>' +
      '<button type="button" class="crm-btn is-accent" id="sch-add-course">Добавить курс</button></div>' +
      '<div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>Название</th><th>Длительность</th><th>Стоимость</th><th>Учеников</th><th>Преподаватель</th><th>Статус</th><th></th></tr></thead><tbody>' +
      store.courses
        .map(
          (c) =>
            '<tr><td>' +
            esc(c.name) +
            '</td><td>' +
            esc(c.duration) +
            '</td><td>' +
            esc(c.price) +
            '</td><td>' +
            (counts[c.name] || 0) +
            '</td><td>' +
            esc(c.teacher) +
            '</td><td>' +
            courseStatus(c.status) +
            '</td><td><button type="button" class="crm-link" data-edit-course="' +
            attr(c.id) +
            '">Изменить</button></td></tr>'
        )
        .join('') +
      '</tbody></table></div></div>';
    document.getElementById('sch-add-course').onclick = () => editCourse(null);
    root.querySelectorAll('[data-edit-course]').forEach((btn) => {
      btn.onclick = () => editCourse(btn.getAttribute('data-edit-course'));
    });
  }

  function renderUsers() {
    const root = document.getElementById('cms-school-users');
    if (!root) return;
    root.innerHTML =
      '<div class="crm-box"><div class="crm-toolbar"><h4 style="margin:0">Команда школы</h4>' +
      '<button type="button" class="crm-btn is-accent" id="sch-add-user">Пригласить сотрудника</button></div>' +
      '<div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>ФИО</th><th>Роль</th><th>Email</th><th>Последний вход</th><th>Статус</th><th></th></tr></thead><tbody>' +
      store.users
        .map(
          (u) =>
            '<tr><td>' +
            esc(u.name) +
            '</td><td>' +
            esc(u.role) +
            '</td><td>' +
            esc(u.email) +
            '</td><td>' +
            esc(u.lastLogin) +
            '</td><td>' +
            userStatus(u.status) +
            '</td><td><button type="button" class="crm-link" data-edit-user="' +
            attr(u.id) +
            '">Права</button></td></tr>'
        )
        .join('') +
      '</tbody></table></div></div>' +
      '<div class="crm-grid" style="margin-top:14px"><div class="crm-box"><h4>Права по роли</h4><div class="crm-fields">' +
      '<div><span>Администратор</span><b>Полный доступ</b></div>' +
      '<div><span>Преподаватель</span><b>Ученики и зачёты</b></div>' +
      '<div><span>Менеджер</span><b>Заявки и расписание</b></div>' +
      '<div><span>Стажёр</span><b>Только просмотр</b></div></div></div></div>';
    document.getElementById('sch-add-user').onclick = () => editUser(null);
    root.querySelectorAll('[data-edit-user]').forEach((btn) => {
      btn.onclick = () => editUser(btn.getAttribute('data-edit-user'));
    });
  }

  function renderStats() {
    const root = document.getElementById('cms-school-stats');
    if (!root) return;
    const ok = issuedCount();
    const total = store.students.length || 1;
    root.innerHTML =
      '<div class="crm-charts"><div class="crm-box"><h4>Набор по месяцам</h4><div class="crm-months">' +
      monthBars() +
      '</div></div><div class="crm-box"><h4>Показатели</h4><div class="crm-kpi">' +
      '<div><span>Всего в базе</span><b>' +
      store.students.length +
      '</b></div>' +
      '<div><span>Доходимость до зачёта</span><b>' +
      Math.round((ok / total) * 100) +
      '%</b></div>' +
      '<div><span>Ожидают</span><b>' +
      waitCount() +
      '</b></div>' +
      '<div><span>Программ</span><b>' +
      store.courses.length +
      '</b></div></div></div></div>' +
      '<div class="crm-box" style="margin-top:14px"><div class="crm-toolbar"><h4 style="margin:0">Выгрузка</h4>' +
      '<button type="button" class="crm-btn is-accent" id="sch-export">Выгрузить в Excel (CSV)</button></div></div>';
    document.getElementById('sch-export').onclick = exportCsv;
  }

  function renderSettings() {
    const root = document.getElementById('cms-school-settings');
    if (!root) return;
    const s = store.settings;
    const teachers = [...new Set(store.users.filter((u) => u.role === 'Преподаватель').map((u) => u.name))];
    if (s.defaultTeacher && teachers.indexOf(s.defaultTeacher) < 0) teachers.unshift(s.defaultTeacher);
    const sw = (key, title, text) =>
      '<div class="crm-switch"><div><b>' +
      title +
      '</b><p>' +
      text +
      '</p></div><button type="button" data-sw="' +
      key +
      '" aria-pressed="' +
      (s[key] ? 'true' : 'false') +
      '"></button></div>';
    root.innerHTML =
      '<div class="crm-grid"><div class="crm-box"><h4>Общие данные</h4><div class="crm-form">' +
      field('Название школы', 'school', s.school) +
      field('Город', 'city', s.city) +
      field('Телефон', 'phone', s.phone) +
      field('Адрес студии', 'address', s.address) +
      field('Email для заявок', 'email', s.email) +
      '</div></div><div class="crm-box"><h4>Сертификаты</h4><div class="crm-form">' +
      field('Префикс номера', 'certPrefix', s.certPrefix) +
      '<label>Шаблон сертификата<select class="crm-select" data-set="template"><option value="dark"' +
      (s.template === 'dark' ? ' selected' : '') +
      '>Тёмный (фирменный)</option><option value="light"' +
      (s.template === 'light' ? ' selected' : '') +
      '>Светлый</option></select></label>' +
      '<label>Подпись на сертификате<select class="crm-select" data-set="defaultTeacher">' +
      teachers.map((t) => '<option' + (t === s.defaultTeacher ? ' selected' : '') + '>' + esc(t) + '</option>').join('') +
      '</select></label>' +
      '<label>Срок действия<select class="crm-select" data-set="certValidity"><option value="unlimited"' +
      (s.certValidity === 'unlimited' ? ' selected' : '') +
      '>Без ограничения</option><option value="3y"' +
      (s.certValidity === '3y' ? ' selected' : '') +
      '>3 года</option></select></label></div>' +
      '<div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="sch-save-set">Сохранить изменения</button>' +
      '<button type="button" class="crm-btn" id="sch-preview">Обновить предпросмотр</button>' +
      '<button type="button" class="crm-btn" id="sch-pdf-sample">Скачать PDF (печать)</button></div></div>' +
      '<div class="crm-box cms-cert-preview-box"><h4>Предпросмотр сертификата</h4><div id="sch-cert-preview"></div></div>' +
      '<div class="crm-box" style="grid-column:1/-1"><h4>Уведомления и доступы</h4>' +
      sw('notifyPublicVerify', 'Публичная проверка сертификатов', 'Страница проверки доступна клиентам на сайте') +
      sw('notifyAutoNumber', 'Автоматическая нумерация', 'Номер присваивается при выдаче сертификата') +
      sw('notifyEmail', 'Email при новой заявке', 'Письмо администратору (сохраняется как настройка)') +
      sw('notifySms', 'SMS ученику о начале курса', 'Напоминание за сутки до первого дня') +
      sw('notifyExam', 'Напоминание о зачётной работе', 'Уведомление преподавателю за день до аттестации') +
      '</div></div>';

    root.querySelectorAll('[data-set]').forEach((el) => {
      el.oninput = el.onchange = () => {
        store.settings[el.getAttribute('data-set')] = el.value;
        renderCertPreviewBox(document.getElementById('sch-cert-preview'));
      };
    });
    root.querySelectorAll('[data-sw]').forEach((btn) => {
      btn.onclick = () => {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        store.settings[btn.getAttribute('data-sw')] = on;
      };
    });
    document.getElementById('sch-save-set').onclick = saveQuiet;
    renderCertPreviewBox(document.getElementById('sch-cert-preview'));
    document.getElementById('sch-preview').onclick = () => {
      renderCertPreviewBox(document.getElementById('sch-cert-preview'));
      toast('Предпросмотр обновлён');
    };
    document.getElementById('sch-pdf-sample').onclick = () => printCert(sampleCertStudent());
  }

  function field(label, key, value) {
    return (
      '<label>' +
      label +
      '<input class="crm-input" type="text" data-set="' +
      key +
      '" value="' +
      attr(value || '') +
      '"></label>'
    );
  }

  function renderStudent() {
    const root = document.getElementById('cms-school-student');
    if (!root) return;
    const s = studentByCert(openCert) || store.students[0];
    if (!s) {
      root.innerHTML = '<p class="cms-admin-note">Выберите ученика в списке.</p>';
      return;
    }
    const done = s.status === 'ok';
    const city = store.settings.city || 'Новокузнецк';
    const school = store.settings.school || 'АвтоБлеск';
    root.innerHTML =
      '<button type="button" class="crm-back" id="sch-back">← Назад</button>' +
      '<div class="crm-student-head"><h3>Карточка обучающегося</h3>' +
      '<button type="button" class="crm-btn" id="sch-edit">Редактировать</button></div>' +
      '<div class="crm-grid"><div class="crm-box"><div class="crm-profile-top"><div class="crm-avatar">' +
      esc(initials(s.name)) +
      '</div><div><h4>' +
      esc(s.name) +
      '</h4><div class="crm-badges"><span class="crm-badge ' +
      (done ? 'is-ok' : 'is-accent') +
      '">' +
      (done ? '● Обучен' : '● Ожидает обучения') +
      '</span>' +
      (done ? '<span class="crm-badge is-accent">Сертификат выдан</span>' : '') +
      '</div></div></div><div class="crm-fields">' +
      '<div><span>Телефон</span><b>' +
      esc(s.phone) +
      '</b></div><div><span>Email</span><b>' +
      esc(s.email) +
      '</b></div><div><span>Даты обучения</span><b>' +
      esc(s.dates) +
      '</b></div><div><span>Курс</span><b>' +
      esc(s.course) +
      '</b></div><div><span>Группа</span><b>' +
      esc(s.group) +
      '</b></div><div><span>Преподаватель</span><b>' +
      esc(s.teacher) +
      '</b></div></div></div>' +
      '<div class="crm-box"><h4>Сертификат</h4><div class="cert-card"><div class="cert-card-top"><div class="cert-card-brand"><span>АВТО</span>БЛЕСК<small>ДЕТЕЙЛИНГ</small></div><div class="cert-card-seal">ПРЕМИЯ<br>2ГИС</div></div><h3>СЕРТИФИКАТ</h3><div class="cert-card-name">' +
      esc(s.name) +
      '</div><div class="cert-card-rows"><div>Курс · <b>' +
      esc(s.course) +
      '</b></div><div>Номер · <b>' +
      esc(s.cert) +
      '</b></div><div>Выдал · <b>' +
      esc(school) +
      ', ' +
      esc(city) +
      '</b></div></div><div class="cert-card-foot"><div class="cert-card-sign">Подпись: ' +
      esc(s.teacher || store.settings.defaultTeacher || '') +
      '</div><div class="cert-qr"></div></div></div>' +
      '<div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="sch-pdf">Скачать / печать</button>' +
      '<a class="crm-btn" href="../training.html?cert=' +
      encodeURIComponent(s.cert) +
      '#verify" target="_blank" rel="noopener">Проверить в базе</a></div></div>' +
      '<div class="crm-box"><h4>История обучения</h4><ul class="crm-steps">' +
      '<li><span><i>✓</i>Регистрация на курс</span><time>' +
      esc(s.registered || '—') +
      '</time></li>' +
      '<li><span><i>✓</i>Прохождение обучения</span><time>' +
      esc(s.dates) +
      '</time></li>' +
      '<li><span><i>✓</i>Сдача итогового теста</span><time>' +
      esc(s.issued) +
      '</time></li>' +
      '<li><span><i>✓</i>Выдача сертификата</span><time>' +
      esc(s.issued) +
      '</time></li></ul></div>' +
      '<div class="crm-box crm-notes"><h4>Примечания</h4><div>' +
      (s.notes || []).map((n) => '<p>' + esc(n) + '</p>').join('') +
      '</div><footer><b>' +
      esc(s.teacher) +
      '</b>Преподаватель</footer>' +
      '<button type="button" class="crm-link" id="sch-del" style="margin-top:12px">Удалить ученика</button></div></div>';
    document.getElementById('sch-back').onclick = () => go('school-students');
    document.getElementById('sch-edit').onclick = () => editStudent(s.cert);
    document.getElementById('sch-pdf').onclick = () => printCert(s);
    document.getElementById('sch-del').onclick = async () => {
      if (!confirm('Удалить ' + s.name + '?')) return;
      store.students = store.students.filter((x) => x.cert !== s.cert);
      await saveQuiet();
      go('school-students');
    };
  }

  function modal(html) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'cms-modal-wrap';
    wrap.id = 'cms-modal';
    wrap.innerHTML = '<div class="cms-modal">' + html + '</div>';
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) closeModal();
    });
    document.body.appendChild(wrap);
    return wrap;
  }

  function closeModal() {
    const el = document.getElementById('cms-modal');
    if (el) el.remove();
  }

  function inp(id, label, value) {
    return '<label>' + label + '<input class="crm-input" id="' + id + '" value="' + attr(value || '') + '"></label>';
  }

  function editStudent(cert) {
    const s = cert ? studentByCert(cert) : null;
    const isNew = !s;
    const courseOpts = store.courses
      .map((c) => '<option' + (s && s.course === c.name ? ' selected' : '') + '>' + esc(c.name) + '</option>')
      .join('');
    const teacherOpts = [...new Set(store.users.map((u) => u.name).concat(store.courses.map((c) => c.teacher)))]
      .filter(Boolean)
      .map((t) => '<option' + (s && s.teacher === t ? ' selected' : '') + '>' + esc(t) + '</option>')
      .join('');
    modal(
      '<h3>' +
        (isNew ? 'Новый ученик' : 'Редактировать') +
        '</h3><div class="crm-form">' +
        inp('m-name', 'ФИО', s && s.name) +
        '<label>Курс<select class="crm-select" id="m-course">' +
        courseOpts +
        '</select></label>' +
        inp('m-dates', 'Даты обучения', s && s.dates) +
        inp('m-issued', 'Дата выдачи', s && s.issued) +
        inp('m-reg', 'Регистрация', s && s.registered) +
        inp('m-phone', 'Телефон', s && s.phone) +
        inp('m-email', 'Email', s && s.email) +
        inp('m-group', 'Группа', s && s.group) +
        '<label>Преподаватель<select class="crm-select" id="m-teacher">' +
        teacherOpts +
        '</select></label>' +
        '<label>Статус<select class="crm-select" id="m-status"><option value="ok"' +
        (s && s.status === 'ok' ? ' selected' : '') +
        '>Обучен</option><option value="wait"' +
        (!s || s.status !== 'ok' ? ' selected' : '') +
        '>Ожидает</option></select></label>' +
        '<label>Примечания (каждое с новой строки)<textarea class="crm-input" id="m-notes" rows="3">' +
        esc((s && s.notes ? s.notes : []).join('\n')) +
        '</textarea></label>' +
        (!isNew ? inp('m-cert', 'Номер сертификата', s.cert) : '<p class="cms-admin-note">Номер: ' + esc(nextCert()) + '</p>') +
        '</div><div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="m-ok">Сохранить</button>' +
        '<button type="button" class="crm-btn" id="m-cancel">Отмена</button></div>'
    );
    document.getElementById('m-cancel').onclick = closeModal;
    document.getElementById('m-ok').onclick = async () => {
      const notes = document
        .getElementById('m-notes')
        .value.split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      if (isNew) {
        const item = {
          cert: store.settings.notifyAutoNumber !== false ? nextCert() : nextCert(),
          name: document.getElementById('m-name').value.trim() || 'Без имени',
          course: document.getElementById('m-course').value,
          dates: document.getElementById('m-dates').value.trim(),
          issued: document.getElementById('m-issued').value.trim() || '—',
          registered: document.getElementById('m-reg').value.trim(),
          phone: document.getElementById('m-phone').value.trim(),
          email: document.getElementById('m-email').value.trim(),
          group: document.getElementById('m-group').value.trim(),
          teacher: document.getElementById('m-teacher').value,
          status: document.getElementById('m-status').value,
          notes,
        };
        store.students.unshift(item);
        openCert = item.cert;
      } else {
        s.name = document.getElementById('m-name').value.trim();
        s.course = document.getElementById('m-course').value;
        s.dates = document.getElementById('m-dates').value.trim();
        s.issued = document.getElementById('m-issued').value.trim();
        s.registered = document.getElementById('m-reg').value.trim();
        s.phone = document.getElementById('m-phone').value.trim();
        s.email = document.getElementById('m-email').value.trim();
        s.group = document.getElementById('m-group').value.trim();
        s.teacher = document.getElementById('m-teacher').value;
        s.status = document.getElementById('m-status').value;
        s.notes = notes;
        const nc = document.getElementById('m-cert').value.trim().toUpperCase();
        if (nc) s.cert = nc;
        openCert = s.cert;
      }
      closeModal();
      await saveQuiet();
      go(isNew ? 'school-student' : 'school-student');
    };
  }

  function editCourse(id) {
    const c = id ? store.courses.find((x) => x.id === id) : null;
    modal(
      '<h3>' +
        (c ? 'Изменить курс' : 'Новый курс') +
        '</h3><div class="crm-form">' +
        inp('m-name', 'Название', c && c.name) +
        inp('m-dur', 'Длительность', c && c.duration) +
        inp('m-price', 'Стоимость', c && c.price) +
        inp('m-teacher', 'Преподаватель', c && c.teacher) +
        '<label>Статус<select class="crm-select" id="m-st"><option value="active"' +
        (!c || c.status === 'active' ? ' selected' : '') +
        '>Активен</option><option value="wait"' +
        (c && c.status === 'wait' ? ' selected' : '') +
        '>Набор группы</option></select></label></div>' +
        '<div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="m-ok">Сохранить</button>' +
        (c ? '<button type="button" class="crm-link" id="m-del">Удалить</button>' : '') +
        '<button type="button" class="crm-btn" id="m-cancel">Отмена</button></div>'
    );
    document.getElementById('m-cancel').onclick = closeModal;
    document.getElementById('m-ok').onclick = async () => {
      if (c) {
        c.name = document.getElementById('m-name').value.trim();
        c.duration = document.getElementById('m-dur').value.trim();
        c.price = document.getElementById('m-price').value.trim();
        c.teacher = document.getElementById('m-teacher').value.trim();
        c.status = document.getElementById('m-st').value;
      } else {
        store.courses.push({
          id: 'c' + Date.now(),
          name: document.getElementById('m-name').value.trim() || 'Новый курс',
          duration: document.getElementById('m-dur').value.trim() || '2 дня',
          price: document.getElementById('m-price').value.trim() || 'по запросу',
          teacher: document.getElementById('m-teacher').value.trim(),
          status: document.getElementById('m-st').value,
        });
      }
      closeModal();
      await saveQuiet();
      renderCourses();
    };
    const del = document.getElementById('m-del');
    if (del) {
      del.onclick = async () => {
        if (!confirm('Удалить курс?')) return;
        store.courses = store.courses.filter((x) => x.id !== c.id);
        closeModal();
        await saveQuiet();
        renderCourses();
      };
    }
  }

  function editUser(id) {
    const u = id ? store.users.find((x) => x.id === id) : null;
    modal(
      '<h3>' +
        (u ? 'Права сотрудника' : 'Новый сотрудник') +
        '</h3><div class="crm-form">' +
        inp('m-name', 'ФИО', u && u.name) +
        '<label>Роль<select class="crm-select" id="m-role">' +
        ['Администратор', 'Преподаватель', 'Менеджер', 'Стажёр']
          .map((r) => '<option' + (u && u.role === r ? ' selected' : '') + '>' + r + '</option>')
          .join('') +
        '</select></label>' +
        inp('m-email', 'Email', u && u.email) +
        '<label>Статус<select class="crm-select" id="m-st"><option value="active"' +
        (!u || u.status === 'active' ? ' selected' : '') +
        '>Активен</option><option value="limited"' +
        (u && u.status === 'limited' ? ' selected' : '') +
        '>Доступ ограничен</option></select></label></div>' +
        '<div class="crm-cert-actions"><button type="button" class="crm-btn is-accent" id="m-ok">Сохранить</button>' +
        (u ? '<button type="button" class="crm-link" id="m-del">Удалить</button>' : '') +
        '<button type="button" class="crm-btn" id="m-cancel">Отмена</button></div>'
    );
    document.getElementById('m-cancel').onclick = closeModal;
    document.getElementById('m-ok').onclick = async () => {
      if (u) {
        u.name = document.getElementById('m-name').value.trim();
        u.role = document.getElementById('m-role').value;
        u.email = document.getElementById('m-email').value.trim();
        u.status = document.getElementById('m-st').value;
      } else {
        store.users.push({
          id: 'u' + Date.now(),
          name: document.getElementById('m-name').value.trim() || 'Сотрудник',
          role: document.getElementById('m-role').value,
          email: document.getElementById('m-email').value.trim(),
          lastLogin: 'ещё не входил',
          status: document.getElementById('m-st').value,
        });
      }
      closeModal();
      await saveQuiet();
      renderUsers();
    };
    const del = document.getElementById('m-del');
    if (del) {
      del.onclick = async () => {
        if (!confirm('Удалить сотрудника?')) return;
        store.users = store.users.filter((x) => x.id !== u.id);
        closeModal();
        await saveQuiet();
        renderUsers();
      };
    }
  }

  function sampleCertStudent() {
    const issued = store.students.find((s) => s.status === 'ok');
    if (issued) return issued;
    return {
      cert: store.settings.certPrefix ? store.settings.certPrefix + '001' : 'AB-2026-001',
      name: 'Алексей Смирнов',
      course: (store.courses[0] && store.courses[0].name) || 'Ремонт сколов и трещин',
      dates: '02.09.2026 — 04.09.2026',
      issued: '04.09.2026',
      teacher: store.settings.defaultTeacher || 'Преподаватель',
      status: 'ok',
    };
  }

  function certCardHtml(s) {
    const school = store.settings.school || 'АвтоБлеск';
    const city = store.settings.city || 'Новокузнецк';
    const teacher = s.teacher || store.settings.defaultTeacher || '';
    const tpl = store.settings.template === 'light' ? ' cert-card--light' : '';
    return (
      '<div class="cert-card' +
      tpl +
      '"><div class="cert-card-top"><div class="cert-card-brand"><span>АВТО</span>БЛЕСК<small>ДЕТЕЙЛИНГ</small></div><div class="cert-card-seal">ПРЕМИЯ<br>2ГИС</div></div><h3>СЕРТИФИКАТ</h3><div class="cert-card-name">' +
      esc(s.name) +
      '</div><div class="cert-card-rows"><div>Курс · <b>' +
      esc(s.course) +
      '</b></div><div>Номер · <b>' +
      esc(s.cert) +
      '</b></div><div>Выдал · <b>' +
      esc(school) +
      ', ' +
      esc(city) +
      '</b></div><div>Даты · <b>' +
      esc(s.dates) +
      '</b></div></div><div class="cert-card-foot"><div class="cert-card-sign">Подпись: ' +
      esc(teacher) +
      '</div><div class="cert-qr" aria-hidden="true"></div></div></div>'
    );
  }

  function openCertDocument(s, action) {
    const base = new URL('../', location.href).href;
    const w = window.open('', '_blank', 'width=820,height=920');
    if (!w) {
      toast('Разрешите всплывающие окна');
      return;
    }
    w.document.write(
      '<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>' +
        attr(s.cert) +
        '</title><link rel="stylesheet" href="' +
        base +
        'styles.css?v=cert1"><style>body{margin:0;padding:32px;background:#0a0a0a;display:grid;place-items:center;min-height:100vh}.cert-card{max-width:520px;width:100%}@media print{body{background:#fff;padding:0}.cert-card{max-width:none}}</style></head><body>' +
        certCardHtml(s) +
        '</body></html>'
    );
    w.document.close();
    w.onload = () => {
      if (action === 'print' || action === 'pdf') w.print();
    };
  }

  function renderCertPreviewBox(container) {
    if (!container) return;
    container.innerHTML = certCardHtml(sampleCertStudent());
  }

  function printCert(s) {
    openCertDocument(s, 'pdf');
  }

  function exportCsv() {
    const rows = [['Сертификат', 'ФИО', 'Курс', 'Даты', 'Выдан', 'Статус', 'Телефон', 'Email', 'Группа', 'Преподаватель']];
    store.students.forEach((s) => {
      rows.push([s.cert, s.name, s.course, s.dates, s.issued, s.status === 'ok' ? 'Обучен' : 'Ожидает', s.phone, s.email, s.group, s.teacher]);
    });
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => '"' + String(c || '').replace(/"/g, '""') + '"').join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'avtoblesk-students.csv';
    a.click();
    toast('Файл CSV скачан');
  }

  window.AvtoSchoolCrm = {
    async load() {
      const res = await fetch(window.AvtoCmsApi.trainingUrl());
      store = res.ok ? await res.json() : store;
      store.students = store.students || [];
      store.courses = store.courses || [];
      store.users = store.users || [];
      store.settings = store.settings || {};
    },
    bind(opts) {
      tokenFn = opts.token;
      go = opts.go;
    },
    render(view) {
      if (view === 'school') renderDashboard();
      if (view === 'school-students') renderStudents();
      if (view === 'school-certs') renderCerts();
      if (view === 'school-courses') renderCourses();
      if (view === 'school-users') renderUsers();
      if (view === 'school-stats') renderStats();
      if (view === 'school-settings') renderSettings();
      if (view === 'school-student') renderStudent();
    },
  };
})();
