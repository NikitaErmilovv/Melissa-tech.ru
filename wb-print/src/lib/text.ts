import { intakeLink } from "./intake-link";
import type { Order, ProductKind, TemplateKey, Templates } from "./types";

const ONES_F = ["", "одну", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

function spellFeminine(count: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(count / 100);
  const rest = count % 100;
  if (hundreds) parts.push(HUNDREDS[hundreds]);
  if (rest >= 10 && rest <= 19) parts.push(TEENS[rest - 10]);
  else {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    if (tens) parts.push(TENS[tens]);
    if (ones) parts.push(ONES_F[ones]);
  }
  return parts.join(" ");
}

export function photoPhrase(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    mod10 === 1 && mod100 !== 11 ? "фотографию" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "фотографии" : "фотографий";
  return `${spellFeminine(count)} ${word}`;
}

export function countPhrase(count: number, kind: ProductKind = "photo"): string {
  if (kind === "sticker") return photoPhrase(count);
  return `${count} фото`;
}

export const TEMPLATE_META: { key: TemplateKey; title: string; hint: string }[] = [
  {
    key: "greeting",
    title: "Первое сообщение, фото",
    hint: "Покупатель грузит фото на сайте. {{order}} {{article}} {{needText}} {{uploadLink}}",
  },
  {
    key: "greetingSticker",
    title: "Первое сообщение, стикеры",
    hint: "Без ссылки. Просим квадрат. {{needText}} — «шесть фотографий», {{which}} — «которые» или «которую».",
  },
  {
    key: "askPhotos",
    title: "Просьба прислать фото",
    hint: "Если покупатель отвечает «фото» или «стикеры». {{order}} {{needText}}",
  },
  {
    key: "askLink",
    title: "Просьба прислать ссылку",
    hint: "Если выбирает диск. Напомните, что ссылка должна быть открытой. {{order}}",
  },
  {
    key: "diskSaved",
    title: "Ссылка получена",
    hint: "Только для фото. {{order}}",
  },
  {
    key: "stickerNoLink",
    title: "Стикерам ссылка не нужна",
    hint: "Если для стикеров прислали диск. {{order}}",
  },
  {
    key: "progress",
    title: "Первая пачка фото",
    hint: "Сразу после первых файлов. Дальше бот молчит и напоминает по таймеру. {{order}} {{got}} {{need}} {{leftText}}",
  },
  {
    key: "reminder",
    title: "Напоминание",
    hint: "Пока макетов или фото не все: после паузы и затем каждые несколько минут. {{order}} {{got}} {{need}} {{leftText}}",
  },
  {
    key: "complete",
    title: "Фотографии приняты",
    hint: "Когда набор полный. Пишем, что приняты, и что замена — слово «замена» в течение 30 минут. {{order}} {{acceptedLine}}",
  },
  {
    key: "replaceAsk",
    title: "Жду замену",
    hint: "После слова «замена», если полчаса ещё не прошли. {{order}} {{needText}}",
  },
  {
    key: "replaceLocked",
    title: "Новые фото без слова «замена»",
    hint: "Набор уже принят, слово ещё не написали, полчаса не вышли. {{order}}",
  },
  {
    key: "replaceClosed",
    title: "Время замены вышло",
    hint: "Прошло больше 30 минут. {{order}}",
  },
  {
    key: "unknownArticle",
    title: "Артикул ещё не заведён",
    hint: "Если для nmId или артикула нет правила. {{order}} {{article}}",
  },
  {
    key: "siteOnly",
    title: "Фото только на сайте",
    hint: "Если покупатель шлёт файл или ссылку в чат WB. {{order}} {{uploadLink}}",
  },
];

export const DEFAULT_TEMPLATES: Templates = {
  greeting: `Здравствуйте! Заказ Wildberries №{{order}} — «{{article}}».
Нужно {{needText}}.

Пришлите, пожалуйста, фотографии на нашем сайте по вашей ссылке (номер заказа уже подставлен):
{{uploadLink}}`,
  askPhotos: `Заказ №{{order}}. Жду {{needText}} — загрузите на сайте: {{uploadLink}}`,
  askLink: `Заказ №{{order}}. Жду {{needText}} — загрузите фото на сайте: {{uploadLink}}`,
  diskSaved: `Заказ №{{order}}. Файлы с сайта получил.`,
  greetingSticker: `Здравствуйте! Заказ Wildberries №{{order}} — «{{article}}».

Нужно {{needText}}. Пришлите, пожалуйста, {{which}} хотели бы напечатать, на сайте:
{{uploadLink}}

Лучше сразу квадратные. Если фотография будет не квадратной, обрежу квадрат с левого верхнего угла.`,
  stickerNoLink: `Заказ №{{order}}. Фото только на сайте, не в чат: {{uploadLink}}`,
  progress: `Заказ №{{order}}. Принял {{got}} из {{need}}. Ещё нужно {{leftText}}. Догрузить: {{uploadLink}}`,
  reminder: `Заказ №{{order}}: уже {{got}} из {{need}}. Не хватает {{leftText}}.

Ссылка для загрузки:
{{uploadLink}}`,
  complete: `Заказ №{{order}}. Всё в порядке, всё принято ({{got}} из {{need}}). {{acceptedLine}}

Замена в течение 30 минут: напишите «замена» и пришлите файлы заново.`,
  replaceAsk: `Заказ №{{order}}. Прежние фотографии убрал. Загрузите заново {{needText}} на сайте: {{uploadLink}}{{squareLine}}`,
  replaceLocked: `Заказ №{{order}}. Фотографии уже приняты. Чтобы заменить их, в течение 30 минут напишите «замена», затем загрузите новые на сайте: {{uploadLink}}`,
  replaceClosed: `Заказ №{{order}}. Фотографии уже в печати. Время на замену вышло, новые файлы не принимаю.`,
  unknownArticle: `Заказ №{{order}} вижу. Артикул «{{article}}» ещё не заведён, поэтому точное число файлов не знаю. Напишите числом, сколько нужно, или дождитесь, пока мы уточним.`,
  siteOnly: `Заказ №{{order}}. Фото в чат не принимаем — загрузите на сайте: {{uploadLink}}`,
};

const STOCK_TEMPLATES: Partial<Record<TemplateKey, string[]>> = {
  complete: [
    `Все {{need}} фото по заказу №{{order}} на месте. Передаём в печать.`,
    `Все {{needText}} по заказу №{{order}} на месте. Можно печатать.`,
  ],
  greetingSticker: [
    `Здравствуйте! Заказ Wildberries №{{order}} — «{{article}}».

Пришлите, пожалуйста, {{needText}}, {{which}} хотели бы напечатать.`,
  ],
  stickerNoLink: [`Заказ №{{order}}. Для стикеров ссылку не принимаю. Пришлите фотографии прямо в этот чат.`],
  replaceAsk: [`Заказ №{{order}}. Прежние фотографии убрал. Пришлите заново {{needText}}.`],
};

/** Сохранённые в БД тексты с этими маркерами сбрасываются на DEFAULT при чтении. */
const LEGACY_TEMPLATE_MARKERS: Partial<Record<TemplateKey, RegExp[]>> = {
  greeting: [
    /Как пришл/i,
    /Напишите «фото»/i,
    /Напишите «ссылка»/i,
    /Яндекс/i,
    /Google/i,
    /Пришлите фотографии прямо в этот чат/i,
    /в этот чат или ссылкой на диск/i,
    /Загрузите, пожалуйста, фото на нашем сайте по вашей ссылке/i,
  ],
  askPhotos: [/Яндекс/i, /Google/i, /несколькими сообщениями: каждое фото/i],
  askLink: [/Яндекс/i, /Google/i],
  diskSaved: [/Яндекс/i, /Google/i, /Ссылку записал/i],
};

const PREVIOUS_TEMPLATES: Partial<Templates> = {
  greeting: `Здравствуйте! Заказ Wildberries №{{order}} — «{{article}}».
Нужно {{count}} фото.

Как пришлёте файлы?
Напишите «фото» — прямо в этот чат, можно несколькими сообщениями.
Напишите «ссылка» — на Яндекс Диск или Google Диск. Диск должен быть открыт по ссылке.`,
  askPhotos: `Заказ №{{order}}. Пришлите {{count}} фото в этот чат. Можно несколькими сообщениями: каждое фото я сохраняю сразу.`,
  askLink: `Заказ №{{order}}. Пришлите ссылку на Яндекс Диск или Google Диск. Проверьте, что доступ открыт по ссылке и без пароля, иначе файлы не скачаются.`,
  diskSaved: `Заказ №{{order}}. Ссылку записал. Если диск открыт, фото скачаются в папку заказа. Если нет — пришлите фото в чат.`,
  progress: `Заказ №{{order}}. Принял {{got}} из {{need}}. Ещё не хватает {{left}} фото — дошлите следующими сообщениями.`,
  reminder: `Заказ №{{order}}: принято {{got}} из {{need}}. Вы не отправили ещё {{left}} фото.`,
  complete: `Все {{need}} фото по заказу №{{order}} на месте. Передаём в печать.`,
  unknownArticle: `Заказ №{{order}} вижу. Артикул «{{article}}» ещё не заведён, поэтому точное число фото не знаю. Напишите числом, сколько фото нужно, или дождитесь, пока мы уточним.`,
};

function isLegacyTemplate(key: TemplateKey, text: string): boolean {
  const trimmed = text.trim();
  const previous = PREVIOUS_TEMPLATES[key]?.trim();
  if (previous && trimmed === previous) return true;
  const stock = STOCK_TEMPLATES[key]?.some((item) => item.trim() === trimmed);
  if (stock) return true;
  const markers = LEGACY_TEMPLATE_MARKERS[key];
  return Boolean(markers?.some((re) => re.test(text)));
}

export function templatesWithDefaults(saved: Partial<Templates> | null | undefined): Templates {
  const next = { ...DEFAULT_TEMPLATES };
  if (!saved) return next;
  for (const key of Object.keys(DEFAULT_TEMPLATES) as TemplateKey[]) {
    const value = saved[key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (isLegacyTemplate(key, value)) continue;
    next[key] = value.trim();
  }
  return next;
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""))
    .slice(0, 1000);
}

