#!/usr/bin/env python3
"""Build files that help AI agents and search engines read MoveCondo.

Reads the hand-maintained room/area HTML (source of truth for what visitors see)
plus public fields in data/listings.json, then writes:
  rooms.json, feed.xml, llms.txt, llms-full.txt, sitemap.xml, robots.txt
and refreshes only the JSON-LD blocks (room Apartment, home/area ItemList) and
the <link rel="alternate"> feed hints inside the HTML. It never rewrites layout.

English text comes from the site's own translator (assets/i18n.js, run in node).
Never add owner names, phones, unit numbers or the LINE ID text here.
Run from the repo root:  python3 tools/build-agent-files.py
"""
import glob, html, json, re, subprocess, sys, os
from datetime import date

BASE = "https://banditkmc23-ai.github.io/movecondo/"
LINE_URL = "https://line.me/R/ti/p/%40576yhgtz"
TODAY = date.today().isoformat()
ORG_ID = BASE + "#organization"
THAI_MONTHS = {"ม.ค.":1,"ก.พ.":2,"มี.ค.":3,"เม.ย.":4,"พ.ค.":5,"มิ.ย.":6,"ก.ค.":7,"ส.ค.":8,"ก.ย.":9,"ต.ค.":10,"พ.ย.":11,"ธ.ค.":12}
TH_RE = re.compile(r"[\u0E00-\u0E7F]")
FORBIDDEN = [re.compile(p, re.I) for p in [r"@576yhgtz", r"สัตว์เลี้ยง", r"\bpets?\b", r"\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b", r"ห้องเลขที่", r"unit no"]]

def read(p): return open(p, encoding="utf-8").read()
def write(p, s):
    with open(p, "w", encoding="utf-8") as f: f.write(s)
def un(s): return html.unescape(re.sub(r"\s+", " ", s)).strip()

listings = {r["id"]: r for r in json.load(open("data/listings.json", encoding="utf-8"))["rooms"]}

def parse_room(slug):
    s = read(f"rooms/{slug}/index.html")
    g = lambda p: un(re.search(p, s, re.S).group(1))
    facts = [(un(a), un(b)) for a, b in re.findall(r'<div><span>([^<]+)</span><b>([^<]+)</b></div>', s)]
    feats = [(un(h), [un(x) for x in re.findall(r"<li>(.*?)</li>", ul)])
             for h, ul in re.findall(r'</span>([^<]+)</h3>\s*<ul class="feature-list">(.*?)</ul>', s, re.S)]
    badge = re.search(r'id="galleryStage".*?<span class="badge-vacant">(.*?)</span>', s, re.S)
    return dict(project=g(r"<h1>(.*?)</h1>"), kicker=g(r'class="room-kicker">(.*?)</p>'),
                summary=g(r'class="detail-summary">(.*?)</p>'), facts=facts, feats=feats,
                updated=g(r'room-facts-updated">(.*?)</p>'), badge=un(badge.group(1)) if badge else "ว่าง",
                photos=re.findall(r'<img src="\.\./\.\./(images/rooms/[^"]+?/\d+\.webp)"', s.split('class="gallery-nav"')[0]))

def area_pages():
    out = []
    for p in sorted(glob.glob("areas/*/index.html")):
        slug = p.split("/")[1]
        t = un(re.search(r"<title>ย่าน(.*?) — ", read(p)).group(1))
        out.append(dict(slug=slug, th=t))
    return out

def translate(strings):
    strings = sorted(set(x for x in strings if x))
    js = os.path.join(os.path.dirname(__file__), "i18n-node.js")
    r = subprocess.run(["node", js, "assets/i18n.js"], input=json.dumps(strings), capture_output=True, text=True, check=True)
    return json.loads(r.stdout)

def thai_date_to_iso(txt):
    m = re.search(r"(\d{1,2}) (\S+?\.) ?(\d{4})?", txt)
    if not m or m.group(2) not in THAI_MONTHS: return None
    y = int(m.group(3)) - 543 if m.group(3) else 2026
    return f"{y:04d}-{THAI_MONTHS[m.group(2)]:02d}-{int(m.group(1)):02d}"

