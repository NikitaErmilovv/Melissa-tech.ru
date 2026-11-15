"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { postJson, useDesk } from "./use-desk";

export function SettingsView() {
  const router = useRouter();
  const { data, reload } = useDesk();
  const [token, setToken] = useState("");
  const [silence, setSilence] = useState("2");
  const [remind, setRemind] = useState("4");
  const [primed, setPrimed] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [articleId, setArticleId] = useState("");
  const [clientName, setClientName] = useState("Анна");
  const [text, setText] = useState("Здравствуйте, хочу отправить фото");
  const [photoCount, setPhotoCount] = useState("0");

  useEffect(() => {
    if (!data || primed) return;
    setSilence(String(data.settings.silenceMin));
    setRemind(String(data.settings.remindMin));
    setArticleId(data.articles[0]?.id ?? "");
    setPrimed(true);
  }, [data, primed]);

  async function run(label: string, task: () => Promise<unknown>) {
    setBusy(label);
    setNote("");
    try {
      const result = await task();
      await reload();
      if (result && typeof result === "object" && "message" in result && typeof result.message === "string") setNote(result.message);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "не получилось");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <section className="sheet space-y-4 p-4">
        <h1 className="font-serif text-3xl">Кабинет</h1>
        <p className="text-sm text-muted-foreground">
          Один общий вход на офисный компьютер. Токен хранится только в папке data на этой машине и в чат покупателя не показывается.
        </p>
        <div className="space-y-1">
          <Label htmlFor="token">Токен продавца</Label>
          <Input
            id="token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder={data?.settings.tokenSet ? `сохранён, окончание …${data.settings.tokenTail}` : "вставьте токен"}
            className="h-10 bg-background"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">Нужны категории «Чат с покупателями» и «Маркетплейс». Вставляйте как есть, без слова Bearer, если его не было.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="silence">Пауза, мин</Label>
            <Input id="silence" inputMode="numeric" value={silence} onChange={(event) => setSilence(event.target.value)} className="h-10 bg-background" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="remind">Повтор, мин</Label>
            <Input id="remind" inputMode="numeric" value={remind} onChange={(event) => setRemind(event.target.value)} className="h-10 bg-background" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Если фото ещё не все, бот молчит эту паузу после последнего файла и потом повторяет, сколько ещё не хватает.
        </p>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3">
          <div>
            <p className="text-sm">Ответы покупателям</p>
            <p className="text-xs text-muted-foreground">
              {data?.settings.liveReplies
                ? "С этого включения берём только новые сообщения. Папка появляется, когда покупатель сам написал."
                : "Выключены — бот не отвечает даже на новое сообщение. Старые чаты при этом не забираем."}
            </p>
          </div>
          <Button
            type="button"
            variant={data?.settings.liveReplies ? "default" : "outline"}
            className="h-10"
            disabled={Boolean(busy)}
            onClick={() => run("ответы", () => postJson("/api/settings", { liveReplies: !data?.settings.liveReplies }, "PUT"))}
          >
            {data?.settings.liveReplies ? "Включены" : "Выключены"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-10"
            disabled={Boolean(busy)}
            onClick={() =>
              run("сохранение", () =>
                postJson("/api/settings", { token, silenceMin: Number(silence), remindMin: Number(remind) }, "PUT"),
              )
            }
          >
            Сохранить
          </Button>
          <Button type="button" variant="outline" className="h-10" disabled={Boolean(busy)} onClick={() => run("проверка", () => postJson("/api/wb/test", {}))}>
            Проверить токен
          </Button>
          <Button type="button" variant="outline" className="h-10" disabled={Boolean(busy) || !data?.settings.liveReplies} onClick={() => run("опрос", () => postJson("/api/poll", {}))}>
            Забрать новые сообщения
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={Boolean(busy) || !data?.settings.tokenSet}
            onClick={() => run("токен", () => postJson("/api/settings", { clearToken: true }, "PUT"))}
          >
            Удалить токен
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          На стол попадают только люди, которые напишут после включения ответов. Старую переписку и заказы, по которым никто не писал, не выгружаем. Писать первым нельзя.
        </p>
      </section>

      <div className="space-y-4">
        <section className="sheet space-y-3 p-4">
          <h2 className="font-serif text-2xl">Проверка без WB</h2>
          <p className="text-sm text-muted-foreground">Сообщение проходит ту же обработку, что и чат. В Wildberries ничего не уходит.</p>
          <div className="space-y-1">
            <Label>Артикул</Label>
            <Select value={articleId} onValueChange={(value) => setArticleId(value ?? "")}>
              <SelectTrigger className="h-10 w-full bg-background">
                <SelectValue placeholder="Выберите артикул" />
              </SelectTrigger>
              <SelectContent>
                {(data?.articles ?? []).map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="client">Имя</Label>
            <Input id="client" value={clientName} onChange={(event) => setClientName(event.target.value)} className="h-10 bg-background" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea id="message" value={text} onChange={(event) => setText(event.target.value)} rows={4} className="bg-background" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="photos">Фото в этом сообщении, до 40</Label>
            <Input id="photos" inputMode="numeric" value={photoCount} onChange={(event) => setPhotoCount(event.target.value)} className="h-10 bg-background" />
          </div>
          <Button
            type="button"
            className="h-10"
            disabled={Boolean(busy) || !articleId}
            onClick={() =>
              run("демо", async () => {
                const result = (await postJson("/api/demo", {
                  articleId,
                  clientName,
                  text,
                  photoCount: Number(photoCount) || 0,
                })) as { orderId?: string };
                if (result.orderId) router.push(`/orders/${result.orderId}`);
                return result;
              })
            }
          >
            Создать заказ
          </Button>
        </section>

        <section className="sheet space-y-3 p-4">
          <h2 className="font-serif text-2xl">Неделя</h2>
          <p className="text-sm text-muted-foreground">
            Само ничего не стирается. Кнопка убирает только готовые, отменённые и брак старше 7 дней. Новые и те, что в печати, остаются.
          </p>
          <Button type="button" variant="outline" className="h-10" onClick={() => setCleanupOpen(true)}>
            Убрать старые папки
          </Button>
          <Dialog open={cleanupOpen} onOpenChange={setCleanupOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Убрать папки старше недели?</DialogTitle>
                <DialogDescription>Возьмутся только статусы «готово», «отменён» и «брак». Фото этих заказов удалятся с компьютера.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCleanupOpen(false)}>
                  Не надо
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    setCleanupOpen(false);
                    void run("очистка", () => postJson("/api/cleanup", {}));
                  }}
                >
                  Убрать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
        {note ? <p className="text-sm">{note}</p> : null}
        {busy ? <p className="text-sm text-muted-foreground">{busy}…</p> : null}
      </div>
    </div>
  );
}
