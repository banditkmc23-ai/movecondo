#!/usr/bin/env python3
"""Build one crawlable hub page per BTS/MRT station that currently has
at least one live available room: stations/<slug>/index.html.

Also (idempotent, safe to rerun every night):
  - folds verified-available dates into .badge-vacant on cards and room pages
  - strips "รหัส MC-xxx" / "code MC-xxx" from titles and meta/og/twitter text
  - links room kickers, station facts, and area pages to the station hub
  - writes data/station-hubs.json and injects const STATION_SLUGS into assets/app.js
  - leaves a noindex stub (and drops from sitemap) if a previously built
    station later has 0 live rooms

Called from tools/build-agent-files.py and from the nightly hook
rooms248/listing_station_hubs.py. Do not invent walk times, prices, or
neighbourhood copy. Never print owner PII, the LINE ID text, pet wording,
or room codes in visible/meta text.
"""
import glob, html, json, os, re, sys
from collections import defaultdict
from datetime import date, timedelta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(ROOT)

BASE = "https://banditkmc23-ai.github.io/movecondo/"
ASSET_V = "20261124a2"
STYLES_V = "20261124a2"
I18N_JS_V = "20261124a2"
TODAY = date.today()
TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
CODE_RE = re.compile(r"(?:\s*[·•]\s*)?(?:รหัส(?:ห้อง)?|code)\s*MC-\d+", re.I)
CARD_RE = re.compile(r'<article class="card"[^>]*>.*?</article>', re.S)
BADGE_RE = re.compile(r'<span class="badge-vacant[^"]*"[^>]*>.*?</span>', re.S)
STATIONS_SEC_RE = re.compile(
    r'\n\s*<section class="section station-hubs" id="stations">.*?</section>', re.S)

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
    return f"{int(n):,}"

def thd(iso, with_year=None):
    d = date.fromisoformat(str(iso)[:10])
    txt = f"{d.day} {TH_MON[d.month - 1]}"
    if with_year is True or (with_year is None and d.year != TODAY.year):
        txt += f" {d.year}"
    return txt

def iso_date(v):
    m = re.match(r"(\d{4}-\d{2}-\d{2})", str(v or ""))
    return m.group(1) if m else None

def is_soon(l):
    a = iso_date(l.get("available") or l.get("availableFrom"))
    if not a:
        return False
    if l.get("status") in (None, "AVAILABLE"):
        return False
    return a > TODAY.isoformat()

def last_verified(l):
    return iso_date(l.get("lastVerified") or l.get("last_verified"))

def badge_html(l):
    """Visible badge text: "ว่าง" or "เข้าอยู่ได้ [date]". Dates stay in data attrs / JSON-LD only."""
    lv = last_verified(l)
    lv_attr = f' data-last-verified="{lv}"' if lv else ""
    if is_soon(l):
        a = iso_date(l.get("available") or l.get("availableFrom"))
        text = f"เข้าอยู่ได้ {thd(a)}"
        return (f'<span class="badge-vacant badge-soon" data-avail-from="{a}"'
                f'{lv_attr}>{esc(text)}</span>')
    return f'<span class="badge-vacant"{lv_attr}>ว่าง</span>'

