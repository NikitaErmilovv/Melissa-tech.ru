export type VenueLike = {
  id: string;
  name: string;
  halls: string[];
};

export type HallBlockKind = "studio" | "rental";

import type { HallActivityType } from "@/lib/hall-activity-types";
import {
  resolveClassActivity,
  resolveRentalActivity,
  truncateGridLabel,
} from "@/lib/hall-activity-types";

export type HallGridBlock = {
  id: string;
  kind: HallBlockKind;
  venueId: string;
  hall: string;
  date: string;
  label: string;
  color: string;
  activityTypeId?: string;
  peopleCount?: number;
  startMinutes: number;
  endMinutes: number;
};

export type HallGridColumn = {
  key: string;
  date: string;
  hall: string;
  dateLabel: string;
  hallLabel: string;
};

export type HallGridCell =
  | { type: "empty" }
  | {
      type: "block";
      block: HallGridBlock;
      rowSpan: number;
    }
  | { type: "covered" };

export const HALL_GRID_OPEN = 8 * 60;
/** 01:00 next day */
export const HALL_GRID_CLOSE = 25 * 60;
export const HALL_SLOT_MINUTES = 30;

export function slotIndexFromMinutes(minutes: number) {
  return Math.floor((minutes - HALL_GRID_OPEN) / HALL_SLOT_MINUTES);
}

export function minutesFromTime(h: number, m: number) {
  return h * 60 + m;
}

export function parseTimeLabel(label: string) {
  const [h, m] = label.split(":").map(Number);
  return minutesFromTime(h, m);
}

