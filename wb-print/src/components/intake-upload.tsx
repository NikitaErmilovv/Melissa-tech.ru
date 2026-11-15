"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { previewUrlForFile } from "@/lib/client-preview";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";
import { postFormWithProgress } from "@/lib/upload-xhr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicIntakeView } from "@/lib/intake-public";

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
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadPhase, setUploadPhase] = useState<"upload" | "processing" | null>(null);
  const [picked, setPicked] = useState<File[]>([]);
  const [lightbox, setLightbox] = useState<{ kind: "server" | "local"; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localPreviews, setLocalPreviews] = useState<{ file: File; url: string }[]>([]);
  const previewGen = useRef(0);

  useEffect(() => {
    const gen = ++previewGen.current;
    let alive = true;
    void (async () => {
      const rows: { file: File; url: string }[] = [];
      for (const file of picked) {
        const url = await previewUrlForFile(file);
        if (!alive || gen !== previewGen.current) {
          URL.revokeObjectURL(url);
          continue;
        }
        rows.push({ file, url });
      }
      if (alive && gen === previewGen.current) setLocalPreviews(rows);
    })();
    return () => {
      alive = false;
    };
  }, [picked]);

  useEffect(
    () => () => {
      for (const row of localPreviews) URL.revokeObjectURL(row.url);
    },
    [localPreviews],
  );

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setPhase("loading");
    setError("");
    try {
      const res = await fetch(apiBase(slug, intakeKey), { cache: "no-store" });
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
    if (!picked.length) {
      setError("выберите хотя бы одно фото");
      return;
    }
    const need = view?.need ?? 0;
    const onServer = view?.files?.length ?? view?.got ?? 0;
    const got = view ? Math.max(view.got, onServer) : 0;
    const total = got + picked.length;
    if (need > 0 && total > need) {
      setError(
        `В заказе ${need} фото, уже ${got}. Вы добавили ещё ${picked.length} — лишних ${total - need}. Уберите лишние.`,
      );
      return;
    }
    setBusy(true);
    setUploadPct(0);
    setUploadPhase("upload");
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      for (const file of picked) form.append("files", file);
      const { status, json } = await postFormWithProgress(apiBase(slug, intakeKey), form, (pct, phase) => {
        setUploadPct(phase === "processing" ? 100 : pct);
        setUploadPhase(phase);
      });
      const data = json as {
        view?: PublicIntakeView;
        saved?: number;
        skipped?: number;
        error?: string;
      };
      if (status === 413) {
        throw new Error(`Файл слишком большой — до ${MAX_UPLOAD_MB} МБ на одно фото.`);
      }
      if (status < 200 || status >= 300) throw new Error(data.error || "не удалось загрузить");
      const nextView = data.view ?? null;
      if (nextView) setView(nextView);
      else await refresh(true);
      const saved = data.saved ?? 0;
      const skipped = data.skipped ?? 0;
      if (saved > 0 && !nextView?.complete) {
        setNotice(saved === 1 ? "Фото отправлено." : `Отправлено ${saved} фото.`);
      } else if (skipped > 0 && saved === 0) {
        setError(
          "Файлы не приняты — браузер мог отправить пустой файл. Выберите снова или откройте ссылку в Safari/Chrome.",
        );
      }
      setPicked([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ошибка загрузки");
    } finally {
      setBusy(false);
      setUploadPct(null);
      setUploadPhase(null);
    }
  }

  const uploaded = view?.files ?? [];
  const gotCount = view ? Math.max(view.got, uploaded.length) : 0;
  const pendingAdd = picked.length;
  const displayGot = gotCount + pendingAdd;
  const overNeed = Boolean(view && view.need > 0 && displayGot > view.need);
  const canUpload = Boolean(view && !view.cancelled && view.need > 0 && !view.complete);

  async function removeUploaded(fileId: string) {
    if (!window.confirm("Удалить это фото?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(fileSrc(slug, intakeKey, fileId), { method: "DELETE" });
      const data = (await res.json()) as { view?: PublicIntakeView; error?: string };
      if (!res.ok) throw new Error(data.error || "не удалось удалить");
      if (data.view) setView(data.view);
      else await refresh(true);
      setNotice("Фото удалено — можно загрузить другое.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ошибка удаления");
    } finally {
      setBusy(false);
    }
  }

  const serverOpen =
    lightbox?.kind === "server" &&
    lightbox.index >= 0 &&
    lightbox.index < uploaded.length;
  const localOpen =
    lightbox?.kind === "local" &&
    lightbox.index >= 0 &&
    lightbox.index < localPreviews.length;

  function stepServer(delta: number) {
    if (!serverOpen || lightbox === null) return;
    const next = (lightbox.index + delta + uploaded.length) % uploaded.length;
    setLightbox({ kind: "server", index: next });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-4 py-8 text-foreground">
      <header className="space-y-1">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">DODJ · печать</p>
        <h1 className="font-heading text-2xl font-bold">Загрузка фото</h1>
      </header>

      {phase === "loading" && !view && <p className="text-sm text-muted-foreground">Открываем заказ…</p>}
      {phase === "error" && !view && <p className="text-sm text-destructive">{error}</p>}

      {view && (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-sm text-muted-foreground">Заказ Wildberries № {view.wbOrderId}</p>
            <p className="mt-1 text-sm text-muted-foreground">{view.articleTitle}</p>
            {view.need > 0 ? (
              <p className="font-heading mt-4 text-4xl font-black tracking-tight">
                <span className="text-accent">{displayGot}</span>
                <span className="text-muted-foreground"> / </span>
                <span>{view.need}</span>
              </p>
            ) : (
              <p className="font-heading mt-4 text-4xl font-black tracking-tight">
                <span className="text-accent">{displayGot}</span>
              </p>
            )}
            {gotCount > 0 && pendingAdd === 0 && !view.complete ? (
              <p className="mt-1 text-xs text-muted-foreground">фото принято</p>
            ) : null}
          </div>

          {uploaded.length > 0 && (
            <PreviewGrid
              title="Уже загружено"
              urls={uploaded.map((file) => ({ id: file.id, alt: file.name, src: fileSrc(slug, intakeKey, file.id) }))}
              onOpen={(index) => setLightbox({ kind: "server", index })}
              onRemove={!view.cancelled ? (id) => void removeUploaded(id) : undefined}
            />
          )}

          {view.cancelled && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              Заказ отменён — новые файлы не принимаем.
            </p>
          )}

          {view.complete && !view.cancelled ? (
            <div className="rounded-xl border border-border bg-background px-4 py-4 text-center">
              <p className="font-heading text-xl font-bold tracking-tight">Готово</p>
              <p className="mt-1 text-sm text-muted-foreground">Все фотографии приняты</p>
            </div>
          ) : null}

          {overNeed ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Фотографий больше, чем в заказе ({view.need}). Уберите {displayGot - view.need} лишних перед отправкой.
            </p>
          ) : null}

          {canUpload && (
            <div className="space-y-3 border-t border-border pt-4">
              {view.stickerSquare && (
                <p className="text-xs text-muted-foreground">Для стикеров лучше квадратные фото.</p>
              )}
              <button
                type="button"
                className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="font-medium">Нажмите, чтобы выбрать фото</span>
                <span className="text-xs text-muted-foreground">
                  любой формат, до {MAX_UPLOAD_MB} МБ на фото
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.HEIC,image/heic,image/heif"
                multiple
                className="hidden"
                onChange={(e) => {
                  const list = e.target.files;
                  if (!list?.length) return;
                  const all = Array.from(list);
                  const oversize = all.filter((f) => f.size > MAX_UPLOAD_BYTES);
                  const next = all.filter((f) => f.size > 0 && f.size <= MAX_UPLOAD_BYTES);
                  if (oversize.length) {
                    setError(`Часть файлов больше ${MAX_UPLOAD_MB} МБ — их не добавили.`);
                  }
                  if (!next.length) {
                    setError(
                      oversize.length
                        ? `Максимум ${MAX_UPLOAD_MB} МБ на фото.`
                        : "Файл пустой — выберите другое фото из галереи.",
                    );
                    return;
                  }
                  setPicked((prev) => [...prev, ...next]);
                  setError("");
                  e.target.value = "";
                }}
              />
              {picked.length > 0 && localPreviews.length < picked.length ? (
                <p className="text-xs text-muted-foreground">Готовим превью…</p>
              ) : null}
              {localPreviews.length > 0 && (
                <PreviewGrid
                  title="Перед отправкой — проверьте"
                  urls={localPreviews.map((row, i) => ({
                    id: `local-${i}`,
                    alt: row.file.name || `Фото ${i + 1}`,
                    src: row.url,
                  }))}
                  onOpen={(index) => setLightbox({ kind: "local", index })}
                />
              )}
              <Button
                type="button"
                className="w-full"
                disabled={busy || !picked.length || overNeed}
                onClick={() => void uploadFiles()}
              >
                {busy
                  ? uploadPhase === "processing"
                    ? "Сохраняем на сервере…"
                    : "Отправляем…"
                  : picked.length
                    ? `Отправить ${picked.length} фото`
                    : "Отправить"}
              </Button>
              {busy && uploadPct !== null ? (
                <div className="space-y-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-200"
                      style={{ width: `${uploadPhase === "processing" ? 100 : uploadPct}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {uploadPhase === "processing"
                      ? "Сохраняем и проверяем фото…"
                      : `Загрузка ${uploadPct}%`}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {notice && <p className="text-sm text-accent-foreground">{notice}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      <Dialog open={Boolean(serverOpen || localOpen)} onOpenChange={(next) => !next && setLightbox(null)}>
        <DialogContent className="max-w-[min(100vw-2rem,42rem)] border-border bg-card p-0">
          {serverOpen && uploaded[lightbox!.index] && (
            <LightboxBody
              title={`${lightbox!.index + 1} из ${uploaded.length}`}
              src={fileSrc(slug, intakeKey, uploaded[lightbox!.index].id)}
              alt={uploaded[lightbox!.index].name}
              onPrev={() => stepServer(-1)}
              onNext={() => stepServer(1)}
            />
          )}
          {localOpen && localPreviews[lightbox!.index] && (
            <LightboxBody
              title={`${lightbox!.index + 1} из ${localPreviews.length}`}
              src={localPreviews[lightbox!.index].url}
              alt={localPreviews[lightbox!.index].file.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center text-[10px] leading-tight text-muted-foreground">
        <span className="font-medium">Фото</span>
        <span className="line-clamp-3 break-all">{alt}</span>
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function PreviewGrid({
  title,
  urls,
  onOpen,
  onRemove,
}: {
  title: string;
  urls: { id: string; alt: string; src: string }[];
  onOpen: (index: number) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((row, index) => (
          <div key={row.id} className="relative">
            <button
              type="button"
              className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted"
              onClick={() => onOpen(index)}
            >
              <Thumb src={row.src} alt={row.alt} />
            </button>
            {onRemove ? (
              <button
                type="button"
                aria-label="Удалить фото"
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background/95 text-xs font-bold shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(row.id);
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function LightboxBody({
  title,
  src,
  alt,
  onPrev,
  onNext,
}: {
  title: string;
  src: string;
  alt: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <>
      <DialogHeader className="px-4 pt-4">
        <DialogTitle className="text-sm font-normal text-muted-foreground">{title}</DialogTitle>
      </DialogHeader>
      <div className="bg-black/50 px-2 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto max-h-[72vh] w-full object-contain" />
        {onPrev && onNext ? (
          <div className="mt-3 flex justify-between gap-2 px-2">
            <Button type="button" variant="outline" size="sm" onClick={onPrev}>
              Назад
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onNext}>
              Дальше
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}