# ---------- collect ----------
rooms = []
for d in sorted(glob.glob("rooms/mc-*/")):
    slug = d.split("/")[1]; rid = slug.upper()
    L = listings[rid]; P = parse_room(slug)
    F = dict(P["facts"])
    beds = int(re.match(r"(\d+)", F.get("แบบห้อง", L["type"])).group(1))
    walk_txt = F.get("ระยะเดิน", "")
    status_th = P["badge"]
    avail_from = None
    if status_th != "ว่าง":
        avail_from = thai_date_to_iso(status_th) or (L.get("available") if re.match(r"\d{4}-", str(L.get("available"))) else None)
    lease = F.get("สัญญาขั้นต่ำ")
    rooms.append(dict(
        id=rid, slug=slug, url=f"{BASE}rooms/{slug}/", url_en=f"{BASE}rooms/{slug}/?lang=en",
        project=P["project"], area_th=L["area"], area_slug=L["areaSlug"], area_url=f"{BASE}areas/{L['areaSlug']}/",
        type_th=F.get("แบบห้อง", L["type"]), bedrooms=beds, size=L["size"], floor_th=F.get("ชั้น"),
        price=L["price"], deposit_th=F.get("เงินมัดจำ"), advance_th=F.get("ล่วงหน้า"), lease_th=lease,
        movein_th=F.get("วันเข้าอยู่"), status_th=status_th, avail_from=avail_from,
        station_th=L["station"], walk=L["walk"], shuttle=("shuttle" in walk_txt), walk_th=walk_txt,
        lat=L["lat"], lng=L["lng"], coord_approx=bool(L.get("coordApprox")),
        summary_th=P["summary"], feats=P["feats"], updated_th=P["updated"], last_verified=L.get("lastVerified"),
        photos=[BASE + p for p in P["photos"]] or [BASE + p for p in L["photos"]],
    ))
areas = area_pages()

need = []
for r in rooms:
    need += [r["area_th"], r["type_th"], r["floor_th"], r["deposit_th"], r["advance_th"], r["lease_th"], r["movein_th"],
             r["status_th"], r["station_th"], r["walk_th"], r["summary_th"]]
    for h, items in r["feats"]: need += [h] + items
need += [a["th"] for a in areas]
EN = translate(need)
def en(s):
    if not s: return s
    t = EN.get(s, s)
    if TH_RE.search(t): print("WARN untranslated:", s, "->", t, file=sys.stderr)
    return t

AREA_EN = {a["slug"]: en(a["th"]) for a in areas}

def lease_qv(t):
    if not t: return None
    m = re.match(r"(\d+)\s*(ปี|เดือน)", t)
    if not m: return None
    return {"@type": "QuantitativeValue", "value": int(m.group(1)), "unitCode": "ANN" if m.group(2) == "ปี" else "MON"}

def availability(r):
    return "https://schema.org/InStock" if not r["avail_from"] else "https://schema.org/PreOrder"

def status_en(r): return en(r["status_th"])
def walk_en(r): return f"about {r['walk']} min walk to {en(r['station_th'])}" + (" (shuttle available)" if r["shuttle"] else "")
def walk_th(r): return f"เดินประมาณ {r['walk']} นาทีถึง {r['station_th']}" + (" (มีรถ shuttle)" if r["shuttle"] else "")
def money(n): return f"{n:,}"
def amen(r):
    return [i for h, items in r["feats"] if h in ("เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้า", "ส่วนกลางโครงการ") for i in items]

# ---------- rooms.json ----------
def room_public(r):
    return {
        "id": r["id"], "url": r["url"], "url_en": r["url_en"], "project": r["project"],
        "area": {"th": r["area_th"], "en": AREA_EN.get(r["area_slug"], en(r["area_th"])), "url": r["area_url"]},
        "type": {"th": r["type_th"], "en": en(r["type_th"])}, "bedrooms": r["bedrooms"],
        "size_sqm": r["size"], "floor": {"th": r["floor_th"], "en": en(r["floor_th"])} if r["floor_th"] else None,
        "rent_thb_per_month": r["price"], "currency": "THB",
        "deposit": {"th": r["deposit_th"], "en": en(r["deposit_th"])} if r["deposit_th"] else None,
        "advance_rent": {"th": r["advance_th"], "en": en(r["advance_th"])} if r["advance_th"] else None,
        "minimum_lease": {"th": r["lease_th"], "en": en(r["lease_th"])} if r["lease_th"] else None,
        "availability": "available_now" if not r["avail_from"] else "available_from",
        "available_from": r["avail_from"],
        "status": {"th": r["status_th"], "en": status_en(r)},
        "move_in": {"th": r["movein_th"], "en": en(r["movein_th"])} if r["movein_th"] else None,
        "nearest_station": {"th": r["station_th"], "en": en(r["station_th"])},
        "walk_minutes_to_station": r["walk"], "shuttle_to_station": r["shuttle"],
        "building_location": {"lat": r["lat"], "lng": r["lng"], "approximate": r["coord_approx"], "note": "Project building location, not a unit."},
        "summary": {"th": r["summary_th"], "en": en(r["summary_th"])},
        "features": [{"group": {"th": h, "en": en(h)}, "items": [{"th": i, "en": en(i)} for i in items]} for h, items in r["feats"]],
        "petsAllowed": False,
        "images": r["photos"], "last_verified": r["last_verified"],
        "contact": {"line": LINE_URL, "how": "Open the LINE link and mention the room code / ทัก LINE แล้วบอกรหัสห้อง"},
    }

