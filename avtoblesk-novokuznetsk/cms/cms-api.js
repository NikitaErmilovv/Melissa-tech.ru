(function () {
  function siteBase() {
    const path = location.pathname.replace(/\\/g, '/');
    const idx = path.indexOf('/avtoblesk-novokuznetsk/');
    if (idx >= 0) return path.slice(0, idx + '/avtoblesk-novokuznetsk/'.length);
    const slash = path.lastIndexOf('/');
    return slash >= 0 ? path.slice(0, slash + 1) : '/';
  }

  function isLocal() {
    const h = location.hostname;
    return h === '127.0.0.1' || h === 'localhost';
  }

  async function tryFetch(url, opts) {
    const res = await fetch(url, opts);
    if (res.status === 404 || res.status === 501) return null;
    return res;
  }

  async function cmsRequest(action, opts) {
    const o = opts || {};
    const headers = Object.assign({}, o.headers || {});
    const init = Object.assign({}, o, { headers });

    if (isLocal()) {
      const py = await tryFetch('/api/cms/' + action, init);
      if (py) return py;
    }

    const base = siteBase();
    const php = await tryFetch(base + 'cms/api.php?action=' + encodeURIComponent(action), init);
    if (php) return php;

    return fetch('/api/cms/' + action, init);
  }

  window.AvtoCmsApi = {
    siteBase,
    login(password) {
      return cmsRequest('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
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
  };
})();