export function formatSlotMinutes(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeSlotLabels() {
  const labels: string[] = [];
  for (let min = HALL_GRID_OPEN; min < HALL_GRID_CLOSE; min += HALL_SLOT_MINUTES) {
    labels.push(formatSlotMinutes(min));
  }
  return labels;
}

export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function formatDayHeader(d: Date) {
  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const wd = weekdays[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${wd} ${dd}.${mm}`;
}

export function abbreviateClient(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].slice(0, 3)} ${parts[1].charAt(0)}.`;
  }
  return name.slice(0, 6);
}

type ClassLike = {
  id: string;
  venueId?: string;
  room: string;
  title: string;
  activityTypeId?: string | null;
  color?: string | null;
  startsAt: Date | string;
  endsAt: Date | string;
  teacher?: { user: { name: string } };
  bookings?: unknown[];
};

type RentalLike = {
  id: string;
  venueId: string;
  hall: string;
  title?: string | null;
  activityTypeId?: string | null;
  color?: string | null;
  clientName: string;
  peopleCount: number;
  startsAt: Date | string;
  endsAt: Date | string;
};

type BuildBlocksOptions = {
  activityTypes: HallActivityType[];
  hidePeopleCount?: boolean;
};

function blockMinutesOnDate(startsAt: Date, endsAt: Date, dateIso: string) {
  const dayStart = new Date(`${dateIso}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const start = startsAt < dayStart ? dayStart : startsAt;
  const end = endsAt > dayEnd ? dayEnd : endsAt;
  if (end <= start) return null;
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes() + (end.getDate() !== start.getDate() ? 24 * 60 : 0);
  const clampedStart = Math.max(startMinutes, HALL_GRID_OPEN);
  const clampedEnd = Math.min(endMinutes, HALL_GRID_CLOSE);
  if (clampedEnd <= clampedStart) return null;
  return { startMinutes: clampedStart, endMinutes: clampedEnd };
}

export function buildDayGridColumns(weekStart: Date, dayCount = 7): HallGridColumn[] {
  const columns: HallGridColumn[] = [];
  for (let offset = 0; offset < dayCount; offset++) {
    const day = addDays(weekStart, offset);
    const date = isoDate(day);
    columns.push({
      key: `${date}|Зал`,
      date,
      hall: "Зал",
      dateLabel: formatDayHeader(day),
      hallLabel: "",
    });
  }
  return columns;
}

export function buildUnifiedHallBlocks(
  weekStart: Date,
  classes: ClassLike[],
  rentals: RentalLike[],
  dayCount = 7,
  options: BuildBlocksOptions
): HallGridBlock[] {
  const { activityTypes, hidePeopleCount = false } = options;
  const blocks: HallGridBlock[] = [];
  const weekEnd = addDays(weekStart, dayCount);

  for (let offset = 0; offset < dayCount; offset++) {
    const day = addDays(weekStart, offset);
    const date = isoDate(day);

    for (const item of classes) {
      const startsAt = new Date(item.startsAt);
      const endsAt = new Date(item.endsAt);
      if (startsAt >= weekEnd || endsAt <= weekStart) continue;
      const range = blockMinutesOnDate(startsAt, endsAt, date);
      if (!range) continue;
      const booked = item.bookings?.length ?? 0;
      const activity = resolveClassActivity(item, activityTypes);
      blocks.push({
        id: `class-${item.id}-${date}`,
        kind: "studio",
        venueId: item.venueId ?? "main",
        hall: "Зал",
        date,
        label: truncateGridLabel(item.title),
        color: activity.color,
        activityTypeId: activity.activityTypeId,
        peopleCount: hidePeopleCount ? undefined : booked,
        startMinutes: range.startMinutes,
        endMinutes: range.endMinutes,
      });
    }

    for (const item of rentals) {
      const startsAt = new Date(item.startsAt);
      const endsAt = new Date(item.endsAt);
      if (startsAt >= weekEnd || endsAt <= weekStart) continue;
      const range = blockMinutesOnDate(startsAt, endsAt, date);
      if (!range) continue;
      const activity = resolveRentalActivity(item, activityTypes);
      blocks.push({
        id: item.id,
        kind: "rental",
        venueId: item.venueId,
        hall: "Зал",
        date,
        label: truncateGridLabel(activity.label),
        color: activity.color,
        activityTypeId: activity.activityTypeId,
        peopleCount: hidePeopleCount ? undefined : item.peopleCount,
        startMinutes: range.startMinutes,
        endMinutes: range.endMinutes,
      });
    }
  }

  return blocks;
}

export function buildHallGridColumns(venue: VenueLike, weekStart: Date, dayCount = 7): HallGridColumn[] {
  const columns: HallGridColumn[] = [];
  for (let offset = 0; offset < dayCount; offset++) {
    const day = addDays(weekStart, offset);
    const date = isoDate(day);
    const dateLabel = formatDayHeader(day);
    for (const hall of venue.halls) {
      columns.push({
        key: `${date}|${hall}`,
        date,
        hall,
        dateLabel,
        hallLabel: hall.replace("Зал ", ""),
      });
    }
  }
  return columns;
}

export function buildHallBlocks(
  venue: VenueLike,
  weekStart: Date,
  classes: ClassLike[],
  rentals: RentalLike[],
  dayCount = 7,
  options: BuildBlocksOptions
): HallGridBlock[] {
  const { activityTypes, hidePeopleCount = false } = options;
  const blocks: HallGridBlock[] = [];
  const weekEnd = addDays(weekStart, dayCount);

  for (let offset = 0; offset < dayCount; offset++) {
    const day = addDays(weekStart, offset);
    const date = isoDate(day);

    for (const item of classes) {
      const venueId = item.venueId ?? venue.id;
      if (venueId !== venue.id) continue;
      if (!venue.halls.includes(item.room)) continue;
      const startsAt = new Date(item.startsAt);
      const endsAt = new Date(item.endsAt);
      if (startsAt >= weekEnd || endsAt <= weekStart) continue;
      const range = blockMinutesOnDate(startsAt, endsAt, date);
      if (!range) continue;
      const booked = item.bookings?.length ?? 0;
      const activity = resolveClassActivity(item, activityTypes);
      blocks.push({
        id: `class-${item.id}-${date}`,
        kind: "studio",
        venueId: venue.id,
        hall: item.room,
        date,
        label: truncateGridLabel(item.title),
        color: activity.color,
        activityTypeId: activity.activityTypeId,
        peopleCount: hidePeopleCount ? undefined : booked,
        startMinutes: range.startMinutes,
        endMinutes: range.endMinutes,
      });
    }

    for (const item of rentals) {
      if (item.venueId !== venue.id) continue;
      if (!venue.halls.includes(item.hall)) continue;
      const startsAt = new Date(item.startsAt);
      const endsAt = new Date(item.endsAt);
      if (startsAt >= weekEnd || endsAt <= weekStart) continue;
      const range = blockMinutesOnDate(startsAt, endsAt, date);
      if (!range) continue;
      const activity = resolveRentalActivity(item, activityTypes);
      blocks.push({
        id: item.id,
        kind: "rental",
        venueId: venue.id,
        hall: item.hall,
        date,
        label: truncateGridLabel(activity.label),
        color: activity.color,
        activityTypeId: activity.activityTypeId,
        peopleCount: hidePeopleCount ? undefined : item.peopleCount,
        startMinutes: range.startMinutes,
        endMinutes: range.endMinutes,
      });
    }
  }

  return blocks;
}

export function buildHallGridRows(columns: HallGridColumn[], blocks: HallGridBlock[]) {
  const timeLabels = buildTimeSlotLabels();
  const columnKeyByDate = new Map(columns.map((column) => [column.date, column.key]));

  const blockStarts = new Map<string, HallGridBlock>();
  for (const block of blocks) {
    const colKey = columnKeyByDate.get(block.date) ?? `${block.date}|${block.hall}`;
    const startSlot = slotIndexFromMinutes(block.startMinutes);
    const mapKey = `${colKey}|${startSlot}`;
    const existing = blockStarts.get(mapKey);
    if (!existing || (block.kind === "studio" && existing.kind === "rental")) {
      blockStarts.set(mapKey, { ...block, hall: colKey.split("|")[1] ?? block.hall });
    }
  }

  const resolvedStarts = new Map<string, HallGridBlock>();
  const byColumn = new Map<string, HallGridBlock[]>();
  for (const block of blockStarts.values()) {
    const colKey = columnKeyByDate.get(block.date) ?? `${block.date}|${block.hall}`;
    if (!byColumn.has(colKey)) byColumn.set(colKey, []);
    byColumn.get(colKey)!.push(block);
  }

  for (const [colKey, colBlocks] of byColumn) {
    const sorted = [...colBlocks].sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
      if (a.kind !== b.kind) return a.kind === "studio" ? -1 : 1;
      return 0;
    });

    const placed: HallGridBlock[] = [];
    for (const block of sorted) {
      const overlaps = placed.some(
        (existing) => block.startMinutes < existing.endMinutes && block.endMinutes > existing.startMinutes
      );
      if (overlaps) continue;
      placed.push(block);
      const startSlot = slotIndexFromMinutes(block.startMinutes);
      resolvedStarts.set(`${colKey}|${startSlot}`, block);
    }
  }

  const activeSpan = new Map<string, { startSlot: number; endSlot: number }>();

  const rows = timeLabels.map((timeLabel, slotIndex) => {
    const cells: Record<string, HallGridCell> = {};
    for (const column of columns) {
      const colKey = column.key;
      const span = activeSpan.get(colKey);
      if (span && slotIndex > span.startSlot && slotIndex < span.endSlot) {
        cells[colKey] = { type: "covered" };
        continue;
      }
      if (span && slotIndex >= span.endSlot) {
        activeSpan.delete(colKey);
      }

      const block = resolvedStarts.get(`${colKey}|${slotIndex}`);
      if (block) {
        const endSlot = slotIndexFromMinutes(block.endMinutes);
        const rowSpan = Math.max(1, endSlot - slotIndex);
        activeSpan.set(colKey, { startSlot: slotIndex, endSlot });
        cells[colKey] = { type: "block", block, rowSpan };
        continue;
      }

      cells[colKey] = { type: "empty" };
    }
    return { timeLabel, slotIndex, cells };
  });

  return { timeLabels, rows };
}

export function groupColumnsByDate(columns: HallGridColumn[]) {
  const groups: { date: string; label: string; halls: HallGridColumn[] }[] = [];
  for (const column of columns) {
    const last = groups[groups.length - 1];
    if (last?.date === column.date) {
      last.halls.push(column);
    } else {
      groups.push({ date: column.date, label: column.dateLabel, halls: [column] });
    }
  }
  return groups;
}
