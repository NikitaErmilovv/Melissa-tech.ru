"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteHallRentalAction } from "@/actions/halls";
import { HallGridSection } from "@/components/HallGridSection";

export { HallGridSection };
import type { HallGridCell, HallGridColumn } from "@/lib/hall-grid";

type HallGridData = {
  columns: HallGridColumn[];
  rows: { timeLabel: string; cells: Record<string, HallGridCell> }[];
};

export function HallHallsClient({
  venueGrids,
  canManage,
  weekStartIso,
}: {
  venueGrids: { venueName: string; columns: HallGridColumn[]; rows: HallGridData["rows"] }[];
  canManage: boolean;
  weekStartIso: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Удалить запись об аренде?")) return;
    startTransition(async () => {
      await deleteHallRentalAction(id, weekStartIso);
      router.refresh();
    });
  }

  const grid = venueGrids[0];
  if (!grid) return null;

  return (
    <div className={pending ? "opacity-70" : undefined}>
      <HallGridSection
        grid={grid}
        canManage={canManage}
        weekStartIso={weekStartIso}
        title={venueGrids.length > 1 ? grid.venueName : undefined}
        onDeleteRental={canManage ? handleDelete : undefined}
      />
    </div>
  );
}
