#!/usr/bin/env python3
"""Build one page per condo project: condo/<slug>/index.html.

Lists every live room of the project (available + coming-soon already filtered
by the room build) using the exact card markup of the area pages, so cards stay
identical. Also:
  - writes `const PROJECT_SLUGS = {...};` into assets/app.js (search suggestions link here)
  - adds a "all rooms in this project" link + crumb link on room pages
  - writes data/projects.json (public fields only)
Run from the repo root before tools/build-agent-files.py (that script calls this one).
Never add owner names, phones, unit numbers, room codes in visible text, or the LINE ID text.
"""
import glob, html, json, os, re, shutil, collections

BASE = "https://banditkmc23-ai.github.io/movecondo/"
def read(p): return open(p, encoding="utf-8").read()
def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f: f.write(s)
def esc(s): return html.escape(str(s), quote=True)
def money(n): return f"{int(n):,}"
def slugify(name): return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

app = read("assets/app.js")
LISTINGS = json.loads(re.search(r"^const LISTINGS = (.*);$", app, re.M).group(1))
AREA_SLUGS = dict(re.findall(r'"([^"]+)": "([a-z0-9-]+)"', re.search(r"const AREA_SLUGS = \{(.*?)\};", app, re.S).group(1)))
listings_json = {r["id"]: r for r in json.load(open("data/listings.json", encoding="utf-8"))["rooms"]}

# ---- card markup from area pages (same depth: ../../) ----
CARDS = {}
for p in glob.glob("areas/*/index.html"):
    for c in re.findall(r'  <article class="card"[^>]*>.*?</article>', read(p), re.S):
        rid = re.search(r'data-listing="(MC-\d{3})"', c).group(1)
        CARDS[rid] = re.sub(r'<article class="card"[^>]*>', '<article class="card">', c, count=1)

projects = collections.OrderedDict()
for l in LISTINGS:
    if not os.path.exists(f"rooms/{l['id'].lower()}/index.html"): continue
    projects.setdefault(l["project"], []).append(l)
slugs = {}
for name in projects:
    s = slugify(name) or "project"
    assert s not in slugs.values(), ("slug clash", name, s)
    slugs[name] = s

def is_soon(l): return l.get("status") != "AVAILABLE" and re.match(r"\d{4}-", str(l.get("available") or ""))
def summary(name, rooms):
    rooms = sorted(rooms, key=lambda l: (1 if is_soon(l) else 0, l["price"], l["id"]))
    area = collections.Counter(l["area"] for l in rooms).most_common(1)[0][0]
    st = collections.Counter(l["transit"] for l in rooms if l.get("transit"))
    station = st.most_common(1)[0][0] if st else None
    walks = [l["walk"] for l in rooms if l.get("transit") == station and l.get("walk") is not None]
    walk = min(walks) if walks else None
    prices = [l["price"] for l in rooms]
    return dict(name=name, slug=slugs[name], area=area, areaSlug=AREA_SLUGS.get(area), station=station, walk=walk,
                count=len(rooms), soon=sum(1 for l in rooms if is_soon(l)), priceMin=min(prices), priceMax=max(prices), rooms=rooms)

def price_range(p): return f"{money(p['priceMin'])} บาท/เดือน" if p["priceMin"] == p["priceMax"] else f"{money(p['priceMin'])}–{money(p['priceMax'])} บาท/เดือน"

TEMPLATE = read("areas/chidlom/index.html")
HEAD_KEEP = TEMPLATE.split("<head>", 1)[1].split("</head>", 1)[0]
BODY_TOP = TEMPLATE.split("<body>", 1)[1].split('<main id="main">', 1)[0]
FOOT = "</main>" + TEMPLATE.split("</main>", 1)[1]