def clean_public_text(t):
    t = CODE_RE.sub("", t or "")
    t = re.sub(r"\s*·\s*·\s*", " · ", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip(" ·\n\t")

def strip_codes_in_html(s):
    def meta(m):
        return m.group(1) + esc(clean_public_text(html.unescape(m.group(2)))) + m.group(3)
    s = re.sub(
        r'(<meta[^>]*(?:name|property)="(?:description|og:description|twitter:description|og:title|twitter:title)"[^>]*content=")([^"]*)(")',
        meta, s, flags=re.I)
    s = re.sub(r"(<title>)([^<]*)(</title>)",
               lambda m: m.group(1) + clean_public_text(m.group(2)) + m.group(3), s)
    return s

def load_catalog():
    data = json.load(open("data/stations.json", encoding="utf-8"))
    by_name, by_id = {}, {}
    for s in data["stations"]:
        by_name[s["name_th"]] = s
        by_id[s["id"]] = s
    return by_name, by_id

def load_listings():
    raw = json.load(open("data/listings.json", encoding="utf-8"))["rooms"]
    return {r["id"]: r for r in raw}

def station_of(l, by_name):
    name = l.get("station") or l.get("transit")
    if not name:
        return None
    return by_name.get(name)

def group_live_hubs(listings, by_name):
    groups = defaultdict(list)
    for l in listings.values():
        st = station_of(l, by_name)
        if not st:
            continue
        groups[st["id"]].append(l)
    hubs = []
    for sid, rooms in groups.items():
        st = by_name[rooms[0].get("station") or rooms[0].get("transit")]
        rooms_sorted = sorted(
            rooms,
            key=lambda l: (
                999 if l.get("walk") is None else int(l["walk"]),
                int(l.get("price") or 0),
                l["id"],
            ),
        )
        prices = [int(l["price"]) for l in rooms_sorted if l.get("price")]
        walks = [int(l["walk"]) for l in rooms_sorted if l.get("walk") is not None]
        hubs.append({
            "id": sid,
            "slug": sid,
            "name_th": st["name_th"],
            "name_en": st.get("name_en") or st["name_th"],
            "system": st.get("system"),
            "line": st.get("line"),
            "line_th": st.get("line_th"),
            "lat": st.get("lat"),
            "lng": st.get("lng"),
            "source": st.get("source"),
            "count": len(rooms_sorted),
            "soon": sum(1 for l in rooms_sorted if is_soon(l)),
            "priceMin": min(prices) if prices else None,
            "priceMax": max(prices) if prices else None,
            "walkMin": min(walks) if walks else None,
            "rooms": rooms_sorted,
        })
    hubs.sort(key=lambda h: (-h["count"], h["name_th"]))
    return hubs

def price_range(h):
    if h["priceMin"] is None:
        return None
    if h["priceMin"] == h["priceMax"]:
        return f"{money(h['priceMin'])} บาท/เดือน"
    return f"{money(h['priceMin'])}–{money(h['priceMax'])} บาท/เดือน"

def load_cards():
    cards = {}
    for p in glob.glob("areas/*/index.html") + glob.glob("condo/*/index.html") + ["index.html"]:
        if not os.path.exists(p):
            continue
        for c in CARD_RE.findall(read(p)):
            m = re.search(r'data-listing="(MC-\d+)"', c)
            if not m:
                continue
            # Area/condo/home cards already use ../../ or ./ ; normalise to ../../
            c = c.replace('href="rooms/', 'href="../../rooms/')
            c = c.replace('src="images/', 'src="../../images/')
            c = c.replace('href="./rooms/', 'href="../../rooms/')
            c = c.replace('src="./images/', 'src="../../images/')
            c = re.sub(r'<article class="card"[^>]*>', '<article class="card">', c, count=1)
            cards[m.group(1)] = c
    return cards

def patch_badges_in_html(s, listings):
    def one_card(m):
        card = m.group(0)
        if "badge-rented" in card or "badge-sold" in card:
            return card
        mid = re.search(r'data-listing="(MC-\d+)"', card)
        if not mid:
            return card
        l = listings.get(mid.group(1))
        if not l:
            return card
        if BADGE_RE.search(card):
            return BADGE_RE.sub(badge_html(l), card, count=1)
        return card
    s = CARD_RE.sub(one_card, s)
    # Room gallery badge (and any leftover standalone vacant badge with data-listing nearby)
    def one_gal(m):
        block = m.group(0)
        if "badge-rented" in block or "badge-sold" in block:
            return block
        mid = re.search(r'data-listing="(MC-\d+)"', block)
        if not mid:
            return block
        l = listings.get(mid.group(1))
        if not l or not BADGE_RE.search(block):
            return block
        return BADGE_RE.sub(badge_html(l), block, count=1)
    s = re.sub(
        r'<div class="gallery-stage"[^>]*>.*?</div>\s*<div class="gallery-nav">',
        one_gal, s, count=1, flags=re.S)
    return s

def link_station_name(name, href, text):
    """Wrap the first raw occurrence of a station name with a link, skip if already linked."""
    if not name or not href or name not in text:
        return text
    # already linked
    if re.search(r'<a\b[^>]*>[^<]*' + re.escape(name), text):
        return text
    return text.replace(name, f'<a href="{esc(href)}">{esc(name)}</a>', 1)

def patch_room_page(s, listing, by_name, listings, pre="../../"):
    s = strip_codes_in_html(s)
    s = patch_badges_in_html(s, listings)
    st = station_of(listing, by_name)
    if not st:
        return s
    href = f"{pre}stations/{st['id']}/"
    def kicker(m):
        inner = m.group(1)
        if "<a " in inner and st["name_th"] in inner:
            return m.group(0)
        return f'<p class="room-kicker">{link_station_name(st["name_th"], href, inner)}</p>'
    s = re.sub(r'<p class="room-kicker">(.*?)</p>', kicker, s, count=1, flags=re.S)
    def fact(m):
        val = m.group(2)
        if "<a " in val:
            return m.group(0)
        return f'{m.group(1)}<a href="{esc(href)}">{val}</a>{m.group(3)}'
    s = re.sub(
        r'(<div><span>สถานีใกล้ที่สุด</span><b>)([^<]+)(</b></div>)',
        fact, s, count=1)
    return s

def area_station_section(area_slug, hubs, listings):
    # stations that have at least one live room in this area
    rows = []
    for h in hubs:
        n = sum(1 for l in h["rooms"] if (l.get("areaSlug") or "") == area_slug)
        if n:
            rows.append((h, n))
    if not rows:
        return ""
    items = []
    for h, n in rows:
        items.append(
            f'<li><a href="../../stations/{esc(h["slug"])}/">{esc(h["name_th"])}</a>'
            f' · ว่างจริง {n} ห้อง</li>'
        )
    return (
        '\n    <section class="section station-hubs" id="stations">\n'
        '      <div class="section-head"><div>\n'
        '        <div class="eyebrow">สถานีรถไฟฟ้า</div>\n'
        '        <h2>ห้องว่างใกล้สถานีในย่านนี้</h2>\n'
        '        <p>หน้ารวมห้องว่างจริงของแต่ละสถานี</p>\n'
        '      </div></div>\n'
        f'      <ul class="station-hub-list">{"".join(items)}</ul>\n'
        '    </section>\n'
    )

def patch_area_page(s, area_slug, hubs, listings):
    s = patch_badges_in_html(s, listings)
    s = strip_codes_in_html(s)
    sec = area_station_section(area_slug, hubs, listings)
    s = STATIONS_SEC_RE.sub("", s)
    if sec:
        if re.search(r'<section class="section" id="rooms">', s):
            s = s.replace(
                '<section class="section" id="rooms">',
                sec + '    <section class="section" id="rooms">',
                1,
            )
        else:
            s = s.replace("</main>", sec + "  </main>", 1)
    return s

def stamp_assets(s):
    s = re.sub(r'(assets/styles\.css\?v=)[^"\']+', rf'\g<1>{STYLES_V}', s)
    s = re.sub(r'(assets/i18n\.js\?v=)[^"\']+', rf'\g<1>{I18N_JS_V}', s)
    s = re.sub(r'(assets/app\.js\?v=)[^"\']+', rf'\g<1>{ASSET_V}', s)
    return s

def inject_station_slugs(hubs):
    app = read("assets/app.js")
    slugs = {h["name_th"]: h["slug"] for h in hubs}
    line = "const STATION_SLUGS = " + json.dumps(slugs, ensure_ascii=False) + ";"
    if re.search(r"^const STATION_SLUGS = ", app, re.M):
        app = re.sub(r"^const STATION_SLUGS = .*;$", line, app, count=1, flags=re.M)
    else:
        # insert after AREA_SLUGS block
        app = re.sub(
            r"(const AREA_SLUGS = \{.*?\};)",
            r"\1\n" + line,
            app, count=1, flags=re.S,
        )
    write("assets/app.js", app)

def collection_ld(h, url):
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": url + "#breadcrumb",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": h["name_th"], "item": url},
        ],
    }
    items = []
    for i, l in enumerate(h["rooms"], 1):
        items.append({
            "@type": "ListItem",
            "position": i,
            "url": f"{BASE}rooms/{l['id'].lower()}/",
            "name": " · ".join(x for x in [
                l.get("project"),
                f"{money(l['price'])} บาท/เดือน" if l.get("price") else None,
                (f"{l['walk']} นาทีถึง {h['name_th']}" if l.get("walk") is not None else None),
            ] if x),
        })
    itemlist = {
        "@type": "ItemList",
        "@id": url + "#rooms",
        "name": f"คอนโดให้เช่าใกล้ {h['name_th']}",
        "url": url,
        "numberOfItems": h["count"],
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": items,
    }
    station = {
        "@type": "SubwayStation",
        "@id": url + "#station",
        "name": h["name_th"],
        "alternateName": h["name_en"],
    }
    if h.get("lat") is not None and h.get("lng") is not None:
        station["geo"] = {"@type": "GeoCoordinates", "latitude": h["lat"], "longitude": h["lng"]}
    if h.get("source"):
        station["sameAs"] = h["source"]
    page = {
        "@type": "CollectionPage",
        "@id": url + "#page",
        "name": f"คอนโดให้เช่าใกล้ {h['name_th']} – ว่างจริง {h['count']} ห้อง",
        "url": url,
        "description": desc_for(h),
        "inLanguage": ["th", "en"],
        "about": {"@id": url + "#station"},
        "mainEntity": {"@id": url + "#rooms"},
        "isPartOf": {"@id": BASE + "#website"},
    }
    return [
        {"@context": "https://schema.org", **page, "hasPart": [station]},
        # keep about entity reachable; also emit it and the lists as siblings
    ]  # rewritten below

