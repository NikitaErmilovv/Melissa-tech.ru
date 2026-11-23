import { prisma } from "@/lib/db";
import { getHallActivityTypes } from "@/lib/hall-activity-types";
import {
  addDays,
  buildDayGridColumns,
  buildHallGridRows,
  buildUnifiedHallBlocks,
} from "@/lib/hall-grid";

export async function loadHallGrid(weekStart: Date, options?: { hidePeopleCount?: boolean }) {
  const settings = await prisma.settings.get();
  const activityTypes = getHallActivityTypes(settings);
  const weekEnd = addDays(weekStart, 7);
  const classes = await prisma.danceClass.findMany({
    where: { startsAt: { gte: weekStart, lt: weekEnd } },
    include: { bookings: { where: { status: "BOOKED" } } },
  });
  const rentals = await prisma.hallRental.findMany({
    where: { startsAt: { gte: weekStart, lt: weekEnd } },
  });

  const columns = buildDayGridColumns(weekStart);
  const blocks = buildUnifiedHallBlocks(weekStart, classes, rentals, 7, {
    activityTypes,
    hidePeopleCount: options?.hidePeopleCount,
  });
  const { rows } = buildHallGridRows(columns, blocks);

  return { columns, rows, activityTypes };
}

/** @deprecated use loadHallGrid */
export async function loadHallVenueGrids(weekStart: Date, options?: { hidePeopleCount?: boolean }) {
  const grid = await loadHallGrid(weekStart, options);
  return [{ venueName: "Зал", ...grid }];
}
