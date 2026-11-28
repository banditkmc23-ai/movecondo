#!/usr/bin/env python3
"""Build /buy/ and /type/<kind>/ pages from data/sale-listings.json.

Also writes public sale fields into assets/app.js as `const SALE_LISTINGS = ...`
so the homepage Buy tab can suggest real sale listings (or show the empty state).

Never invent listings. An empty listings array yields empty-state pages only.
Never print owner names, phones, unit numbers, room codes, or the LINE ID text.
Run from the repo root:  python3 tools/build-sale-pages.py
"""
from __future__ import annotations
import html, json, os, re, shutil, sys
from datetime import date, datetime
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

BASE = "https://banditkmc23-ai.github.io/movecondo/"
LINE_URL = "https://line.me/R/ti/p/%40576yhgtz"
ASSET_V = "20261128m3"
I18N_CSS_V = "20261112i1"
CAROUSEL_V = "20261117dc1"
ADS_V = "20261128m3"
STATS_V = "20261113p1"
PROPERTY_TYPES = ("condo", "house", "land", "office", "warehouse", "other")
TYPE_TH = {"condo": "คอนโด", "house": "บ้าน", "land": "ที่ดิน", "office": "ออฟฟิศ", "warehouse": "โกดัง", "other": "อื่น ๆ"}
TYPE_EN = {"condo": "Condo", "house": "House", "land": "Land", "office": "Office", "warehouse": "Warehouse", "other": "Other"}
TYPE_SCHEMA = {
    "condo": "Apartment",
    "house": "House",
    "land": "LandPlot",  # fallback handled below if needed
    "office": "Office",
    "warehouse": "Warehouse",  # may not exist; use Place
    "other": "Accommodation",
}
# schema.org-safe types
TYPE_SCHEMA = {
    "condo": "Apartment",
    "house": "House",
    "land": "Plot",
    "office": "Office",
    "warehouse": "Place",
    "other": "Accommodation",
}
THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
FORBIDDEN = [re.compile(p, re.I) for p in [
    re.escape(unquote(LINE_URL.rsplit("/", 1)[1])),
    r"สัตว์เลี้ยง", r"\bpets?\b",
    r"\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b",
    r"ห้องเลขที่", r"unit no",
]]
LINE_SVG = '<svg class="ic-line" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 5H4a2 2 0 00-2 2v9a2 2 0 002 2h3.2L11 21v-3h9a2 2 0 002-2V7a2 2 0 00-2-2z"/></svg>'

TYPE_ICONS = {
  "condo": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="1.2"/><path d="M10 20.5v-4h4v4"/><path d="M9 8h1.6M13.4 8H15M9 11.5h1.6M13.4 11.5H15M9 15h1.6M13.4 15H15"/></svg>',
  "house": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5L12 4l8 7.5"/><path d="M6.5 10.2V20h11V10.2"/><path d="M10 20v-5.5h4V20"/></svg>',
  "land": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19h18"/><path d="M4.5 19l3.2-8.2 3.3 4.2 3.6-7.5L20 19"/><path d="M8 11.2c0-1.4.9-2.5 1.6-2.5S11.2 9.8 11.2 11.2c0 1.5-1.6 3.3-1.6 3.3S8 12.7 8 11.2z"/></svg>',
  "office": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.2"/><path d="M11 21v-3.2h2V21"/><path d="M8.3 7.2h1.5M14.2 7.2h1.5M8.3 10.8h1.5M14.2 10.8h1.5M8.3 14.4h1.5M14.2 14.4h1.5"/></svg>',
  "warehouse": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 4l9 6.5V20H3V10.5z"/><path d="M3 10.5h18"/><path d="M9.5 20v-6h5v6"/></svg>',
  "other": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/></svg>',
}

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def write(p, s):
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)

def esc(s):
    return html.escape(str(s), quote=True)

def money(n):
    return f"฿{int(n):,}"

def size_label(n, lang="th"):
    if n is None or n == "":
        return None
    num = float(n)
    if num == int(num):
        s = str(int(num))
    else:
        s = f"{num:.2f}".rstrip("0").rstrip(".")
    return f"{s} ตร.ม." if lang == "th" else f"{s} sq.m."

def beds_label(n, lang="th"):
    if n is None or n == "":
        return None
    try:
        n = int(n)
    except (TypeError, ValueError):
        return str(n)
    if n == 0:
        return "สตูดิโอ" if lang == "th" else "Studio"
    if lang == "th":
        return f"{n} ห้องนอน"
    return "1 bedroom" if n == 1 else f"{n} bedrooms"

def floor_label(v, lang="th"):
    if v is None or str(v).strip() == "":
        return None
    v = str(v).strip()
    if lang == "th":
        return v if v.startswith("ชั้น") else f"ชั้น {v}"
    return v if v.lower().startswith("floor") else f"Floor {v}"

def dist_label(m, station, lang="th"):
    if m is None or not station:
        return station or None
    m = int(m)
    if lang == "th":
        return f"{m:,} ม. ถึง {station}"
    return f"{m:,} m to {station}"

