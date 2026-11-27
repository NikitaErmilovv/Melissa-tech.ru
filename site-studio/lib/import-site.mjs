import fs from 'node:fs';
import path from 'node:path';
import { CONFIG_NAME, siteDir, starterDir, templateForSlug, loadTemplates } from './repo.mjs';

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function matchGroup(text, re, group = 1) {
  const m = text.match(re);
  return m ? m[group].trim() : '';
}

function parseContactsJs(text) {
  const wa = matchGroup(text, /wa:\s*["']([^"']+)["']/);
  const tg = matchGroup(text, /tg:\s*["']([^"']+)["']/);
  const defaultMessage = matchGroup(text, /defaultMessage:\s*["']([^"']*)["']/);
  const addressLine = matchGroup(text, /addressLine:\s*["']([^"']*)["']/);
  const hoursLine = matchGroup(text, /hoursLine:\s*["']([^"']*)["']/);
  const mapLat = Number(matchGroup(text, /mapLat:\s*([-\d.]+)/));
  const mapLon = Number(matchGroup(text, /mapLon:\s*([-\d.]+)/));
  const gisFirm = matchGroup(text, /gisFirm:\s*["']([^"']+)["']/);
  const tel = matchGroup(text, /tel:\s*["']([^"']+)["']/);
  const display = matchGroup(text, /display:\s*["']([^"']+)["']/);
  return {
    messengers: { wa, tg, defaultMessage },
    contacts: {
      addressLine,
      hoursLine,
      mapLat: Number.isFinite(mapLat) ? mapLat : 0,
      mapLon: Number.isFinite(mapLon) ? mapLon : 0,
      gisFirm,
      email: matchGroup(text, /email:\s*["']([^"']*)["']/),
      phones: tel
        ? [{ label: 'Бронирование', name: '', tel, display: display || tel }]
        : [],
    },
  };
}

function parseReviewsJs(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) return { meta: {}, reviews: [] };
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    return { meta: obj.meta || {}, reviews: obj.reviews || [] };
  } catch {
    return { meta: {}, reviews: [] };
  }
}

function parseGalleryManifest(dir) {
  const p = path.join(dir, 'data', 'gallery-manifest.json');
  if (!fs.existsSync(p)) return { hero: '', albums: {} };
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { hero: data.hero || '', albums: { ...data }, manifestRaw: data };
  } catch {
    return { hero: '', albums: {} };
  }
}

function scrapeIndex(dir) {
  const html = readText(path.join(dir, 'index.html'));
  const title = matchGroup(html, /<title>([^<]*)<\/title>/);
  const brandKino = matchGroup(html, /<span class="title-kino-line">([^<]*)<\/span>/);
  const navBrand = matchGroup(html, /<span class="brand-stack__base">([^<]*)<\/span>/);
  const eyebrow = matchGroup(html, /<div class="eyebrow hero-eyebrow-city">([^<]*)<\/div>/);
  const heroP = matchGroup(html, /<div class="hero-content">\s*<p>([^<]*)<\/p>/s);
  const heroAlt = matchGroup(html, /class="heroimg-photo"[^>]*alt="([^"]*)"/);
  const reviewsStat = matchGroup(html, /id="stat-reviews">([^<]*)</);
  const ratingStat = matchGroup(html, /id="stat-rating">([^<]*)</);
  const modeStat = matchGroup(html, /<div class="stat"><span>режим<\/span><b>([^<]*)<\/b>/);
  const navPhone = matchGroup(html, /<a class="phone" href="tel:([^"]+)">([^<]*)<\/a>/);
  return {
    seo: { title },
    brand: {
      kino: brandKino || navBrand || '',
      navStack: navBrand || brandKino || '',
      eyebrowCity: eyebrow || '',
      displayPlain: title.split('—')[0]?.trim() || brandKino,
    },
    hero: {
      paragraph: heroP.replace(/\s+/g, ' ').trim(),
      imageAlt: heroAlt || '',
    },
    stats: {
      mode: modeStat || '24–7',
      reviewsCount: reviewsStat || '0',
      rating: ratingStat || '5',
    },
    nav: {
      phoneTel: navPhone ? matchGroup(html, /<a class="phone" href="tel:([^"]+)">/) : '',
      phoneDisplay: navPhone ? matchGroup(html, /<a class="phone" href="tel:[^"]+">([^<]*)<\/a>/) : '',
    },
  };
}

