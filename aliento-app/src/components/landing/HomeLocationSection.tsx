import { Container } from "@/components/Container";
import {
  ALIENTO_2GIS_FIRM_URL,
  locationCopy,
  twoGisStaticMapUrl,
} from "@/lib/location";
import { siteConfig } from "@/lib/site";

type Props = {
  hours?: string;
};

export function HomeLocationSection({ hours }: Props) {
  const phone = siteConfig.contacts.phone;
  const tel = phone.replace(/[^+\d]/g, "");
  const schedule = hours?.trim() || siteConfig.contacts.hours;
  const mapDesktop = twoGisStaticMapUrl("880x450");
  const mapMobile = twoGisStaticMapUrl("720x720");

  return (
    <section id="contacts" className="studio-location">
      <div className="studio-location-bg" aria-hidden>
        <div className="studio-location-glow studio-location-glow--tr" />
        <div className="studio-location-glow studio-location-glow--bl" />
      </div>

      <Container className="studio-location-inner">
        <div className="studio-location-grid">
          <div className="studio-location-copy">
            <div className="studio-location-intro">
              <div className="studio-location-kicker">
                <span className="studio-location-line" />
                <span className="label-caps text-accent-300">Локация</span>
              </div>
              <h2 className="studio-location-title">
                Где мы
                <br />
                <span className="text-accent-300">находимся.</span>
              </h2>
              <p className="studio-location-lead">
                Приходите на занятия по записи. Точный адрес и маршрут — в 2ГИС.
              </p>
              <div className="studio-location-divider studio-location-divider--intro" aria-hidden />
            </div>

            <div className="studio-location-details-wrap">
              <div className="studio-location-details">
                <div>
                  <span className="studio-location-detail-label">Студия</span>
                  <p className="studio-location-brand">ALIENTO</p>
                  <p className="studio-location-muted">{locationCopy.addressLine}</p>
                  <p className="studio-location-muted-sm">{locationCopy.metroHint}</p>
                  <p className="studio-location-muted-sm">{schedule}</p>
                </div>
                <div>
                  <span className="studio-location-detail-label">Телефон</span>
                  <a href={`tel:${tel}`} className="studio-location-phone">
                    {phone}
                  </a>
                </div>
              </div>
              <a
                href={ALIENTO_2GIS_FIRM_URL}
                className="btn btn-primary studio-location-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Как добраться
              </a>
            </div>
          </div>

          <div className="studio-location-visual">
            <a
              href={ALIENTO_2GIS_FIRM_URL}
              className="studio-location-frame"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="studio-location-map studio-location-map--desktop"
                src={mapDesktop}
                alt=""
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="studio-location-map studio-location-map--mobile"
                src={mapMobile}
                alt={locationCopy.mapAlt}
              />
              <div className="studio-location-pin" aria-hidden>
                <span className="studio-location-pin-text">ALIENTO</span>
              </div>
            </a>
            <div className="studio-location-decor" aria-hidden />
          </div>
        </div>
      </Container>
    </section>
  );
}