def thai_date(iso):
    try:
        d = datetime.strptime(str(iso)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None
    return f"{d.day} {THAI_MONTHS[d.month-1]} {d.year + 543}"

def en_date(iso):
    try:
        d = datetime.strptime(str(iso)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None
    return d.strftime("%-d %b %Y")

def photo_src(path, rel):
    path = str(path).lstrip("/")
    return rel + path

def thumb_src(path, rel):
    path = str(path).lstrip("/")
    root, ext = os.path.splitext(path)
    th = root + "-th" + ext
    if os.path.exists(th):
        return rel + th
    return rel + path

def scan_forbidden(text, where):
    bad = []
    for rx in FORBIDDEN:
        for m in rx.finditer(text):
            ctx = text[max(0, m.start()-30):m.end()+10]
            if "petsAllowed" in ctx:
                continue
            bad.append((where, rx.pattern, ctx))
    return bad

def load_rentals():
    """Published rental rooms with a real rent price, keyed by slug (mc-001)."""
    out = {}
    path = "data/listings.json"
    if not os.path.exists(path):
        return out
    for r in json.load(open(path, encoding="utf-8")).get("rooms") or []:
        slug = str(r.get("slug") or r.get("id") or "").strip().lower()
        try:
            price = int(r.get("price"))
        except (TypeError, ValueError):
            price = 0
        if slug and price > 0 and os.path.exists(f"rooms/{slug}/index.html"):
            out[slug] = r
    return out

def is_dual(l):
    return bool(l.get("rentRoomSlug") and l.get("rentPrice"))

def sale_badge_html(l):
    if l.get("saleWithTenant"):
        return '<span class="badge-vacant badge-sale-tenant"><span class="t-th">ขายพร้อมผู้เช่า</span><span class="t-en">Sold with tenant</span></span>'
    if is_dual(l):
        return dual_badge_html()
    return '<span class="badge-vacant badge-sale">ขาย</span>'

def dual_badge_html():
    return '<span class="badge-vacant badge-sale-rent"><span class="t-th">ขาย / เช่า</span><span class="t-en">Sale / Rent</span></span>'

def dual_price_html(sale_price, rent_price):
    return (
        f'<div class="price price-dual">'
        f'<div class="price-sale">{money(sale_price)} <small><span class="t-th">ขาย</span><span class="t-en">Sale</span></small></div>'
        f'<div class="price-rent">{int(rent_price):,} <span class="t-th">บาท/เดือน</span><span class="t-en">THB/month</span></div>'
        f'</div>'
    )

TRANSFER_ITEMS = (
    ("transferFee", "ค่าธรรมเนียมการโอน", "Transfer fee"),
    ("specificBusinessTax", "ภาษีธุรกิจเฉพาะ", "Specific business tax"),
    ("stampDuty", "ค่าอากรแสตมป์", "Stamp duty"),
    ("withholdingTax", "ภาษีหัก ณ ที่จ่าย", "Withholding tax"),
)


def parse_cost_split(obj, loc, errors):
    if not isinstance(obj, dict):
        errors.append(f"{loc} must be an object with a buyer/seller percent or a THB amount")
        return None
    out = {}
    for src, dest in (("buyerPercent", "buyerPercent"), ("sellerPercent", "sellerPercent")):
        if obj.get(src) in (None, ""):
            continue
        try:
            v = float(obj[src])
        except (TypeError, ValueError):
            errors.append(f"{loc}.{src} must be a number")
            continue
        if v < 0 or v > 100:
            errors.append(f"{loc}.{src} must be between 0 and 100")
            continue
        out[dest] = int(v) if v == int(v) else v
    for src, dest in (("buyerBaht", "buyerBaht"), ("sellerBaht", "sellerBaht"),
                      ("buyerAmount", "buyerBaht"), ("sellerAmount", "sellerBaht")):
        if obj.get(src) in (None, ""):
            continue
        try:
            v = int(obj[src])
        except (TypeError, ValueError):
            errors.append(f"{loc}.{src} must be a whole number in THB")
            continue
        if v < 0:
            errors.append(f"{loc}.{src} must be 0 or more")
            continue
        out[dest] = v
    unknown = set(obj) - {"buyerPercent", "sellerPercent", "buyerBaht", "sellerBaht", "buyerAmount", "sellerAmount"}
    if unknown:
        errors.append(f"{loc} has unknown keys {sorted(unknown)}; allowed: buyerPercent, sellerPercent, buyerBaht, sellerBaht")
    if not any(k in out for k in ("buyerPercent", "sellerPercent", "buyerBaht", "sellerBaht")):
        errors.append(f"{loc} needs a buyer/seller percent or THB amount. Do not invent figures.")
        return None
    return out


def parse_transfer_costs(raw, loc, errors):
    if raw in (None, "", {}):
        return None
    if not isinstance(raw, dict):
        errors.append(f"{loc} must be an object")
        return None
    out = {}
    allowed = {k for k, _, _ in TRANSFER_ITEMS} | {"note", "noteEn"}
    unknown = set(raw) - allowed
    if unknown:
        errors.append(f"{loc} has unknown keys {sorted(unknown)}")
    for key, _th, _en in TRANSFER_ITEMS:
        if raw.get(key) in (None, ""):
            continue
        item = parse_cost_split(raw[key], f"{loc}.{key}", errors)
        if item:
            out[key] = item
    for k in ("note", "noteEn"):
        if raw.get(k) not in (None, ""):
            out[k] = str(raw[k]).strip()
            errors.extend(f"{loc}.{k}: forbidden {pat} in {ctx!r}" for pat, ctx in ((e[1], e[2]) for e in scan_forbidden(out[k], k)))
    if not out:
        errors.append(f"{loc} is empty. Omit the field if there is no owner-provided split.")
        return None
    return out


def split_label_html(item):
    parts_th, parts_en = [], []
    if "buyerPercent" in item:
        parts_th.append(f"ผู้ซื้อ {item['buyerPercent']}%")
        parts_en.append(f"Buyer {item['buyerPercent']}%")
    if "buyerBaht" in item:
        baht = money(item["buyerBaht"])
        if "buyerPercent" in item:
            parts_th[-1] += f" ({baht})"
            parts_en[-1] += f" ({baht})"
        else:
            parts_th.append(f"ผู้ซื้อ {baht}")
            parts_en.append(f"Buyer {baht}")
    if "sellerPercent" in item:
        parts_th.append(f"ผู้ขาย {item['sellerPercent']}%")
        parts_en.append(f"Seller {item['sellerPercent']}%")
    if "sellerBaht" in item:
        baht = money(item["sellerBaht"])
        if "sellerPercent" in item:
            parts_th[-1] += f" ({baht})"
            parts_en[-1] += f" ({baht})"
        else:
            parts_th.append(f"ผู้ขาย {baht}")
            parts_en.append(f"Seller {baht}")
    return " · ".join(parts_th), " · ".join(parts_en)


def transfer_costs_html(l):
    costs = l.get("transferCosts")
    if not costs:
        return ""
    rows = []
    for key, th, en in TRANSFER_ITEMS:
        item = costs.get(key)
        if not item:
            continue
        th_l, en_l = split_label_html(item)
        rows.append(
            f'<div class="transfer-row"><dt><span class="t-th">{th}</span><span class="t-en">{en}</span></dt>'
            f'<dd><span class="t-th">{th_l}</span><span class="t-en">{en_l}</span></dd></div>'
        )
    note = ""
    if costs.get("note") or costs.get("noteEn"):
        nth = esc(costs.get("note") or costs.get("noteEn"))
        nen = esc(costs.get("noteEn") or costs.get("note"))
        note = f'<p class="transfer-note"><span class="t-th">{nth}</span><span class="t-en">{nen}</span></p>'
    if not rows and not note:
        return ""
    body = f"<dl>{''.join(rows)}</dl>" if rows else ""
    return (
        '<section class="transfer-costs" id="transfer-costs">'
        '<h2><span class="t-th">ค่าใช้จ่ายในการโอน</span><span class="t-en">Transfer costs</span></h2>'
        f"{body}{note}</section>"
    )


def parse_sale_with_tenant(l, loc, errors):
    flag = l.get("saleWithTenant")
    if flag in (None, "", False, 0, "false", "False"):
        return False, None, None
    if flag not in (True, 1, "true", "True", "yes"):
        errors.append(f"{loc}.saleWithTenant must be true or false")
        return False, None, None
    end = l.get("leaseEndDate")
    if end not in (None, ""):
        end = str(end).strip()
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", end):
            errors.append(f"{loc}.leaseEndDate must be YYYY-MM-DD")
            end = None
    else:
        end = None
    rent = l.get("currentRentPerMonth")
    if rent not in (None, ""):
        try:
            rent = int(rent)
        except (TypeError, ValueError):
            errors.append(f"{loc}.currentRentPerMonth must be a monthly rent in THB")
            rent = None
        else:
            if rent <= 0:
                errors.append(f"{loc}.currentRentPerMonth must be a real monthly rent, not zero")
                rent = None
    else:
        rent = None
    return True, end, rent


def load_listings():
    rentals = load_rentals()
    raw = json.load(open("data/sale-listings.json", encoding="utf-8"))
    if not isinstance(raw, dict) or "listings" not in raw:
        sys.exit("data/sale-listings.json must be an object with a 'listings' array")
    out = []
    errors = []
    slugs = set()
    for i, l in enumerate(raw.get("listings") or []):
        loc = f"listings[{i}]"
        if not isinstance(l, dict):
            errors.append(f"{loc} must be an object"); continue
        if l.get("published") is False or l.get("status") in ("draft", "sold", "hidden"):
            continue
        slug = str(l.get("slug") or "").strip()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            errors.append(f"{loc}.slug must be lowercase letters, numbers and hyphens (got {slug!r})"); continue
        if slug in slugs:
            errors.append(f"{loc}.slug {slug!r} is duplicated"); continue
        slugs.add(slug)
        ptype = l.get("propertyType")
        if ptype not in PROPERTY_TYPES:
            errors.append(f"{loc}.propertyType must be one of {PROPERTY_TYPES}"); continue
        required = ["project", "area", "salePrice", "photos", "descriptionTh", "descriptionEn", "lastVerified"]
        for k in required:
            if l.get(k) in (None, "", []):
                errors.append(f"{loc}.{k} is required")
        try:
            price = int(l.get("salePrice"))
            if price <= 0:
                raise ValueError
        except (TypeError, ValueError):
            errors.append(f"{loc}.salePrice must be a positive integer (THB)")
            price = 0
        photos = l.get("photos") or []
        if not isinstance(photos, list) or not photos:
            errors.append(f"{loc}.photos must be a non-empty array of paths under images/sale/")
        else:
            for p in photos:
                if not str(p).startswith("images/sale/"):
                    errors.append(f"{loc}.photos path must start with images/sale/ (got {p!r})")
                elif not os.path.exists(p):
                    errors.append(f"{loc}.photos file missing: {p}")
        try:
            datetime.strptime(str(l.get("lastVerified") or "")[:10], "%Y-%m-%d")
        except ValueError:
            errors.append(f"{loc}.lastVerified must be YYYY-MM-DD")
        size = l.get("size")
        if size not in (None, ""):
            try:
                size = float(size)
            except (TypeError, ValueError):
                errors.append(f"{loc}.size must be a number (sqm)"); size = None
        else:
            size = None
        dist = l.get("stationDistanceM")
        if dist not in (None, ""):
            try:
                dist = int(dist)
            except (TypeError, ValueError):
                errors.append(f"{loc}.stationDistanceM must be an integer (metres)"); dist = None
        else:
            dist = None
        beds = l.get("bedrooms")
        if beds not in (None, ""):
            try:
                beds = int(beds)
            except (TypeError, ValueError):
                errors.append(f"{loc}.bedrooms must be an integer (0 = studio)"); beds = None
        else:
            beds = None
        row = {
            "slug": slug,
            "propertyType": ptype,
            "project": str(l["project"]).strip() if l.get("project") else "",
            "area": str(l.get("area") or "").strip(),
            "areaSlug": str(l.get("areaSlug") or "").strip() or None,
            "areaEn": str(l.get("areaEn") or "").strip() or None,
            "station": str(l.get("station") or "").strip() or None,
            "stationEn": str(l.get("stationEn") or "").strip() or None,
            "stationDistanceM": dist,
            "bedrooms": beds,
            "bathrooms": l.get("bathrooms"),
            "size": size,
            "salePrice": price,
            "floor": (str(l["floor"]).strip() if l.get("floor") not in (None, "") else None),
            "photos": [str(p) for p in photos],
            "descriptionTh": str(l.get("descriptionTh") or "").strip(),
            "descriptionEn": str(l.get("descriptionEn") or "").strip(),
            "lastVerified": str(l.get("lastVerified") or "")[:10],
            "lat": l.get("lat"),
            "lng": l.get("lng"),
        }
        if row["bathrooms"] not in (None, ""):
            try:
                row["bathrooms"] = int(row["bathrooms"])
            except (TypeError, ValueError):
                errors.append(f"{loc}.bathrooms must be an integer"); row["bathrooms"] = None
        else:
            row["bathrooms"] = None
        for field in ("project", "area", "descriptionTh", "descriptionEn", "floor", "station"):
            if row.get(field):
                errors.extend(f"{loc}.{field}: forbidden {pat} in {ctx!r}" for pat, ctx in ((e[1], e[2]) for e in scan_forbidden(row[field], field)))
        row["rentRoomSlug"] = None
        row["rentPrice"] = None
        rs = l.get("rentRoomSlug")
        if rs not in (None, ""):
            slug = str(rs).strip().lower()
            if not re.fullmatch(r"mc-\d{3,}", slug):
                errors.append(f"{loc}.rentRoomSlug must be a rental slug like mc-001 (got {rs!r})")
            elif slug not in rentals:
                errors.append(f"{loc}.rentRoomSlug {slug!r} does not match a published rental room that has a rent price. Do not invent a price; only link a room that is already listed for rent.")
            else:
                row["rentRoomSlug"] = slug
                row["rentPrice"] = int(rentals[slug]["price"])
        tenant, lease_end, cur_rent = parse_sale_with_tenant(l, loc, errors)
        row["saleWithTenant"] = tenant
        row["leaseEndDate"] = lease_end
        row["currentRentPerMonth"] = cur_rent
        if "transferCosts" in l and l.get("transferCosts") not in (None, ""):
            row["transferCosts"] = parse_transfer_costs(l.get("transferCosts"), f"{loc}.transferCosts", errors)
        else:
            row["transferCosts"] = None
        out.append(row)
    seen_rent = {}
    for i, row in enumerate(out):
        rs = row.get("rentRoomSlug")
        if not rs:
            continue
        if rs in seen_rent:
            errors.append(
                f"listings[{i}].rentRoomSlug {rs!r} is already used by another sale listing. "
                "One rental room can be linked from only one sale listing."
            )
        seen_rent[rs] = i
    if errors:
        print("\n".join(errors), file=sys.stderr)
        sys.exit(1)
    return out

def public_fields(l):
    keys = ("slug", "propertyType", "project", "area", "areaSlug", "station", "stationDistanceM", "bedrooms", "size", "salePrice", "floor", "rentRoomSlug", "rentPrice", "photos", "saleWithTenant", "leaseEndDate", "currentRentPerMonth")
    out = {k: l[k] for k in keys if l.get(k) not in (None, "", False, [])}
    return out

def type_cats_nav(rel, intent="rent", current=None):
    items = []
    for tid in PROPERTY_TYPES:
        if intent == "buy":
            href = f"{rel}buy/" if tid == "condo" else f"{rel}type/{tid}/?intent=buy"
        else:
            href = f"{rel}#listings" if tid == "condo" else f"{rel}type/{tid}/"
        on = " on" if current == tid else ""
        if intent == "rent" and tid == "condo" and not current:
            on = " on"
        items.append(f'<a class="type-cat{on}" href="{href}" data-type="{tid}"><span class="type-cat-icon">{TYPE_ICONS[tid]}</span><span class="type-cat-label"><span class="t-th">{TYPE_TH[tid]}</span><span class="t-en">{TYPE_EN[tid]}</span></span></a>')
    return f'<nav class="type-cats" aria-label="ประเภทอสังหาริมทรัพย์">{"".join(items)}</nav>'

def page_shell(rel, title, desc, path, body_class, main, extra_head="", og_image=None, scripts=None, jsonld=None):
    url = BASE + path
    og = og_image or (BASE + "images/og.jpg")
    ld = ""
    if jsonld:
        blocks = jsonld if isinstance(jsonld, list) else [jsonld]
        ld = "".join(f'  <script type="application/ld+json">\n{json.dumps(b, ensure_ascii=False, indent=2)}\n  </script>\n' for b in blocks)
    script_tags = scripts if scripts is not None else [
        f'<script src="{rel}assets/i18n.js?v={ASSET_V}" defer></script>',
        f'<script src="{rel}assets/stats.js?v={STATS_V}" defer></script>',
        f'<script src="{rel}assets/app.js?v={ASSET_V}" defer></script>',
        f'<script src="{rel}assets/ads.js?v={ADS_V}" defer></script>',
    ]
    return f'''<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />
  <meta name="robots" content="index,follow" />
  <meta name="theme-color" content="#B9532F" />
  <link rel="canonical" href="{url}" />
  <link rel="alternate" href="{url}" hreflang="th" />
  <link rel="alternate" href="{url}?lang=en" hreflang="en" />
  <link rel="alternate" href="{url}" hreflang="x-default" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="th_TH" />
  <meta property="og:site_name" content="MoveCondo" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(desc)}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{esc(og)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(desc)}" />
  <meta name="twitter:image" content="{esc(og)}" />
  <link rel="icon" href="{rel}favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="{rel}favicon.ico" sizes="32x32" />
  <link rel="apple-touch-icon" href="{rel}apple-touch-icon.png" />
  <link rel="manifest" href="{rel}site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{rel}assets/styles.css?v={ASSET_V}" />
  <link rel="stylesheet" href="{rel}assets/i18n.css?v={I18N_CSS_V}" />
  <script>(function(){{try{{var q=new URLSearchParams(location.search).get("lang"),l=(q==="en"||q==="th")?q:localStorage.getItem("mc-lang");if(l==="en"){{var d=document.documentElement;d.lang="en";d.className+=" mc-en mc-i18n-wait";setTimeout(function(){{d.classList.remove("mc-i18n-wait")}},2500)}}}}catch(e){{}}}})();</script>
  {extra_head}
{ld}</head>
<body class="{body_class}">
  <a class="skip" href="#main">ข้ามไปยังเนื้อหา</a>
  <header class="app">
    <div class="app-inner">
      <a class="brand" href="{rel}" aria-label="MoveCondo ย้ายคอนโด · หาคอนโดเช่าที่ใช่">
        <div class="logo" aria-hidden="true">M</div>
        <div class="brand-text">
          <b>MoveCondo</b>
          <span>ย้ายคอนโด · หาคอนโดเช่าที่ใช่</span>
        </div>
      </a>
      <nav class="main" aria-label="หลัก">
        <a href="{rel}" data-nav="home">หน้าแรก</a>
        <a href="{rel}#/match" data-nav="match">จับคู่ห้อง</a>
        <a href="{rel}#areas" data-nav="areas">สำรวจย่าน</a>
        <a href="{rel}partner/" data-nav="partner">Partner</a>
      </nav>
      <div class="header-cta">
        <div class="lang-toggle" role="group" aria-label="ภาษา / Language" data-i18n-skip><a href="?lang=th" data-lang="th" lang="th" class="on" aria-current="true">TH</a><a href="?lang=en" data-lang="en" lang="en">EN</a></div>
        <a class="btn btn-sm btn-line-text" href="{LINE_URL}" target="_blank" rel="noopener noreferrer">{LINE_SVG} LINE</a>
        <a class="btn btn-sm btn-primary" href="{rel}#/match">เริ่มจับคู่ห้อง</a>
      </div>
    </div>
  </header>
  <main id="main" data-i18n-skip>
{main}
  </main>
  <footer class="site">
    <div class="wrap">
      <div>
        <b>MoveCondo</b> · ย้ายคอนโด<br />
        หาคอนโดเช่าที่ใช่ในกรุงเทพฯ
      </div>
      <nav class="foot-links" aria-label="ลิงก์เพิ่มเติม"><a href="{rel}partner/">ร่วมเป็น Partner</a><a href="{LINE_URL}" target="_blank" rel="noopener noreferrer">LINE</a></nav>
    </div>
  </footer>
  {"".join(script_tags)}
</body>
</html>
'''

def empty_block(h1_th, h1_en, lead_th, lead_en, rel, buy_h1_th=None, buy_h1_en=None, buy_lead_th=None, buy_lead_en=None, icon="other"):
    buy_attrs = ""
    if buy_h1_th:
        buy_attrs = (
            f' data-empty-buy-h1-th="{esc(buy_h1_th)}" data-empty-buy-h1-en="{esc(buy_h1_en)}"'
            f' data-empty-buy-lead-th="{esc(buy_lead_th)}" data-empty-buy-lead-en="{esc(buy_lead_en)}"'
        )
    return f'''    <div class="empty-listing" data-empty-state{buy_attrs}>
      <div class="empty-listing-icon">{TYPE_ICONS.get(icon, TYPE_ICONS["other"])}</div>
      <h1 data-empty-h1><span class="t-th">{esc(h1_th)}</span><span class="t-en">{esc(h1_en)}</span></h1>
      <p class="lead" data-empty-lead><span class="t-th">{esc(lead_th)}</span><span class="t-en">{esc(lead_en)}</span></p>
      <p class="lead" data-sale-filter-q hidden></p>
      <div class="empty-listing-actions">
        <a class="btn btn-lg btn-line" href="{LINE_URL}" target="_blank" rel="noopener noreferrer">{LINE_SVG} <span class="t-th">ทัก LINE เพื่อลงประกาศ</span><span class="t-en">Message us on LINE to list a property</span></a>
        <a class="btn btn-lg btn-ghost" href="{rel}partner/"><span class="t-th">ร่วมเป็น Partner</span><span class="t-en">Become a Partner</span></a>
        <a class="btn btn-lg btn-primary" href="{rel}"><span class="t-th">ดูคอนโดเช่าทั้งหมด</span><span class="t-en">See all rental condos</span></a>
      </div>
    </div>
    <script>
    (function(){{
      var p = new URLSearchParams(location.search);
      var root = document.querySelector("[data-empty-state]");
      if(!root) return;
      if(p.get("intent")==="buy" && root.getAttribute("data-empty-buy-h1-th")){{
        var h = root.querySelector("[data-empty-h1]");
        var l = root.querySelector("[data-empty-lead]");
        if(h) h.innerHTML = '<span class="t-th">'+root.getAttribute("data-empty-buy-h1-th")+'</span><span class="t-en">'+root.getAttribute("data-empty-buy-h1-en")+'</span>';
        if(l) l.innerHTML = '<span class="t-th">'+root.getAttribute("data-empty-buy-lead-th")+'</span><span class="t-en">'+root.getAttribute("data-empty-buy-lead-en")+'</span>';
      }}
      var q = (p.get("q")||"").trim();
      if(!q) return;
      var el = root.querySelector("[data-sale-filter-q]");
      if(!el) return;
      function esc(s){{return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}}
      el.hidden = false;
      el.innerHTML = '<span class="t-th">ไม่พบประกาศขายสำหรับ «'+esc(q)+'»</span><span class="t-en">No sale listings yet for “'+esc(q)+'”</span>';
    }})();
    </script>'''

def card_html(l, rel):
    href = f"{rel}buy/{esc(l['slug'])}/"
    photos = l["photos"]
    slides = "".join(
        f'<figure class="card-slide"><img src="{photo_src(p, rel)}" alt="{esc(l["project"])} ย่าน{esc(l["area"])} ภาพที่ {i+1}" width="800" height="450" loading="lazy" decoding="async" draggable="false"></figure>'
        for i, p in enumerate(photos)
    )
    dots = ""
    if len(photos) > 1:
        dots = '<div class="card-dots">' + "".join(
            f'<button type="button" class="card-dot{" on" if i==0 else ""}" aria-label="ภาพที่ {i+1}" aria-current="{"true" if i==0 else "false"}"></button>'
            for i in range(len(photos))
        ) + "</div>"
    meta_th = " · ".join(x for x in [
        l["area"],
        beds_label(l["bedrooms"], "th"),
        size_label(l["size"], "th"),
        dist_label(l["stationDistanceM"], l["station"], "th"),
    ] if x)
    meta_en = " · ".join(x for x in [
        l.get("areaEn") or l["area"],
        beds_label(l["bedrooms"], "en"),
        size_label(l["size"], "en"),
        dist_label(l["stationDistanceM"], l.get("stationEn") or l["station"], "en"),
    ] if x)
    hay = " ".join(str(x) for x in [l["project"], l["area"], l.get("areaEn"), l["station"], l.get("stationEn"), l["propertyType"], l["floor"], l["size"], l["bedrooms"]] if x)
    return f'''  <article class="card" data-sale-card data-search="{esc(hay)}" data-type="{esc(l["propertyType"])}">
<div class="card-slider" data-card-slider>
  <a class="card-track" draggable="false" href="{href}" aria-label="ดูประกาศขาย {esc(l["project"])}">{slides}</a>
  {sale_badge_html(l)}
  {dots}
</div>
<a class="card-body" href="{href}">
  <h3>{esc(l["project"])}</h3>
  {dual_price_html(l["salePrice"], l["rentPrice"]) if is_dual(l) else f'<div class="price">{money(l["salePrice"])}</div>'}
  <div class="meta"><span class="t-th">{esc(meta_th)}</span><span class="t-en">{esc(meta_en)}</span></div>
</a>
  {f'<a class="dual-cross" href="{rel}rooms/{esc(l["rentRoomSlug"])}/"><span class="t-th">ดูประกาศเช่า</span><span class="t-en">See the rental listing</span></a>' if is_dual(l) else ""}
  </article>'''

def filter_script():
    return '''    <script>
    (function(){
      var q = (new URLSearchParams(location.search).get("q")||"").trim().toLowerCase();
      var cards = document.querySelectorAll("[data-sale-card]");
      if(!cards.length) return;
      var shown = 0;
      cards.forEach(function(c){
        var hay = (c.getAttribute("data-search")||"").toLowerCase();
        var on = !q || hay.indexOf(q) !== -1;
        c.hidden = !on;
        if(on) shown++;
      });
      var empty = document.querySelector("[data-sale-none]");
      var grid = document.querySelector("[data-sale-grid]");
      var count = document.querySelector("[data-sale-count]");
      if(grid) grid.hidden = shown === 0;
      if(empty) empty.hidden = shown !== 0;
      if(count && q){
        count.innerHTML = shown
          ? '<span class="t-th">พบ '+shown+' ประกาศขาย</span><span class="t-en">'+shown+' sale listing'+(shown===1?"":"s")+'</span>'
          : '<span class="t-th">ไม่พบประกาศขายสำหรับ «'+count.getAttribute("data-q")+'»</span><span class="t-en">No sale listings match “'+count.getAttribute("data-q")+'”</span>';
      }
    })();
    </script>'''

def listings_section(listings, rel, eyebrow_th, eyebrow_en, h2_th, h2_en, empty_html):
    if not listings:
        return empty_html
    cards = "\n".join(card_html(l, rel) for l in listings)
    n = len(listings)
    return f'''    <div class="section" data-sale-grid id="listings">
      <div class="section-head">
        <div>
          <div class="eyebrow"><span class="t-th">{esc(eyebrow_th)}</span><span class="t-en">{esc(eyebrow_en)}</span></div>
          <h2><span class="t-th">{esc(h2_th)}</span><span class="t-en">{esc(h2_en)}</span></h2>
          <p data-sale-count data-q="">{n} <span class="t-th">ประกาศขาย</span><span class="t-en">sale listing{"s" if n != 1 else ""}</span></p>
        </div>
      </div>
      <div class="grid">
{cards}
      </div>
    </div>
    <div class="empty-listing" data-sale-none hidden>
      <div class="empty-listing-icon">{TYPE_ICONS["other"]}</div>
      <h2><span class="t-th">ไม่พบประกาศขายที่ตรงกับคำค้นหา</span><span class="t-en">No sale listings match your search</span></h2>
      <div class="empty-listing-actions">
        <a class="btn btn-lg btn-ghost" href="{rel}buy/"><span class="t-th">ดูประกาศขายทั้งหมด</span><span class="t-en">See all sale listings</span></a>
        <a class="btn btn-lg btn-line" href="{LINE_URL}" target="_blank" rel="noopener noreferrer">{LINE_SVG} <span class="t-th">ทัก LINE เพื่อลงประกาศ</span><span class="t-en">Message us on LINE to list a property</span></a>
      </div>
    </div>
{filter_script()}'''

def buy_index(listings):
    rel = "../"
    path = "buy/"
    title = "ขายคอนโดมือสอง ใกล้ BTS / MRT กรุงเทพฯ | MoveCondo"
    desc = "ขายคอนโดมือสองใกล้ BTS / MRT ในกรุงเทพฯ บ้าน ที่ดิน บอกค่าโอนชัดเจน ทักไลน์ได้เลย" if listings else "ตอนนี้ MoveCondo ยังไม่มีประกาศขายคอนโดมือสอง หากมีคอนโด บ้าน หรือที่ดินที่อยากลงขาย ทัก LINE ได้เลย"
    crumbs = f"""    <nav class="crumbs" aria-label="เส้นทาง"><a href="{rel}"><span class="t-th">หน้าแรก</span><span class="t-en">Home</span></a> <span aria-hidden="true">/</span> <span><span class="t-th">ขายคอนโด</span><span class="t-en">Condos for sale</span></span></nav>"""
    intro = (
        '    <header class="page-intro">'
        '<h1><span class="t-th">ขายคอนโด ใกล้ <span class="hero-transit">BTS / MRT</span></span><span class="t-en">Condos for sale near <span class="hero-transit">BTS / MRT</span></span><br>'
        '<em class="hero-phrase"><span class="t-th">คอนโดมือสอง บ้าน ที่ดิน</span><span class="t-en">Resale condos, houses, land</span></em></h1>'
        '<p class="lead"><span class="t-th">ประกาศขายคอนโดมือสองในกรุงเทพฯ บอกค่าโอนชัดเจน ทักไลน์ได้เลย</span>'
        '<span class="t-en">Resale condo listings in Bangkok with clear transfer costs…</span></p>'
        '</header>\n'
    )
    cats = type_cats_nav(rel, intent="buy", current="condo")
    empty = empty_block(
        "ยังไม่มีประกาศขาย", "No sale listings yet",
        "ตอนนี้ MoveCondo มีเฉพาะคอนโดให้เช่า หากคุณมีคอนโด บ้าน ที่ดิน หรืออสังหาฯ ที่อยากลงขาย ทัก LINE มาได้เลย เราจะช่วยลงประกาศให้",
        "MoveCondo currently lists condos for rent only. If you have a condo, house, land or other property to sell, message us on LINE and we will help you list it.",
        rel, icon="condo",
    )
    body = crumbs + "\n" + intro + "    " + cats + "\n" + listings_section(
        listings, rel, "ประกาศขาย", "For sale", "ประกาศขาย", "For sale", empty
    )
    jsonld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "ขายคอนโดมือสอง ใกล้ BTS / MRT กรุงเทพฯ | MoveCondo",
        "url": BASE + path,
        "description": desc,
        "numberOfItems": len(listings),
    }
    if listings:
        jsonld["mainEntity"] = {
            "@type": "ItemList",
            "numberOfItems": len(listings),
            "itemListElement": [
                {"@type": "ListItem", "position": i+1, "url": BASE + "buy/" + l["slug"] + "/", "name": l["project"]}
                for i, l in enumerate(listings)
            ],
        }
    html_out = page_shell(rel, title, desc, path, "sale-page empty-page", body, jsonld=jsonld)
    write("buy/index.html", html_out)

def type_page(kind, listings):
    rel = "../../"
    path = f"type/{kind}/"
    th, en = TYPE_TH[kind], TYPE_EN[kind]
    rows = [l for l in listings if l["propertyType"] == kind]
    title = f"{th} | MoveCondo"
    desc = f"ประกาศ{th}บน MoveCondo" if rows else f"ตอนนี้ MoveCondo ยังไม่มีประกาศ{th} มีเฉพาะคอนโดให้เช่า"
    crumbs = f'''    <nav class="crumbs" aria-label="เส้นทาง"><a href="{rel}"><span class="t-th">หน้าแรก</span><span class="t-en">Home</span></a> <span aria-hidden="true">/</span> <span><span class="t-th">{th}</span><span class="t-en">{en}</span></span></nav>'''
    cats = type_cats_nav(rel, intent="rent", current=kind)
    empty = empty_block(
        f"ยังไม่มีประกาศ{th}", f"No {en.lower()} listings yet",
        f"ตอนนี้ MoveCondo มีเฉพาะคอนโดให้เช่า หากคุณมี{th}ที่อยากลงประกาศเช่าหรือขาย ทัก LINE มาได้เลย เราจะช่วยลงให้",
        f"MoveCondo currently lists condos for rent only. If you have a {en.lower()} to rent or sell, message us on LINE and we will help you list it.",
        rel, icon=kind,
        buy_h1_th=f"ยังไม่มีประกาศขาย{th}", buy_h1_en=f"No {en.lower()}s for sale yet" if kind != "other" else "No sale listings in this category yet",
        buy_lead_th=f"ตอนนี้ยังไม่มีประกาศขายในหมวด{th} หากคุณมี{th}ที่อยากลงขาย ทัก LINE มาได้เลย",
        buy_lead_en=f"There are no {en.lower()} sale listings yet. If you have a {en.lower()} to sell, message us on LINE.",
    )
    # When intent=buy, highlight buy-side category links via a tiny script that rewrites type-cat hrefs
    intent_js = '''    <script>
    (function(){
      if(new URLSearchParams(location.search).get("intent")!=="buy") return;
      document.querySelectorAll(".type-cat").forEach(function(a){
        var id=a.getAttribute("data-type");
        if(id==="condo") a.setAttribute("href", a.getAttribute("href").replace(/#listings|.\\/\\.\\.\\/#listings/, "../../buy/"));
      });
    })();
    </script>'''
    # simpler: always include both rent and buy type cats? Keep as-is; setHomeIntent isn't on this page.
    # Fix condo buy href: I'll output buy-aware hrefs when we add a data-intent-buy-href.
    body = crumbs + "\n    " + cats + "\n" + listings_section(
        rows, rel, th, en, f"{th}ขาย", f"{en}s for sale" if kind != "other" else "Other properties for sale", empty
    )
    # The intent_js for category row: add data-buy-href
    # I'll bake buy hrefs as data-buy-href in type_cats_nav instead — skip extra JS for now.
    jsonld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "url": BASE + path,
        "description": desc,
        "numberOfItems": len(rows),
    }
    write(f"type/{kind}/index.html", page_shell(rel, title, desc, path, "sale-page empty-page", body, jsonld=jsonld))