def desc_for(h):
    bits = [f"คอนโดให้เช่าใกล้ {h['name_th']}", f"ว่างจริง {h['count']} ห้อง"]
    pr = price_range(h)
    if pr:
        bits.append(f"ราคา {pr}")
    if h["soon"]:
        bits.append(f"รวมห้องที่เข้าอยู่ได้ภายใน 30 วัน {h['soon']} ห้อง")
    bits.append("ห้องว่างจริงที่ MoveCondo")
    return " · ".join(bits)

def intro_for(h):
    pr = price_range(h)
    line = f" อยู่บน {h['line_th']}" if h.get("line_th") else ""
    th = f"ขณะนี้มีคอนโดให้เช่าว่างจริง {h['count']} ห้องใกล้ {h['name_th']}{line}"
    if pr:
        th += f" ราคา {pr}"
    if h["soon"]:
        th += f" รวมห้องที่จะเข้าอยู่ได้ภายใน 30 วัน {h['soon']} ห้อง"
    th += " เรียงจากห้องที่เดินถึงสถานีใกล้ที่สุดก่อน และแสดงเวลาเดินเฉพาะห้องที่มีข้อมูลจริง"
    en = (f"There are currently {h['count']} verified available condo"
          f"{'s' if h['count'] != 1 else ''} for rent near {h['name_en']}")
    if h.get("line"):
        en += f" on the {h['line']} line"
    if pr:
        en += f". Rents range from {money(h['priceMin'])} to {money(h['priceMax'])} THB per month" if h["priceMin"] != h["priceMax"] else f". Rent is {money(h['priceMin'])} THB per month"
    else:
        en += "."
    if h["soon"]:
        en += f" This includes {h['soon']} room{'s' if h['soon'] != 1 else ''} available within 30 days."
    else:
        if not en.endswith("."):
            en += "."
    en += " Rooms are sorted by walking time to the station; walking minutes are shown only when that figure is known."
    return th, en

