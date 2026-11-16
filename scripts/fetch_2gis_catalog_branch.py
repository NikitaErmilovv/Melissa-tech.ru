"""Fetch branch contacts, schedule, map point, and review stats from 2GIS Catalog API."""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from typing import Any

CATALOG_KEY = "292d0592-6e9a-4882-b2c6-5979d678ddea"
CATALOG_BASE = "https://catalog.api.2gis.ru/3.0/items/byid"
UA = "Mozilla/5.0 (compatible; MelissaTechSite/1.0)"

DAY_RU = {
    "Mon": "Пн",
    "Tue": "Вт",
    "Wed": "Ср",
    "Thu": "Чт",
    "Fri": "Пт",
    "Sat": "Сб",
    "Sun": "Вс",
}


def _normalize_phone(raw: str) -> tuple[str, str, str]:
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    if len(digits) != 11:
        return raw, raw, ""
    tel = f"+{digits}"
    disp = f"+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"
    wa = digits
    return tel, disp, wa


def _schedule_line(schedule: dict[str, Any] | None) -> str:
    if not schedule:
        return "По предварительной записи"
    comment = str(schedule.get("comment") or "").strip()
    days: list[str] = []
    for key in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"):
        block = schedule.get(key) or {}
        hours = block.get("working_hours") or []
        if not hours:
            continue
        h = hours[0]
        frm, to = h.get("from", ""), h.get("to", "")
        if frm and to:
            days.append(f"{DAY_RU[key]} {frm}–{to}")
    if not days:
        base = "По предварительной записи"
    elif len(days) == 5 and all("09:00" in d and "17:00" in d for d in days[:5]):
        base = "Пн–Пт 09:00–17:00"
    else:
        base = " · ".join(days)
    if comment:
        return f"{base} · {comment}"
    return base


def fetch_branch_catalog(branch_id: str, *, city_slug: str = "novosibirsk") -> dict[str, Any]:
    fields = ",".join(
        [
            "items.contact_groups",
            "items.schedule",
            "items.point",
            "items.reviews",
            "items.address_name",
            "items.name",
        ]
    )
    q = urllib.parse.urlencode({"id": branch_id, "key": CATALOG_KEY, "fields": fields})
    url = f"{CATALOG_BASE}?{q}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as resp:
        payload = json.loads(resp.read().decode("utf-8", "ignore"))
    items = (payload.get("result") or {}).get("items") or []
    if not items:
        raise RuntimeError(f"2GIS catalog: branch {branch_id} not found")
    item = items[0]
    point = item.get("point") or {}
    lat = float(point.get("lat") or 0)
    lon = float(point.get("lon") or 0)
    address = str(item.get("address_name") or "").strip()
    if address and not address.startswith("г."):
        address = f"г. Новосибирск, {address}"

    phones: list[dict[str, str]] = []
    wa = tg = ""
    for group in item.get("contact_groups") or []:
        for c in group.get("contacts") or []:
            ctype = str(c.get("type") or "")
            if ctype == "phone":
                tel, disp, wa_digits = _normalize_phone(str(c.get("value") or c.get("text") or ""))
                if tel and not any(p["tel"] == tel for p in phones):
                    phones.append({"tel": tel, "display": disp})
                    if not wa:
                        wa = wa_digits
            elif ctype == "whatsapp" and not wa:
                m = re.search(r"wa\.me/(\d+)", str(c.get("url") or c.get("value") or ""))
                if m:
                    wa = m.group(1)
            elif ctype == "telegram" and not tg:
                m = re.search(r"t\.me/(\+?\d+)", str(c.get("url") or c.get("value") or ""))
                if m:
                    tg = m.group(1)
                    if not tg.startswith("+"):
                        tg = "+" + tg

    schedule = item.get("schedule") or {}
    for group in item.get("contact_groups") or []:
        if group.get("schedule"):
            schedule = group["schedule"]
            break
    hours_line = _schedule_line(schedule)

    rev = item.get("reviews") or {}
    rating = rev.get("org_rating") or rev.get("general_rating") or rev.get("rating") or 5
    review_count = (
        rev.get("org_review_count")
        or rev.get("general_review_count")
        or rev.get("review_count")
        or 0
    )

    if phones and not tg:
        tg = phones[0]["tel"]
    if not wa and phones:
        wa = re.sub(r"\D", "", phones[0]["tel"])[-10:]

    firm_url = f"https://2gis.ru/{city_slug}/firm/{branch_id}"
    map_c = f"{lat},{lon}"
    map_desk = (
        f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={map_c}&amp;z=16&amp;pt={map_c}~k:p"
    )
    map_mob = (
        f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={map_c}&amp;z=16&amp;pt={map_c}~k:p"
    )
    map_alt = f"Карта 2ГИС — {address}"

    return {
        "firm_id": branch_id,
        "firm_url": firm_url,
        "name": str(item.get("name") or "Grad54"),
        "address": address,
        "hours_line": hours_line,
        "map_lat": lat,
        "map_lon": lon,
        "map_c": map_c,
        "map_desktop_url": map_desk,
        "map_mobile_url": map_mob,
        "map_alt": map_alt,
        "phones": phones,
        "wa": wa,
        "tg": tg or (phones[0]["tel"] if phones else ""),
        "rating": rating,
        "review_count": int(review_count),
    }