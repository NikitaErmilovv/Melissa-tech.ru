import Script from "next/script";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Пользовательское соглашение",
  description:
    "Условия использования сайта Aliento: регистрация, личный кабинет, запись на занятия, оплата абонементов через ЮKassa.",
  path: "/terms",
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

export default function TermsPage() {
  const { owner } = siteConfig;
  const executor = owner.legalName;
  const innLine = owner.inn ? `, ИНН ${owner.inn}` : "";

  return (
    <>
      <Script
        id="ld-breadcrumb-terms"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Пользовательское соглашение", path: "/terms" },
            ])
          ),
        }}
      />

      <PageHeader
        eyebrow="Документы"
        title="Пользовательское соглашение"
        description="Публичная оферта на использование сайта и оказание услуг школы бачаты Aliento. Регистрируясь и оплачивая абонемент, вы принимаете эти условия."
      />

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="content-panel mx-auto max-w-3xl lg:p-10">
            <p className="label-caps label-muted">Редакция от {UPDATED_AT}</p>

            <div className="mt-10 space-y-10">
              <Block title="1. Стороны и предмет">
                <p>
                  Настоящее пользовательское соглашение (далее — «Соглашение») регулирует отношения
                  между {executor}
                  {innLine}, оказывающим услуги под брендом {owner.name} (далее — «Исполнитель»), и
                  физическим лицом, использующим сайт {siteConfig.url} (далее — «Пользователь»).
                </p>
                <p>
                  Исполнитель оказывает услуги по обучению танцам (групповые и иные занятия), а
                  Пользователь получает доступ к информации о расписании, личному кабинету, записи на
                  занятия и онлайн-оплате абонементов через сайт.
                </p>
                <p>
                  Исполнитель применяет специальный налоговый режим «Налог на профессиональный доход»
                  (самозанятость). По каждой оплаченной услуге формируется чек в приложении «Мой
                  налог» в порядке, предусмотренном законодательством РФ.
                </p>
              </Block>

              <Block title="2. Регистрация и аккаунт">
                <p>
                  Для записи на занятия и покупки абонемента необходима регистрация с указанием ФИО,
                  даты рождения, телефона, адреса электронной почты и пароля. Пользователь обязан
                  предоставлять достоверные данные и не передавать доступ к аккаунту третьим лицам.
                </p>
                <p>
                  Подтверждение email выполняется кодом, направляемым на указанный адрес. Исполнитель
                  вправе заблокировать аккаунт при нарушении{" "}
                  <Link href="/rules" className="link-underline text-accent-300">
                    правил школы
                  </Link>{" "}
                  или злоупотреблении сервисом.
                </p>
              </Block>

              <Block title="3. Запись на занятия и абонементы">
                <p>
                  Расписание и наличие мест публикуются на сайте. Запись из личного кабинета
                  возможна при наличии активного абонемента с неиспользованными занятиями. Отмена и
                  перенос — по{" "}
                  <Link href="/rules" className="link-underline text-accent-300">
                    правилам школы
                  </Link>
                  .
                </p>
                <p>
                  Абонемент включает фиксированное число занятий и действует в указанный срок.
                  Стоимость и состав тарифов указаны на странице{" "}
                  <Link href="/subscriptions" className="link-underline text-accent-300">
                    «Абонементы»
                  </Link>
                  .
                </p>
              </Block>

              <Block title="4. Оплата">
                <p>
                  Оплата абонементов на сайте производится через платёжный сервис{" "}
                  <Link
                    href={siteConfig.payments.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.payments.provider}
                  </Link>
                  . После успешного платежа абонемент активируется автоматически в личном кабинете.
                </p>
                <p>
                  Моментом акцепта оферты считается нажатие кнопки оплаты и завершение платежа в
                  платёжной системе. Возврат денежных средств возможен в случаях, предусмотренных
                  законодательством РФ и правилами школы, — по обращению в{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    Telegram
                  </Link>
                  .
                </p>
              </Block>

              <Block title="5. Персональные данные">
                <p>
                  Обработка персональных данных описана в{" "}
                  <Link href="/privacy" className="link-underline text-accent-300">
                    политике конфиденциальности
                  </Link>
                  . Использование cookie — в{" "}
                  <Link href="/cookies" className="link-underline text-accent-300">
                    политике cookie
                  </Link>
                  .
                </p>
              </Block>

              <Block title="6. Ограничение ответственности">
                <p>
                  Сайт предоставляется «как есть». Исполнитель не несёт ответственности за временную
                  недоступность сервиса по причинам, не зависящим от него (сбои связи, работы
                  платёжных и хостинг-провайдеров), при условии принятия разумных мер по
                  восстановлению работы.
                </p>
                <p>
                  Занятия танцами связаны с физической активностью. Пользователь самостоятельно
                  оценивает своё состояние здоровья и сообщает преподавателю об ограничениях.
                </p>
              </Block>

              <Block title="7. Изменение условий">
                <p>
                  Исполнитель вправе изменять Соглашение, публикуя новую редакцию на этой странице.
                  Продолжение использования сайта после изменений означает согласие с обновлёнными
                  условиями.
                </p>
              </Block>

              <Block title="8. Контакты">
                <p>
                  Вопросы по Соглашению, оплате и занятиям:{" "}
                  <Link
                    href={siteConfig.telegram.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-accent-300"
                  >
                    {siteConfig.telegram.channelHandle}
                  </Link>
                  , {siteConfig.contacts.email}, {siteConfig.contacts.phone}.
                </p>
              </Block>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center text-[10px] leading-snug text-muted-dim">
            <p>
              {executor}
              {innLine}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
