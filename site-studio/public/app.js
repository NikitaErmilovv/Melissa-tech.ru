const $ = (sel) => document.querySelector(sel);

let meta = null;
let config = null;
let currentSlug = null;
let selectedTemplateId = 'river-home';

function setStatus(text, ok = true) {
  const el = $('#status');
  if (!el) return;
  el.textContent = text || '';
  el.style.color = ok ? 'var(--muted)' : 'var(--danger)';
}

function get(path, obj) {
  return path.split('.').reduce((a, k) => (a && a[k] != null ? a[k] : ''), obj);
}

function set(path, obj, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (path.endsWith('mapLat') || path.endsWith('mapLon')) cur[last] = Number(value);
  else cur[last] = value;
}

function syncBrandMirror() {
  if (!config?.brand) return;
  const k = config.brand.kino?.trim();
  if (k && !config.brand.navStack?.trim()) config.brand.navStack = k;
  if (k && !config.brand.displayPlain?.trim()) config.brand.displayPlain = k;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function showWelcome() {
  currentSlug = null;
  config = null;
  $('#welcome').hidden = false;
  $('#editor').hidden = true;
  $('#toolbar').hidden = true;
  $('#edit-header').hidden = true;
  setStatus('');
  renderDrafts();
}

function showEditor(slug) {
  $('#welcome').hidden = true;
  $('#editor').hidden = false;
  $('#toolbar').hidden = false;
  $('#edit-header').hidden = false;
  $('#current-draft-label').textContent = slug;
}

function renderTemplates() {
  const root = $('#template-pick');
  root.innerHTML = '';
  for (const t of meta.templates) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `template-card${t.id === selectedTemplateId ? ' is-active' : ''}`;
    card.innerHTML = `<strong>${t.name}</strong><span class="muted">${t.description || ''}</span><span class="muted small">Эталон: ${t.starterDir}</span>`;
    card.addEventListener('click', () => {
      selectedTemplateId = t.id;
      renderTemplates();
    });
    root.appendChild(card);
  }
  updateProdPreview();
}

function updateProdPreview() {
  const slug = $('#new-slug').value.trim() || '…';
  const base = meta.prodBaseUrl || 'https://melissa-tech.ru';
  $('#prod-url-preview').textContent = `${base.replace(/\/$/, '')}/${slug}/`;
}

function renderDrafts() {
  const list = $('#drafts-list');
  const empty = $('#drafts-empty');
  const drafts = meta?.drafts || [];
  list.innerHTML = '';
  empty.hidden = drafts.length > 0;
  for (const d of drafts) {
    const row = document.createElement('div');
    row.className = 'draft-row';
    row.innerHTML = `
      <div>
        <strong>${d.slug}</strong>
        <span class="muted"> · ${d.title}</span>
      </div>
      <div class="draft-row__actions">
        <button type="button" class="btn small" data-open="${d.slug}">Редактировать</button>
        <button type="button" class="btn ghost small danger" data-del="${d.slug}">Удалить</button>
      </div>`;
    list.appendChild(row);
  }
  list.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openDraft(btn.dataset.open));
  });
  list.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => deleteDraft(btn.dataset.del));
  });
}

async function refreshMeta() {
  meta = await api('/api/meta');
}

async function openDraft(slug) {
  try {
    config = await api(`/api/sites/${encodeURIComponent(slug)}/config`);
    currentSlug = slug;
    bindFormFromConfig();
    showEditor(slug);
    setStatus(`Черновик «${slug}»`);
  } catch (e) {
    setStatus(e.message, false);
  }
}

function bindFormFromConfig() {
  document.querySelectorAll('[data-bind]').forEach((el) => {
    el.value = get(el.dataset.bind, config) ?? '';
  });
  renderAlbums();
  renderReviews();
  renderHeroThumb();
}

function readFormToConfig() {
  document.querySelectorAll('[data-bind]').forEach((el) => {
    set(el.dataset.bind, config, el.value);
  });
  syncBrandMirror();
}

function photoUrl(slug, rel) {
  return `/api/sites/${encodeURIComponent(slug)}/photos?path=${encodeURIComponent(rel.split('?')[0])}`;
}

function renderHeroThumb() {
  const root = $('#hero-preview');
  root.innerHTML = '';
  const hero = config.gallery?.hero;
  if (!hero || !currentSlug) return;
  const wrap = document.createElement('div');
  wrap.className = 'thumb';
  const img = document.createElement('img');
  img.src = photoUrl(currentSlug, hero);
  wrap.appendChild(img);
  root.appendChild(wrap);
}

