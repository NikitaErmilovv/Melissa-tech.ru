export type HallActivityType = {
  id: string;
  name: string;
  color: string;
  keywords?: string[];
};

export const DEFAULT_HALL_ACTIVITY_TYPES: HallActivityType[] = [
  {
    id: "sensual",
    name: "Bachata Sensual",
    color: "#2d6a4f",
    keywords: ["sensual", "сеншуал"],
  },
  {
    id: "partnerwork",
    name: "Bachata Partnerwork",
    color: "#4361ee",
    keywords: ["partner", "парн", "partnerwork"],
  },
  {
    id: "ladies",
    name: "Ladies Styling",
    color: "#9b5de5",
    keywords: ["ladies", "леди", "styling"],
  },
  {
    id: "beginners",
    name: "Бачата для новичков",
    color: "#f4a261",
    keywords: ["нович", "beginner", "началь"],
  },
  {
    id: "practice",
    name: "Практика",
    color: "#4cc9f0",
    keywords: ["практик", "practice"],
  },
  {
    id: "intensive",
    name: "Интенсив",
    color: "#e76f51",
    keywords: ["интенсив", "intensive"],
  },
  {
    id: "party",
    name: "Вечеринка / ивент",
    color: "#ff006e",
    keywords: ["вечерин", "party", "ивент"],
  },
  {
    id: "other",
    name: "Другое",
    color: "#8d99ae",
    keywords: [],
  },
];

export function getHallActivityTypes(settings?: { hallActivityTypes?: HallActivityType[] }) {
  const stored = settings?.hallActivityTypes?.filter((item) => item.id && item.name && item.color);
  if (stored?.length) return stored;
  return DEFAULT_HALL_ACTIVITY_TYPES;
}

export function findActivityType(
  types: HallActivityType[],
  activityTypeId?: string | null
): HallActivityType | undefined {
  if (!activityTypeId) return undefined;
  return types.find((item) => item.id === activityTypeId);
}

export function matchActivityTypeByTitle(title: string, types: HallActivityType[]): HallActivityType {
  const lower = title.toLowerCase();
  for (const type of types) {
    if (type.keywords?.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  return types.find((item) => item.id === "other") ?? types[types.length - 1];
}

export function resolveClassActivity(
  item: { title: string; activityTypeId?: string | null; color?: string | null },
  types: HallActivityType[]
) {
  const matched = findActivityType(types, item.activityTypeId) ?? matchActivityTypeByTitle(item.title, types);
  return {
    activityTypeId: matched.id,
    color: item.color?.trim() || matched.color,
  };
}

export function resolveRentalActivity(
  item: {
    title?: string | null;
    clientName: string;
    activityTypeId?: string | null;
    color?: string | null;
  },
  types: HallActivityType[]
) {
  const label = (item.title?.trim() || item.clientName.trim()).trim();
  const matched =
    findActivityType(types, item.activityTypeId) ??
    matchActivityTypeByTitle(label, types.filter((type) => type.id !== "other")) ??
    findActivityType(types, "other") ??
    types[types.length - 1];
  return {
    label,
    activityTypeId: item.activityTypeId ?? matched.id,
    color: item.color?.trim() || matched.color,
  };
}

export function blockColorStyle(color: string): Record<string, string> {
  return {
    ["--hall-block-color" as string]: color,
    backgroundColor: `color-mix(in srgb, ${color} 30%, var(--surface))`,
    borderColor: `color-mix(in srgb, ${color} 48%, var(--border))`,
  };
}

export function truncateGridLabel(label: string, max = 14) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}