function listPhotoAlbums(dir, manifestRaw) {
  const albums = [];
  const keys = Object.keys(manifestRaw || {}).filter((k) => k !== 'hero');
  for (const key of keys) {
    const paths = Array.isArray(manifestRaw[key]) ? manifestRaw[key] : [];
    const folderGuess = paths[0] ? path.dirname(paths[0]).replace(/\\/g, '/') : `photoHouse/${key}`;
    albums.push({
      id: key,
      manifestKey: key,
      label: key,
      folder: folderGuess,
      files: paths.map((rel) => ({
        path: rel.replace(/\\/g, '/'),
        alt: '',
      })),
    });
  }
  const photoRoot = path.join(dir, 'photoHouse');
  if (fs.existsSync(photoRoot)) {
    for (const sub of fs.readdirSync(photoRoot, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const id = sub.name;
      const exists = albums.some((a) => a.folder.endsWith(id) || a.id === id);
      if (exists) continue;
      const folder = `photoHouse/${id}`;
      const files = fs
        .readdirSync(path.join(photoRoot, sub.name))
        .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
        .map((f) => ({ path: `${folder}/${f}`, alt: '' }));
      if (files.length) {
        albums.push({ id: sub.name, manifestKey: sub.name, label: sub.name, folder, files });
      }
    }
  }
  return albums;
}

function parseCarouselsFromIndex(dir) {
  const html = readText(path.join(dir, 'index.html'));
  const blocks = [];
  const re =
    /data-label="([^"]+)"[^>]*>[\s\S]*?<script type="application\/json" class="depth-carousel__items">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      const items = JSON.parse(m[2].trim());
      blocks.push({ label: m[1], items });
    } catch {
      blocks.push({ label: m[1], items: [] });
    }
  }
  return blocks;
}

export function importSiteConfig(slug) {
  const dir = siteDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`Папка не найдена: ${slug}`);

  const contactsText = readText(path.join(dir, 'contacts-config.js'));
  const { messengers, contacts } = parseContactsJs(contactsText);
  const reviewsText = readText(path.join(dir, 'reviews-data.js'));
  const { meta, reviews } = parseReviewsJs(reviewsText);
  const gallery = parseGalleryManifest(dir);
  const scraped = scrapeIndex(dir);
  const carousels = parseCarouselsFromIndex(dir);

  const templates = loadTemplates();
  const tpl = templateForSlug(slug, templates);

  const config = {
    version: 1,
    slug,
    templateId: tpl?.id || 'river-home',
    meta: {
      cacheBust: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      importedAt: new Date().toISOString(),
    },
    brand: scraped.brand,
    seo: scraped.seo,
    contacts,
    messengers,
    hero: scraped.hero,
    stats: scraped.stats,
    nav: scraped.nav,
    gallery: {
      hero: gallery.hero || 'photoHouse/hero-cover.jpg',
      cacheQuery: `?v=${slug}-studio`,
    },
    albums: listPhotoAlbums(dir, gallery.manifestRaw),
    carousels,
    reviews: { meta, items: reviews },
    sync: {
      lastPairs: [],
      snapshot: {
        title: scraped.seo.title,
        brandKino: scraped.brand.kino,
        navBrand: scraped.brand.navStack,
        eyebrow: scraped.brand.eyebrowCity,
        heroParagraph: scraped.hero.paragraph,
        heroAlt: scraped.hero.imageAlt,
        reviewsCount: String(scraped.stats.reviewsCount),
        rating: String(scraped.stats.rating),
        mode: scraped.stats.mode,
        navPhoneTel: scraped.nav.phoneTel,
        navPhoneDisplay: scraped.nav.phoneDisplay,
        waMessage: messengers.defaultMessage,
      },
    },
  };

  if (!config.messengers.defaultMessage && config.brand.displayPlain) {
    config.messengers.defaultMessage = `Здравствуйте! Хочу забронировать ${config.brand.displayPlain}.`;
  }

  return config;
}

export function writeSiteConfig(slug, config) {
  const p = path.join(siteDir(slug), CONFIG_NAME);
  fs.writeFileSync(p, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return p;
}

export function ensureSiteConfig(slug) {
  const p = path.join(siteDir(slug), CONFIG_NAME);
  if (!fs.existsSync(p)) {
    throw new Error('Черновик не найден. Сначала создайте сайт на главном экране.');
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function createDraftFromTemplate({ slug, templateId }) {
  const doc = loadTemplates();
  const tpl = doc.templates.find((t) => t.id === templateId);
  if (!tpl) throw new Error('Шаблон не найден');
  const target = siteDir(slug);
  const starter = starterDir(templateId);
  if (fs.existsSync(target)) throw new Error('Черновик с таким slug уже есть');
  if (!fs.existsSync(starter)) throw new Error(`Эталон не найден: ${tpl.starterDir}`);
  fs.cpSync(starter, target, {
    recursive: true,
    filter: (src) => !src.includes('node_modules') && !src.includes('.git') && !src.endsWith('site.config.json'),
  });
  const cfg = importSiteConfig(slug);
  cfg.slug = slug;
  cfg.templateId = templateId;
  cfg.studio = { managed: true, createdAt: new Date().toISOString(), fromTemplate: tpl.starterDir };
  cfg.brand = {
    kino: 'НАЗВАНИЕ',
    navStack: 'НАЗВАНИЕ',
    displayPlain: 'Название объекта',
    eyebrowCity: 'Город',
  };
  cfg.seo = { title: 'Название — гостевой дом' };
  cfg.contacts = cfg.contacts || {};
  cfg.contacts.addressLine = 'Адрес';
  cfg.nav = cfg.nav || { phoneTel: '+79000000000', phoneDisplay: '+7 (900) 000-00-00' };
  writeSiteConfig(slug, cfg);
  return cfg;
}