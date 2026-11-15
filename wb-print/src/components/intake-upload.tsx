"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicIntakeFile, PublicIntakeView } from "@/lib/intake-public";

type Phase = "loading" | "ready" | "error";

function apiBase(slug: string, key: string) {
  return `/api/intake/${encodeURIComponent(slug)}/${encodeURIComponent(key)}`;
}

function fileSrc(slug: string, key: string, fileId: string) {
  return `${apiBase(slug, key)}/files/${encodeURIComponent(fileId)}`;
}

export function IntakeUpload({ slug, intakeKey }: { slug: string; intakeKey: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [view, setView] = useState<PublicIntakeView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const res = await fetch(apiBase(slug, intakeKey));
      const data = (await res.json()) as { view?: PublicIntakeView; error?: string };
      if (!res.ok) throw new Error(data.error || "не удалось открыть заказ");
      setView(data.view ?? null);
      setPhase("ready");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "ошибка");
    }
  }, [slug, intakeKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function uploadFiles() {
    if (!files?.length) {
      setError("выберите фото");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      const res = await fetch(apiBase(slug, intakeKey), { method: "POST", body: form });
      const data = (await res.json()) as { view?: PublicIntakeView; error?: string };
      if (!res.ok) throw new Error(data.error || "не удалось загрузить");
      if (data.view) setView(data.view);
      else await refresh();
      setFiles(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  const uploaded = view?.files ?? [];
  const open = lightbox !== null && lightbox >= 0 && lightbox < uploaded.length;

  function step(delta: number) {
    if (lightbox === null || uploaded.length === 0) return;
    const next = (lightbox + delta + uploaded.length) % uploaded.length;
    setLightbox(next);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-4 py-10 text-foreground">
      <header className="space-y-1">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">DODJ · печать</p>
        <h1 className="font-heading text-2xl font-bold">Загрузка фото</h1>
      </header>

      {phase === "loading" && <p className="text-sm text-muted-foreground">Открываем заказ…</p>}
      {phase === "error" && <p className="text-sm text-destructive">{error}</p>}

      {view && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-sm text-muted-foreground">Заказ Wildberries</p>
            <p className="font-heading text-xl font-bold">№ {view.wbOrderId}</p>
            <p className="mt-2 text-sm">{view.articleTitle}</p>
            {view.need > 0 && (
              <p className="mt-3 text-sm">
                Принято <span className="font-semibold text-accent">{view.got}</span> из{" "}
                <span className="font-semibold">{view.need}</span>
              </p>
            )}
          </div>

          {uploaded.length > 0 && (
            <PreviewGrid
              files={uploaded}
              slug={slug}
              intakeKey={intakeKey}
              onOpen={(index) => setLightbox(index)}
            />
          )}

          {view.cancelled && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              Заказ отменён — новые файлы не принимаем.
            </p>
          )}

          {view.complete && !view.cancelled && (
            <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-foreground">
              Всё отлично, все фотографии приняты. Можно закрыть страницу.
            </p>
          )}

          {!view.cancelled && !view.complete && view.need > 0 && (
            <>
              {view.stickerSquare && (
                <p className="text-xs text-muted-foreground">
                  Для стикеров лучше загружать квадратные фото. Неквадратные обрежем с левого верхнего угла.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="files">Добавить фото</Label>
                <Input
                  id="files"
                  type="file"
                  accept="image/*"
                  multiple
                  className="h-auto bg-background py-2"
                  onChange={(e) => setFiles(e.target.files)}
                />
                <Button type="button" className="w-full" disabled={busy} onClick={() => void uploadFiles()}>
                  Отправить
                </Button>
              </div>
            </>
          )}

          {error && phase === "ready" && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={(next) => !next && setLightbox(null)}>
        <DialogContent className="max-w-[min(100vw-2rem,42rem)] border-border bg-card p-0">
          {open && uploaded[lightbox!] ? (
            <>
              <DialogHeader className="px-4 pt-4">
                <DialogTitle className="text-sm font-normal text-muted-foreground">
                  {lightbox! + 1} из {uploaded.length} · {uploaded[lightbox!].name}
                </DialogTitle>
              </DialogHeader>
              <div className="relative bg-black/40 px-2 pb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileSrc(slug, intakeKey, uploaded[lightbox!].id)}
                  alt={uploaded[lightbox!].name}
                  className="mx-auto max-h-[70vh] w-full object-contain"
                />
                <div className="mt-3 flex justify-between gap-2 px-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => step(-1)}>
                    Назад
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => step(1)}>
                    Дальше
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewGrid({
  files,
  slug,
  intakeKey,
  onOpen,
}: {
  files: PublicIntakeFile[];
  slug: string;
  intakeKey: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Загруженные фото · нажмите, чтобы открыть</p>
      <div className="grid grid-cols-3 gap-2">
        {files.map((file, index) => (
          <button
            key={file.id}
            type="button"
            className="overflow-hidden rounded-lg border border-border bg-background text-left"
            onClick={() => onOpen(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileSrc(slug, intakeKey, file.id)}
              alt={file.name}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}