"use client";

import { HallOccupancyGrid } from "@/components/HallOccupancyGrid";
import type { HallGridCell, HallGridColumn } from "@/lib/hall-grid";

type HallGridData = {
  columns: HallGridColumn[];
  rows: { timeLabel: string; cells: Record<string, HallGridCell> }[];
};

/** Read-only hall grid (no server actions) — safe for static export. */
export function HallGridSection({
  grid,
  canManage,
  weekStartIso,
  title,
  focusDateIso,
  onDeleteRental,
}: {
  grid: HallGridData;
  canManage: boolean;
  weekStartIso: string;
  title?: string;
  focusDateIso?: string;
  onDeleteRental?: (id: string) => void;
}) {
  void weekStartIso;

  return (
    <HallOccupancyGrid
      title={title}
      columns={grid.columns}
      rows={grid.rows}
      focusDateIso={focusDateIso}
      canManage={canManage}
      onDeleteRental={canManage ? onDeleteRental : undefined}
    />
  );
}
