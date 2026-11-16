export type PrintStatus = "new" | "printing" | "done" | "defect" | "cancelled";

export type ProductKind = "sticker" | "photo";

export type IntakeMode = "choice" | "photos" | "link";

export type FileSource = "chat" | "yandex" | "gdrive" | "manual" | "demo" | "site";

export type TemplateKey =
  | "greeting"
  | "greetingSticker"
  | "askPhotos"
  | "askLink"
  | "diskSaved"
  | "stickerNoLink"
  | "progress"
  | "reminder"
  | "idleNudge"
  | "complete"
  | "replaceAsk"
  | "replaceLocked"
  | "replaceClosed"
  | "unknownArticle"
  | "siteOnly";

export type Templates = Record<TemplateKey, string>;

export interface Article {
  id: string;
  vendorCode: string;
  nmId: number | null;
  title: string;
  photoCount: number;
  note: string;
  kind: ProductKind;
}

export interface OrderFile {
  id: string;
  name: string;
  relPath: string;
  bytes: number;
  contentType: string;
  source: FileSource;
  addedAt: string;
}

export interface OrderLog {
  at: string;
  kind: "in" | "out" | "system";
  text: string;
  delivered?: boolean;
}

export interface PendingDownload {
  id: string;
  name: string;
  tries: number;
}

export interface Order {
  id: string;
  wbOrderId: string;
  orderUid: string;
  rid: string;
  nmId: number | null;
  vendorCode: string;
  articleTitle: string;
  kind: ProductKind;
  expectedPhotos: number;
  clientName: string;
  chatId: string;
  replySign: string;
  folderRel: string;
  createdAt: string;
  updatedAt: string;
  printStatus: PrintStatus;
  intakeMode: IntakeMode;
  greetedAt: string | null;
  replacing: boolean;
  replaceHintAt: string | null;
  diskUrl: string;
  diskNote: string;
  lastPhotoAt: string | null;
  lastReminderAt: string | null;
  completedNoticeAt: string | null;
  /** Когда заказ убран со стола (обычно после «Готово»). */
  archivedAt: string | null;
  source: "wb" | "demo";
  files: OrderFile[];
  log: OrderLog[];
  pendingDownloads: PendingDownload[];
  /** Публичная ссылка для загрузки фото покупателем. */
  intakeToken: string;
}

export interface FbsOrder {
  id: number;
  rid: string;
  nmId: number | null;
  article: string;
  orderUid: string;
  createdAt: string;
}

export interface ChatSign {
  replySign: string;
  clientName: string;
  nmId: number | null;
  rid: string;
}

export interface Settings {
  token: string;
  silenceMin: number;
  remindMin: number;
  eventNext: number | null;
  eventCaughtUp: boolean;
  eventSeenUntil: number;
  watchFrom: number;
  lastStatusSyncAt: string | null;
  lastChatSyncAt: string | null;
  chatSigns: Record<string, ChatSign>;
  seenEventIds: string[];
  liveReplies: boolean;
}

export interface Database {
  version: 1;
  articles: Article[];
  orders: Order[];
  templates: Templates;
  settings: Settings;
  fbsOrders: FbsOrder[];
  fbsFetchedAt: string | null;
}

export interface PublicOrder extends Omit<Order, "replySign" | "pendingDownloads"> {
  pending: number;
}

export interface PublicState {
  now: string;
  orders: PublicOrder[];
  articles: Article[];
  templates: Templates;
  settings: {
    tokenSet: boolean;
    tokenTail: string;
    silenceMin: number;
    remindMin: number;
    liveReplies: boolean;
    fbsCount: number;
    eventsReady: boolean;
  };
  worker: {
    lastTickAt: string | null;
    lastError: string;
    mode: "live" | "demo";
    lastEventCount: number;
  };
}
