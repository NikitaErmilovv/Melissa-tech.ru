export const siteConfig = {
  name: "Aliento",
  fullName: "Aliento — школа бачаты",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://aliento.dance",
  description:
    "Школа бачаты для тех, кто хочет танцевать, знакомиться с людьми и получать удовольствие от каждого движения.",
  shortDescription: "Школа бачаты: расписание, абонементы и запись на занятия.",
  slogan: "Танец, который чувствуется сердцем",
  keywords: [
    "школа бачаты",
    "бачата",
    "уроки бачаты",
    "танцы",
    "Aliento",
    "запись на занятие",
    "абонемент на танцы",
    "sensual bachata",
    "преподаватели бачаты",
  ],
  telegram: {
    channel: "https://t.me/aliento",
    channelHandle: "@aliento",
    direct: "https://t.me/aliento",
  },
  social: {
    instagram: "https://instagram.com/aliento",
    youtube: "https://youtube.com/@aliento",
  },
  contacts: {
    phone: "+7 913 270-45-06",
    email: "info@aliento.dance",
    address: "проспект Карла Маркса, 53а",
    hours: "Ежедневно 10:00 — 22:00",
  },
  legal: {
    channelRules: "/rules",
    chatRules: "/rules",
    privacy: "/privacy",
    terms: "/terms",
    cookies: "/cookies",
    rkn: "",
  },
  owner: {
    name: "Школа бачаты Aliento",
    /** ФИО самозанятого — укажите в .env или здесь для оферты и чеков */
    legalName: process.env.LEGAL_OWNER_NAME || "Исполнитель услуг Aliento",
    inn: process.env.LEGAL_INN || "",
  },
  payments: {
    provider: "ЮKassa",
    providerUrl: "https://yookassa.ru",
  },
  ogImage: "/opengraph-image",
  locale: "ru_RU",
  themeColor: "#100c09",
} as const;

/** Public static files (respects /aliento on melissa-tech.ru). */
export function publicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  return `${base}${normalized}`;
}

export type SiteConfig = typeof siteConfig;
