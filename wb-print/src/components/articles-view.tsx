"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countPhrase } from "@/lib/text";
import type { ProductKind } from "@/lib/types";
import { postJson, send, useDesk } from "./use-desk";

const EMPTY = { id: "", vendorCode: "", nmId: "", title: "", photoCount: "2", note: "3D-стикеры на заказ", kind: "sticker" as ProductKind };

export function ArticlesView() {
  const { data, reload } = useDesk();
  const [form, setForm] = useState(EMPTY);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setNote("");
    try {
      const body = {
        vendorCode: form.vendorCode,
        title: form.title,
        nmId: form.nmId.trim() ? Number(form.nmId) : null,
        photoCount: Number(form.photoCount),
        note: form.note,
        kind: form.kind,
      };
      if (form.id) await postJson(`/api/articles/${form.id}`, body, "PATCH");
      else await postJson("/api/articles", body);
      setForm(EMPTY);
      await reload();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "не сохранилось");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="font-serif text-3xl">Артикулы</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Сейчас заведены только 3D-стикеры на заказ. Число в карточке — сколько макетов ждать, не сколько штук в заказе WB. Папка такого заказа лежит отдельно от фото.
        </p>
        <ul className="mt-5 space-y-2">
          {(data?.articles ?? []).map((article) => (
            <li key={article.id} className="sheet flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <p className="font-medium">
                  {article.title} · {countPhrase(article.photoCount, article.kind || "sticker")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {article.vendorCode}
                  {article.nmId ? ` · WB ${article.nmId}` : ""}
                  {article.note ? ` · ${article.note}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      id: article.id,
                      vendorCode: article.vendorCode,
                      nmId: article.nmId ? String(article.nmId) : "",
                      title: article.title,
                      photoCount: String(article.photoCount),
                      note: article.note,
                      kind: article.kind || "sticker",
                    })
                  }
                >
                  Править
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (!window.confirm(`Убрать артикул ${article.vendorCode}? Уже созданные папки останутся.`)) return;
                    await send(`/api/articles/${article.id}`, { method: "DELETE" });
                    await reload();
                  }}
                >
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="sheet h-fit space-y-3 p-4 lg:sticky lg:top-24"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <h2 className="font-serif text-xl">{form.id ? "Правка" : "Новая карточка"}</h2>
        <div className="space-y-1">
          <Label htmlFor="code">Артикул продавца</Label>
          <Input id="code" value={form.vendorCode} onChange={(event) => set("vendorCode", event.target.value)} className="h-10 bg-background" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="nm">nmId, если есть</Label>
          <Input id="nm" value={form.nmId} onChange={(event) => set("nmId", event.target.value)} className="h-10 bg-background" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="title">Название</Label>
          <Input id="title" value={form.title} onChange={(event) => set("title", event.target.value)} className="h-10 bg-background" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="count">{form.kind === "photo" ? "Сколько фото" : "Сколько стикеров"}</Label>
          <Input id="count" inputMode="numeric" value={form.photoCount} onChange={(event) => set("photoCount", event.target.value)} className="h-10 bg-background" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="note">Заметка</Label>
          <Input id="note" value={form.note} onChange={(event) => set("note", event.target.value)} className="h-10 bg-background" />
        </div>
        {note ? <p className="text-sm text-destructive">{note}</p> : null}
        <Button type="submit" className="h-10 w-full" disabled={busy}>
          {form.id ? "Сохранить" : "Добавить"}
        </Button>
        {form.id ? (
          <Button type="button" variant="ghost" className="w-full" onClick={() => setForm(EMPTY)}>
            Это новая карточка
          </Button>
        ) : null}
      </form>
    </div>
  );
}