def jsonld_for(h, url):
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": url + "#breadcrumb",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": h["name_th"], "item": url},
        ],
    }
    items = []
    for i, l in enumerate(h["rooms"], 1):
        items.append({
            "@type": "ListItem",
            "position": i,
            "url": f"{BASE}rooms/{l['id'].lower()}/",
            "name": " · ".join(x for x in [
                l.get("project"),
                f"{money(l['price'])} บาท/เดือน" if l.get("price") else None,
                (f"{l['walk']} นาทีถึง {h['name_th']}" if l.get("walk") is not None else None),
            ] if x),
        })
    itemlist = {
        "@type": "ItemList",
        "@id": url + "#rooms",
        "name": f"คอนโดให้เช่าใกล้ {h['name_th']}",
        "url": url,
        "numberOfItems": h["count"],
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": items,
    }
    station = {
        "@type": "SubwayStation",
        "@id": url + "#station",
        "name": h["name_th"],
        "alternateName": h["name_en"],
    }
    if h.get("lat") is not None and h.get("lng") is not None:
        station["geo"] = {
            "@type": "GeoCoordinates",
            "latitude": h["lat"],
            "longitude": h["lng"],
        }
    if h.get("source"):
        station["sameAs"] = h["source"]
    page = {
        "@type": "CollectionPage",
        "@id": url + "#page",
        "name": f"คอนโดให้เช่าใกล้ {h['name_th']} – ว่างจริง {h['count']} ห้อง",
        "url": url,
        "description": desc_for(h),
        "inLanguage": ["th", "en"],
        "about": {"@id": url + "#station"},
        "mainEntity": {"@id": url + "#rooms"},
        "breadcrumb": {"@id": url + "#breadcrumb"},
        "isPartOf": {"@id": BASE + "#website"},
    }
    return {"@context": "https://schema.org", "@graph": [page, station, itemlist, crumbs]}

