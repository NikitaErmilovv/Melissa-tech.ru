(function () {
  function siteBase() {
    const path = location.pathname.replace(/\\/g, '/');
    const idx = path.indexOf('/avtoblesk-novokuznetsk/');
    if (idx >= 0) return path.slice(0, idx + '/avtoblesk-novokuznetsk/'.length);
    const cms = path.lastIndexOf('/cms/');
    if (cms >= 0) return path.slice(0, cms + 1);
    const slash = path.lastIndexOf('/');
    return slash >= 0 ? path.slice(0, slash + 1) : '/';
  }

  function isLocal() {
    const h = location.hostname;
    return h === '127.0.0.1' || h === 'localhost';
  }

  async function tryJson(url, opts) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 404 || res.status === 501) return null;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && !ct.includes('json')) return null;
      return res;
    } catch (_) {
      return null;
    }
  }

  async function cmsRequest(action, opts) {
    const o = opts || {};
    const headers = Object.assign({}, o.headers || {});
    const init = Object.assign({}, o, { headers });
    const base = siteBase();
    const urls = [];
    if (isLocal()) urls.push('/api/cms/' + action);
    urls.push(base + 'cms/api.php?action=' + encodeURIComponent(action));
    if (location.pathname.replace(/\\/g, '/').includes('/cms/')) {
      urls.push('api.php?action=' + encodeURIComponent(action));
    }
    let last = null;
    for (const url of urls) {
      const res = await tryJson(url, init);
      if (res) return res;
      last = res;
    }
    return last || fetch(urls[0], init);
  }

  window.AvtoCmsApi = {
    siteBase,
    login(password) {
      const body = JSON.stringify({ password });
      const headers = { 'Content-Type': 'application/json' };
      if (isLocal()) {
        return fetch('/api/cms/login', { method: 'POST', headers, body });
      }
      return cmsRequest('login', { method: 'POST', headers, body });
    },
    save(payload, token) {
      return cmsRequest('save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(payload),
      });
    },
    upload(file, token) {
      const fd = new FormData();
      fd.append('file', file);
      return cmsRequest('upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      });
    },
    contentJsonUrl() {
      const base = siteBase();
      return base + 'cms/content.json?_=' + Date.now();
    },
    wrapZonesUrl() {
      const base = siteBase();
      return base + 'data/wrap-zones.json?_=' + Date.now();
    },
    async saveWrapZones(payload, token) {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };
      if (isLocal()) {
        const py = await tryJson('/api/wrap-zones/save', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (py) return py;
      }
      const base = siteBase();
      const php = await tryJson(base + 'cms/api.php?action=wrap-zones-save', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (php) return php;
      return fetch('/api/wrap-zones/save', { method: 'POST', headers, body: JSON.stringify(payload) });
    },
    trainingUrl() {
      const base = siteBase();
      return base + 'data/training.json?_=' + Date.now();
    },
    async saveTraining(payload, token) {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };
      if (isLocal()) {
        const py = await tryJson('/api/training/save', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (py) return py;
      }
      const base = siteBase();
      const php = await tryJson(base + 'cms/api.php?action=training-save', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (php) return php;
      return fetch('/api/training/save', { method: 'POST', headers, body: JSON.stringify(payload) });
    },
  };
})();
