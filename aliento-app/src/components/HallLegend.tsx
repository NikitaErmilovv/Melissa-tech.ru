import type { HallActivityType } from "@/lib/hall-activity-types";

export function HallLegend({ activityTypes }: { activityTypes: HallActivityType[] }) {
  const studioTypes = activityTypes.filter((type) => type.id !== "other");

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {studioTypes.map((type) => (
        <span key={type.id} className="inline-flex items-center gap-2">
          <span className="hall-legend" style={{ backgroundColor: type.color }} />
          {type.name}
        </span>
      ))}
      <span className="inline-flex items-center gap-2">
        <span className="hall-legend hall-legend-free" />
        Свободно
      </span>
    </div>
  );
}
