import { STUDIO_VENUE_LABEL } from "@/lib/messengers";
import { publicAsset } from "@/lib/site";

export type PartyTheme = {
  gradient: string;
  glow: string;
};

export type PartyCatalogItem = {
  number: number;
  title: string;
  date: string;
  time: string;
  place: string;
  description: string;
  theme: PartyTheme;
};

const STUDIO = STUDIO_VENUE_LABEL;

export const PARTY_CATALOG: PartyCatalogItem[] = [
  {
    number: 1,
    title: "Alien Night Party",
    date: "2025-11-15",
    time: "21:00",
    place: STUDIO,
    description: "Космическая ночь: неон, инопланетные образы и бачата под звёздным небом.",
    theme: {
      gradient: "linear-gradient(145deg, #1a1035 0%, #2d6a4f 45%, #9b5de5 100%)",
      glow: "#9b5de5",
    },
  },
  {
    number: 2,
    title: "Arabian Night Party",
    date: "2025-12-20",
    time: "21:00",
    place: STUDIO,
    description: "Восточная сказка — золото зала, ароматы специй и sensual bachata до утра.",
    theme: {
      gradient: "linear-gradient(145deg, #3d0c02 0%, #9a3412 42%, #fbbf24 100%)",
      glow: "#fbbf24",
    },
  },
  {
    number: 3,
    title: "Hogwarts Party",
    date: "2025-12-27",
    time: "21:00",
    place: STUDIO,
    description: "Магия Hogwarts: факультеты, костюмы и танцевальный бал волшебников.",
    theme: {
      gradient: "linear-gradient(145deg, #1c1917 0%, #7f1d1d 50%, #ca8a04 100%)",
      glow: "#ca8a04",
    },
  },
  {
    number: 4,
    title: "Matrix Party",
    date: "2026-01-31",
    time: "21:00",
    place: STUDIO,
    description: "Зелёный код, cyber-эстетика и baсhata в параллельной реальности.",
    theme: {
      gradient: "linear-gradient(145deg, #020617 0%, #14532d 55%, #22c55e 100%)",
      glow: "#22c55e",
    },
  },
  {
    number: 5,
    title: "Gangster's Party",
    date: "2026-02-21",
    time: "21:00",
    place: STUDIO,
    description: "Chicago 20-х: джаз, gangster chic и страстная бачата в полумраке.",
    theme: {
      gradient: "linear-gradient(145deg, #0a0a0a 0%, #374151 45%, #991b1b 100%)",
      glow: "#991b1b",
    },
  },
  {
    number: 6,
    title: "Luau Party",
    date: "2026-02-28",
    time: "21:00",
    place: STUDIO,
    description: "Гавайский luau: цветы, тропики и лёгкое летнее настроение на танцполе.",
    theme: {
      gradient: "linear-gradient(145deg, #0c4a6e 0%, #0891b2 40%, #f97316 100%)",
      glow: "#f97316",
    },
  },
  {
    number: 7,
    title: "Women's Paradise Party",
    date: "2026-03-07",
    time: "21:00",
    place: STUDIO,
    description: "Вечер для неё: styling, empowerment и танец в атмосфере поддержки.",
    theme: {
      gradient: "linear-gradient(145deg, #500724 0%, #be185d 48%, #fbcfe8 100%)",
      glow: "#f472b6",
    },
  },
  {
    number: 8,
    title: "Красный Бархат Party",
    date: "2026-03-21",
    time: "21:00",
    place: STUDIO,
    description: "Бархат, красные занавесы и sensual bachata в духе old Hollywood.",
    theme: {
      gradient: "linear-gradient(145deg, #450a0a 0%, #991b1b 50%, #fecaca 100%)",
      glow: "#ef4444",
    },
  },
  {
    number: 9,
    title: "Fiesta Mexicana",
    date: "2026-04-04",
    time: "21:00",
    place: STUDIO,
    description: "Sombreros, яркие краски и fiesta с latino energy до последнего трека.",
    theme: {
      gradient: "linear-gradient(145deg, #14532d 0%, #15803d 35%, #ea580c 70%, #facc15 100%)",
      glow: "#facc15",
    },
  },
  {
    number: 10,
    title: "Banana Party",
    date: "2026-04-25",
    time: "21:00",
    place: STUDIO,
    description: "Жёлтый dress-code, юмор и самая солнечная вечеринка сезона.",
    theme: {
      gradient: "linear-gradient(145deg, #713f12 0%, #eab308 55%, #fef08a 100%)",
      glow: "#eab308",
    },
  },
  {
    number: 11,
    title: "Birthday Party",
    date: "2026-05-23",
    time: "21:00",
    place: STUDIO,
    description: "Празднуем вместе: сюрпризы, любимые хиты и торт на танцполе.",
    theme: {
      gradient: "linear-gradient(145deg, #312e81 0%, #7c3aed 40%, #f472b6 75%, #fbbf24 100%)",
      glow: "#a78bfa",
    },
  },
  {
    number: 12,
    title: "Open Air на Михайловской набережной",
    date: "2026-06-06",
    time: "19:00",
    place: "Михайловская набережная",
    description: "Танцы на открытом воздухе у воды — закат, живые DJ-сеты и бачата под небом.",
    theme: {
      gradient: "linear-gradient(145deg, #0c4a6e 0%, #38bdf8 45%, #fb923c 100%)",
      glow: "#38bdf8",
    },
  },
];

