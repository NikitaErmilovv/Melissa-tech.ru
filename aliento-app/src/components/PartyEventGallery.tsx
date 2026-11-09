"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function PartyEventGallery({
  images,
  alt,
  className,
  interactive = false,
  onIndexChange,
  onOpen,
}: {
  images: string[];
  alt: string;
  className?: string;
  interactive?: boolean;
  onIndexChange?: (index: number) => void;
  onOpen?: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());

  const visible = images.filter((_, i) => !failed.has(i));

  const updateIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || visible.length === 0) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-gallery-slide]"));
    if (!slides.length) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setIndex(nearest);
    onIndexChange?.(nearest);
  }, [onIndexChange, visible.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateIndex();
    track.addEventListener("scroll", updateIndex, { passive: true });
    return () => track.removeEventListener("scroll", updateIndex);
  }, [updateIndex, visible.length]);

  function scrollTo(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: delta * track.clientWidth, behavior: "smooth" });
  }

  if (visible.length === 0) return null;

  return (
    <div
      className={cn(
        "party-event-gallery absolute inset-0",
        interactive && "party-event-gallery-interactive",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive && onOpen) onOpen(index);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div ref={trackRef} className="party-event-gallery-track h-full">
        {images.map((src, i) =>
          failed.has(i) ? null : (
            <div key={src} data-gallery-slide className="party-event-gallery-slide relative h-full">
              <Image
                src={src}
                alt={`${alt} — фото ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 85vw, 320px"
                onError={() => setFailed((prev) => new Set(prev).add(i))}
                draggable={false}
              />
            </div>
          )
        )}
      </div>

      {interactive && visible.length > 1 && (
        <>
          <button
            type="button"
            className="party-gallery-nav party-gallery-nav-prev"
            aria-label="Предыдущее фото"
            onClick={(e) => {
              e.stopPropagation();
              scrollTo(-1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="party-gallery-nav party-gallery-nav-next"
            aria-label="Следующее фото"
            onClick={(e) => {
              e.stopPropagation();
              scrollTo(1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {visible.length > 1 && (
        <div className="pointer-events-none absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 px-3">
          {visible.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/45"
              )}
            />
          ))}
        </div>
      )}

    </div>
  );
}
