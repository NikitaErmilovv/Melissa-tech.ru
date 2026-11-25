import Script from "next/script";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Политика конфиденциальности",
  description:
    "Политика в отношении обработки персональных данных на сайте Aliento: какие данные собираются, зачем используются cookie и как связаться со школой.",
  path: "/privacy",
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

export default function PrivacyPage() {
  const { owner } = siteConfig;

  return (
    <>
      <Script
        id="ld-breadcrumb-privacy"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Политика конфиденциальности", path: "/privacy" },
            ])
          ),
        }}
      />

      <PageHeader
        eyebrow="Документы"
        title="Политика конфиденциальности"
        description="Документ описывает, какие данные обрабатываются при использовании сайта Aliento, с какой целью и как вы можете отказаться от их обработки."
      />

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="content-panel mx-auto max-w-3xl lg:p-10">
            <p className="label-caps label-muted">
              Редакция от {UPDATED_AT}
            </p>

            <div className="mt-10 space-y-10">
              <Block title="1. Владелец сайта и оператор данных">
                <p>
                  Владельцем сайта и оператором обработки персональных данных является{" "}
                  {owner.name}.
                </p>
                <p>
                  Связаться с оператором можно через личные сообщения Telegram-канала{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.telegram.channelHandle}
                  </Link>
                  .
                </p>
                <p>
                  Использование сайта означает согласие с настоящей политикой. Если вы не
                  согласны с её условиями, пожалуйста, прекратите использование сайта.
                </p>
              </Block>

              <Block title="2. Какие данные обрабатываются">
                <p>
                  При регистрации и использовании личного кабинета мы обрабатываем данные, которые вы
                  указываете сами: ФИО, дата рождения, номер телефона, адрес электронной почты, а
                  также хеш пароля (сам пароль в открытом виде не хранится).
                </p>
                <p>
                  Для входа в аккаунт и работы кабинета используются технические данные сессии.
                  При восстановлении доступа и подтверждении email на указанный адрес отправляются
                  одноразовые коды.
                </p>
                <p>
                  При оплате абонемента через сайт обрабатываются сведения о платеже: сумма, тариф,
                  статус, идентификатор транзакции в платёжной системе{" "}
                  <Link
                    href={siteConfig.payments.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.payments.provider}
                  </Link>
                  . Данные банковской карты обрабатываются на стороне платёжного провайдера и не
                  сохраняются на серверах сайта Aliento.
                </p>
                <p>
                  При посещении сайта автоматически обрабатываются обезличенные технические данные:
                  IP-адрес, тип браузера и операционной системы, язык интерфейса, дата и время
                  обращения, адреса открытых страниц.
                </p>
              </Block>

              <Block title="3. Цели обработки">
                <p>Персональные и технические данные обрабатываются, чтобы:</p>
                <ul className="panel-list">
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>регистрировать аккаунт и обеспечивать вход в личный кабинет;</span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>записывать на занятия, учитывать абонементы и посещения;</span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>принимать оплату абонементов и формировать чеки (самозанятость);</span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      отправлять сервисные письма: коды подтверждения email и восстановление пароля;
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      обеспечивать работу сайта, улучшать сервис и защищаться от злоупотреблений.
                    </span>
                  </li>
                </ul>
                <p>
                  Данные не используются для несогласованной рекламной рассылки и не продаются
                  третьим лицам. Подробнее о cookie — на странице{" "}
                  <Link href="/cookies" className="link-underline text-accent-300">
                    политики cookie
                  </Link>
                  .
                </p>
              </Block>

              <Block title="4. Cookie и аналогичные технологии">
                <p>
                  Cookie — это небольшие текстовые файлы, которые сохраняются в вашем
                  браузере при посещении сайта. Сайт использует:
                </p>
                <ul className="panel-list">
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      <strong className="text-foreground">технические cookie</strong> и
                      локальное хранилище браузера — например, чтобы запомнить, что вы уже
                      закрыли уведомление об использовании cookie;
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      <strong className="text-foreground">аналитические cookie</strong> —
                      если на сайте подключены внешние сервисы веб-аналитики. Они собирают
                      обезличенную статистику посещений в соответствии с политиками
                      конфиденциальности соответствующих сервисов.
                    </span>
                  </li>
                </ul>
                <p>
                  Вы можете в любой момент удалить сохранённые cookie и запретить их
                  запись в настройках своего браузера. Отключение технических cookie может
                  повлиять на корректность отображения отдельных элементов сайта.
                </p>
              </Block>

              <Block title="5. Передача данных третьим лицам">
                <p>
                  Оператор может передавать данные партнёрам, без которых сервис не работает:
                </p>
                <ul className="panel-list">
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>провайдеру хостинга — для размещения сайта;</span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      почтовому сервису (SMTP) — для отправки кодов подтверждения и писем
                      восстановления пароля;
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>
                      платёжному сервису {siteConfig.payments.provider} — для приёма оплаты
                      абонементов;
                    </span>
                  </li>
                  <li>
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>сервисам веб-аналитики — если они подключены.</span>
                  </li>
                </ul>
                <p>
                  Данные могут быть предоставлены государственным органам по мотивированному
                  запросу в порядке, предусмотренном законодательством Российской Федерации.
                </p>
              </Block>

              <Block title="6. Переходы в Telegram и на внешние сайты">
                <p>
                  Основное взаимодействие со школой Aliento происходит в Telegram.
                  После перехода по ссылке в канал, чат или личные сообщения обработка
                  ваших данных регулируется политикой конфиденциальности Telegram, а не
                  настоящим документом.
                </p>
                <p>
                  То же относится к другим внешним ресурсам, ссылки на которые размещены на
                  сайте. Оператор не отвечает за содержание и политики сторонних сайтов.
                </p>
              </Block>

              <Block title="7. Хранение и защита данных">
                <p>
                  Технические данные и статистика хранятся не дольше, чем требуется для
                  указанных выше целей, после чего удаляются или обезличиваются. Оператор
                  принимает разумные организационные и технические меры для защиты данных
                  от неправомерного доступа, изменения и распространения.
                </p>
              </Block>

              <Block title="8. Ваши права">
                <p>
                  Вы вправе запросить информацию об обработке ваших данных, потребовать их
                  уточнения, блокирования или удаления, а также отозвать согласие на
                  обработку. Для этого напишите оператору в личные сообщения Telegram-канала{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.telegram.channelHandle}
                  </Link>
                  . Ответ будет направлен в срок, установленный законодательством
                  Российской Федерации.
                </p>
              </Block>

              <Block title="9. Изменения политики">
                <p>
                  Оператор вправе изменять настоящую политику. Актуальная редакция всегда
                  размещена на этой странице, дата редакции указана в начале документа.
                  Рекомендуем периодически проверять её содержание.
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
