(function () {
  const TOKEN_KEY = 'avtoblesk_cms_token';
  const PAGE = document.body.dataset.cmsPage || (location.pathname.split('/').pop() || 'index.html');
  let hiddenBlocks = [];

  function isExcluded(el) {
    return !!(
      el.closest('.site-nav') ||
      el.closest('#wrap-cfg') ||
      el.closest('[data-cms-skip]') ||
      el.closest('script') ||
      el.closest('template') ||
      el.id === 'stat-rating' ||
      el.closest('#zones') ||
      el.closest('#swatches') ||
      el.closest('#parts') ||
      el.closest('.tools') ||
      el.closest('.finish') ||
      el.closest('.zones') ||
      el.closest('.address-map-frame') ||
      el.classList?.contains('address-map-img')
    );
  }

  function isLockedFrame(el) {
    return !!(
      el.classList.contains('hero') ||
      el.classList.contains('subpage-hero') ||
      el.hasAttribute('data-cms-lock')
    );
  }

  function hideableBlocks() {
    return Array.from(document.querySelectorAll('section, .stats')).filter((el) => {
      if (isLockedFrame(el)) return false;
      if (el.closest('.site-nav, footer, .cms-bar, .cms-modal-wrap')) return false;
      const parentBlock = el.parentElement && el.parentElement.closest('section');
      if (parentBlock && parentBlock !== el) return false;
      return true;
    });
  }

  function blockKey(el, index) {
    return el.id || el.getAttribute('data-cms-block') || 'block-' + (index + 1);
  }

  function applyHiddenBlocks() {
    hideableBlocks().forEach((el, i) => {
      const key = blockKey(el, i);
      el.setAttribute('data-cms-block', key);
      el.classList.toggle('cms-block-off', hiddenBlocks.indexOf(key) !== -1);
    });
  }

  function toggleBlock(key) {
    const i = hiddenBlocks.indexOf(key);
    if (i >= 0) hiddenBlocks.splice(i, 1);
    else hiddenBlocks.push(key);
    applyHiddenBlocks();
    attachBlockToggles();
  }

  function attachBlockToggles() {
    if (!document.body.classList.contains('cms-editing')) return;
    hideableBlocks().forEach((el, i) => {
      const key = blockKey(el, i);
      let btn = el.querySelector(':scope > .cms-hide-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cms-hide-btn';
        el.insertBefore(btn, el.firstChild);
      }
      const off = hiddenBlocks.indexOf(key) !== -1;
      btn.textContent = off ? 'Показать блок' : 'Скрыть блок';
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBlock(key);
      };
    });
  }

  function sectionId(el) {
    const album = el.closest('[data-cms-album]');
    if (album) {
      const albums = document.querySelectorAll('[data-cms-album]');
      const idx = Array.prototype.indexOf.call(albums, album);
      return 'album_' + (idx + 1);
    }
    const sec = el.closest('section[id]');
    if (sec) return sec.id;
    if (el.closest('.stats')) return 'stats';
    if (el.closest('.site-footer')) return 'footer';
    if (el.closest('.site-bottom')) return 'site-bottom';
    if (el.closest('.hero')) return 'hero';
    return 'main';
  }

  function roleOf(el) {
    const cls = el.className && typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : '';
    return (el.tagName.toLowerCase() + (cls ? '.' + cls : '')).replace(/\./g, '_');
  }

  function bgUrl(el) {
    const inline = el.style.backgroundImage;
    if (inline && inline !== 'none') {
      const m = inline.match(/url\(["']?([^"')]+)/);
      if (m) return m[1];
    }
    const comp = getComputedStyle(el).backgroundImage;
    if (comp && comp !== 'none') {
      const m = comp.match(/url\(["']?([^"')]+)/);
      if (m) return m[1];
    }
    return '';
  }

  function bgPosition(el) {
    const pos = el.style.backgroundPosition || getComputedStyle(el).backgroundPosition || '50% 50%';
    const parts = pos.split(/\s+/);
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1] != null ? parts[1] : parts[0]) || 50;
    return { x, y };
  }

  function parseBgStored(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'string') return { url: value, posX: 50, posY: 50 };
    return {
      url: value.url || '',
      posX: value.posX != null ? value.posX : 50,
      posY: value.posY != null ? value.posY : 50,
    };
  }

  function setBg(el, value) {
    const data = parseBgStored(value);
    if (!data || !data.url) return;
    el.style.backgroundImage = "url('" + data.url.replace(/'/g, "\\'") + "')";
    el.style.backgroundSize = el.style.backgroundSize || 'cover';
    el.style.backgroundPosition = data.posX + '% ' + data.posY + '%';
    el.classList.toggle('is-has-photo', true);
    if (el.classList.contains('founder-visual')) {
      const ph = el.querySelector('.founder-visual-placeholder');
      if (ph) ph.style.display = 'none';
    }
  }

  function assignKeys() {
    const counters = {};
    const mark = (el) => {
      if (!el || el.dataset.cmsKey) return;
      if (isExcluded(el)) return;
      const sec = sectionId(el);
      const role = roleOf(el);
      const bucket = sec + '::' + role;
      counters[bucket] = (counters[bucket] || 0) + 1;
      el.dataset.cmsKey = PAGE + '::' + bucket + '::' + counters[bucket];
    };

    document.querySelectorAll(
      '.eyebrow,.kicker,.intro,.tag,.cost,.quote,.founder-lead,.cms-album-desc,.contact-note,.address-map-text,.address-map-muted,.address-map-muted-sm,.address-map-detail-label,.address-map-btn,.founder-visual-caption,.stars,p,h1,h2,h3,h4,figcaption,small,summary,.service-row p,.service-row h3,.step h3,.step p,.card-body h3,.card-body p,.review p,.review small,.footer-hours-block span,.footer-bottom span,.subpage-hero p,.details p'
    ).forEach(mark);

    document.querySelectorAll('a.button, a.address-map-phone, .footer-phone-inline, .footer-logo, .address-map-brand').forEach((el) => {
      if (isExcluded(el)) return;
      mark(el);
    });

    document.querySelectorAll('img').forEach((img) => {
      if (isExcluded(img)) return;
      if (!img.dataset.cmsImg) {
        const sec = sectionId(img);
        counters['img_' + sec] = (counters['img_' + sec] || 0) + 1;
        img.dataset.cmsImg = PAGE + '::img_' + sec + '::' + counters['img_' + sec];
      }
    });

    const bgTargets = '.photo, .heroimg, .card-media, .founder-visual, [data-cms-bg]';
    document.querySelectorAll(bgTargets).forEach((el) => {
      if (isExcluded(el)) return;
      if (el.dataset.cmsBg) return;
      const sec = sectionId(el);
      counters['bg_' + sec] = (counters['bg_' + sec] || 0) + 1;
      el.dataset.cmsBg = PAGE + '::bg_' + sec + '::' + counters['bg_' + sec];
    });
  }

  function sanitizeHtml(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') return '<br>';
      if (tag === 'span' && node.classList.contains('accent')) {
        return '<span class="accent">' + Array.from(node.childNodes).map(walk).join('') + '</span>';
      }
      return Array.from(node.childNodes).map(walk).join('');
    };
    return Array.from(tpl.content.childNodes).map(walk).join('');
  }

  function applyField(key, value, kind) {
    if (kind === 'text') {
      const el = document.querySelector('[data-cms-key="' + key + '"]');
      if (!el) return;
      if (value.includes('<')) el.innerHTML = sanitizeHtml(value);
      else el.textContent = value;
      return;
    }
    if (kind === 'img') {
      const el = document.querySelector('[data-cms-img="' + key + '"]');
      if (!el) return;
      if (value.src) el.src = value.src;
      if (value.alt != null) el.alt = value.alt;
      return;
    }
    if (kind === 'bg') {
      const el = document.querySelector('[data-cms-bg="' + key + '"]');
      if (!el) return;
      setBg(el, value);
    }
  }

  function albumsRoot() {
    return document.querySelector('[data-cms-albums="portfolio"]');
  }

  function collectAlbums() {
    const A = window.AvtoCmsAlbums;
    if (!A) return null;
    return A.collectAlbums(albumsRoot());
  }

  function renderAlbums(albums) {
    const A = window.AvtoCmsAlbums;
    const root = albumsRoot();
    if (!A || !root || !albums || !albums.length) return;
    A.renderAlbumsRoot(root, albums);
  }

  function collectServices() {
    const root = document.querySelector('[data-cms-list="services"]');
    if (!root) return null;
    return Array.from(root.querySelectorAll('.service-row')).map((row) => ({
      title: row.querySelector('h3')?.textContent.trim() || '',
      text: row.querySelector('p')?.textContent.trim() || '',
      cost: row.querySelector('.cost')?.textContent.trim() || '',
    }));
  }

  function renderServices(items) {
    const root = document.querySelector('[data-cms-list="services"]');
    if (!root || !items || !items.length) return;
    root.innerHTML = items
      .map((it, i) => {
        const n = String(i + 1).padStart(2, '0');
        return (
          '<div class="service-row">' +
          '<div class="idx">' + n + '</div>' +
          '<div><h3>' + escapeHtml(it.title) + '</h3><p>' + escapeHtml(it.text) + '</p></div>' +
          '<div class="cost">' + escapeHtml(it.cost) + '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadContent() {
    assignKeys();
    try {
      const url = window.AvtoCmsApi ? window.AvtoCmsApi.contentJsonUrl() : '/cms/content.json?_=' + Date.now();
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const page = data[PAGE];
      if (!page) return;
      const A = window.AvtoCmsAlbums;
      if (page.lists?.albums) renderAlbums(page.lists.albums);
      else if (page.lists?.portfolio && A) renderAlbums(A.migratePortfolio(page.lists.portfolio));
      if (page.lists?.services) renderServices(page.lists.services);
      hiddenBlocks = Array.isArray(page.hiddenBlocks) ? page.hiddenBlocks.slice() : [];
      assignKeys();
      applyHiddenBlocks();
      Object.entries(page.text || {}).forEach(([k, v]) => applyField(k, v, 'text'));
      Object.entries(page.images || {}).forEach(([k, v]) => applyField(k, v, 'img'));
      Object.entries(page.backgrounds || {}).forEach(([k, v]) => applyField(k, v, 'bg'));
    } catch (_) {}
  }

  function collectPagePayload() {
    assignKeys();
    const text = {};
    document.querySelectorAll('[data-cms-key]').forEach((el) => {
      if (isExcluded(el)) return;
      const html = el.innerHTML.trim();
      text[el.dataset.cmsKey] = html.includes('<') ? sanitizeHtml(html) : el.textContent.trim();
    });
    const images = {};
    document.querySelectorAll('[data-cms-img]').forEach((el) => {
      if (isExcluded(el)) return;
      images[el.dataset.cmsImg] = { src: el.getAttribute('src') || '', alt: el.alt || '' };
    });
    document.querySelectorAll('[data-cms-bg]').forEach((el) => {
      if (isExcluded(el)) return;
      const url = bgUrl(el);
      if (url) el.classList.add('is-has-photo');
    });
    const backgrounds = {};
    document.querySelectorAll('[data-cms-bg]').forEach((el) => {
      if (isExcluded(el)) return;
      const url = bgUrl(el);
      if (!url) return;
      const pos = bgPosition(el);
      backgrounds[el.dataset.cmsBg] = { url, posX: pos.x, posY: pos.y };
    });
    const lists = {};
    const albums = collectAlbums();
    if (albums) lists.albums = albums;
    const services = collectServices();
    if (services) lists.services = services;
    return { page: PAGE, text, images, backgrounds, lists, hiddenBlocks: hiddenBlocks.slice() };
  }

  function token() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  async function saveAll() {
    const payload = collectPagePayload();
    const api = window.AvtoCmsApi;
    const res = api
      ? await api.save(payload, token())
      : await fetch('/api/cms/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      alert('Не удалось сохранить. Войдите снова через cms/admin-panel.html');
      return;
    }
    alert('Сохранено.');
  }

  async function uploadImage(file, targetEl, kind) {
    const fd = new FormData();
    fd.append('file', file);
    const api = window.AvtoCmsApi;
    const res = api
      ? await api.upload(file, token())
      : await fetch('/api/cms/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token() },
          body: fd,
        });
    if (!res.ok) {
      alert('Ошибка загрузки файла');
      return null;
    }
    const data = await res.json();
    if (kind === 'img') {
      targetEl.src = data.url;
      const link = targetEl.closest('a.g--media');
      if (link) link.setAttribute('href', data.url);
    } else {
      setBg(targetEl, { url: data.url, posX: bgPosition(targetEl).x, posY: bgPosition(targetEl).y });
    }
    return data.url;
  }

  function pickImage(targetEl, kind) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files[0]) uploadImage(input.files[0], targetEl, kind);
    };
    input.click();
  }

  let activeBgEl = null;
  let bgDrag = null;

  function selectBgEl(el) {
    if (activeBgEl && activeBgEl !== el) activeBgEl.classList.remove('cms-bg-active');
    activeBgEl = el;
    if (el) el.classList.add('cms-bg-active');
  }

  function bindBgClick(el) {
    el.addEventListener('click', (e) => {
      if (!document.body.classList.contains('cms-editing')) return;
      e.preventDefault();
      e.stopPropagation();
      if (activeBgEl !== el) {
        selectBgEl(el);
        return;
      }
      pickImage(el, 'bg');
    });
    el.addEventListener('dblclick', (e) => {
      if (!document.body.classList.contains('cms-editing')) return;
      e.preventDefault();
      e.stopPropagation();
      pickImage(el, 'bg');
    });
    el.addEventListener('pointerdown', (e) => {
      if (!document.body.classList.contains('cms-editing')) return;
      if (!bgUrl(el)) return;
      selectBgEl(el);
      bgDrag = {
        el,
        startX: e.clientX,
        startY: e.clientY,
        pos: bgPosition(el),
      };
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      if (!bgDrag || bgDrag.el !== el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = ((e.clientX - bgDrag.startX) / rect.width) * 100;
      const dy = ((e.clientY - bgDrag.startY) / rect.height) * 100;
      const nx = Math.min(100, Math.max(0, bgDrag.pos.x - dx));
      const ny = Math.min(100, Math.max(0, bgDrag.pos.y - dy));
      el.style.backgroundPosition = nx + '% ' + ny + '%';
    });
    const endDrag = (e) => {
      if (!bgDrag || bgDrag.el !== el) return;
      bgDrag = null;
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  function bindImgClick(el) {
    el.addEventListener('click', (e) => {
      if (!document.body.classList.contains('cms-editing')) return;
      e.preventDefault();
      e.stopPropagation();
      pickImage(el, 'img');
    });
  }

  function addPhotoToAlbum(albumSection) {
    const A = window.AvtoCmsAlbums;
    const grid = albumSection.querySelector('.gallery--portfolio');
    if (!grid || !A) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = A.mediaItemHtml({ type: 'image', url: 'img/works/portfolio/gallery-01.jpg' });
    const el = wrap.firstElementChild;
    grid.appendChild(el);
    assignKeys();
    const img = el.querySelector('img');
    if (img) {
      bindImgClick(img);
      attachMediaRemove(el);
      pickImage(img, 'img');
    }
  }

  function addAlbumSection() {
    const A = window.AvtoCmsAlbums;
    const root = albumsRoot();
    if (!root || !A) return;
    const n = root.querySelectorAll('[data-cms-album]').length + 1;
    const wrap = document.createElement('div');
    wrap.innerHTML = A.albumSectionHtml(
      { kicker: String(n).padStart(2, '0'), title: 'Новый альбом', description: 'Краткое описание блока', items: [] },
      n - 1
    );
    const sec = wrap.firstElementChild;
    root.appendChild(sec);
    attachAlbumChrome(sec);
    enableTextEditOn(sec);
    sec.querySelector('.cms-album-title')?.focus();
  }

  function attachMediaRemove(el) {
    if (el.querySelector('.cms-remove-item')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cms-remove-item';
    btn.textContent = '×';
    btn.title = 'Удалить фото';
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm('Удалить это фото?')) el.remove();
    };
    el.appendChild(btn);
  }

  function attachAlbumChrome(albumSection) {
    if (albumSection.querySelector('.cms-album-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'cms-album-tools';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'cms-add-album-photo';
    addBtn.textContent = '+ фото в альбом';
    addBtn.onclick = () => addPhotoToAlbum(albumSection);
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'cms-remove-album';
    delBtn.textContent = 'Удалить альбом';
    delBtn.onclick = () => {
      if (confirm('Удалить весь альбом?')) albumSection.remove();
    };
    tools.append(addBtn, delBtn);
    albumSection.querySelector('.section-head')?.appendChild(tools);
    albumSection.querySelectorAll('.g--media, .g--video').forEach(attachMediaRemove);
    albumSection.querySelectorAll('.g--media img').forEach((img) => bindImgClick(img));
    enableTextEditOn(albumSection);
  }

  function addServiceRow() {
    const root = document.querySelector('[data-cms-list="services"]');
    if (!root) return;
    const n = root.querySelectorAll('.service-row').length + 1;
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML =
      '<div class="idx">' + String(n).padStart(2, '0') + '</div>' +
      '<div><h3>Новая услуга</h3><p>Описание услуги</p></div>' +
      '<div class="cost">после осмотра</div>';
    root.appendChild(row);
    attachServiceRemove(row);
    enableTextEditOn(row);
    row.querySelector('h3')?.focus();
  }

  function attachServiceRemove(row) {
    if (row.querySelector('.cms-remove-service')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cms-remove-service';
    btn.textContent = 'Удалить услугу';
    btn.onclick = () => {
      if (confirm('Удалить эту услугу из списка?')) {
        row.remove();
        document.querySelectorAll('[data-cms-list="services"] .service-row').forEach((r, i) => {
          const idx = r.querySelector('.idx');
          if (idx) idx.textContent = String(i + 1).padStart(2, '0');
        });
      }
    };
    row.appendChild(btn);
  }

  function enableTextEditOn(root) {
    root.querySelectorAll('[data-cms-key], h3, p, .cost').forEach((el) => {
      if (isExcluded(el)) return;
      if (!el.dataset.cmsKey && (el.matches('h3,p,.cost') || el.closest('.service-row'))) {
        assignKeys();
      }
      el.contentEditable = 'true';
      el.spellcheck = true;
    });
  }

  function enableEditing() {
    document.body.classList.add('cms-editing');
    assignKeys();

    document.querySelectorAll('[data-cms-key]').forEach((el) => {
      if (isExcluded(el)) return;
      el.contentEditable = 'true';
      el.spellcheck = true;
      el.addEventListener('paste', (e) => {
        e.preventDefault();
        const t = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, t);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !el.classList.contains('intro') && el.tagName !== 'P' && !el.closest('.faq')) {
          e.preventDefault();
        }
      });
    });

    document.querySelectorAll('[data-cms-img]').forEach((el) => {
      if (isExcluded(el)) return;
      bindImgClick(el);
    });

    document.querySelectorAll('[data-cms-bg]').forEach((el) => {
      if (isExcluded(el)) return;
      bindBgClick(el);
    });

    document.querySelectorAll('[data-cms-album]').forEach(attachAlbumChrome);
    document.querySelectorAll('[data-cms-list="services"] .service-row').forEach(attachServiceRemove);
    applyHiddenBlocks();
    attachBlockToggles();

    const bar = document.createElement('div');
    bar.className = 'cms-bar';
    bar.innerHTML =
      '<span class="cms-hint">Текст — клик. Фото: клик по зоне — выделение, перетаскивание — кадр, второй клик или двойной — замена. Затем «Сохранить страницу».</span>' +
      '<button type="button" class="cms-save">Сохранить страницу</button>' +
      '<button type="button" class="cms-exit">Выйти</button>';

    if (albumsRoot()) {
      const addA = document.createElement('button');
      addA.type = 'button';
      addA.className = 'cms-add';
      addA.textContent = '+ Альбом';
      addA.onclick = addAlbumSection;
      bar.insertBefore(addA, bar.querySelector('.cms-save'));
      const adminLink = document.createElement('a');
      adminLink.className = 'cms-add cms-add-link';
      adminLink.href = 'cms/admin-panel.html';
      adminLink.textContent = 'Админ-панель';
      bar.insertBefore(adminLink, bar.querySelector('.cms-save'));
    }
    if (document.querySelector('[data-cms-list="services"]')) {
      const addS = document.createElement('button');
      addS.type = 'button';
      addS.className = 'cms-add';
      addS.textContent = '+ Услуга';
      addS.onclick = addServiceRow;
      bar.insertBefore(addS, bar.querySelector('.cms-save'));
    }
    if (!albumsRoot()) {
      const adminLink = document.createElement('a');
      adminLink.className = 'cms-add cms-add-link';
      adminLink.href = 'cms/admin-panel.html';
      adminLink.textContent = 'Админ-панель';
      bar.insertBefore(adminLink, bar.querySelector('.cms-save'));
    }

    bar.querySelector('.cms-save').onclick = saveAll;
    bar.querySelector('.cms-exit').onclick = () => {
      sessionStorage.removeItem(TOKEN_KEY);
      location.reload();
    };
    document.body.appendChild(bar);
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadContent().then(() => {
      applyHiddenBlocks();
      if (token()) enableEditing();
    });
  });
})();
