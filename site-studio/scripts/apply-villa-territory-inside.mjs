import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath, REPO_ROOT } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

const slug = 'villa-perevalovo';
const v = '?v=villa-terr-inside-20261127';
const dir = siteDir(slug);
const assets = 'C:/Users/Никита/.cursor/projects/c-Users-Melissa-tech-ru/assets';

const TERR1 = `${assets}/image-4de50678-0bb1-46af-bc07-b6647a53e75d.jpg`;
const TERR2 = `${assets}/image-49d32a55-f1f8-4188-b7ff-b85ca1478229.jpg`;
const IN3 = `${assets}/image-4db8c619-175e-46cc-86f1-a1d4457c97cf.jpg`;
const IN4 = `${assets}/image-34d618ef-8a4d-44a8-9071-fdbda38be47b.jpg`;
const IN5 = `${assets}/image-934ed736-60e1-41bc-aca8-d2db10b95b7a.jpg`;

const insideDir = path.join(dir, 'photoHouse/Комнаты - Внутри дома');
const terrDir = path.join(dir, 'photoHouse/Территория у дома');

function extOf(file) {
  return path.extname(file).toLowerCase() || '.jpg';
}

function copyTo(dest, src) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const oldInside = ['01.jpg', '02.jpg', '03.jpg', '04.png', '05.png', '06.png', '07.png']
  .map((name) => path.join(insideDir, name))
  .filter((p) => fs.existsSync(p));

const insideSeq = [IN3, IN4, ...oldInside.map((p) => p), IN5];
const staging = path.join(dir, 'photoHouse/.staging-inside');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

const insideFiles = insideSeq.map((src, i) => {
  const num = String(i + 1).padStart(2, '0');
  const ext = extOf(src);
  const staged = path.join(staging, `${num}${ext}`);
  copyTo(staged, src);
  return { staged, num, ext };
});

fs.rmSync(insideDir, { recursive: true, force: true });
fs.mkdirSync(insideDir, { recursive: true });
const insideMeta = insideFiles.map(({ staged, num, ext }) => {
  const rel = `photoHouse/Комнаты - Внутри дома/${num}${ext}`;
  const dest = path.join(dir, rel);
  fs.copyFileSync(staged, dest);
  const alt =
    num === '01'
      ? 'Лестница с подсветкой'
      : num === '02'
        ? 'Кухня и столовая'
        : num === String(insideFiles.length).padStart(2, '0')
          ? 'Коридор и прихожая'
          : 'Интерьер виллы Перевалово';
  return { path: rel, alt };
});
fs.rmSync(staging, { recursive: true, force: true });

fs.rmSync(terrDir, { recursive: true, force: true });
fs.mkdirSync(terrDir, { recursive: true });
const terrMeta = [
  { src: TERR1, alt: 'Территория виллы вечером' },
  { src: TERR2, alt: 'Участок и подсветка у дома' },
].map((row, i) => {
  const num = String(i + 1).padStart(2, '0');
  const rel = `photoHouse/Территория у дома/${num}${extOf(row.src)}`;
  copyTo(path.join(dir, rel), row.src);
  return { path: rel, alt: row.alt };
});

function img(f) {
  return { image: `${f.path}${v}`, alt: f.alt };
}

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
const villaAlbum = cfg.albums.find((a) => a.id === 'villa');
const sanuzelAlbum = cfg.albums.find((a) => a.id === 'sanuzel');
const dosugAlbum = cfg.albums.find((a) => a.id === 'dosug');

cfg.albums = [
  villaAlbum,
  {
    id: 'territory',
    manifestKey: 'Территория у дома',
    label: 'Территория у дома',
    folder: 'photoHouse/Территория у дома',
    files: terrMeta,
  },
  {
    id: 'inside',
    manifestKey: 'Комнаты - Внутри дома',
    label: 'Внутри',
    folder: 'photoHouse/Комнаты - Внутри дома',
    files: insideMeta,
  },
  sanuzelAlbum,
  dosugAlbum,
].filter(Boolean);

cfg.carousels = [
  { label: 'Вилла', items: villaAlbum.files.map((f) => img(f)) },
  { label: 'Территория у дома', items: terrMeta.map(img) },
  { label: 'Комнаты', items: insideMeta.map(img) },
  { label: 'Санузел', items: sanuzelAlbum.files.map((f) => img(f)) },
  { label: 'Досуг', items: dosugAlbum.files.map((f) => img(f)) },
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
  html =
    html.slice(0, galleryStart) +
    `<div class="gallery gallery--portfolio">\n    ${items}  </div>\n` +
    html.slice(sectionEnd);
  fs.writeFileSync(p, html, 'utf8');
}