def offer_ld(l):
    url = BASE + "buy/" + l["slug"] + "/"
    typ = TYPE_SCHEMA.get(l["propertyType"], "Accommodation")
    # Plot is not standard; use Place for land
    if typ == "Plot":
        typ = "Place"
    obj = {
        "@context": "https://schema.org",
        "@type": typ,
        "name": l["project"],
        "url": url,
        "description": l["descriptionTh"],
        "image": [BASE + p for p in l["photos"]],
        "offers": {
            "@type": "Offer",
            "url": url,
            "price": l["salePrice"],
            "priceCurrency": "THB",
            "availability": "https://schema.org/InStock",
            "businessFunction": "http://purl.org/goodrelations/v1#Sell",
        },
    }
    if l["area"]:
        obj["address"] = {"@type": "PostalAddress", "addressLocality": l["area"], "addressRegion": "กรุงเทพมหานคร", "addressCountry": "TH"}
    if l["size"] is not None:
        obj["floorSize"] = {"@type": "QuantitativeValue", "value": l["size"], "unitCode": "MTK"}
    if l["bedrooms"] is not None:
        obj["numberOfRooms"] = l["bedrooms"]
    if l["floor"]:
        obj["floorLevel"] = str(l["floor"])
    if l.get("lat") and l.get("lng"):
        obj["geo"] = {"@type": "GeoCoordinates", "latitude": l["lat"], "longitude": l["lng"]}
    if is_dual(l):
        rent_url = BASE + f"rooms/{l['rentRoomSlug']}/"
        obj["offers"] = [obj["offers"], {
            "@type": "Offer",
            "url": rent_url,
            "price": l["rentPrice"],
            "priceCurrency": "THB",
            "availability": "https://schema.org/InStock",
            "businessFunction": "http://purl.org/goodrelations/v1#LeaseOut",
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": l["rentPrice"],
                "priceCurrency": "THB",
                "unitCode": "MON",
                "unitText": "เดือน",
            },
        }]
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "ประกาศขาย", "item": BASE + "buy/"},
            {"@type": "ListItem", "position": 3, "name": l["project"], "item": url},
        ],
    }
    return [crumbs, obj]

