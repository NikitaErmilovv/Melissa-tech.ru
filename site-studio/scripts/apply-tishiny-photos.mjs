import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'tishiny-hochu-tyumen';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);
const v = 'tishiny-hochu-20261129';
const q = `?v=${v}`;
const BRAND = 'Тишины хочу';

const PH1 = 'image-2262dffb-d4a7-4e13-a967-6390d9722ce2.jpg';
const DOM = [
  { file: '01.jpg', asset: PH1 },
  { file: '02.jpg', asset: 'image-921c4e96-d045-469e-8da5-c6b1d29f0619.jpg' },
  { file: '03.png', asset: 'image-abfd5138-c96d-45c8-91dc-37657965a5bb.png' },
];
const TERR = [
  { file: '01.jpg', asset: 'image-7908ad0b-5fe5-44ea-b66a-dcd7a70f019e.jpg' },
  { file: '02.jpg', asset: 'image-9be95966-6e9d-4620-b7d0-d3320301f463.jpg' },
  { file: '03.jpg', asset: 'image-8a9618a8-46ad-4044-aa63-65f017dc75fc.jpg' },
  { file: '04.jpg', asset: 'image-b416eb14-aa79-4872-a61f-d8a2839575d4.jpg' },
  { file: '05.jpg', asset: 'image-b1e26cc9-49f8-4c08-bf19-ce2f5c4976f1.jpg' },
];
const INSIDE = [
  { file: '01.jpg', asset: 'image-4e32c82c-456c-475b-a7d4-de35718cfec1.jpg' },
  { file: '02.jpg', asset: 'image-88d751b7-eb83-4a12-9d8f-2b3f67d4b774.jpg' },
  { file: '03.jpg', asset: 'image-c07f810d-f92f-43b1-a203-be40787797d0.jpg' },
  { file: '04.jpg', asset: 'image-6e8a4922-12d3-4e14-8e43-506c74c078b2.jpg' },
];
const BANYA = [
  { file: '01.jpg', asset: 'image-dccd4602-9c79-4833-ad6c-e0f0833a25d8.jpg' },
  { file: '02.jpg', asset: 'image-25b84bec-7145-4f4f-9351-cb6bd3ba840f.jpg' },
  { file: '03.jpg', asset: 'image-f699cbfb-d784-408d-b1c4-d90a34596e59.jpg' },
];

function copySet(folder, items) {
  const destDir = path.join(dir, 'photoHouse', folder);
  fs.mkdirSync(destDir, { recursive: true });
  for (const old of fs.readdirSync(destDir)) {
    try {
      fs.unlinkSync(path.join(destDir, old));
    } catch {
      /* ignore */
    }
  }
  for (const ent of items) {
    const src = path.join(assets, ent.asset);
    if (!fs.existsSync(src)) throw new Error(`Asset missing: ${ent.asset}`);
    fs.copyFileSync(src, path.join(destDir, ent.file));
  }
}

function wipeFolder(folder) {
  const destDir = path.join(dir, 'photoHouse', folder);
  if (!fs.existsSync(destDir)) return;
  for (const old of fs.readdirSync(destDir)) {
    try {
      fs.unlinkSync(path.join(destDir, old));
    } catch {
      /* ignore */
    }
  }
}

copySet('Дом', DOM);
copySet('Территория у дома', TERR);
copySet('Комнаты - Внутри дома', INSIDE);
copySet('Баня и чан', BANYA);
fs.copyFileSync(path.join(assets, PH1), path.join(dir, 'photoHouse', 'hero-cover.jpg'));
for (const folder of ['Санузел', 'Прихожая', 'Купель и сауна']) {
  wipeFolder(folder);
}

function paths(folder, items) {
  return items.map((e) => `photoHouse/${folder}/${e.file}`);
}

function galleryItems(files, label) {
  return files.map((f, i) => ({
    path: f,
    alt: i === 0 ? `${label} — ${BRAND}, д. Новопокровка` : `${label} — ${BRAND}`,
  }));
}

const domItems = galleryItems(paths('Дом', DOM), 'Дом');
const terrItems = galleryItems(paths('Территория у дома', TERR), 'Территория');
const insideItems = galleryItems(paths('Комнаты - Внутри дома', INSIDE), 'Внутри');
const banyaItems = galleryItems(paths('Баня и чан', BANYA), 'Баня и чан');

