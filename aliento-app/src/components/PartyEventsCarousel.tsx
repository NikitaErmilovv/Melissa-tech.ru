"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PartyEventCard, type PartyEventCardData } from "@/components/PartyEventCard";
import { cn } from "@/lib/cn";

export function PartyEventsCarousel({
  events,
  title,
  subtitle,
  compact = false,
  className,
}: {
  events: PartyEventCardData[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8);

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-party-card]"));
    if (!cards.length) return;
    const center = scrollLeft + clientWidth / 2;
    let nearest = 0;
    let nearestDist = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [events.length, updateControls]);

  function scrollByCard(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-party-card]");
    const gap = 16;
    const step = (card?.offsetWidth ?? 300) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  if (events.length === 0) {
    return (
      <div className={cn("app-card card-body text-sm", className)}>
        Пока нет запланированных вечеринок.
      </div>
    );
  }

  return (
    <div className={cn("party-carousel", className)}>
      {(title || subtitle) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-2xl md:text-3xl">{title}</h2>}
            {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-muted-dim">
              {activeIndex + 1} / {events.length}
            </span>
            <button
              type="button"
              aria-label="Предыдущая вечеринка"
              className="party-carousel-btn"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Следующая вечеринка"
              className="party-carousel-btn"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="party-carousel-shell">
        <div ref={trackRef} className="party-carousel-track" tabIndex={0}>
          {events.map((event) => (
            <div key={event.id} data-party-card className="party-carousel-slide">
              <PartyEventCard
                event={event}
                compact={compact}
                interactivePhotos={!compact}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-dim md:hidden">Листайте плашки пальцем →</p>
    </div>
  );
}