def empty_stub(slug, name_th="สถานีนี้"):
    url = f"{BASE}stations/{slug}/"
    title = f"คอนโดให้เช่าใกล้ {name_th} | MoveCondo"
    desc = f"ขณะนี้ยังไม่มีห้องว่างจริงใกล้ {name_th} ที่ MoveCondo"
    return f'''<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="{BASE}" />
  <link rel="stylesheet" href="../../assets/styles.css?v={STYLES_V}" />
  <link rel="stylesheet" href="../../assets/i18n.css?v=20261112i1" />
</head>
<body>
  <main id="main" class="wrap" style="padding:32px 20px 64px">
    <nav class="crumbs" aria-label="เส้นทาง"><a href="../../">หน้าแรก</a> <span aria-hidden="true">/</span> <span>{esc(name_th)}</span></nav>
    <h1>คอนโดให้เช่าใกล้ {esc(name_th)}</h1>
    <p>ขณะนี้ยังไม่มีห้องว่างจริงใกล้สถานีนี้ ดูห้องว่างในย่านอื่นได้ที่ <a href="../../">หน้าแรก</a></p>
  </main>
</body>
</html>
'''

def build_hub_page(h, cards, template_head_foot):
    body_top, foot = template_head_foot
    url = f"{BASE}stations/{h['slug']}/"
    title = f"คอนโดให้เช่าใกล้ {h['name_th']} – ว่างจริง {h['count']} ห้อง | MoveCondo"
    title_en = f"Condos for rent near {h['name_en']} – {h['count']} verified available room{'s' if h['count']!=1 else ''} | MoveCondo"
    desc = desc_for(h)
    desc_en = (
        f"{h['count']} verified available condo{'s' if h['count']!=1 else ''} for rent near {h['name_en']}"
        + (f", from {money(h['priceMin'])} to {money(h['priceMax'])} THB per month" if h["priceMin"] and h["priceMin"] != h["priceMax"] else (f", {money(h['priceMin'])} THB per month" if h["priceMin"] else ""))
        + ". Real listings on MoveCondo."
    )
    intro_th, intro_en = intro_for(h)
    og = f"{BASE}images/rooms/{h['rooms'][0]['id'].lower()}/cover.webp"
    eyebrow = " · ".join(x for x in [h.get("system"), h.get("line_th")] if x)
    card_html = []
    missing = 0
    for l in h["rooms"]:
        c = cards.get(l["id"])
        if not c:
            missing += 1
            continue
        card_html.append(c)
    if missing:
        print(f"  warn {h['slug']}: {missing} rooms have no card markup", file=sys.stderr)
    ld = json.dumps(jsonld_for(h, url), ensure_ascii=False, indent=2)
    head = f'''<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />
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
  <meta property="og:image" content="{og}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(desc)}" />
  <meta name="twitter:image" content="{og}" />
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="../../favicon.ico" sizes="32x32" />
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png" />
  <link rel="manifest" href="../../site.webmanifest" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/styles.css?v={STYLES_V}" />
  <link rel="stylesheet" href="../../assets/i18n.css?v=20261112i1" />
  <script type="application/ld+json" id="ld-station">
{ld}
  </script>
  <meta name="description:en" content="{esc(desc_en)}" />
</head>
'''
    # description:en is a nonstandard meta I shouldn't invent. Use data-en on visible nodes only.
    head = head.replace(f'  <meta name="description:en" content="{esc(desc_en)}" />\n', "")
    h1 = f"คอนโดให้เช่าใกล้ {h['name_th']} – ว่างจริง {h['count']} ห้อง"
    body = f'''{body_top}<main id="main">
    <nav class="crumbs" aria-label="เส้นทาง"><a href="../../">หน้าแรก</a> <span aria-hidden="true">/</span> <span>{esc(h["name_th"])}</span></nav>
    <article class="page-hero station-hero" style="width:min(var(--max), calc(100% - 48px)); margin: 12px auto 0;">
      <div class="eyebrow">{esc(eyebrow)}</div>
      <h1 data-en="{esc(title_en.replace(" | MoveCondo", ""))}">{esc(h1)}</h1>
      <p class="lead" data-en="{esc(intro_en)}">{esc(intro_th)}</p>
    </article>
    <section class="section" id="rooms">
      <div class="section-head">
        <div>
          <div class="eyebrow">คอนโดเช่าใกล้สถานี</div>
          <h2>ห้องให้เช่าใกล้สถานีนี้</h2>
          <p>ว่างจริง {h["count"]} ห้อง · เรียงตามเวลาเดินถึงสถานี</p>
        </div>
      </div>
      <div class="grid" data-more-grid>
{chr(10).join(card_html)}
      </div>
    </section>
  '''
    return stamp_assets(head + body + foot)

