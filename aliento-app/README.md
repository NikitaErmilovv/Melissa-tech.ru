# BARTER.lab — сайт биржи бартерных интеграций

Маркетинговый сайт для Telegram-канала [@barterlab](https://t.me/barterlab). Главная задача сайта — конвертировать посетителей из поиска (в том числе из ИИ-поиска/AI Overviews) в подписчиков и клиентов Telegram-канала, а также транслировать экспертный статус площадки в нише бартерных интеграций.

Стек: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**.

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Сборка и продакшн

```bash
npm run build
npm run start
```

## Обязательно перед публикацией

1. **Домен.** Сейчас в качестве канонического домена используется плейсхолдер `https://barterlab.ru` (см. `src/lib/site.ts`). Как только у вас будет реальный домен:
   - создайте `.env.local` на основе `.env.example` и укажите `NEXT_PUBLIC_SITE_URL=https://ваш-домен`;
   - либо задайте эту переменную окружения в настройках хостинга (Vercel/Netlify и т.д.).
2. **Подтверждение в Google Search Console / Яндекс.Вебмастер.** После деплоя добавьте сайт в вебмастерские, отправьте `https://ваш-домен/sitemap.xml`.
3. **Проверьте ссылки на Telegram** в `src/lib/site.ts` — сейчас используются реальные ссылки на канал `@barterlab` и посты-шаблоны.

## Структура проекта

```
src/
  app/
    page.tsx           — главная страница
    brands/page.tsx     — страница для брендов и продавцов
    bloggers/page.tsx    — страница для блогеров
    faq/page.tsx         — вопросы и ответы (с FAQPage JSON-LD)
    rules/page.tsx        — правила канала и чата
    layout.tsx            — общий layout: шрифты, метаданные, JSON-LD Organization/WebSite
    sitemap.ts             — генерация sitemap.xml
    robots.ts               — генерация robots.txt
    manifest.ts               — генерация manifest.webmanifest
    opengraph-image.tsx        — динамическая генерация OG-картинки
  components/            — переиспользуемые UI-блоки (Hero, FAQ-аккордеон, шаги и т.д.)
  lib/
    site.ts               — единая конфигурация (домен, ссылки на Telegram, тексты)
    faq-data.ts            — контент FAQ, используется и на главной, и на /faq
    metadata.ts             — хелпер для генерации Metadata на каждой странице
    json-ld.ts               — хелперы для BreadcrumbList / FAQPage JSON-LD
public/
  images/                 — логотип канала в разных размерах
  llms.txt                 — краткое структурированное описание проекта для AI-краулеров
```

## SEO и AEO (видимость в ИИ-поиске)

- Семантическая структура (`h1`–`h3`, списки, `nav`, `main`, `footer`) и понятные, самодостаточные ответы на вопросы (особенно в FAQ) — так контент проще цитировать поисковым ИИ (ChatGPT, Perplexity, Google AI Overviews, Яндекс.Нейро).
- `Organization`, `WebSite`, `BreadcrumbList` и `FAQPage` JSON-LD разметка (`src/lib/json-ld.ts`, `layout.tsx`).
- Уникальные `title`/`description`/canonical для каждой страницы (`src/lib/metadata.ts`).
- `sitemap.xml` и `robots.txt` генерируются нативно через Next.js (`app/sitemap.ts`, `app/robots.ts`) и **явно разрешают** краулеры ИИ-сервисов: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, YandexBot и др.
- `public/llms.txt` — простой машиночитаемый файл-выжимка о продукте (эмерджентный стандарт для AI-агентов, аналог robots.txt).
- Открытая справочная страница `/rules` с реальными правилами и ссылкой на регистрацию в реестре РКН — сигнал доверия (E-E-A-T) для поисковых систем.
- Автогенерируемая OG-картинка (`app/opengraph-image.tsx`) для красивых превью при шеринге в мессенджерах и соцсетях.

## Дизайн

Тёмная тема, выстроенная вокруг фиолетового «звёздного» градиента из лого канала: акцентный цвет `--accent-500`, шрифт заголовков — Unbounded, текст — Inter (оба с поддержкой кириллицы). Декоративные компоненты `BackgroundGlow`/`.grain-overlay` повторяют текстуру и свечение оригинального лого.

## Полезные скрипты

- `scripts/gen-images.mjs` — генерирует иконки (favicon, apple-icon, PWA-иконки) из `public/images/logo.png` через `sharp`. Запустить заново: `node scripts/gen-images.mjs`.
