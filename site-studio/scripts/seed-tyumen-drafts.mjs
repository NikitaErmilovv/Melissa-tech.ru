import fs from 'node:fs';
import { createDraftFromTemplate, importSiteConfig, writeSiteConfig } from '../lib/import-site.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const sites = [
  {
    slug: 'dom-otdyha-tyumen-grush',
    brand: {
      kino: 'ДОМ ОТДЫХА',
      navStack: 'ДОМ ОТДЫХА',
      displayPlain: 'Дом отдыха',
      eyebrowCity: 'Тюмень · Березняки',
    },
    seo: { title: 'Дом отдыха — коттедж, Грушевая 85, Тюмень' },
    contacts: {
      addressLine: 'Тюмень, Грушевая улица, 85 (СНТ Березняки)',
      hoursLine: 'Круглосуточно · бронь по телефону',
      mapLat: 57.22952,
      mapLon: 65.498152,
      gisFirm: 'https://2gis.ru/tyumen/firm/70000001099796514',
      email: '',
      firmId: '70000001099796514',
    },
    nav: { phoneTel: '+79829143247', phoneDisplay: '+7 (982) 914-32-47' },
    messengers: {
      wa: '79829143247',
      tg: '+79829143247',
      defaultMessage:
        'Здравствуйте! Хочу забронировать Дом отдыха на Грушевой, 85 (Тюмень).',
    },
    hero: {
      paragraph:
        'Двухэтажный дом отдыха в СНТ «Березняки»: около 160 м², до 18 гостей, дизайнерский ремонт, терраса с панорамным остеклением. На участке — русская баня на дровах и мангальная беседка. В черте города, около 10 км от центра Тюмени. Бронирование круглосуточно.',
      imageAlt: 'Дом отдыха, Грушевая улица, 85, Тюмень',
    },
    stats: { mode: '24–7', reviewsCount: '56', rating: '4.9' },
  },
  {
    slug: 'villa-perevalovo',
    brand: {
      kino: 'ВИЛЛА ПЕРЕВАЛОВО',
      navStack: 'ВИЛЛА',
      displayPlain: 'Вилла Перевалово',
      eyebrowCity: 'с. Перевалово',
    },
    seo: { title: 'Вилла Перевалово — гостевой дом, Сосновая 22' },
    contacts: {
      addressLine: 'Тюменская область, с. Перевалово, Сосновая улица, 22',
      hoursLine: 'Ежедневно 10:00–21:00 · по записи',
      mapLat: 57.084766,
      mapLon: 65.205475,
      gisFirm: 'https://2gis.ru/tyumen/firm/70000001093571752',
      email: '',
      firmId: '70000001093571752',
    },
    nav: { phoneTel: '+79199515839', phoneDisplay: '+7 (919) 951-58-39' },
    messengers: {
      wa: '79199515839',
      tg: '+79199515839',
      defaultMessage: 'Здравствуйте! Хочу забронировать Виллу Перевалово (Сосновая, 22).',
    },
    hero: {
      paragraph:
        'Гостевой дом «Вилла Перевалово» в лесном массиве: просторная вилла для отдыха и мероприятий, баня и сауна, бассейн, беседки. Сосновая улица, 22 — Тюменский район. Звоните или пишите — подберём дату.',
      imageAlt: 'Вилла Перевалово, гостевой дом, с. Перевалово',
    },
    stats: { mode: '10–21', reviewsCount: '57', rating: '5' },
  },
];

function ensureDraft(slug) {
  if (fs.existsSync(siteConfigPath(slug))) return JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
  createDraftFromTemplate({ slug, templateId: 'river-home' });
  return JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
}

for (const spec of sites) {
  let cfg = ensureDraft(spec.slug);
  const imported = importSiteConfig(spec.slug);
  cfg.sync = cfg.sync || imported.sync;
  if (!cfg.sync?.snapshot || !cfg.sync.snapshot.title) {
    cfg.sync.snapshot = imported.sync?.snapshot || {};
  }
  Object.assign(cfg.brand, spec.brand);
  cfg.seo = spec.seo;
  cfg.contacts = { ...cfg.contacts, ...spec.contacts };
  cfg.nav = spec.nav;
  cfg.messengers = spec.messengers;
  cfg.hero = spec.hero;
  cfg.stats = spec.stats;
  cfg.contacts.phones = [
    {
      label: 'Бронирование',
      name: '',
      tel: spec.nav.phoneTel,
      display: spec.nav.phoneDisplay,
    },
  ];
  cfg.reviews = cfg.reviews || imported.reviews;
  cfg.reviews.meta = {
    ...cfg.reviews.meta,
    firmId: spec.contacts.firmId,
    snapshotAt: new Date().toISOString().slice(0, 10),
    rating: Number(spec.stats.rating),
    ratingsCount: Number(spec.stats.reviewsCount),
    source: '2GIS snapshot (studio seed)',
  };
  cfg.studio = cfg.studio || { managed: true };
  cfg.templateId = 'river-home';
  cfg.slug = spec.slug;
  applySiteConfig(cfg);
  writeSiteConfig(spec.slug, cfg);
  console.log('OK draft', spec.slug, '->', siteDir(spec.slug));
}