def template_parts():
    t = read("areas/chidlom/index.html")
    body_top = t.split("<body>", 1)[1].split('<main id="main">', 1)[0]
    # body may be <body> or <body class=...>
    m = re.search(r"(<body[^>]*>)(.*)<main id=\"main\">", t, re.S)
    body_top = m.group(1) + m.group(2)
    foot = "</main>" + t.split("</main>", 1)[1]
    return body_top, foot

def write_hubs(hubs, cards):
    parts = template_parts()
    live = {h["slug"] for h in hubs}
    names = {h["slug"]: h["name_th"] for h in hubs}
    out_dir = "stations"
    os.makedirs(out_dir, exist_ok=True)
    written = []
    for h in hubs:
        path = f"stations/{h['slug']}/index.html"
        write(path, build_hub_page(h, cards, parts))
        written.append(h["slug"])
    # leftover folders -> noindex stub
    stubs = []
    if os.path.isdir(out_dir):
        for slug in os.listdir(out_dir):
            p = os.path.join(out_dir, slug)
            if not os.path.isdir(p):
                continue
            if slug in live:
                continue
            # keep the Thai name if the old page has it
            name = slug
            old = os.path.join(p, "index.html")
            if os.path.exists(old):
                m = re.search(r"ใกล้ ([^<–|]+)", read(old))
                if m:
                    name = m.group(1).strip()
            write(os.path.join(p, "index.html"), empty_stub(slug, name))
            stubs.append(slug)
    return written, stubs

def public_hubs_json(hubs):
    rows = []
    for h in hubs:
        rows.append({
            "id": h["id"],
            "slug": h["slug"],
            "url": f"{BASE}stations/{h['slug']}/",
            "name_th": h["name_th"],
            "name_en": h["name_en"],
            "system": h.get("system"),
            "line_th": h.get("line_th"),
            "count": h["count"],
            "soon": h["soon"],
            "priceMin": h["priceMin"],
            "priceMax": h["priceMax"],
            "walkMin": h["walkMin"],
            "rooms": [l["id"] for l in h["rooms"]],
        })
    write("data/station-hubs.json", json.dumps({
        "generated": TODAY.isoformat(),
        "count": len(rows),
        "stations": rows,
    }, ensure_ascii=False, indent=2) + "\n")

