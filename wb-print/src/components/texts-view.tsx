"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATE_META } from "@/lib/text";
import type { Templates } from "@/lib/types";
import { postJson, useDesk } from "./use-desk";

export function TextsView() {
  const { data, reload } = useDesk();
  const [draft, setDraft] = useState<Templates | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data && !draft) setDraft(data.templates);
  }, [data, draft]);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setNote("");
    try {
      await postJson("/api/templates", draft, "PUT");
      await reload();
      setNote("Тексты сохранены. Следующее сообщение покупателю уйдёт уже с ними.");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "не сохранилось");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Тексты бота</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Бот пишет только после сообщения покупателя. Для стикеров сразу просит фотографии в чат, без ссылки, и лучше квадратом: «пришлите, пожалуйста, шесть фотографий». Если кадр не квадратный, в папку ляжет квадрат с левого верхнего угла. Для печати фотографий по-прежнему можно выбрать чат или диск, без обрезки. Когда набор полный, бот пишет, что фото приняты. Заменить их можно за 30 минут: сначала слово «замена», потом новые файлы. Пока файлов не все, напоминание повторяется само.
      </p>
      {!draft ? <p className="mt-6 text-sm text-muted-foreground">Загружаю тексты…</p> : null}
      <div className="mt-6 space-y-5">
        {draft
          ? TEMPLATE_META.map((item) => (
              <div key={item.key} className="sheet space-y-2 p-4">
                <Label htmlFor={item.key}>{item.title}</Label>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
                <Textarea
                  id={item.key}
                  value={draft[item.key]}
                  rows={item.key === "greeting" || item.key === "greetingSticker" || item.key === "complete" ? 8 : 4}
                  onChange={(event) => setDraft({ ...draft, [item.key]: event.target.value })}
                  className="bg-background"
                />
              </div>
            ))
          : null}
      </div>
      {note ? <p className="mt-4 text-sm">{note}</p> : null}
      <Button type="button" className="mt-4 h-10" disabled={!draft || busy} onClick={() => void save()}>
        Сохранить тексты
      </Button>
    </div>
  );
}