export function orderVars(order: Order): Record<string, string | number> {
  const got = order.files.length;
  const need = order.expectedPhotos;
  const left = Math.max(need - got, 0);
  const kind = order.kind || "photo";
  const needText = countPhrase(need, kind);
  const acceptedLine =
    kind === "sticker"
      ? `Макеты на месте, передаём в печать.`
      : `Фотографии на месте, передаём в печать.`;
  return {
    order: order.wbOrderId || "уточняется",
    article: order.articleTitle || order.vendorCode || "товар",
    count: need,
    got,
    need,
    left,
    needText,
    leftText: countPhrase(left, kind),
    which: need % 10 === 1 && need % 100 !== 11 ? "которую" : "которые",
    acceptedLine,
    uploadLink: intakeLink(order),
    squareLine:
      kind === "sticker"
        ? "\nЛучше сразу квадратные. Если фотография будет не квадратной, обрежу квадрат с левого верхнего угла."
        : "",
  };
}

export const REPLACE_MS = 30 * 60 * 1000;

export function wantsReplace(text: string): boolean {
  return /(^|[^а-яё])замена([^а-яё]|$)/i.test(text.trim().toLowerCase());
}

export function buyerIntent(text: string): "photos" | "link" | "none" {
  const t = text.trim().toLowerCase();
  if (!t) return "none";
  if (diskUrlFromText(t)) return "link";
  if (/https?:\/\//.test(t) || /яндекс|yandex|yadi\.sk|google|диск/.test(t)) {
    if (/фото|фотк|картинк|снимк/i.test(t) && !/ссылк|диск|http/i.test(t)) return "photos";
    return "link";
  }
  if (/фото|фотк|фотограф|картинк|стикер|стикеры|макет/i.test(t)) return "photos";
  if (/ссылк/i.test(t) && t.length < 200) return "link";
  return "none";
}

export function diskUrlFromText(text: string): string | null {
  const urls = text.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  const clean = urls.map((raw) => raw.replace(/[),.;]+$/, ""));
  const preferred = clean.find((url) =>
    /yadi\.sk|disk\.yandex|yandex\.[a-z.]+\/(?:d|i)\/|drive\.google|docs\.google/i.test(url),
  );
  return preferred ?? clean[0] ?? null;
}

export function parseOrderDigits(text: string): string | null {
  const labeled = text.match(/(?:заказ[а-яё]*|order)\s*№?\s*(\d{5,12})/i);
  if (labeled) return labeled[1];
  const hash = text.match(/№\s*(\d{5,12})/);
  return hash?.[1] ?? null;
}

export function parseArticleCode(text: string): string | null {
  const m = text.match(/артикул\s*[:№]?\s*([A-Za-zА-Яа-яЁё0-9_-]{2,40})/i);
  return m?.[1] ?? null;
}

export function parsePhotoCount(text: string): number | null {
  const m = text.trim().match(/^(\d{1,3})$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 500) return null;
  return n;
}