export function partyImagePath(number: number) {
  return publicAsset(`/events/party-${number}.jpg`);
}

/** Ordered gallery paths per event (when multiple photos exist). */
export const PARTY_GALLERIES: Record<number, string[]> = {
  1: Array.from({ length: 7 }, (_, i) => `/events/party-1/${i + 1}.png`),
  2: Array.from({ length: 3 }, (_, i) => `/events/party-2/${i + 1}.png`),
  3: [`/events/party-3/1.png`],
  4: [6, 1, 2, 3, 4, 5, 7, 8, 9].map((n) => `/events/party-4/${n}.png`),
  5: Array.from({ length: 6 }, (_, i) => `/events/party-5/${i + 1}.png`),
  6: Array.from({ length: 8 }, (_, i) => `/events/party-6/${i + 1}.png`),
  8: Array.from({ length: 10 }, (_, i) => `/events/party-8/${i + 1}.png`),
  9: Array.from({ length: 8 }, (_, i) => `/events/party-9/${i + 1}.png`),
  10: [4, 1, 2, 3, 5, 6, 7, 8].map((n) => `/events/party-10/${n}.png`),
  11: Array.from({ length: 9 }, (_, i) => `/events/party-11/${i + 1}.png`),
};

export function partyGalleryPaths(number: number) {
  const paths = PARTY_GALLERIES[number];
  return paths ? paths.map(publicAsset) : null;
}

export function partyCoverImage(number: number) {
  const gallery = PARTY_GALLERIES[number];
  if (gallery?.length) return gallery[0];
  return partyImagePath(number);
}

export function getPartyTheme(number: number): PartyTheme {
  return (
    PARTY_CATALOG.find((item) => item.number === number)?.theme ?? {
      gradient: "linear-gradient(145deg, #1e1815 0%, #a89458 100%)",
      glow: "#fbeda3",
    }
  );
}

export function toPartyDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function catalogToEventItems() {
  return PARTY_CATALOG.map((item) => {
    const [year, month, day] = item.date.split("-").map(Number);
    const [hour, minute] = item.time.split(":").map(Number);
    const startsAt = new Date(year, month - 1, day, hour, minute, 0, 0);
    return {
      id: `party-${item.number}`,
      number: item.number,
      title: item.title,
      description: item.description,
      startsAt: startsAt.toISOString(),
      place: item.place,
      imageUrl: partyCoverImage(item.number),
      isDemo: false,
    };
  });
}
