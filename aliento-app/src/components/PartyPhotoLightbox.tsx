"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function PartyPhotoLightbox({
  images,
  alt,
  index,
  open,
  onClose,
  onIndexChange,
}: {
  images: string[];
  alt: string;
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const visible = images.filter((_, i) => !failed.has(i));
  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0));
  const current = visible[safeIndex];

  const go = useCallback(
    (delta: number) => {
      if (visible.length <= 1) return;
      onIndexChange((safeIndex + delta + visible.length) % visible.length);
    },
    [onIndexChange, safeIndex, visible.length]
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, go]);

  if (!open || !current) return null;

  return (
    <div
      className="party-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Фото: ${alt}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="party-lightbox-close"
        aria-label="Закрыть"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {visible.length > 1 && (
        <>
          <button
            type="button"
            className="party-lightbox-nav party-lightbox-nav-prev"
            aria-label="Предыдущее фото"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="party-lightbox-nav party-lightbox-nav-next"
            aria-label="Следующее фото"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="party-lightbox-counter">
            {safeIndex + 1} / {visible.length}
          </p>
        </>
      )}

      <div
        className="relative h-full max-h-[90vh] w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current}
          alt={`${alt} — фото ${safeIndex + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          onError={() => {
            const failedIndex = images.indexOf(current);
            if (failedIndex >= 0) setFailed((prev) => new Set(prev).add(failedIndex));
          }}
        />
      </div>
    </div>
  );
}