def detail_page(l):
    rel = "../../"
    path = f"buy/{l['slug']}/"
    meta_th = " · ".join(x for x in [f"ย่าน{l['area']}" if l["area"] else None, beds_label(l["bedrooms"], "th"), size_label(l["size"], "th"), dist_label(l["stationDistanceM"], l["station"], "th")] if x)
    meta_en = " · ".join(x for x in [l.get("areaEn") or l["area"], beds_label(l["bedrooms"], "en"), size_label(l["size"], "en"), dist_label(l["stationDistanceM"], l.get("stationEn") or l["station"], "en")] if x)
    if is_dual(l):
        title = f"{l['project']} ขาย / เช่า {money(l['salePrice'])} · {int(l['rentPrice']):,} บาท/เดือน | MoveCondo"
        desc = " · ".join(x for x in [l["project"], "ขาย / เช่า", money(l["salePrice"]), f"{int(l['rentPrice']):,} บาท/เดือน", meta_th] if x)
    else:
        title = f"{l['project']} ขาย {money(l['salePrice'])} | MoveCondo"
        desc = " · ".join(x for x in [l["project"], "ขาย", money(l["salePrice"]), meta_th] if x)
    og = BASE + l["photos"][0]
    photos = l["photos"]
    slides = "".join(
        f'<figure class="gallery-slide" data-idx="{i}"><img src="{photo_src(p, rel)}" alt="ภาพ{esc(l["project"])} ย่าน{esc(l["area"])} ภาพที่ {i+1}" width="1400" height="788" {"fetchpriority=\"high\"" if i==0 else "loading=\"lazy\" decoding=\"async\""} draggable="false"></figure>'
        for i, p in enumerate(photos)
    )
    thumbs = "".join(
        f'<button type="button" class="thumb{" on" if i==0 else ""}" data-gal="{i}" aria-label="ดูภาพที่ {i+1}" aria-pressed="{"true" if i==0 else "false"}"><img src="{thumb_src(p, rel)}" alt="" width="320" height="180" loading="lazy"></button>'
        for i, p in enumerate(photos)
    )
    facts = []
    facts.append(('<span class="t-th">ประเภท</span><span class="t-en">Type</span>', f'<span class="t-th">{TYPE_TH[l["propertyType"]]}</span><span class="t-en">{TYPE_EN[l["propertyType"]]}</span>'))
    if beds_label(l["bedrooms"], "th"):
        facts.append(('<span class="t-th">แบบห้อง</span><span class="t-en">Layout</span>', f'<span class="t-th">{beds_label(l["bedrooms"], "th")}</span><span class="t-en">{beds_label(l["bedrooms"], "en")}</span>'))
    if size_label(l["size"], "th"):
        facts.append(('<span class="t-th">ขนาด</span><span class="t-en">Size</span>', f'<span class="t-th">{size_label(l["size"], "th")}</span><span class="t-en">{size_label(l["size"], "en")}</span>'))
    if floor_label(l["floor"], "th"):
        facts.append(('<span class="t-th">ชั้น</span><span class="t-en">Floor</span>', f'<span class="t-th">{floor_label(l["floor"], "th")}</span><span class="t-en">{floor_label(l["floor"], "en")}</span>'))
    if l["bathrooms"] is not None:
        bt = f'{l["bathrooms"]} ห้องน้ำ' if l["bathrooms"] != 1 else "1 ห้องน้ำ"
        be = "1 bathroom" if l["bathrooms"] == 1 else f'{l["bathrooms"]} bathrooms'
        facts.append(('<span class="t-th">ห้องน้ำ</span><span class="t-en">Bathrooms</span>', f'<span class="t-th">{bt}</span><span class="t-en">{be}</span>'))
    if l["station"]:
        facts.append(('<span class="t-th">สถานีใกล้ที่สุด</span><span class="t-en">Nearest station</span>', esc(l["station"])))
    if l["stationDistanceM"] is not None:
        facts.append(('<span class="t-th">ระยะทาง</span><span class="t-en">Distance</span>', f'<span class="t-th">{l["stationDistanceM"]:,} ม.</span><span class="t-en">{l["stationDistanceM"]:,} m</span>'))
    if l["area"]:
        area_h = f'<a href="{rel}areas/{esc(l["areaSlug"])}/">ย่าน{esc(l["area"])}</a>' if l["areaSlug"] and os.path.isdir(f"areas/{l['areaSlug']}") else esc(l["area"])
        facts.append(('<span class="t-th">ย่าน</span><span class="t-en">Area</span>', area_h))
    if l.get("saleWithTenant") and l.get("currentRentPerMonth"):
        facts.append(('<span class="t-th">ค่าเช่าปัจจุบัน</span><span class="t-en">Current rent</span>', f'<span class="t-th">{int(l["currentRentPerMonth"]):,} บาท/เดือน</span><span class="t-en">{int(l["currentRentPerMonth"]):,} THB/month</span>'))
    if l.get("saleWithTenant") and l.get("leaseEndDate"):
        facts.append(('<span class="t-th">สัญญาเช่าถึง</span><span class="t-en">Lease ends</span>', esc(l["leaseEndDate"])))
    facts_html = "".join(f"<div><span>{a}</span><b>{b}</b></div>" for a, b in facts)
    updated_th = thai_date(l["lastVerified"])
    updated_en = en_date(l["lastVerified"])
    updated = f'<p class="room-facts-updated"><span class="t-th">ข้อมูลล่าสุด {updated_th}</span><span class="t-en">Last verified {updated_en}</span></p>' if updated_th else ""
    area_crumb = f'<a href="{rel}areas/{esc(l["areaSlug"])}/">ย่าน{esc(l["area"])}</a> <span aria-hidden="true">/</span> ' if l["areaSlug"] and os.path.isdir(f"areas/{l['areaSlug']}") else (f'<span>ย่าน{esc(l["area"])}</span> <span aria-hidden="true">/</span> ' if l["area"] else "")
    main = f'''    <nav class="crumbs" aria-label="เส้นทาง"><a href="{rel}"><span class="t-th">หน้าแรก</span><span class="t-en">Home</span></a> <span aria-hidden="true">/</span> <a href="{rel}buy/"><span class="t-th">ประกาศขาย</span><span class="t-en">For sale</span></a> <span aria-hidden="true">/</span> {area_crumb}<span>{esc(l["project"])}</span></nav>
    <header class="room-intro">
      <h1>{esc(l["project"])}</h1>
      <p class="room-kicker"><span class="t-th">{esc(meta_th)}</span><span class="t-en">{esc(meta_en)}</span></p>
      {dual_price_html(l["salePrice"], l["rentPrice"]) if is_dual(l) else f'<p class="room-price">{money(l["salePrice"])}</p>'}
      {f'<a class="dual-cross" href="{rel}rooms/{esc(l["rentRoomSlug"])}/"><span class="t-th">ดูประกาศเช่า</span><span class="t-en">See the rental listing</span></a>' if is_dual(l) else ""}
    </header>
    <div class="gallery-hero" id="gallery">
      <div class="gallery-stage" id="galleryStage" aria-roledescription="carousel" aria-label="ภาพ{esc(l["project"])}">
        <div class="gallery-track" tabindex="0">{slides}</div>
        <div class="gallery-ui">
          <button type="button" class="gal-btn" data-gal="prev" aria-label="ภาพก่อนหน้า"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-8 7 8 7"/></svg></button>
          <button type="button" class="gal-btn" data-gal="next" aria-label="ภาพถัดไป"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l8 7-8 7"/></svg></button>
          <span class="gal-count">01 / {len(photos):02d}</span>
        </div>
        {sale_badge_html(l)}
      </div>
      <div class="gallery-nav"><div class="thumbs">{thumbs}</div></div>
    </div>
    <div class="detail" style="margin-top:20px">
      <div class="detail-main">
        <section class="detail-more" id="details">
          <h2 class="detail-heading"><span class="t-th">รายละเอียด</span><span class="t-en">Detail</span></h2>
          <p class="detail-summary"><span class="t-th">{esc(l["descriptionTh"])}</span><span class="t-en">{esc(l["descriptionEn"])}</span></p>
          <div class="room-facts">{facts_html}</div>
          {updated}
          {transfer_costs_html(l)}
        </section>
      </div>
      <aside class="detail-side">
        <div class="book-card">
          {dual_price_html(l["salePrice"], l["rentPrice"]) if is_dual(l) else f'<div class="price">{money(l["salePrice"])}</div>'}
          {f'<a class="dual-cross" href="{rel}rooms/{esc(l["rentRoomSlug"])}/"><span class="t-th">ดูประกาศเช่า</span><span class="t-en">See the rental listing</span></a>' if is_dual(l) else ""}
          <a class="btn btn-lg btn-line" href="{LINE_URL}" target="_blank" rel="noopener noreferrer">{LINE_SVG} ทัก LINE</a>
        </div>
      </aside>
    </div>'''
    # sticky bar
    # include after main via extra? I'll append before footer by putting it in main end.
    main += f'''
  <div class="room-bar" aria-label="ติดต่อเรื่องประกาศนี้">
    {f'<div class="room-bar-price">{dual_price_html(l["salePrice"], l["rentPrice"])}</div>' if is_dual(l) else f'<div class="room-bar-price">{money(l["salePrice"])}</div>'}
    <a class="btn btn-line" href="{LINE_URL}" target="_blank" rel="noopener noreferrer">{LINE_SVG} ทัก LINE</a>
  </div>'''
    scripts = [
        f'<script src="{rel}assets/carousel.js?v={CAROUSEL_V}" defer></script>',
        f'<script src="{rel}assets/i18n.js?v={ASSET_V}" defer></script>',
        f'<script src="{rel}assets/stats.js?v={STATS_V}" defer></script>',
        f'<script src="{rel}assets/app.js?v={ASSET_V}" defer></script>',
        f'<script src="{rel}assets/ads.js?v={ADS_V}" defer></script>',
    ]
    # Scan page text for forbidden before write — done on assembled html
    page = page_shell(rel, title, desc, path, "sale-page room-page", main, og_image=og, scripts=scripts, jsonld=offer_ld(l))
    bad = scan_forbidden(page, path)
    if bad:
        print("FORBIDDEN on", path, bad, file=sys.stderr)
        sys.exit(1)
    write(f"buy/{l['slug']}/index.html", page)

