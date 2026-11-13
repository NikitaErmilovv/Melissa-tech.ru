const DEFAULT_BOOK_TEXT =
  "Здравствуйте! Хочу записаться в Aliento — подскажите, какая группа подойдёт.";

const DEFAULT_TRIAL_TEXT =
  "Здравствуйте! Хочу на бесплатное пробное занятие — подскажите ближайшее время.";

function encode(text: string) {
  return encodeURIComponent(text);
}

export const STUDIO_ADDRESS = "проспект Карла Маркса, 53а";
export const STUDIO_VENUE_LABEL = `DekaDance, ${STUDIO_ADDRESS}`;

const TELEGRAM_USERNAME = "SitnikV_Tina";

export function telegramUrl(message = DEFAULT_BOOK_TEXT) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encode(message)}`;
}

export function maxShareUrl(message = DEFAULT_BOOK_TEXT) {
  return `https://max.ru/:share?text=${encode(message)}`;
}

export function trialTelegramUrl() {
  return telegramUrl(DEFAULT_TRIAL_TEXT);
}

export function trialMaxUrl() {
  return maxShareUrl(DEFAULT_TRIAL_TEXT);
}
