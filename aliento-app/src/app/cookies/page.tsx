import Script from "next/script";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Политика использования cookie",
  description:
    "Как сайт Aliento использует cookie и локальное хранилище браузера: технические, сессионные и аналитические файлы.",
  path: "/cookies",
});

const UPDATED_AT = "25 августа 2026 года";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="card-title text-lg md:text-xl">{title}</h2>
      <div className="prose-body mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function CookiesPage() {
  const { owner } = siteConfig;

  return (
    <>
      <Script
        id="ld-breadcrumb-cookies"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Политика cookie", path: "/cookies" },
            ])
          ),
        }}
      />

      <PageHeader
        eyebrow="Документы"
        title="Политика использования cookie"
        description="Кратко о том, какие файлы cookie и аналогичные технологии применяются на сайте Aliento и как ими управлять."
      />

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="content-panel mx-auto max-w-3xl lg:p-10">
            <p className="label-caps label-muted">Редакция от {UPDATED_AT}</p>

            <div className="mt-10 space-y-10">
              <Block title="1. Что такое cookie">
                <p>
                  Cookie — небольшие текстовые файлы, которые сайт сохраняет в браузере. Они помогают
                  запоминать настройки, поддерживать вход в аккаунт и понимать, как посетители
                  используют страницы. Подробнее о персональных данных — в{" "}
                  <Link href="/privacy" className="link-underline text-accent-300">
                    политике конфиденциальности
                  </Link>
                  .
                </p>
              </Block>

              <Block title="2. Какие cookie мы используем">
                <ul className="panel-list">
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      <strong className="text-foreground">Обязательные (технические)</strong> —
                      сессия входа в личный кабинет и административную панель, защита от подделки
                      запросов. Без них регистрация, запись на занятия и оплата работать не будут.
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      <strong className="text-foreground">Функциональные</strong> — запоминание темы
                      оформления (светлая/тёмная) и факта закрытия уведомления о cookie в локальном
                      хранилище браузера (<code className="text-foreground">localStorage</code>).
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      <strong className="text-foreground">Аналитические</strong> — если подключены
                      сервисы веб-аналитики, они могут устанавливать собственные cookie для
                      обезличенной статистики посещений.
                    </span>
                  </li>
                </ul>
              </Block>

              <Block title="3. Cookie сторонних сервисов">
                <p>
                  При оплате абонемента вы переходите на защищённую страницу платёжного сервиса{" "}
                  <Link
                    href={siteConfig.payments.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.payments.provider}
                  </Link>
                  . На его стороне могут применяться собственные cookie и правила обработки данных.
                  Оператор сайта Aliento не контролирует cookie платёжного провайдера.
                </p>
                <p>
                  Переход в{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    Telegram
                  </Link>{" "}
                  также регулируется политикой соответствующего сервиса.
                </p>
              </Block>

              <Block title="4. Срок хранения">
                <p>
                  Сессионные cookie удаляются после выхода из аккаунта или закрытия браузера (в
                  зависимости от настроек). Запись о принятии уведомления о cookie хранится в
                  localStorage до её удаления пользователем. Сроки аналитических cookie определяются
                  политиками соответствующих сервисов.
                </p>
              </Block>

              <Block title="5. Как управлять cookie">
                <p>
                  Вы можете удалить сохранённые cookie и очистить localStorage в настройках браузера.
                  Отключение обязательных cookie приведёт к невозможности входа в личный кабинет и
                  оплаты на сайте.
                </p>
                <p>
                  Продолжая пользоваться сайтом и нажимая «Принять» в уведомлении о cookie, вы
                  соглашаетесь с использованием описанных технологий в объёме, необходимом для работы
                  сервиса.
                </p>
              </Block>

              <Block title="6. Контакты">
                <p>
                  По вопросам обработки данных обращайтесь к оператору — {owner.name} — через{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.telegram.channelHandle}
                  </Link>
                  . См. также{" "}
                  <Link href="/terms" className="link-underline text-accent-300">
                    пользовательское соглашение
                  </Link>
                  .
                </p>
              </Block>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center text-[10px] leading-snug text-muted-dim">
            <p>{owner.name}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