function renderAlbums() {
  const root = $('#albums-root');
  root.innerHTML = '';
  (config.albums || []).forEach((album, ai) => {
    const details = document.createElement('details');
    details.className = 'album-block';
    details.open = true;
    const count = (album.files || []).length;
    details.innerHTML = `
      <summary>
        <span class="album-block__title">${album.label || album.id || `Альбом ${ai + 1}`}</span>
        <span class="muted">${count} фото</span>
      </summary>
      <div class="album-block__body">
        <div class="grid-2 tight">
          <label>Название альбома<input data-album-label="${ai}"></label>
          <label>Папка на диске<input data-album-folder="${ai}"></label>
          <label>Ключ в manifest<input data-album-key="${ai}"></label>
        </div>
        <div class="thumbs" data-thumbs="${ai}"></div>
        <div class="album-block__bar">
          <label class="btn ghost small">+ Загрузить фото<input type="file" accept="image/*" hidden data-upload="${ai}"></label>
          <button type="button" class="btn ghost small danger" data-remove-album="${ai}">Удалить альбом</button>
        </div>
      </div>`;
    root.appendChild(details);

    const labelInp = details.querySelector(`[data-album-label="${ai}"]`);
    labelInp.value = album.label || '';
    const folderInp = details.querySelector(`[data-album-folder="${ai}"]`);
    folderInp.value = album.folder || '';
    const keyInp = details.querySelector(`[data-album-key="${ai}"]`);
    keyInp.value = album.manifestKey || album.id || '';

    labelInp.addEventListener('input', () => {
      config.albums[ai].label = labelInp.value;
      details.querySelector('.album-block__title').textContent = labelInp.value || config.albums[ai].id;
    });
    folderInp.addEventListener('input', () => { config.albums[ai].folder = folderInp.value; });
    keyInp.addEventListener('input', () => {
      config.albums[ai].manifestKey = keyInp.value;
      config.albums[ai].id = keyInp.value;
    });

    const thumbs = details.querySelector(`[data-thumbs="${ai}"]`);
    (album.files || []).forEach((file, fi) => {
      const t = document.createElement('div');
      t.className = 'thumb';
      const img = document.createElement('img');
      img.src = photoUrl(currentSlug, file.path);
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.title = 'Удалить файл';
      del.addEventListener('click', () => removePhoto(ai, fi, file.path));
      t.appendChild(img);
      t.appendChild(del);
      thumbs.appendChild(t);
    });

    const up = details.querySelector(`[data-upload="${ai}"]`);
    up.addEventListener('change', () => uploadPhoto(ai, config.albums[ai].folder, up.files[0]));

    details.querySelector(`[data-remove-album="${ai}"]`).addEventListener('click', () => {
      if (!confirm('Удалить альбом из конфига? (файлы на диске не трогаем)')) return;
      config.albums.splice(ai, 1);
      renderAlbums();
    });
  });
}

function renderReviews() {
  const root = $('#reviews-root');
  root.innerHTML = '';
  (config.reviews?.items || []).forEach((r, i) => {
    const row = document.createElement('details');
    row.className = 'album-block';
    row.open = false;
    row.innerHTML = `
      <summary><span>${r.name || 'Отзыв'} · ${r.date || ''}</span></summary>
      <div class="album-block__body">
        <div class="grid-2 tight">
          <label>Имя<input data-r-name="${i}"></label>
          <label>Дата<input data-r-date="${i}"></label>
        </div>
        <label>Оценка<input data-r-rating="${i}" type="number" min="1" max="5"></label>
        <label>Текст<textarea data-r-text="${i}" rows="3"></textarea></label>
        <button type="button" class="btn danger small" data-r-del="${i}">Удалить</button>
      </div>`;
  root.appendChild(row);
    row.querySelector(`[data-r-name="${i}"]`).value = r.name || '';
    row.querySelector(`[data-r-date="${i}"]`).value = r.date || '';
    row.querySelector(`[data-r-rating="${i}"]`).value = r.rating || 5;
    row.querySelector(`[data-r-text="${i}"]`).value = r.text || '';
    row.querySelector(`[data-r-name="${i}"]`).addEventListener('input', (e) => { config.reviews.items[i].name = e.target.value; });
    row.querySelector(`[data-r-date="${i}"]`).addEventListener('input', (e) => { config.reviews.items[i].date = e.target.value; });
    row.querySelector(`[data-r-rating="${i}"]`).addEventListener('input', (e) => { config.reviews.items[i].rating = Number(e.target.value); });
    row.querySelector(`[data-r-text="${i}"]`).addEventListener('input', (e) => { config.reviews.items[i].text = e.target.value; });
    row.querySelector(`[data-r-del="${i}"]`).addEventListener('click', () => {
      config.reviews.items.splice(i, 1);
      renderReviews();
    });
  });
}

async function removePhoto(albumIndex, fileIndex, relPath) {
  if (!confirm('Удалить этот файл?')) return;
  await api(`/api/sites/${encodeURIComponent(currentSlug)}/photos`, {
    method: 'DELETE',
    body: JSON.stringify({ path: relPath }),
  });
  config.albums[albumIndex].files.splice(fileIndex, 1);
  renderAlbums();
  renderHeroThumb();
}

