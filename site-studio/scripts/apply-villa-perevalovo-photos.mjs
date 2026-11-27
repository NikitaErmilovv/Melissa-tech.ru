import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

const slug = 'villa-perevalovo';
const v = '?v=villa-photos-20261127';
const dir = siteDir(slug);
const assets =
  'C:/Users/Никита/.cursor/projects/c-Users-Melissa-tech-ru/assets';

const SOURCES = [
  `${assets}/image-ca62ceac-91cc-4385-9bb3-a670dd564192.jpg`,
  `${assets}/image-95d50360-c3e6-496d-826a-155322bba980.png`,
  `${assets}/image-d0b4640a-f443-48ce-a181-08253e2a524d.png`,
  `${assets}/image-f5843a8c-1b0f-45a2-9f7c-e336b24e0f23.jpg`,
  `${assets}/image-352b905f-ebfc-4954-85c7-a733e9c9b590.jpg`,
  `${assets}/image-9a69f1bb-67d6-4e20-b72e-3c8b0f978ee8.jpg`,
  `${assets}/image-6ce491c3-da6e-4ec1-816e-e150d0085cac.png`,
  `${assets}/image-856a1c42-3d93-449e-b3a0-5a04bc269a3f.png`,
  `${assets}/image-a5fc70ed-612a-4813-90c2-27d4c0f3ed22.png`,
  `${assets}/image-9f582bc0-ded4-44b8-bfa9-5a7e2efdec70.png`,
];

function extOf(file) {
  return path.extname(file).toLowerCase() || '.jpg';
}

function copyTo(destPath, src) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(src, destPath);
}

const villaDir = path.join(dir, 'photoHouse', 'Вилла');
const insideDir = path.join(dir, 'photoHouse', 'Комнаты - Внутри дома');

copyTo(path.join(dir, 'photoHouse', 'hero-cover.jpg'), SOURCES[0]);
copyTo(path.join(villaDir, `01${extOf(SOURCES[1])}`), SOURCES[1]);
copyTo(path.join(villaDir, `02${extOf(SOURCES[2])}`), SOURCES[2]);

const insideFiles = [];
for (let i = 0; i < 7; i += 1) {
  const src = SOURCES[3 + i];
  const name = `${String(i + 1).padStart(2, '0')}${extOf(src)}`;
  const rel = `photoHouse/Комнаты - Внутри дома/${name}`;
  copyTo(path.join(dir, rel), src);
  insideFiles.push({ path: rel, alt: 'Интерьер виллы Перевалово' });
}

const villaFiles = [
  { path: `photoHouse/Вилла/01${extOf(SOURCES[1])}`, alt: 'Вилла Перевалово снаружи' },
  { path: `photoHouse/Вилла/02${extOf(SOURCES[2])}`, alt: 'Вилла в сосновом лесу' },
];

function img(rel, alt) {
  return { image: `${rel}${v}`, alt };
}

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery = cfg.gallery || {};
cfg.gallery.hero = 'photoHouse/hero-cover.jpg';
cfg.gallery.cacheQuery = v;

cfg.albums = [
  {
    id: 'villa',
    manifestKey: 'villa',
    label: 'Вилла',
    folder: 'photoHouse/Вилла',
    files: villaFiles,
  },
  {
    id: 'inside',
    manifestKey: 'Комнаты - Внутри дома',
    label: 'Внутри',
    folder: 'photoHouse/Комнаты - Внутри дома',
    files: insideFiles,
  },
];

cfg.carousels = [
  { label: 'Вилла', items: villaFiles.map((f) => img(f.path, f.alt)) },
  { label: 'Комнаты', items: insideFiles.map((f) => img(f.path, f.alt)) },
];

function regenGallery(page, files) {
  const p = path.join(dir, page);
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  const galleryStart = html.indexOf('<div class="gallery gallery--portfolio">');
  if (galleryStart < 0) return;
  let items = '';
  for (const f of files) {
    const href = `../${f.path}${v}`;
    items += `<a class="g g--media" href="${href}"><img data-src="${href}" alt="${f.alt}" loading="lazy" decoding="async"></a>\n    `;
  }
  const sectionEnd = html.indexOf('</section>', galleryStart);
  const newGallery = `<div class="gallery gallery--portfolio">\n    ${items}  </div>`;
  html = html.slice(0, galleryStart) + newGallery + html.slice(sectionEnd);
  fs.writeFileSync(p, html, 'utf8');
}

regenGallery('services/komnaty.html', insideFiles);
regenGallery('services/territoriya.html', villaFiles);

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(/#house-albums">Дом<\/a>/g, '#house-albums">Вилла</a>');
index = index.replace(
  /href="photoHouse\/hero-cover\.jpg[^"]*"/g,
  `href="photoHouse/hero-cover.jpg${v}"`,
);
index = index.replace(
  /<div class="heroimg">[\s\S]*?<\/div>/,
  `<div class="heroimg"><img class="heroimg-photo" src="photoHouse/hero-cover.jpg${v}" alt="${cfg.hero.imageAlt}" width="1440" height="1920" fetchpriority="high" decoding="async"></div>`,
);
index = index.replace(
  /<p>Гостевой дом River home[\s\S]*?<\/p>\s*<div class="actions">/,
  `<p>${cfg.hero.paragraph}</p>\n      <div class="actions">`,
);
index = index.replace(
  /Внутри дома, купель с сауной и двор у реки — как это видят гости River home\./,
  'Вилла снаружи и интерьеры — бассейн, банкетный зал, сауна и комнаты для гостей.',
);

const villaBlock = `<article class="album-row" id="house-villa">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Вилла" data-href="services/territoriya.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[0].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Вилла</div>
        <h3 class="album-title"><span class="title-kino-line">Вилла</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Перевалово</span><span class="brand-stack__script">снаружи</span></span></h3>
        <p>Современная вилла в сосновом лесу: панорамные окна, терраса и просторная территория.</p>
        <div class="actions"><a class="button" href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

const insideBlock = `<article class="album-row album-row--flip" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[1].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Интерьер</div>
        <h3 class="album-title"><span class="title-kino-line">Комнаты</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">виллы</span></span></h3>
        <p>Гостиная, столовая, лестница и зоны отдыха — дизайнерская отделка и просторные комнаты.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

index = index.replace(/<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/, `<div class="album-list">\n    ${villaBlock}\n    ${insideBlock}\n  </div>\n</section>\n\n<section class="section" id="reviews">`);

fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

['services/komnaty.html', 'services/territoriya.html', 'services/kupel-sauna.html'].forEach((page) => {
  const p = path.join(dir, page);
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/#house-albums">Дом<\/a>/g, '#house-albums">Вилла</a>');
  fs.writeFileSync(p, html, 'utf8');
});

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('Villa Perevalovo: hero +', villaFiles.length, 'exterior +', insideFiles.length, 'interior photos');