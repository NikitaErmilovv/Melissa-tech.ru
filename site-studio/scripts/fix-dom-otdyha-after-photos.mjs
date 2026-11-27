import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';
import { buildContactsJs } from '../lib/apply-river-home.mjs';

const slug = 'dom-otdyha-tyumen-grush';
const v = '?v=dom-otdyha-20261127';
const dir = siteDir(slug);
const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));

const tel = '+79829143247';
const display = '+7 (982) 914-32-47';
const heroText = cfg.hero.paragraph;
const gis = cfg.contacts.gisFirm;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(/tel:\+7[^"']+/g, `tel:${tel}`);
index = index.replace(/\+7 \(983\)[^<]+/g, display);
index = index.replace(/\+7 \(982\) 914-32-47/g, display);
index = index.replace(
  /<p>Гостевой дом River home[\s\S]*?<\/p>/,
  `<p>${heroText}</p>`,
);
index = index.replace(/Грушевая, 84\.9/g, 'Грушевая, 85');
index = index.replace(/Грушевая улица, 84\.9/g, 'Грушевая улица, 85');
index = index.replace('id="stat-reviews">4.96', 'id="stat-reviews">56');
index = index.replace(/https:\/\/2gis\.ru\/tyumen\/firm\/[^"]+/g, gis);
index = index.replace(/max="6" value="2"/, 'max="18" value="2"');
index = index.replace(
  /<p>«Дом отдыха», Тюмень, Грушевая 85\. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram\.\s*(?=<div class="booking-rates">)/,
  '<p>«Дом отдыха», Тюмень, Грушевая 85. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram.</p>\n      ',
);
index = index.replace(/href="services\/komnaty.html">СМОТРЕТЬ АЛЬБОМ<\/a><\/div>\s*<\/div>\s*<\/article>\s*<article class="album-row album-row--flip">/, (m) =>
  m.replace('services/komnaty.html', 'index.html#house-dom'),
);
index = index.replace(
  'href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ',
  'href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ',
);
index = index.replace(
  'href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ',
  'href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ',
);

const hallItems = cfg.albums
  .find((a) => a.id === 'hall')
  .files.map((f) => ({ image: `${f.path}${v}`, alt: f.alt }));
if (!index.includes('data-label="Прихожая"')) {
  const block = `
    <article class="album-row album-row--flip" id="house-hall">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Прихожая" data-href="services/territoriya.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(hallItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Прихожая</div>
        <h3 class="album-title"><span class="title-kino-line">Прихожая</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">и</span><span class="brand-stack__script">зона входа</span></span></h3>
        <p>Светлое пространство с лестницей и удобной планировкой.</p>
        <div class="actions"><a class="button" href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;
  index = index.replace(/<\/div>\s*<\/section>\s*<section class="section" id="reviews">/, `${block}\n  </div>\n</section>\n\n<section class="section" id="reviews">`);
}

fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');
fs.writeFileSync(path.join(dir, 'contacts-config.js'), buildContactsJs(cfg), 'utf8');

function regenGallery(page, folder, count, prefix, alts) {
  const p = path.join(dir, page);
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  const galleryStart = html.indexOf('<div class="gallery gallery--portfolio">');
  if (galleryStart < 0) return;
  let items = '';
  for (let i = 1; i <= count; i++) {
    const rel = `../photoHouse/${folder}/${String(i).padStart(2, '0')}.jpg`;
    const alt = alts[i - 1] || '';
    items += `<a class="g g--media" href="${rel}${v}"><img data-src="${rel}${v}" alt="${alt}" loading="lazy" decoding="async"></a>\n    `;
  }
  const closeIdx = html.indexOf('</div>', galleryStart);
  const sectionEnd = html.indexOf('</section>', galleryStart);
  const newGallery = `<div class="gallery gallery--portfolio">\n    ${items}  </div>`;
  html = html.slice(0, galleryStart) + newGallery + html.slice(sectionEnd);
  html = html.replace(/tel:\+7[^"']+/g, `tel:${tel}`);
  html = html.replace(/\+7 \(983\)[^<]+/g, display);
  fs.writeFileSync(p, html, 'utf8');
}

regenGallery('services/komnaty.html', 'Комнаты - Внутри дома', 7, 'inside', ['Интерьер', 'Спальня', 'Гостиная', 'Интерьер', 'Интерьер', 'Спальня', 'Кухня']);
regenGallery('services/kupel-sauna.html', 'Санузел', 2, 'bath', ['Санузел', 'Санузел']);
regenGallery('services/territoriya.html', 'Прихожая', 4, 'hall', ['Прихожая', 'Прихожая', 'Прихожая', 'Прихожая']);

// dom exterior album on territoriya or komnaty - patch komnaty hero to link dom - actually create dom in territoriya first 2 images - user wanted dom block - gallery on separate page - add to about or leave on index only

const domPage = path.join(dir, 'services/komnaty.html');
let kh = fs.readFileSync(domPage, 'utf8');
kh = kh.replace('<div class="kicker">Комнаты</div>', '<div class="kicker">Внутри</div>');
fs.writeFileSync(domPage, kh, 'utf8');

console.log('Fixed dom-otdyha phones, hero, прихожая, service galleries');