import fs from 'node:fs';
import path from 'node:path';
import { importSiteConfig, writeSiteConfig } from '../lib/import-site.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const SOURCE = 'dom-otdyha-tyumen-grush';

function digits10(phone) {
  const d = String(phone).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('8')) return `7${d.slice(1)}`;
  if (d.length === 11 && d.startsWith('7')) return d;
  if (d.length === 10) return `7${d}`;
  return d;
}

function toTel(raw) {
  const d = digits10(raw);
  return d ? `+${d}` : raw;
}

function toWa(raw) {
  return digits10(raw);
}

function bookingIntro(display, addressLine) {
  return `«${display}», ${addressLine}. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram.`;
}

const ORGS = [
  {
    slug: 'nashe-mesto-tyumen',
    firmId: '70000001088086404',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001088086404',
    mapLat: 57.241931,
    mapLon: 65.078587,
    brand: {
      kino: 'НАШЕ МЕСТО',
      navStack: 'НАШЕ МЕСТО',
      displayPlain: 'Наше Место',
      eyebrowCity: 'с. Кулига',
    },
  phone: '89224766947',
    addressLine: 'Тюменская область, с. Кулига, Заречная улица, 39',
    hoursLine: 'Круглосуточно · бронь по телефону',
    stats: { mode: '24–7', reviewsCount: '88', rating: '5' },
    heroParagraph:
      'Коттедж «Наше Место» в с. Кулига, Заречная улица, 39 — загородный дом для отдыха компанией и семьёй. Двухэтажный дом, круглосуточное бронирование.',
  },
  {
    slug: 'molly-house-tyumen',
    firmId: '70000001098073484',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001098073484',
    mapLat: 57.112469,
    mapLon: 66.044119,
    brand: {
      kino: 'МОЛЛИ ХАУС',
      navStack: 'МОЛЛИ ХАУС',
      displayPlain: 'Молли Хаус',
      eyebrowCity: 'д. Якуши',
    },
    phone: '89224850171',
    addressLine: 'Тюменская область, д. Якуши, Шахматная улица, 38 (Атлетик village)',
    hoursLine: 'Круглосуточно · по предварительной записи',
    stats: { mode: '24–7', reviewsCount: '51', rating: '5' },
    heroParagraph:
      'Гостевой дом «Молли Хаус» в д. Якуши: уютный дом для выходных и мероприятий. Круглосуточно, запись по телефону или в мессенджерах.',
  },
  {
    slug: 'tishiny-hochu-tyumen',
    firmId: '70000001105078811',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001105078811',
    mapLat: 57.472056,
    mapLon: 65.385073,
    brand: {
      kino: 'ТИШИНЫ ХОЧУ',
      navStack: 'ТИШИНЫ ХОЧУ',
      displayPlain: 'Тишины хочу',
      eyebrowCity: 'д. Новопокровка',
    },
    phone: '89829004275',
    addressLine: 'Тюменская область, д. Новопокровка, Лесная улица, 18',
    hoursLine: 'Круглосуточно · бронь по телефону',
    stats: { mode: '24–7', reviewsCount: '25', rating: '5' },
    heroParagraph:
      'Загородный дом «Тишины хочу» в д. Новопокровка — спокойный отдых вдали от городской суеты. Лесная улица, 18, круглосуточно.',
  },
  {
    slug: 'abazhur-tyumen',
    firmId: '70000001097247474',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001097247474',
    mapLat: 57.091379,
    mapLon: 65.537821,
    brand: {
      kino: 'АБАЖУР',
      navStack: 'АБАЖУР',
      displayPlain: 'Абажур',
      eyebrowCity: 'д. Патрушева',
    },
    phone: '89829825404',
    phoneExtra: '83452388001',
    phoneExtraDisplay: '+7 (3452) 38-80-01',
    addressLine: 'Тюменская область, д. Патрушева, 1-й Трактовый переулок, 12',
    hoursLine: 'Круглосуточно · бронь по телефону',
    stats: { mode: '24–7', reviewsCount: '50', rating: '5' },
    heroParagraph:
      'Гостевой дом «Абажур» в д. Патрушева: просторный дом на три этажа для отдыха и праздников. Круглосуточное бронирование.',
  },
  {
    slug: 'dom-uyuta-365-tyumen',
    firmId: '70000001095569219',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001095569219',
    mapLat: 57.121389,
    mapLon: 65.375042,
    brand: {
      kino: 'ДОМ УЮТА 365',
      navStack: 'ДОМ УЮТА 365',
      displayPlain: 'Дом Уюта 365',
      eyebrowCity: 'Тюмень · Ёлочка',
    },
    phone: '89920874656',
    addressLine: 'Тюмень, Урожайная улица, 7 (Ёлочка, Калининский округ)',
    hoursLine: 'Круглосуточно · баня и отдых',
    stats: { mode: '24–7', reviewsCount: '69', rating: '4.9' },
    heroParagraph:
      '«Дом Уюта 365» на Урожайной, 7 в Тюмени — дом для отдыха и банный комплекс. Круглосуточно, звоните или пишите для брони.',
  },
  {
    slug: 'dom-vyhodnogo-dnya',
    firmId: '70000001101724624',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001101724624',
    mapLat: 57.16964,
    mapLon: 66.057175,
    brand: {
      kino: 'ДОМ ВЫХОДНОГО ДНЯ',
      navStack: 'ДОМ ВЫХОДНОГО ДНЯ',
      displayPlain: 'Дом выходного дня',
      eyebrowCity: 'с. Борки',
    },
    phone: '89322003553',
    addressLine: 'Тюменская область, с. Борки, Береговая улица, 6',
    hoursLine: 'Круглосуточно · по предварительной записи',
    stats: { mode: '24–7', reviewsCount: '102', rating: '4.8' },
    heroParagraph:
      'Гостевой дом «Дом выходного дня» в с. Борки, Береговая улица, 6 — двухэтажный дом для семейного и большого отдыха. Круглосуточно по записи.',
  },
  {
    slug: 'sun-village-tyumen',
    firmId: '70000001095630775',
    gisFirm: 'https://2gis.ru/tyumen/firm/70000001095630775',
    mapLat: 57.12501,
    mapLon: 66.033431,
    brand: {
      kino: 'SUN VILLAGE',
      navStack: 'SUN VILLAGE',
      displayPlain: 'Sun Village',
      eyebrowCity: 'д. Якуши',
    },
    phone: '89224486686',
    addressLine: 'Тюменская область, д. Якуши, Солнечная улица, 44 (пос. Солнечный день-1)',
    hoursLine: 'Круглосуточно · по предварительной записи',
    stats: { mode: '24–7', reviewsCount: '29', rating: '4.1' },
    heroParagraph:
      'Sun Village в д. Якуши — коттедж на Солнечной, 44 для отдыха у воды и на природе. Бронирование круглосуточно по записи.',
  },
];