def patch_sitemap(hubs):
    path = "sitemap.xml"
    if not os.path.exists(path):
        return
    s = read(path)
    # drop any previous station entries
    s = re.sub(
        r"\n  <url>\s*<loc>" + re.escape(BASE) + r"stations/[^<]+</loc>.*?</url>",
        "", s, flags=re.S)
    entries = []
    for h in hubs:
        u = f"{BASE}stations/{h['slug']}/"
        entries.append(f"""  <url>
    <loc>{u}</loc>
    <xhtml:link rel="alternate" hreflang="th" href="{u}" />
    <xhtml:link rel="alternate" hreflang="en" href="{u}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="{u}" />
    <lastmod>{TODAY.isoformat()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
    if entries:
        if "</urlset>" in s:
            s = s.replace("</urlset>", "\n".join(entries) + "\n</urlset>")
        else:
            s = s.rstrip() + "\n" + "\n".join(entries) + "\n"
    write(path, s)

def patch_all_pages(listings, by_name, hubs):
    # homepage + any leftover html with cards
    if os.path.exists("index.html"):
        write("index.html", stamp_assets(patch_badges_in_html(strip_codes_in_html(read("index.html")), listings)))
    for p in glob.glob("areas/*/index.html"):
        slug = p.split("/")[1]
        write(p, stamp_assets(patch_area_page(read(p), slug, hubs, listings)))
    for p in glob.glob("condo/*/index.html"):
        write(p, stamp_assets(patch_badges_in_html(strip_codes_in_html(read(p)), listings)))
    for p in glob.glob("rooms/*/index.html"):
        mid = p.split("/")[1].upper()  # mc-168 -> MC-168? wait mc-168.upper() is MC-168 yes
        # folder is mc-168
        rid = mid.replace("MC-", "MC-") if mid.startswith("MC-") else "MC-" + mid[3:] if False else mid
        # rooms/mc-168 -> MC-168
        rid = p.split("/")[1].upper()
        if not rid.startswith("MC-"):
            rid = "MC-" + p.split("/")[1].split("-")[-1].zfill(3)
        # actually folder is always mc-###
        m = re.search(r"rooms/(mc-\d+)/", p + "/")
        rid = m.group(1).upper() if m else None
        l = listings.get(rid)
        if not l:
            # rented pages still in folders - strip codes, leave rented badge
            write(p, stamp_assets(strip_codes_in_html(read(p))))
            continue
        write(p, stamp_assets(patch_room_page(read(p), l, by_name, listings)))
    # type/buy/partner just in case a code leaked
    for p in (glob.glob("buy/**/index.html", recursive=True)
              + glob.glob("type/*/index.html")
              + glob.glob("partner/**/*.html", recursive=True)
              + ["404.html"] if os.path.exists("404.html") else []):
        if os.path.exists(p):
            s = read(p)
            n = strip_codes_in_html(s)
            if n != s:
                write(p, stamp_assets(n))

def main():
    by_name, by_id = load_catalog()
    listings = load_listings()
    unknown = sorted({
        (l.get("station") or l.get("transit"))
        for l in listings.values()
        if (l.get("station") or l.get("transit")) and not station_of(l, by_name)
    })
    if unknown:
        print("unknown station names (no hub):", unknown, file=sys.stderr)
    hubs = group_live_hubs(listings, by_name)
    # Patch existing pages first so copied cards already have the new badge
    patch_all_pages(listings, by_name, hubs)
    cards = load_cards()
    # Re-patch card badges in the in-memory copies (already patched on disk)
    for rid, c in list(cards.items()):
        l = listings.get(rid)
        if l:
            cards[rid] = BADGE_RE.sub(badge_html(l), c, count=1) if BADGE_RE.search(c) else c
    written, stubs = write_hubs(hubs, cards)
    public_hubs_json(hubs)
    inject_station_slugs(hubs)
    patch_sitemap(hubs)
    print(f"station hubs: {len(written)} live, {len(stubs)} noindex stubs")
    for h in hubs:
        print(f"  {h['slug']}: {h['count']} rooms · {h['name_th']}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