function carouselJson(items) {
  return JSON.stringify(items.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })));
}

function galleryHtml(items) {
  return items
    .map(
      (it) =>
        `<a class="g g--media" href="../${it.path}${q}"><img data-src="../${it.path}${q}" alt="${it.alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"></a>`,
    )
    .join('\n    ');
}

const albumList = `  <div class="album-list">
    <article class="album-row" id="house-dom">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Дом" data-href="services/dom.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(domItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Дом</div>
        <h3 class="album-title"><span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">снаружи</span><span class="brand-stack__script">зимой</span></span></h3>
        <p>Модульный дом в снегу: фасад, крыльцо и вечерняя подсветка.</p>
        <div class="actions"><a class="button" href="services/dom.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-territory">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Территория" data-href="services/territoriya.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(terrItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Территория</div>
        <h3 class="album-title"><span class="title-kino-line">У дома</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">двор</span><span class="brand-stack__script">озеро и сосны</span></span></h3>
        <p>Сосны, озеро с мостком и чай на участке.</p>
        <div class="actions"><a class="button" href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(insideItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Внутри</div>
        <h3 class="album-title"><span class="title-kino-line">Внутри</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">дома</span><span class="brand-stack__script">кухня и отдых</span></span></h3>
        <p>Гостиная, кухня, вид из окна и санузел.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-banya">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Баня" data-href="services/banya-chan.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(banyaItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Баня и чан</div>
        <h3 class="album-title"><span class="title-kino-line">Баня</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">и чан</span><span class="brand-stack__script">для гостей</span></span></h3>
        <p>Уличный чан и парная — для гостей дома.</p>
        <div class="actions"><a class="button" href="services/banya-chan.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">[\s\S]*?<\/p>/,
  '<p class="intro">Дом, территория, интерьер, баня и чан — только наши фото.</p>',
);
index = index.replace(
  /<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
  `${albumList}\n</section>\n\n<section class="section" id="reviews">`,
);
index = index.replace(
  /<div class="heroimg">\s*<img class="heroimg-photo"[^>]*>/,
  `<div class="heroimg"><img class="heroimg-photo" src="photoHouse/hero-cover.jpg${q}" alt="Тишины хочу, Лесная улица, 18, д. Новопокровка" width="1440" height="1920" fetchpriority="high" decoding="async">`,
);
index = index.replace(/(<link rel="preload" as="image" href=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');
const phone = '+79829004275';
const phoneDisp = '+7 (982) 900-42-75';

function basePage(html) {
  return html
    .replace(/Дом — Дом отдыха/g, 'Тишины хочу')
    .replace(/ДОМ ОТДЫХА/g, 'ТИШИНЫ ХОЧУ')
    .replace(/\+79829143247/g, phone)
    .replace(/\+7 \(982\) 914-32-47/g, phoneDisp)
    .replace(/\?v=[^"'&\s]+/g, q);
}

function servicePage({ kicker, titleHtml, lead, items, current }) {
  let html = basePage(domTpl);
  html = html.replace(
    /<section class="subpage-hero[\s\S]*?<\/section>/,
    `<section class="subpage-hero subpage-hero--service">
  <div class="kicker">${kicker}</div>
  <h1>${titleHtml}</h1>
  <p>${lead}</p>
</section>`,
  );
  html = html.replace(
    /<section class="section section--album-gallery">[\s\S]*?<\/section>/,
    `<section class="section section--album-gallery">
  <div class="gallery gallery--portfolio">
    ${galleryHtml(items)}
  </div>