def update_app_js(listings):
    public = [public_fields(l) for l in listings]
    line = "const SALE_LISTINGS = " + json.dumps(public, ensure_ascii=False) + ";"
    app = read("assets/app.js")
    if re.search(r"^const SALE_LISTINGS = ", app, re.M):
        app = re.sub(r"^const SALE_LISTINGS = .*;$", line, app, count=1, flags=re.M)
    else:
        app = re.sub(r"^(const PROJECT_SLUGS = .*;)$", r"\1\n" + line, app, count=1, flags=re.M)
    write("assets/app.js", app)

def cleanup_slugs(keep):
    if not os.path.isdir("buy"):
        return
    for name in os.listdir("buy"):
        path = os.path.join("buy", name)
        if name == "index.html" or not os.path.isdir(path):
            continue
        if name not in keep:
            shutil.rmtree(path)

DUAL_MARK = re.compile(r"<!--mc-sale-rent-->.*?<!--/mc-sale-rent-->", re.S)


def strip_room_dual(html):
    return DUAL_MARK.sub("", html)


def _wrap(inner):
    return f"<!--mc-sale-rent-->{inner}<!--/mc-sale-rent-->"


def inject_room_dual(html, sale):
    html = strip_room_dual(html)
    sale_href = f"../../buy/{sale['slug']}/"
    badge = _wrap(dual_badge_html())
    prices = _wrap(
        '<div class="dual-block">'
        + dual_price_html(sale["salePrice"], sale["rentPrice"])
        + f'<a class="dual-cross" href="{sale_href}"><span class="t-th">ดูประกาศขาย</span><span class="t-en">See the sale listing</span></a>'
        + "</div>"
    )
    bar_prices = _wrap(
        '<div class="room-bar-price dual-block">'
        + dual_price_html(sale["salePrice"], sale["rentPrice"])
        + "</div>"
    )
    ld = {
        "@context": "https://schema.org",
        "@type": "Offer",
        "url": BASE + "buy/" + sale["slug"] + "/",
        "price": sale["salePrice"],
        "priceCurrency": "THB",
        "availability": "https://schema.org/InStock",
        "businessFunction": "http://purl.org/goodrelations/v1#Sell",
        "itemOffered": {"@id": BASE + f"rooms/{sale['rentRoomSlug']}/#apartment"},
        "seller": {"@id": BASE + "#organization"},
    }
    ld_html = _wrap(
        '<script type="application/ld+json">\n'
        + json.dumps(ld, ensure_ascii=False, indent=2)
        + "\n</script>"
    )

    m = re.search(
        r'<div class="gallery-stage"[^>]*>.*?</div>\s*<div class="gallery-nav">',
        html,
        re.S,
    )
    if m:
        block = m.group(0)
        if re.search(r'<span class="badge-vacant\b', block):
            block2 = re.sub(
                r'(<span class="badge-vacant\b[^"]*">)',
                badge + r"\1",
                block,
                count=1,
            )
        else:
            idx = block.rfind("</div>")
            block2 = block[:idx] + badge + block[idx:]
        html = html[: m.start()] + block2 + html[m.end() :]

    html, n_price = re.subn(
        r'(<p class="room-price">.*?</p>)',
        r"\1" + prices,
        html,
        count=1,
        flags=re.S,
    )
    html, n_book = re.subn(
        r'(<div class="book-card">\s*<div class="price">.*?</div>)',
        r"\1" + prices,
        html,
        count=1,
        flags=re.S,
    )
    html, n_bar = re.subn(
        r'(<div class="room-bar-price">.*?</div>)',
        r"\1" + bar_prices,
        html,
        count=1,
        flags=re.S,
    )
    if "</head>" in html and "mc-sale-rent" not in html[: html.find("</head>")]:
        html = html.replace("</head>", ld_html + "\n</head>", 1)
    missing = [name for name, n in (("room-price", n_price), ("book-card", n_book), ("room-bar", n_bar)) if n == 0]
    if missing:
        print(
            f"warning: rooms/{sale['rentRoomSlug']}/ missing inject points: {', '.join(missing)}",
            file=sys.stderr,
        )
    return html


def sync_room_duals(listings):
    wanted = {l["rentRoomSlug"]: l for l in listings if is_dual(l)}
    changed = 0
    for dirpath in sorted(os.listdir("rooms")):
        path = os.path.join("rooms", dirpath, "index.html")
        if not os.path.isfile(path):
            continue
        raw = read(path)
        nxt = strip_room_dual(raw)
        if dirpath in wanted:
            nxt = inject_room_dual(nxt, wanted[dirpath])
        if nxt != raw:
            write(path, nxt)
            changed += 1
    return changed, len(wanted)


def main():
    listings = load_listings()
    buy_index(listings)
    for kind in ("house", "land", "office", "warehouse", "other"):
        type_page(kind, listings)
    keep = set()
    for l in listings:
        detail_page(l)
        keep.add(l["slug"])
    cleanup_slugs(keep)
    update_app_js(listings)
    rooms_changed, dual_n = sync_room_duals(listings)
    print(f"sale_listings={len(listings)} buy_pages={len(listings)} type_pages=5 dual={dual_n} rooms_patched={rooms_changed}")

if __name__ == "__main__":
    main()