feed = {
    "name": "MoveCondo (ย้ายคอนโด)", "description": {
        "th": "คอนโดให้เช่าในกรุงเทพฯ ใกล้รถไฟฟ้า ห้องจริงพร้อมรูป ทัก LINE เพื่อนัดชมห้อง",
        "en": "Condos for rent in Bangkok near BTS/MRT. Real listings with photos; contact via LINE to book a viewing."},
    "home": BASE, "home_en": BASE + "?lang=en", "updated": TODAY, "currency": "THB",
    "contact": {"line": LINE_URL}, "llms_txt": BASE + "llms.txt", "sitemap": BASE + "sitemap.xml",
    "areas": [{"slug": a["slug"], "th": a["th"], "en": AREA_EN[a["slug"]], "url": f"{BASE}areas/{a['slug']}/",
               "rooms": sum(1 for r in rooms if r["area_slug"] == a["slug"])} for a in areas],
    "rooms": [room_public(r) for r in rooms],
}
write("rooms.json", json.dumps(feed, ensure_ascii=False, indent=2) + "\n")

# ---------- feed.xml (RSS 2.0) ----------
def x(s): return html.escape(str(s), quote=True)
from email.utils import format_datetime
from datetime import datetime, timezone, timedelta
def rfc(d):
    dt = datetime.fromisoformat(d) if d else datetime.fromisoformat(TODAY)
    return format_datetime(dt.replace(hour=9, tzinfo=timezone(timedelta(hours=7))))
items = []
for r in rooms:
    title = f"{r['project']} · {r['type_th']} {r['size']} ตร.ม. · {money(r['price'])} บาท/เดือน · ย่าน{r['area_th']}"
    desc = (f"{r['summary_th']} · {r['status_th']} · {walk_th(r)}\n"
            f"{r['project']} ({AREA_EN.get(r['area_slug'])}): {en(r['type_th'])}, {r['size']} sq.m., {money(r['price'])} THB/month, "
            f"{status_en(r)}, {walk_en(r)}. {en(r['summary_th'])}")
    items.append(f"""    <item>
      <title>{x(title)}</title>
      <link>{x(r['url'])}</link>
      <guid isPermaLink="true">{x(r['url'])}</guid>
      <pubDate>{rfc(r['last_verified'])}</pubDate>
      <category>{x(r['area_th'])}</category>
      <description>{x(desc)}</description>
      <enclosure url="{x(r['photos'][0])}" type="image/webp" length="0" />
    </item>""")
