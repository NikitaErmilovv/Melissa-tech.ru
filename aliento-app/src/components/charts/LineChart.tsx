export type LinePoint = { label: string; value: number };

export function LineChart({
  points,
  height = 200,
  highlightLabel = "Пик",
}: {
  points: LinePoint[];
  height?: number;
  highlightLabel?: string;
}) {
  if (points.length === 0) {
    return <p className="card-body text-sm">Недостаточно данных для графика.</p>;
  }

  const width = 640;
  const padding = { top: 16, right: 12, bottom: 26, left: 30 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = Math.max(...points.map((p) => p.value), 4);
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    ...point,
    x: padding.left + index * stepX,
    y: padding.top + innerHeight - (point.value / max) * innerHeight,
  }));

  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${line} ${padding.left + innerWidth},${padding.top + innerHeight}`;
  const peak = coords.reduce((best, c) => (c.value > best.value ? c : best), coords[0]);
  const gridLines = 4;
  const tickEvery = Math.max(1, Math.ceil(points.length / 8));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="График посещаемости занятий"
      >
        <defs>
          <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-400)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-400)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }).map((_, index) => {
          const y = padding.top + (innerHeight / gridLines) * index;
          const value = Math.round(max - (max / gridLines) * index);
          return (
            <g key={index}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--list-line)"
                strokeWidth="1"
              />
              <text x={4} y={y + 3.5} fontSize="9" fill="var(--muted-dim)">
                {value}
              </text>
            </g>
          );
        })}

        <polygon points={area} fill="url(#line-area)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent-400)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {coords.map((c, index) =>
          index % tickEvery === 0 ? (
            <text
              key={`tick-${c.label}`}
              x={c.x}
              y={height - 8}
              fontSize="9"
              fill="var(--muted-dim)"
              textAnchor="middle"
            >
              {c.label}
            </text>
          ) : null
        )}

        <circle cx={peak.x} cy={peak.y} r="4" fill="var(--accent-300)" />
        <text
          x={Math.min(Math.max(peak.x, padding.left + 24), width - padding.right - 24)}
          y={Math.max(peak.y - 12, 12)}
          fontSize="10"
          fill="var(--accent-300)"
          textAnchor="middle"
        >
          {highlightLabel} {peak.value}
        </text>
      </svg>
    </div>
  );
}
