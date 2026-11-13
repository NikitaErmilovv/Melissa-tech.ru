"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PartyEventGallery } from "@/components/PartyEventGallery";
import { PartyPhotoLightbox } from "@/components/PartyPhotoLightbox";
import { getPartyTheme, partyCoverImage, partyGalleryPaths, toPartyDate } from "@/lib/party-events";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export type PartyEventCardData = {
  id: string;
  number: number;
  title: string;
  description: string;
  startsAt: Date | string;
  place: string;
  imageUrl?: string;
};

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

export function PartyEventCard({
  event,
  compact = false,
  interactivePhotos = false,
  className,
}: {
  event: PartyEventCardData;
  compact?: boolean;
  interactivePhotos?: boolean;
  className?: string;
}) {
  const startsAt = toPartyDate(event.startsAt);
  const theme = getPartyTheme(event.number);
  const gallery = partyGalleryPaths(event.number);
  const [singleOk, setSingleOk] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const singleSrc = event.imageUrl ?? partyCoverImage(event.number);

  const photos = useMemo(() => {
    if (gallery?.length) return gallery;
    if (singleOk) return [singleSrc];
    return [];
  }, [gallery, singleOk, singleSrc]);

  function openLightbox(index: number) {
    if (!interactivePhotos || photos.length === 0) return;
    setPhotoIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <article
        className={cn(
          "party-event-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-32px_rgba(0,0,0,0.65)]",
          className
        )}
      >
        <div className={cn("party-event-cover relative overflow-hidden", compact ? "aspect-[4/3]" : "aspect-[3/4]")}>
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ background: theme.gradient }}
          />
          {gallery ? (
            <PartyEventGallery
              images={gallery}
              alt={event.title}
              interactive={interactivePhotos}
              onIndexChange={setPhotoIndex}
              onOpen={openLightbox}
            />
          ) : (
            singleOk && (
              <button
                type="button"
                className={cn(
                  "absolute inset-0 border-0 bg-transparent p-0",
                  interactivePhotos ? "cursor-zoom-in" : "pointer-events-none"
                )}
                aria-label={interactivePhotos ? `Открыть фото: ${event.title}` : undefined}
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={singleSrc}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 85vw, 320px"
                  onError={() => setSingleOk(false)}
                />
              </button>
            )
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
            aria-hidden
          />
          <span
            className="absolute left-3 top-3 z-10 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm"
            style={{ boxShadow: `0 0 24px ${theme.glow}55` }}
          >
            #{event.number}
          </span>
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10">
            <p className="font-display text-lg leading-tight text-white drop-shadow-sm md:text-xl">{event.title}</p>
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col", compact ? "gap-2 p-4" : "gap-3 p-5")}>
          <div className="flex items-center gap-3">
            <span className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-border-strong bg-accent-500/10 px-2 py-2">
              <span className="font-display text-xl leading-none text-accent-300">{startsAt.getDate()}</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-dim">
                {MONTHS_SHORT[startsAt.getMonth()]}
              </span>
              <span className="text-[10px] text-muted-dim">{startsAt.getFullYear()}</span>
            </span>
            <div className="min-w-0 text-xs text-muted-dim">
              <p>{formatDate(startsAt)}</p>
              <p className="mt-1">
                {formatTime(startsAt)} · {event.place}
              </p>
            </div>
          </div>
          {!compact && <p className="text-sm leading-relaxed text-muted">{event.description}</p>}
          <p className="mt-auto text-xs text-accent-300">Без записи — просто приходите</p>
        </div>
      </article>

      {interactivePhotos && (
        <PartyPhotoLightbox
          images={photos}
          alt={event.title}
          index={photoIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setPhotoIndex}
        />
      )}
    </>
  );
}