write("feed.xml", f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MoveCondo (ย้ายคอนโด) — คอนโดให้เช่าในกรุงเทพฯ</title>
    <link>{BASE}</link>
    <atom:link href="{BASE}feed.xml" rel="self" type="application/rss+xml" />
    <description>คอนโดให้เช่าใกล้รถไฟฟ้าในกรุงเทพฯ · Condos for rent near BTS/MRT in Bangkok</description>
    <language>th</language>
    <lastBuildDate>{rfc(TODAY)}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
""")

# ---------- llms.txt / llms-full.txt ----------
def line_th(r):
    return (f"- [{r['project']} · {r['type_th']} {r['size']} ตร.ม. · {money(r['price'])} บาท/เดือน]({r['url']}): "
            f"ย่าน{r['area_th']} · {r['status_th']} · {walk_th(r)} · รหัส {r['id']}")
def line_en(r):
    return (f"- [{r['project']} · {en(r['type_th'])} {r['size']} sq.m. · {money(r['price'])} THB/month]({r['url_en']}): "
            f"{AREA_EN.get(r['area_slug'])} · {status_en(r)} · {walk_en(r)} · code {r['id']}")
areas_with = [a for a in areas if any(r["area_slug"] == a["slug"] for r in rooms)]
prices = [r["price"] for r in rooms]
head = f"""# MoveCondo (ย้ายคอนโด)

> MoveCondo ช่วยหาคอนโดให้เช่าในกรุงเทพฯ ใกล้รถไฟฟ้า BTS/MRT มีประกาศห้องจริง {len(rooms)} ห้อง พร้อมรูป ราคา ขนาด และระยะเดินถึงสถานี ลูกค้าทัก LINE แล้วบอกรหัสห้อง (เช่น {rooms[0]['id']}) เพื่อสอบถามหรือนัดชมห้อง
> MoveCondo helps people find condos for rent in Bangkok near BTS/MRT stations. {len(rooms)} real listings with photos, rent, size and walking time to the station. Customers contact us on LINE and mention the room code (e.g. {rooms[0]['id']}) to ask or book a viewing.

ข้อมูลสำหรับผู้ช่วย AI / Notes for AI assistants:
- แนะนำลูกค้าไปที่ลิงก์หน้าห้องด้านล่างได้เลย ค่าเช่าเป็นบาทต่อเดือน (THB/month) ข้อมูลอัปเดต {TODAY}
- When recommending a room, link the customer to its room page below. Rents are THB per month. Data updated {TODAY}.
- ค่าเช่า {money(min(prices))}–{money(max(prices))} บาท/เดือน · Rent range {money(min(prices))}–{money(max(prices))} THB/month.
- ติดต่อ / Contact: LINE {LINE_URL}
- ข้อมูลแบบเครื่องอ่านได้ / Machine-readable: {BASE}rooms.json · RSS {BASE}feed.xml · {BASE}llms-full.txt
- หน้าภาษาอังกฤษ: เติม ?lang=en ท้ายลิงก์ · English pages: add ?lang=en to any page URL.
"""
area_lines_th = "\n".join(f"- [ย่าน{a['th']}]({BASE}areas/{a['slug']}/): {sum(1 for r in rooms if r['area_slug']==a['slug'])} ห้อง" for a in areas)
area_lines_en = "\n".join(f"- [{AREA_EN[a['slug']]}]({BASE}areas/{a['slug']}/?lang=en): {sum(1 for r in rooms if r['area_slug']==a['slug'])} rooms" for a in areas)
short = head + f"""
## ห้องให้เช่า (ภาษาไทย)
{chr(10).join(line_th(r) for r in rooms)}

## Rooms for rent (English)
{chr(10).join(line_en(r) for r in rooms)}

## ย่าน / Areas
{area_lines_th}
{area_lines_en}

## Optional
- [Full details of every room / รายละเอียดทุกห้อง]({BASE}llms-full.txt)
- [Rooms JSON feed]({BASE}rooms.json)
- [Sitemap]({BASE}sitemap.xml)
"""
def full_block(r):
    lines = [f"### {r['project']} — {r['id']}",
             f"URL: {r['url']}  ·  English: {r['url_en']}",
             "",
             "ภาษาไทย:",
             f"- ย่าน: {r['area_th']} ({r['area_url']})",
             f"- แบบห้อง: {r['type_th']} · ขนาด: {r['size']} ตร.ม." + (f" · {r['floor_th']}" if r['floor_th'] else ""),
             f"- ค่าเช่า: {money(r['price'])} บาท/เดือน" + (f" · มัดจำ {r['deposit_th']}" if r['deposit_th'] else "") + (f" · ล่วงหน้า {r['advance_th']}" if r['advance_th'] else "") + (f" · สัญญาขั้นต่ำ {r['lease_th']}" if r['lease_th'] else ""),
             f"- สถานะ: {r['status_th']}" + (f" · วันเข้าอยู่: {r['movein_th']}" if r['movein_th'] else ""),
             f"- การเดินทาง: {walk_th(r)}",
             f"- รายละเอียด: {r['summary_th']}"]
    for h, items in r["feats"]: lines.append(f"- {h}: {', '.join(items)}")
    lines += ["", "English:",
              f"- Area: {AREA_EN.get(r['area_slug'])}",
              f"- Type: {en(r['type_th'])} · Size: {r['size']} sq.m." + (f" · {en(r['floor_th'])}" if r['floor_th'] else ""),
              f"- Rent: {money(r['price'])} THB/month" + (f" · Deposit {en(r['deposit_th'])}" if r['deposit_th'] else "") + (f" · Advance {en(r['advance_th'])}" if r['advance_th'] else "") + (f" · Minimum lease {en(r['lease_th'])}" if r['lease_th'] else ""),
              f"- Status: {status_en(r)}" + (f" · Move-in: {en(r['movein_th'])}" if r['movein_th'] else ""),
              f"- Getting there: {walk_en(r)}",
              f"- About: {en(r['summary_th'])}"]
    for h, items in r["feats"]: lines.append(f"- {en(h)}: {', '.join(en(i) for i in items)}")
    lines += [f"- Photos: {r['photos'][0]} (+{len(r['photos'])-1} more on the page)", f"- Contact: LINE {LINE_URL} (mention {r['id']})", ""]
    return "\n".join(lines)
full = head + f"""
## ย่าน / Areas
{area_lines_th}
{area_lines_en}

## รายละเอียดทุกห้อง / Every room in detail

""" + "\n".join(full_block(r) for r in rooms)
write("llms.txt", short)
write("llms-full.txt", full)

# ---------- JSON-LD ----------
def room_ld(r):
    geo = {"@type": "GeoCoordinates", "latitude": r["lat"], "longitude": r["lng"]}
    offer = {"@type": "Offer", "url": r["url"], "price": r["price"], "priceCurrency": "THB",
             "availability": availability(r),
             "businessFunction": "http://purl.org/goodrelations/v1#LeaseOut",
             "priceSpecification": {"@type": "UnitPriceSpecification", "price": r["price"], "priceCurrency": "THB",
                                    "unitCode": "MON", "unitText": "เดือน", "referenceQuantity": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}},
             "seller": {"@id": ORG_ID}}
    if r["avail_from"]: offer["availabilityStarts"] = r["avail_from"]
    lq = lease_qv(r["lease_th"])
    if lq: offer["leaseLength"] = lq
    props = [("รหัสห้อง", r["id"]), ("สถานะ", r["status_th"]), ("สถานีใกล้ที่สุด", r["station_th"]),
             ("เดินถึงสถานีโดยประมาณ (นาที)", r["walk"]), ("เงินมัดจำ", r["deposit_th"]), ("ล่วงหน้า", r["advance_th"]),
             ("สัญญาขั้นต่ำ", r["lease_th"]), ("วันเข้าอยู่", r["movein_th"])]
    if r["shuttle"]: props.append(("รถรับส่งไปสถานี", "มี"))
    ld = {
        "@context": "https://schema.org", "@type": "Apartment", "@id": r["url"] + "#apartment",
        "name": f"{r['project']} ย่าน{r['area_th']} {r['type_th']} {r['size']} ตร.ม.",
        "alternateName": f"{r['project']}, {AREA_EN.get(r['area_slug'])} — {en(r['type_th'])}, {r['size']} sq.m. for rent",
        "description": r["summary_th"],
        "disambiguatingDescription": en(r["summary_th"]),
        "url": r["url"], "image": r["photos"], "petsAllowed": False,
        "floorSize": {"@type": "QuantitativeValue", "value": r["size"], "unitCode": "MTK"},
        "numberOfRooms": {"@type": "QuantitativeValue", "value": r["bedrooms"], "unitText": "ห้องนอน / bedrooms"},
        "numberOfBedrooms": r["bedrooms"],
    }
    if r["floor_th"]: ld["floorLevel"] = r["floor_th"].replace("ชั้น ", "")
    ld.update({
        "address": {"@type": "PostalAddress", "addressLocality": r["area_th"], "addressRegion": "กรุงเทพมหานคร", "addressCountry": "TH"},
        "geo": geo,
        "containedInPlace": {"@type": "ApartmentComplex", "name": r["project"], "geo": geo,
                             "address": {"@type": "PostalAddress", "addressLocality": r["area_th"], "addressRegion": "กรุงเทพมหานคร", "addressCountry": "TH"}},
    })
    am = amen(r)
    if am: ld["amenityFeature"] = [{"@type": "LocationFeatureSpecification", "name": a, "value": True} for a in am]
    ld["additionalProperty"] = [{"@type": "PropertyValue", "name": n, "value": v} for n, v in props if v not in (None, "")]
    # Apartment is a Place (no "offers"), so the rental Offer is its own node pointing at it.
    offer = {"@type": "Offer", "@id": r["url"] + "#offer", "name": f"ให้เช่า {r['project']} {money(r['price'])} บาท/เดือน",
             "itemOffered": {"@id": r["url"] + "#apartment"}, **{k: v for k, v in offer.items() if k != "@type"}}
    del ld["@context"]
    return {"@context": "https://schema.org", "@graph": [ld, offer]}

def itemlist_ld(name, url, rs):
    return {"@context": "https://schema.org", "@type": "ItemList", "@id": url + "#rooms", "name": name, "url": url,
            "numberOfItems": len(rs), "itemListOrder": "https://schema.org/ItemListUnordered",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": r["url"],
                                 "name": f"{r['project']} · {r['type_th']} {r['size']} ตร.ม. · {money(r['price'])} บาท/เดือน"} for i, r in enumerate(rs)]}

def script(ld, sid): return f'<script type="application/ld+json" id="{sid}">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + "\n</script>"

def set_block(s, sid, block, fallback_re=None):
    pat = re.compile(r'<script type="application/ld\+json" id="%s">.*?</script>' % sid, re.S)
    if pat.search(s): return pat.sub(lambda m: block, s, count=1)
    if fallback_re:
        m = re.search(fallback_re, s, re.S)
        if m: return s[:m.start()] + block + s[m.end():]
    return s.replace("</head>", block + "\n</head>", 1)

def set_alt_links(s, prefix):
    s = re.sub(r'\n  <link rel="alternate" type="(application/json|application/rss\+xml|text/plain)"[^>]*/>', "", s)
    links = (f'\n  <link rel="alternate" type="application/json" href="{BASE}rooms.json" title="MoveCondo rooms (JSON)" />'
             f'\n  <link rel="alternate" type="application/rss+xml" href="{BASE}feed.xml" title="MoveCondo rooms (RSS)" />'
             f'\n  <link rel="alternate" type="text/plain" href="{BASE}llms.txt" title="llms.txt" />')
    return re.sub(r'(<link rel="alternate" href="[^"]*" hreflang="x-default" />)', lambda m: m.group(1) + links, s, count=1)

for r in rooms:
    p = f"rooms/{r['slug']}/index.html"; s = read(p)
    s = set_block(s, "ld-room", script(room_ld(r), "ld-room"),
                  r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": "Apartment".*?</script>')  # first run only
    write(p, set_alt_links(s, "../../"))
p = "index.html"; s = read(p)
s = set_block(s, "ld-itemlist", script(itemlist_ld("คอนโดให้เช่าทั้งหมด · MoveCondo", BASE, rooms), "ld-itemlist"))
write(p, set_alt_links(s, ""))
for a in areas:
    p = f"areas/{a['slug']}/index.html"; s = read(p)
    rs = [r for r in rooms if r["area_slug"] == a["slug"]]
    if rs:
        s = set_block(s, "ld-itemlist", script(itemlist_ld(f"คอนโดให้เช่าย่าน{a['th']}", f"{BASE}areas/{a['slug']}/", rs), "ld-itemlist"))
    write(p, set_alt_links(s, "../../"))

# ---------- sitemap / robots ----------
def url_entry(path, prio, lastmod):
    u = BASE + path
    return f"""  <url>
    <loc>{u}</loc>
    <xhtml:link rel="alternate" hreflang="th" href="{u}" />
    <xhtml:link rel="alternate" hreflang="en" href="{u}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="{u}" />
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{prio}</priority>
  </url>"""
entries = [url_entry("", "1.0", TODAY)] + [url_entry(f"areas/{a['slug']}/", "0.8", TODAY) for a in areas] \
        + [url_entry(f"rooms/{r['slug']}/", "0.9", TODAY) for r in rooms]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(entries) + "\n</urlset>\n")

bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "Googlebot", "Bingbot", "PerplexityBot", "Perplexity-User",
        "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "Applebot", "Applebot-Extended", "CCBot", "DuckAssistBot", "meta-externalagent"]
write("robots.txt", "# MoveCondo welcomes search engines and AI assistants.\n# Room list for AI agents: " + BASE + "llms.txt · JSON: " + BASE + "rooms.json\n\nUser-agent: *\nAllow: /\n\n"
      + "\n".join(f"User-agent: {b}\nAllow: /\n" for b in bots) + f"\nSitemap: {BASE}sitemap.xml\n")

# ---------- safety scan ----------
bad = 0
for f in ["rooms.json", "feed.xml", "llms.txt", "llms-full.txt", "robots.txt", "sitemap.xml"]:
    t = read(f)
    for rx in FORBIDDEN:
        for m in rx.finditer(t):
            ctx = t[max(0, m.start() - 40): m.end() + 10]
            if f == "rooms.json" and "petsAllowed" in ctx: continue
            print("FORBIDDEN", f, rx.pattern, repr(ctx), file=sys.stderr); bad += 1
print(f"rooms={len(rooms)} areas={len(areas)} forbidden_hits={bad}")
sys.exit(1 if bad else 0)
