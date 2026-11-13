const niches = [
  "Sensual bachata",
  "Dominican bachata",
  "Modern bachata",
  "Ladies styling",
  "Мужское ведение",
  "Музыкальность",
  "Импровизация",
  "Социальные танцы",
  "Пробное занятие",
  "Групповые классы",
  "Индивидуальные",
  "Вечеринки школы",
];

export function NicheMarquee() {
  const items = [...niches, ...niches];

  return (
    <div className="relative overflow-hidden border-y border-border bg-background-elevated py-5">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background-elevated to-transparent sm:w-24"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background-elevated to-transparent sm:w-24"
        aria-hidden="true"
      />
      <div className="animate-marquee flex w-max gap-3">
        {items.map((niche, i) => (
          <span
            key={`${niche}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border-strong bg-white/[0.06] px-4 py-2.5 text-sm text-foreground/75"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            {niche}
          </span>
        ))}
      </div>
    </div>
  );
}
