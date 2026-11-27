import fs from 'node:fs';
import path from 'node:path';
import { siteDir } from './repo.mjs';

function walkHtmlFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'vendor') continue;
      out.push(...walkHtmlFiles(full));
    } else if (name.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function jsString(s) {
  return JSON.stringify(String(s ?? ''));
}

export function buildContactsJs(cfg) {
  const m = cfg.messengers || {};
  const c = cfg.contacts || {};
  const phones = c.phones?.length
    ? c.phones
    : [{ label: 'Бронирование', name: '', tel: cfg.nav?.phoneTel || '', display: cfg.nav?.phoneDisplay || '' }];
  const phoneLines = phones
    .map(
      (p) => `  {
    "label": ${jsString(p.label)},
    "name": ${jsString(p.name || '')},
    "tel": ${jsString(p.tel)},
    "display": ${jsString(p.display || p.tel)}
  }`,
    )
    .join(',\n');
  return `window.STUDIO_MESSENGERS = {
  wa: ${jsString(m.wa)},
  tg: ${jsString(m.tg)},
  defaultMessage: ${jsString(m.defaultMessage)},
};

window.STUDIO_CONTACTS = {
  addressLine: ${jsString(c.addressLine)},
  hoursLine: ${jsString(c.hoursLine)},
  mapLat: ${Number(c.mapLat) || 0},
  mapLon: ${Number(c.mapLon) || 0},
  gisFirm: ${jsString(c.gisFirm)},
  email: ${jsString(c.email || '')},
  phones: [
${phoneLines}
],
};
`;
}

function buildReviewsJs(cfg) {
  const meta = cfg.reviews?.meta || {};
  const reviews = cfg.reviews?.items || [];
  const body = {
    meta,
    reviews,
  };
  return `// Static snapshot from 2GIS — do not fetch at runtime
window.RIVER_HOME_SITE_REVIEWS = ${JSON.stringify(body, null, 2)};
`;
}

function buildGalleryManifest(cfg) {
  const q = cfg.gallery?.cacheQuery || '';
  const manifest = { hero: cfg.gallery?.hero || 'photoHouse/hero-cover.jpg' };
  for (const album of cfg.albums || []) {
    const key = album.manifestKey || album.id;
    manifest[key] = (album.files || []).map((f) => f.path);
  }
  if (q && !manifest.hero.includes('?')) manifest.hero += q;
  return manifest;
}

function isSafeGlobalReplace(from, to) {
  if (!from || from === to) return false;
  if (from.length < 4 && /^[\d.]+$/.test(from)) return false;
  return true;
}

function applyReplacements(dir, pairs) {
  if (!pairs.length) return { files: 0, replacements: 0 };
  const htmlFiles = walkHtmlFiles(dir);
  let replacementCount = 0;
  for (const file of htmlFiles) {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [from, to] of pairs) {
      if (!isSafeGlobalReplace(from, to)) continue;
      if (text.includes(from)) {
        text = text.split(from).join(to);
        replacementCount += 1;
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, text, 'utf8');
  }
  return { files: htmlFiles.length, replacements: replacementCount };
}

function deriveBrandLiterals(cfg) {
  const b = cfg.brand || {};
  const kino = b.kino || b.navStack || '';
  const nav = b.navStack || kino;
  const display = b.displayPlain || kino;
  return { kino, nav, display };
}

export function deriveConfigFromBrand(cfg) {
  const { kino, nav, display } = deriveBrandLiterals(cfg);
  const c = cfg.contacts || {};
  const slug = cfg.slug;
  const q = cfg.gallery?.cacheQuery || `?v=${slug}-studio`;

  cfg.brand = { ...cfg.brand, kino, navStack: nav, displayPlain: display };

  if (!cfg.seo) cfg.seo = {};
  if (cfg.seo.titleAuto !== false) {
    const addr = c.addressLine?.split(',')[0] || cfg.brand.eyebrowCity || '';
    cfg.seo.title = `${display || kino} — гостевой дом${addr ? `, ${addr}` : ''}`;
  }

  if (cfg.messengers && cfg.messengers.messageAuto !== false && display) {
    cfg.messengers.defaultMessage = `Здравствуйте! Хочу забронировать ${display.replace(/^«|»$/g, '')}.`;
  }

  if (cfg.nav?.phoneTel && cfg.nav.phoneAuto !== false) {
    const tel = cfg.nav.phoneTel;
    cfg.nav.phoneDisplay = cfg.nav.phoneDisplay || formatPhoneDisplay(tel);
  }

  cfg.gallery = cfg.gallery || {};
  cfg.gallery.cacheQuery = q;

  return cfg;
}

function formatPhoneDisplay(tel) {
  const digits = String(tel).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  return tel;
}

export function applySiteConfig(cfg) {
  const slug = cfg.slug;
  if (!slug) throw new Error('В конфиге нет slug');
  deriveConfigFromBrand(cfg);

  const dir = siteDir(slug);
  fs.writeFileSync(path.join(dir, 'contacts-config.js'), buildContactsJs(cfg), 'utf8');
  fs.writeFileSync(path.join(dir, 'reviews-data.js'), buildReviewsJs(cfg), 'utf8');
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'data', 'gallery-manifest.json'),
    `${JSON.stringify(buildGalleryManifest(cfg), null, 2)}\n`,
    'utf8',
  );

  const pairs = [];
  const prev = cfg.sync?.lastPairs || [];
  for (const [from, to] of prev) {
    if (from && to) pairs.push([from, to]);
  }

  const { kino, nav, display } = deriveBrandLiterals(cfg);
  const newPairs = [
    [cfg.sync?.snapshot?.title, cfg.seo?.title],
    [cfg.sync?.snapshot?.brandKino, kino],
    [cfg.sync?.snapshot?.navBrand, nav],
    [cfg.sync?.snapshot?.eyebrow, cfg.brand?.eyebrowCity],
    [cfg.sync?.snapshot?.heroParagraph, cfg.hero?.paragraph],
    [cfg.sync?.snapshot?.heroAlt, cfg.hero?.imageAlt],
    [cfg.sync?.snapshot?.reviewsCount, String(cfg.stats?.reviewsCount ?? '')],
    [cfg.sync?.snapshot?.rating, String(cfg.stats?.rating ?? '')],
    [cfg.sync?.snapshot?.mode, cfg.stats?.mode],
    [cfg.sync?.snapshot?.navPhoneTel, cfg.nav?.phoneTel],
    [cfg.sync?.snapshot?.navPhoneDisplay, cfg.nav?.phoneDisplay],
    [cfg.sync?.snapshot?.waMessage, cfg.messengers?.defaultMessage],
  ];

  for (const [from, to] of newPairs) {
    if (from && to != null && from !== to) pairs.push([from, to]);
  }

  const uniq = [];
  const seen = new Set();
  for (const [a, b] of pairs) {
    const key = `${a}\0${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push([a, b]);
  }

  const repResult = applyReplacements(dir, uniq);

  cfg.sync = cfg.sync || {};
  cfg.sync.lastPairs = uniq;
  cfg.sync.snapshot = {
    title: cfg.seo?.title,
    brandKino: kino,
    navBrand: nav,
    eyebrow: cfg.brand?.eyebrowCity,
    heroParagraph: cfg.hero?.paragraph,
    heroAlt: cfg.hero?.imageAlt,
    reviewsCount: String(cfg.stats?.reviewsCount ?? ''),
    rating: String(cfg.stats?.rating ?? ''),
    mode: cfg.stats?.mode,
    navPhoneTel: cfg.nav?.phoneTel,
    navPhoneDisplay: cfg.nav?.phoneDisplay,
    waMessage: cfg.messengers?.defaultMessage,
  };
  cfg.meta = cfg.meta || {};
  cfg.meta.lastAppliedAt = new Date().toISOString();

  applyCarousels(dir, cfg);
  applyContactMaps(dir, cfg);

  return { slug, ...repResult };
}

function applyContactMaps(dir, cfg) {
  const c = cfg.contacts || {};
  const lat = Number(c.mapLat);
  const lon = Number(c.mapLon);
  const gis = String(c.gisFirm || '').trim();
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !gis) return { files: 0 };

  const address = String(c.addressLine || cfg.brand?.eyebrowCity || '').trim();
  const hours = String(c.hoursLine || cfg.stats?.mode || 'Круглосуточно').trim();
  const phoneTel = String(cfg.nav?.phoneTel || c.phones?.[0]?.tel || '').trim();
  const phoneDisplay = String(cfg.nav?.phoneDisplay || c.phones?.[0]?.display || phoneTel).trim();
  const intro = address
    ? `Ждём вас: ${address}. Адрес и маршрут — в 2ГИС.`
    : 'Адрес и маршрут — в 2ГИС.';
  const mapAlt = `Карта 2ГИС — ${address}`;
  const altEsc = mapAlt.replace(/"/g, '&quot;');
  const desktop = `https://static.maps.2gis.com/1.0?s=880x450&amp;c=${lat},${lon}&amp;z=16&amp;pt=${lat},${lon}~k:p`;
  const mobile = `https://static.maps.2gis.com/1.0?s=720x720&amp;c=${lat},${lon}&amp;z=16&amp;pt=${lat},${lon}~k:p`;
  const desktopTag = `<img class="address-map-img address-map-img--desktop" loading="lazy" decoding="async" src="${desktop}" alt="${altEsc}">`;
  const mobileTag = `<img class="address-map-img address-map-img--mobile" loading="lazy" decoding="async" src="${mobile}" alt="${altEsc}">`;

  let files = 0;
  for (const file of walkHtmlFiles(dir)) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('address-map') && !html.includes('static.maps.2gis.com') && !html.includes('2gis.ru/')) {
      continue;
    }
    const before = html;
    html = html.replace(/href="https:\/\/2gis\.ru\/[^"]+"/g, `href="${gis}"`);
    html = html.replace(
      /<img class="address-map-img address-map-img--desktop"[^>]*>/g,
      desktopTag,
    );
    html = html.replace(
      /<img class="address-map-img address-map-img--mobile"[^>]*>/g,
      mobileTag,
    );
    if (html.includes('address-map-text')) {
      html = html.replace(/<p class="address-map-text">[^<]*<\/p>/, `<p class="address-map-text">${intro}</p>`);
    }
    if (address) {
      html = html.replace(
        /<p class="address-map-muted">[^<]*<\/p>/,
        `<p class="address-map-muted">${address}</p>`,
      );
    }
    html = html.replace(
      /<p class="address-map-muted-sm">[^<]*<\/p>/,
      `<p class="address-map-muted-sm">${hours}</p>`,
    );
    if (phoneTel && phoneDisplay) {
      html = html.replace(
        /<a href="tel:[^"]+" class="address-map-phone">[^<]+<\/a>/g,
        `<a href="tel:${phoneTel}" class="address-map-phone">${phoneDisplay}</a>`,
      );
    }
    if (html !== before) {
      fs.writeFileSync(file, html, 'utf8');
      files += 1;
    }
  }
  return { files };
}

function applyCarousels(dir, cfg) {
  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  let html = fs.readFileSync(indexPath, 'utf8');
  const carousels = cfg.carousels || [];
  for (const block of carousels) {
    if (!block.label || !Array.isArray(block.items)) continue;
    const labelEsc = block.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      `(data-label="${labelEsc}"[\\s\\S]*?<script type="application/json" class="depth-carousel__items">)([\\s\\S]*?)(</script>)`,
      'm',
    );
    const json = JSON.stringify(block.items, null, 0);
    if (re.test(html)) {
      html = html.replace(re, `$1${json}$3`);
    }
  }
  fs.writeFileSync(indexPath, html, 'utf8');
}