</section>`,
  );
  html = html.replace(/data-album-current="[^"]*"/, `data-album-current="${current}"`);
  return html;
}

const hDom =
  '<span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">снаружи</span><span class="brand-stack__script">зимой</span></span>';
const hTerr =
  '<span class="title-kino-line">Территория</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">у дома</span><span class="brand-stack__script">озеро и сосны</span></span>';
const hIn =
  '<span class="title-kino-line">Внутри</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">дома</span><span class="brand-stack__script">кухня и отдых</span></span>';
const hBanya =
  '<span class="title-kino-line">Баня</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">и чан</span><span class="brand-stack__script">для гостей</span></span>';

fs.writeFileSync(
  path.join(dir, 'services', 'dom.html'),
  servicePage({
    kicker: 'Дом',
    titleHtml: hDom,
    lead: 'Модульный дом в д. Новопокровка, Лесная улица, 18.',
    items: domItems,
    current: 'dom',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'territoriya.html'),
  servicePage({
    kicker: 'Территория',
    titleHtml: hTerr,
    lead: 'Двор, сосны, озеро и чай на участке.',
    items: terrItems,
    current: 'territoriya',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'komnaty.html'),
  servicePage({
    kicker: 'Внутри',
    titleHtml: hIn,
    lead: 'Гостиная, кухня, вид из окна и санузел.',
    items: insideItems,
    current: 'komnaty',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'banya-chan.html'),
  servicePage({
    kicker: 'Баня и чан',
    titleHtml: hBanya,
    lead: 'Уличный чан и парная для гостей дома.',
    items: banyaItems,
    current: 'banya-chan',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Снаружи',
      lead: 'Фасад зимой',
      preview: '../photoHouse/Дом/01.jpg${q}',
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'У дома',
      lead: 'Озеро и сосны',
      preview: '../photoHouse/Территория у дома/01.jpg${q}',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Внутри',
      kicker: 'Интерьер',
      lead: 'Кухня и отдых',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg${q}',
    },
    {
      id: 'banya-chan',
      href: 'banya-chan.html',
      title: 'Баня и чан',
      kicker: 'Для гостей',
      lead: 'Чан и парная',
      preview: '../photoHouse/Баня и чан/01.jpg${q}',
    },
  ];`;

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs
    .readFileSync(path.join(dir, 'album-more.js'), 'utf8')
    .replace(/var ALBUMS = \[[\s\S]*?\];/, albumMore),
  'utf8',
);

let services = fs.readFileSync(path.join(dir, 'services.html'), 'utf8');
services = services.replace(
  /<div class="service-list">[\s\S]*?<\/div>/,
  `<div class="service-list">
    <a class="service-row" href="services/dom.html" id="album-01"><div class="idx">01</div><div><h3>Дом снаружи</h3><div class="service-desc"><p class="service-lead">Фасад, крыльцо и вечерняя подсветка.</p></div></div><div class="cost">3 фото</div></a>
    <a class="service-row" href="services/territoriya.html" id="album-02"><div class="idx">02</div><div><h3>Территория у дома</h3><div class="service-desc"><p class="service-lead">Сосны, озеро и чай на участке.</p></div></div><div class="cost">5 фото</div></a>
    <a class="service-row" href="services/komnaty.html" id="album-03"><div class="idx">03</div><div><h3>Внутри дома</h3><div class="service-desc"><p class="service-lead">Гостиная, кухня и санузел.</p></div></div><div class="cost">4 фото</div></a>
    <a class="service-row" href="services/banya-chan.html" id="album-04"><div class="idx">04</div><div><h3>Баня и чан</h3><div class="service-desc"><p class="service-lead">Уличный чан и парная.</p></div></div><div class="cost">3 фото</div></a>
  </div>`,
);
services = services.replace(
  /<p>Альбомы:[\s\S]*?<\/p>/,
  '<p>Альбомы: дом, территория, внутри, баня и чан.</p>',
);
fs.writeFileSync(path.join(dir, 'services.html'), services, 'utf8');

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery = { hero: 'photoHouse/hero-cover.jpg', cacheQuery: q };
cfg.hero = cfg.hero || {};
cfg.hero.imageAlt = 'Тишины хочу, Лесная улица, 18, д. Новопокровка';
cfg.carousels = [
  { label: 'Дом', items: domItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Территория', items: terrItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Комнаты', items: insideItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Баня', items: banyaItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
];
cfg.albums = [
  {
    id: 'dom',
    manifestKey: 'Дом',
    label: 'Дом',
    folder: 'photoHouse/Дом',
    files: domItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'territory',
    manifestKey: 'Территория у дома',
    label: 'Территория',
    folder: 'photoHouse/Территория у дома',
    files: terrItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'inside',
    manifestKey: 'Комнаты - Внутри дома',
    label: 'Внутри',
    folder: 'photoHouse/Комнаты - Внутри дома',
    files: insideItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'banya-chan',
    manifestKey: 'Баня и чан',
    label: 'Баня и чан',
    folder: 'photoHouse/Баня и чан',
    files: banyaItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261129';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug);