function ensureClone(slug) {
  const target = siteDir(slug);
  if (fs.existsSync(target)) return;
  const src = siteDir(SOURCE);
  if (!fs.existsSync(src)) throw new Error(`Нет эталона ${SOURCE}`);
  fs.cpSync(src, target, {
    recursive: true,
    filter: (srcPath) => {
      const base = path.basename(srcPath);
      if (base === 'site.config.json') return false;
      if (srcPath.includes(`${path.sep}node_modules${path.sep}`)) return false;
      return true;
    },
  });
}

const OLD_BOOKING =
  '«Дом отдыха», Тюмень, Грушевая 84.9. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram.';
const OLD_PRICE = '12 000 ₽';
const OLD_PRICE_NOTE = 'за сутки · до 6 гостей в базовой цене, доп. гости по согласованию';
const NEW_PRICE = 'По запросу';
const NEW_PRICE_NOTE = 'стоимость и число гостей — уточняйте по телефону';

for (const org of ORGS) {
  ensureClone(org.slug);
  let cfg = importSiteConfig(org.slug);
  const tel = toTel(org.phone);
  const display = org.brand.displayPlain;
  const heroAlt = `${display}, ${org.addressLine.split(',').slice(-2).join(',').trim()}`;

  cfg.slug = org.slug;
  cfg.templateId = 'river-home';
  cfg.brand = { ...cfg.brand, ...org.brand };
  cfg.seo = {
    title: `${display} — гостевой дом`,
    titleAuto: false,
  };
  cfg.contacts = {
    ...cfg.contacts,
    addressLine: org.addressLine,
    hoursLine: org.hoursLine,
    mapLat: org.mapLat,
    mapLon: org.mapLon,
    gisFirm: org.gisFirm,
    firmId: org.firmId,
    email: '',
    phones: org.phoneExtra
      ? [
          {
            label: 'Городской',
            name: '',
            tel: toTel(org.phoneExtra),
            display: org.phoneExtraDisplay,
          },
          { label: 'Бронирование', name: '', tel, display: '' },
        ]
      : [{ label: 'Бронирование', name: '', tel, display: '' }],
  };
  cfg.nav = { phoneTel: tel, phoneDisplay: '' };
  cfg.messengers = {
    wa: toWa(org.phone),
    tg: tel,
    defaultMessage: `Здравствуйте! Хочу забронировать ${display}.`,
    messageAuto: false,
  };
  cfg.hero = { paragraph: org.heroParagraph, imageAlt: heroAlt };
  cfg.stats = org.stats;
  cfg.gallery = {
    ...cfg.gallery,
    hero: 'photoHouse/hero-cover.jpg',
    cacheQuery: `?v=${org.slug}-studio`,
  };
  const prevCfgPath = siteConfigPath(org.slug);
  const prevReviews =
    fs.existsSync(prevCfgPath) &&
    JSON.parse(fs.readFileSync(prevCfgPath, 'utf8')).reviews?.items?.length
      ? JSON.parse(fs.readFileSync(prevCfgPath, 'utf8')).reviews
      : null;
  cfg.reviews = prevReviews || {
    meta: {
      source: '2GIS snapshot (static, no live fetch)',
      firmId: org.firmId,
      snapshotAt: new Date().toISOString().slice(0, 10),
      rating: Number(org.stats.rating),
      ratingsCount: Number(org.stats.reviewsCount),
      carouselCount: 0,
    },
    items: [],
  };
  cfg.studio = {
    managed: true,
    createdAt: new Date().toISOString(),
    fromTemplate: `clone:${SOURCE}`,
  };
  cfg.pricing = { dailyRub: null, dailyNote: NEW_PRICE_NOTE };

  const q = cfg.gallery.cacheQuery;
  for (const album of cfg.albums || []) {
    for (const f of album.files || []) {
      f.alt = `${album.label || 'Фото'} — ${display}`;
      if (f.path && f.path.includes('dom-otdyha')) {
        f.path = f.path.replace(/\?v=[^"]*/g, '').replace(/dom-otdyha-\d+/g, `${org.slug}-ph`);
        if (!f.path.includes('?')) f.path += q;
      }
    }
  }
  for (const block of cfg.carousels || []) {
    for (const it of block.items || []) {
      it.alt = `${block.label} — ${display}`;
      if (it.image) {
        it.image = it.image
          .replace(/dom-otdyha[^"\\]*/g, `${org.slug}-studio`)
          .replace(/\?v=dom-otdyha[^"\\]*/g, q);
        if (!String(it.image).includes('?')) it.image += q;
      }
    }
  }

  const intro = bookingIntro(display, org.addressLine);
  cfg.sync = cfg.sync || { lastPairs: [], snapshot: {} };
  cfg.sync.lastPairs = [
    ...(cfg.sync.lastPairs || []),
    [OLD_BOOKING, intro],
    [OLD_PRICE, NEW_PRICE],
    [OLD_PRICE_NOTE, NEW_PRICE_NOTE],
    [
      'Сообщение уйдёт на +7 (982) 914-32-47 — номер из 2ГИС.',
      `Сообщение уйдёт на ${cfg.nav.phoneDisplay || tel} — номер из 2ГИС.`,
    ],
    ['Ждём вас: Тюмень, Грушевая улица, 85 (СНТ Березняки).', `Ждём вас: ${org.addressLine}.`],
  ];

  applySiteConfig(cfg);
  writeSiteConfig(org.slug, cfg);
  console.log('OK', org.slug);
}

console.log('Done', ORGS.length, 'drafts');