async function uploadPhoto(albumIndex, folder, file) {
  if (!file || !folder) {
    setStatus('Укажите папку альбома', false);
    return;
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch(`/api/sites/${encodeURIComponent(currentSlug)}/photos`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  if (!config.albums[albumIndex].files) config.albums[albumIndex].files = [];
  config.albums[albumIndex].files.push({ path: data.path, alt: '' });
  renderAlbums();
}

$('#btn-add-album').addEventListener('click', () => {
  if (!config.albums) config.albums = [];
  const id = `album-${config.albums.length + 1}`;
  config.albums.push({
    id,
    manifestKey: id,
    label: `Альбом ${config.albums.length + 1}`,
    folder: `photoHouse/${id}`,
    files: [],
  });
  renderAlbums();
});

$('#btn-add-review').addEventListener('click', () => {
  if (!config.reviews) config.reviews = { meta: {}, items: [] };
  config.reviews.items.push({
    id: `rev-${Date.now()}`,
    name: '',
    text: '',
    rating: 5,
    date: new Date().toISOString().slice(0, 10),
  });
  renderReviews();
});

$('#btn-save').addEventListener('click', async () => {
  try {
    readFormToConfig();
    await api(`/api/sites/${encodeURIComponent(currentSlug)}/config`, { method: 'POST', body: JSON.stringify(config) });
    setStatus('Сохранено в workspace');
  } catch (e) {
    setStatus(e.message, false);
  }
});

$('#btn-apply').addEventListener('click', async () => {
  try {
    readFormToConfig();
    const data = await api(`/api/sites/${encodeURIComponent(currentSlug)}/apply`, {
      method: 'POST',
      body: JSON.stringify({ config }),
    });
    config = data.config;
    setStatus('Применено к файлам черновика');
  } catch (e) {
    setStatus(e.message, false);
  }
});

$('#btn-preview').addEventListener('click', async () => {
  try {
    readFormToConfig();
    await api(`/api/sites/${encodeURIComponent(currentSlug)}/config`, { method: 'POST', body: JSON.stringify(config) });
    await api(`/api/sites/${encodeURIComponent(currentSlug)}/apply`, {
      method: 'POST',
      body: JSON.stringify({ config }),
    });
    const prev = await api(`/api/sites/${encodeURIComponent(currentSlug)}/preview/start`, { method: 'POST' });
    window.open(prev.url, '_blank');
    setStatus(`Превью: ${prev.url}`);
  } catch (e) {
    setStatus(e.message, false);
  }
});

$('#btn-publish').addEventListener('click', async () => {
  if (!confirm('Скопировать черновик в репозиторий, commit и push?\nТолько папка этого сайта.')) return;
  try {
    readFormToConfig();
    const out = await api(`/api/sites/${encodeURIComponent(currentSlug)}/publish`, {
      method: 'POST',
      body: JSON.stringify({ message: `deploy: ${currentSlug} (site-studio)` }),
    });
    const wrap = $('#prod-link-wrap');
    wrap.hidden = false;
    wrap.innerHTML = `Прод: <a href="${out.prodUrl}" target="_blank" rel="noopener">${out.prodUrl}</a>`;
    setStatus(out.note || 'Опубликовано');
  } catch (e) {
    setStatus(e.message, false);
  }
});

$('#btn-back').addEventListener('click', async () => {
  await refreshMeta();
  showWelcome();
});

$('#btn-create-draft').addEventListener('click', async () => {
  const slug = $('#new-slug').value.trim();
  if (!slug) return setStatus('Введите slug на главном экране', false);
  try {
    await api('/api/drafts/create', {
      method: 'POST',
      body: JSON.stringify({ slug, templateId: selectedTemplateId }),
    });
    await refreshMeta();
    await openDraft(slug);
    $('#new-slug').value = '';
  } catch (e) {
    alert(e.message);
  }
});

async function deleteDraft(slug) {
  if (!confirm(`Удалить черновик «${slug}» с диска?`)) return;
  try {
    await api(`/api/drafts/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    await refreshMeta();
    renderDrafts();
  } catch (e) {
    alert(e.message);
  }
}

$('#new-slug').addEventListener('input', updateProdPreview);

document.querySelectorAll('[data-bind^="brand."]').forEach((el) => {
  el.addEventListener('blur', () => {
    if (!config) return;
    readFormToConfig();
    if (el.dataset.bind === 'brand.kino') bindFormFromConfig();
  });
});

(async function init() {
  try {
    await refreshMeta();
    renderTemplates();
    showWelcome();
    $('#repo-hint').textContent += ` · ветка ${meta.git?.branch || '?'}`;
  } catch (e) {
    alert(e.message);
  }
})();