import { STUDIO_ADDRESS, STUDIO_VENUE_LABEL } from "@/lib/messengers";

/** 2GIS card: https://2gis.ru/novosibirsk/firm/70000001116531788 */
export const ALIENTO_2GIS_FIRM_URL = "https://2gis.ru/novosibirsk/firm/70000001116531788";

const MAP_LAT = 54.99141;
const MAP_LON = 82.9087;

export function twoGisStaticMapUrl(size: string) {
  const center = `${MAP_LAT},${MAP_LON}`;
  return `https://static.maps.2gis.com/1.0?s=${size}&c=${center}&z=17&pt=${center}~k:p`;
}

export const locationCopy = {
  venueLabel: STUDIO_VENUE_LABEL,
  addressLine: `г. Новосибирск, ${STUDIO_ADDRESS}`,
  metroHint: "м. Студенческая — несколько минут пешком",
  mapAlt: `Карта 2ГИС — ${STUDIO_ADDRESS}, Новосибирск`,
} as const;
