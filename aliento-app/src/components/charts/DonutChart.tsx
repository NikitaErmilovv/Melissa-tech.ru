export type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="card-body text-sm">Пока нет активных абонементов.</p>;
  }

  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce<{ segment: DonutSegment; length: number; offset: number }[]>(
    (acc, segment) => {
      const previous = acc[acc.length - 1];
      const offset = previous ? previous.offset + previous.length : 0;
      return [...acc, { segment, length: (segment.value / total) * circumference, offset }];
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Распределение абонементов">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--list-line)" strokeWidth="18" />
        {arcs.map(({ segment, length, offset }) => (
          <circle
            key={segment.label}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth="18"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <ul className="w-full space-y-3">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-muted">{segment.label}</span>
            <span className="text-sm text-foreground">
              {segment.value}
              <span className="ml-1.5 text-xs text-muted-dim">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