def page(p):
    url = f"{BASE}condo/{p['slug']}/"
    title = f"{p['name']} ย่าน{p['area']} คอนโดให้เช่า {p['count']} ห้อง | MoveCondo"
    near = (f"ประมาณ {p['walk']} นาทีถึง {p['station']}" if p["walk"] is not None else f"ใกล้ {p['station']}") if p["station"] else None
    desc = " · ".join(x for x in [f"{p['name']} ย่าน{p['area']}", f"{p['count']} ห้องว่าง", price_range(p), near] if x)
    og = f"{BASE}images/rooms/{p['rooms'][0]['id'].lower()}/cover.webp"
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": f"ย่าน{p['area']}", "item": f"{BASE}areas/{p['areaSlug']}/"},
        {"@type": "ListItem", "position": 3, "name": p["name"], "item": url}]}
    addr = {"@type": "PostalAddress", "addressLocality": p["area"], "addressRegion": "กรุงเทพมหานคร", "addressCountry": "TH"}
    complex_ = {"@context": "https://schema.org", "@type": "ApartmentComplex", "@id": url + "#complex", "name": p["name"], "url": url,
                "description": desc, "address": addr, "image": og, "petsAllowed": False,
                "numberOfAvailableAccommodationUnits": {"@type": "QuantitativeValue", "value": p["count"]},
                "containsPlace": [{"@id": f"{BASE}rooms/{l['id'].lower()}/#apartment"} for l in p["rooms"]]}
    lj = listings_json.get(p["rooms"][0]["id"], {})
    if lj.get("lat") and lj.get("lng") and not lj.get("coordApprox"):
        complex_["geo"] = {"@type": "GeoCoordinates", "latitude": lj["lat"], "longitude": lj["lng"]}
    items = {"@context": "https://schema.org", "@type": "ItemList", "name": f"ห้องว่างใน {p['name']}", "numberOfItems": p["count"],
             "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{BASE}rooms/{l['id'].lower()}/",
                                  "name": " · ".join(x for x in [p["name"], l.get("type"), (l.get("sizeLabel") or (f"{l['size']:g} ตร.ม." if l.get("size") else None)), f"{money(l['price'])} บาท/เดือน"] if x)}
                                 for i, l in enumerate(p["rooms"])]}
    ld = "".join(f'<script type="application/ld+json">\n{json.dumps(x, ensure_ascii=False, indent=2)}\n</script>\n' for x in (crumbs, complex_, items))
    head = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', "", HEAD_KEEP, flags=re.S)
    head = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", head)
    head = re.sub(r'(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*"', lambda m: m.group(1) + esc(desc) + '"', head)
    head = re.sub(r'(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*"', lambda m: m.group(1) + esc(title) + '"', head)
    head = re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*"', lambda m: m.group(1) + og + '"', head)
    head = head.replace('content="630"', 'content="675"')
    head = head.replace(f"{BASE}areas/chidlom/", url)
    head = head.replace("<!-- Google Search Console: owner must add a verification meta tag from Search Console, then submit sitemap.xml. Do not invent a code. -->", "")
    head = head.rstrip() + "\n  " + ld
    stats = [f'<span class="proj-stat proj-stat-main">{p["count"]} ห้องว่าง</span>', f'<span class="proj-stat">{price_range(p)}</span>']
    if near: stats.append(f'<span class="proj-stat">{esc(near)}</span>')
    soon_note = f'<p class="proj-note">รวมห้องที่กำลังจะว่างภายใน 30 วัน</p>' if p["soon"] else ""
    cards = "\n".join(CARDS[l["id"]] for l in p["rooms"])
    main = f'''<main id="main">
    <nav class="crumbs" aria-label="เส้นทาง"><a href="../../">หน้าแรก</a> <span aria-hidden="true">/</span> <a href="../../areas/{p["areaSlug"]}/">ย่าน{esc(p["area"])}</a> <span aria-hidden="true">/</span> <span>{esc(p["name"])}</span></nav>
    <header class="proj-hero">
      <div class="eyebrow">โครงการคอนโด</div>
      <h1>{esc(p["name"])}</h1>
      <p class="proj-area"><a href="../../areas/{p["areaSlug"]}/">ย่าน{esc(p["area"])}</a></p>
      <div class="proj-stats">{"".join(stats)}</div>
    </header>
    <section class="section" id="rooms">
      <div class="section-head">
        <div>
          <div class="eyebrow">ห้องว่างในโครงการนี้</div>
          <h2>ห้องให้เช่าใน {esc(p["name"])}</h2>
          <p>{p["count"]} ห้องในโครงการนี้</p>
          {soon_note}
        </div>
      </div>
      <div class="grid">
{cards}
      </div>
      <div class="proj-more"><a class="btn btn-md btn-ghost" href="../../areas/{p["areaSlug"]}/">ดูห้องอื่นในย่าน{esc(p["area"])}</a> <a class="btn btn-md btn-ghost" href="../../#/search">ค้นหาแบบละเอียด</a></div>
    </section>
      '''
    return f'''<!DOCTYPE html>
<html lang="th">
<head>{head}</head>
<body class="project-page">{BODY_TOP}{main}{FOOT}'''

if __name__ == "__main__":
    P = [summary(n, r) for n, r in projects.items()]
    keep = set()
    for p in P:
        write(f"condo/{p['slug']}/index.html", page(p)); keep.add(p["slug"])
    for d in glob.glob("condo/*/"):
        if d.split("/")[1] not in keep: shutil.rmtree(d)
    # data + app.js slug map
    json.dump({"generated_from": "assets/app.js LISTINGS", "projects": [{k: v for k, v in p.items() if k != "rooms"} | {"rooms": [l["id"] for l in p["rooms"]], "url": f"{BASE}condo/{p['slug']}/"} for p in P]},
              open("data/projects.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    line = "const PROJECT_SLUGS = " + json.dumps(slugs, ensure_ascii=False) + ";"
    lines = app.split("\n")
    idx = [i for i, l in enumerate(lines) if l.startswith("const PROJECT_SLUGS = ")]
    if idx: lines[idx[0]] = line
    else: lines.insert([i for i, l in enumerate(lines) if l.startswith("const LISTINGS = ")][0], line)
    write("assets/app.js", "\n".join(lines))
    # room pages: crumb + "all rooms in this project" link
    byid = {l["id"]: p for p in P for l in p["rooms"]}
    for rid, p in byid.items():
        f = f"rooms/{rid.lower()}/index.html"; s = read(f); s0 = s
        s = re.sub(r'(<nav class="crumbs"[^>]*>.*?<span aria-hidden="true">/</span> )(?:<span>|<a href="\.\./\.\./condo/[^"]*/">)([^<]*)(?:</span>|</a>)(</nav>)',
                   lambda m: m.group(1) + f'<a href="../../condo/{p["slug"]}/">{m.group(2)}</a>' + m.group(3), s, count=1, flags=re.S)
        s = re.sub(r'\n?\s*<p class="room-project-link">.*?</p>', "", s, flags=re.S)
        if p["count"] > 1:
            s = s.replace('</p>\n  </header>', f'</p>\n    <p class="room-project-link"><a href="../../condo/{p["slug"]}/">ดูห้องว่างทั้งหมดในโครงการนี้ · {p["count"]} ห้อง</a></p>\n  </header>', 1)
        if s != s0: write(f, s)
    print("projects", len(P), "multi-room", sum(1 for p in P if p["count"] > 1))
