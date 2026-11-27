import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

const slug = 'dom-otdyha-tyumen-grush';
const v = '?v=dom-otdyha-20261127';
const dir = siteDir(slug);

function img(rel, alt) {
  return { image: `${rel}${v}`, alt };
}

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery.hero = 'photoHouse/hero-cover.jpg';
cfg.pricing = { dailyRub: 12000, dailyNote: 'за сутки · базово до 6 гостей, уточняйте по телефону' };

cfg.albums = [
  {
    id: 'dom',
    manifestKey: 'dom',
    label: 'Дом',
    folder: 'photoHouse/Дом',
    files: ['01.jpg', '02.jpg'].map((f) => ({
      path: `photoHouse/Дом/${f}`,
      alt: 'Дом отдыха снаружи',
    })),
  },
  {
    id: 'inside',
    manifestKey: 'Комнаты - Внутри дома',
    label: 'Внутри',
    folder: 'photoHouse/Комнаты - Внутри дома',
    files: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg'].map((f) => ({
      path: `photoHouse/Комнаты - Внутри дома/${f}`,
      alt: 'Интерьер дома отдыха',
    })),
  },
  {
    id: 'bath',
    manifestKey: 'Санузел',
    label: 'Санузел',
    folder: 'photoHouse/Санузел',
    files: ['01.jpg', '02.jpg'].map((f) => ({
      path: `photoHouse/Санузел/${f}`,
      alt: 'Санузел',
    })),
  },
  {
    id: 'hall',
    manifestKey: 'Прихожая',
    label: 'Прихожая',
    folder: 'photoHouse/Прихожая',
    files: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'].map((f) => ({
      path: `photoHouse/Прихожая/${f}`,
      alt: 'Прихожая',
    })),
  },
];

cfg.carousels = [
  {
    label: 'Дом',
    items: cfg.albums[0].files.map((f) => img(f.path, f.alt)),
  },
  {
    label: 'Комнаты',
    items: cfg.albums[1].files.map((f) => img(f.path, f.alt)),
  },
  {
    label: 'Санузел',
    items: cfg.albums[2].files.map((f) => img(f.path, f.alt)),
  },
];

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<div class="heroimg">[\s\S]*?<\/div>/,
  `<div class="heroimg"><img class="heroimg-photo" src="photoHouse/hero-cover.jpg${v}" alt="${cfg.hero.imageAlt}" width="1440" height="1920" fetchpriority="high" decoding="async"></div>`,
);
index = index.replace(
  /Внутри дома, купель с сауной и двор у реки — как это видят гости River home\./,
  'Дом, интерьеры, санузел и прихожая — как в объявлении и на месте.',
);
index = index.replace(
  /<article class="album-row">\s*<div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Комнаты"[\s\S]*?<\/article>/,
  `<article class="album-row">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Дом" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[0].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Дом</div>
        <h3 class="album-title"><span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">отдыха</span><span class="brand-stack__script">снаружи</span></span></h3>
        <p>Двухэтажный дом в СНТ «Березняки» — Грушевая, 85. Баня и беседка на участке.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`,
);
index = index.replace(
  /data-label="Сауна и купель фурако" data-href="services\/kupel-sauna.html">[\s\S]*?<\/script>/,
  `data-label="Комнаты" data-href="services/komnaty.html">\n        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[1].items)}</script>`,
);
index = index.replace(
  /<div class="kicker">Отдых<\/div>\s*<h3 class="album-title">[\s\S]*?<p>Дровяная купель-чан[\s\S]*?<\/p>/,
  `<div class="kicker">Комнаты</div>
        <h3 class="album-title"><span class="title-kino-line">Комнаты</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">дома</span></span></h3>
        <p>Спальни, гостиная и кухня: дизайнерский ремонт, до 18 гостей.</p>`,
);
index = index.replace(
  /data-label="Территория у дома" data-href="services\/territoriya.html">[\s\S]*?<\/script>/,
  `data-label="Санузел" data-href="services/kupel-sauna.html">\n        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[2].items)}</script>`,
);
index = index.replace(
  /<div class="kicker">Территория<\/div>[\s\S]*?<p>Мангальная зона[\s\S]*?<\/p>/,
  `<div class="kicker">Санузел</div>
        <h3 class="album-title"><span class="title-kino-line">Санузел</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">и</span><span class="brand-stack__script">душ</span></span></h3>
        <p>Современная отделка, всё необходимое для комфортного проживания.</p>`,
);

index = index.replace(
  /«River home», д\. Тюмень · Березняки, Солнечная ул\., 14\.[^\n]*/,
  '«Дом отдыха», Тюмень, Грушевая 85. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram.',
);
index = index.replace(
  /<span>Сутки<\/span>\s*<b>от 1 суток<\/b>\s*<small>до 6 гостей · стоимость уточняйте по телефону<\/small>/,
  '<span>Сутки</span>\n          <b>12 000 ₽</b>\n          <small>за сутки · до 6 гостей в базовой цене, доп. гости по согласованию</small>',
);
index = index.replace(/data-max-guests="6"/, 'data-max-guests="18"');
index = index.replace(
  /https:\/\/2gis\.ru\/krasnoyarsk\/firm\/[^"]+/g,
  'https://2gis.ru/tyumen/firm/70000001099796514',
);
index = index.replace(
  /Сообщение уйдёт на \+7[^<]+/,
  'Сообщение уйдёт на +7 (982) 914-32-47 — номер из 2ГИС.',
);

fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

for (const page of ['services/komnaty.html', 'services/kupel-sauna.html', 'services/territoriya.html']) {
  const p = path.join(dir, page);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/https:\/\/2gis\.ru\/krasnoyarsk\/firm\/[^"]+/g, cfg.contacts.gisFirm);
  fs.writeFileSync(p, html, 'utf8');
}

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('Photos + price applied for', slug);