let terrPage = fs.readFileSync(path.join(dir, 'services/territoriya.html'), 'utf8');
terrPage = terrPage.replace(
  /<section class="subpage-hero[\s\S]*?<\/section>/,
  `<section class="subpage-hero subpage-hero--service subpage-hero--territory-album">
  <div class="kicker">Территория</div>
  <h1 class="album-title album-title--subpage"><span class="brand-stack brand-stack--section"><span class="brand-stack__base">У дома</span><span class="brand-stack__script">во дворе</span></span></h1>
  <p>Вечерняя подсветка, газон, дорожки и отдых на участке в сосновом лесу.</p>
</section>`,
);
fs.writeFileSync(path.join(dir, 'services/territoriya.html'), terrPage, 'utf8');
regenGallery('services/territoriya.html', terrMeta);
regenGallery('services/komnaty.html', insideMeta);

const territoryBlock = `<article class="album-row album-row--flip" id="house-territory">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Территория у дома" data-href="services/territoriya.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[1].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Территория</div>
        <h3 class="album-title"><span class="brand-stack brand-stack--section"><span class="brand-stack__base">У дома</span><span class="brand-stack__script">во дворе</span></span></h3>
        <p>Подсветка фасада, газон, дорожки и место для отдыха на свежем воздухе.</p>
        <div class="actions"><a class="button" href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

const insideBlock = `<article class="album-row album-row--flip" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[2].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Интерьер</div>
        <h3 class="album-title"><span class="title-kino-line">Комнаты</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">виллы</span></span></h3>
        <p>Гостиная, столовая, лестница и зоны отдыха — дизайнерская отделка и просторные комнаты.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(/<article class="album-row(?: album-row--flip)?" id="house-territory">[\s\S]*?<\/article>\s*/g, '');
index = index.replace(
  /(<article class="album-row" id="house-villa">[\s\S]*?<\/article>)\s*/,
  `$1\n    ${territoryBlock}\n    `,
);
index = index.replace(
  /<article class="album-row album-row--flip" id="house-inside">[\s\S]*?<\/article>/,
  insideBlock,
);

// villa cache bust on index carousel
index = index.replace(
  /"photoHouse\/Вилла\/[^"]+\?v=[^"]+"/g,
  (m) => m.replace(/\?v=[^"]+/, v),
);
const villaItems = JSON.stringify(cfg.carousels[0].items);
index = index.replace(
  /data-label="Вилла"[\s\S]*?<\/script>/,
  `data-label="Вилла" data-href="services/territoriya.html">\n        <script type="application/json" class="depth-carousel__items">${villaItems}</script>`,
);

const sanuzelItems = JSON.stringify(cfg.carousels[3].items);
index = index.replace(
  /id="house-sanuzel">[\s\S]*?<\/script>/,
  (block) =>
    block.replace(
      /<script type="application\/json" class="depth-carousel__items">[\s\S]*?<\/script>/,
      `<script type="application/json" class="depth-carousel__items">${sanuzelItems}</script>`,
    ),
);

const dosugItems = JSON.stringify(cfg.carousels[4].items);
index = index.replace(
  /id="house-dosug">[\s\S]*?<\/script>/,
  (block) =>
    block.replace(
      /<script type="application\/json" class="depth-carousel__items">[\s\S]*?<\/script>/,
      `<script type="application/json" class="depth-carousel__items">${dosugItems}</script>`,
    ),
);

fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs
    .readFileSync(path.join(REPO_ROOT, 'river-home-terentievo', 'album-more.js'), 'utf8')
    .replace(
      /var ALBUMS = \[[\s\S]*?\];/,
      `var ALBUMS = [
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'Во дворе',
      lead: 'Подсветка и участок',
      preview: '../photoHouse/Территория у дома/01.jpg${v}',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Интерьер',
      lead: 'Кухня, лестница, гостиные',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg${v}',
    },
    {
      id: 'sanuzel',
      href: 'sanuzel.html',
      title: 'Санузел',
      kicker: 'Ванная',
      lead: 'Душевая и отделка',
      preview: '../photoHouse/Санузел/02.jpg?v=villa-sanuzel-20261127',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Досуг',
      kicker: 'На вилле',
      lead: 'Бассейн, бильярд и детская',
      preview: '../photoHouse/Досуг/01-basseyn.jpg?v=villa-dosug-20261127',
    },
  ];`,
    ),
  'utf8',
);

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('Territory:', terrMeta.length, '| Inside:', insideMeta.length, '(3–4 first, 5 last)');