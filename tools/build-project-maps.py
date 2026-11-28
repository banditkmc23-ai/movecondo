#!/usr/bin/env python3
"""Project location maps for MoveCondo (Leaflet + OpenStreetMap tiles, lazy-loaded).

What it does (idempotent; safe to run every night, never runs gen.py):
  - keeps data/project-coords.json: one verified lat/lng per condo PROJECT (never a unit).
    New coordinates are taken from data/listings.json (already geocoded from OpenStreetMap)
    and merged into the store; entries already in the store are never dropped, so hand-verified
    coordinates survive nightly rebuilds.  Add more with tools/geocode-projects.py (real sources only).
  - writes data/project-coords-missing.json: live projects that still have NO verified coordinates.
  - inserts a compact map section on every live project page (condo/<slug>/) and live room page
    (rooms/mc-xxx/): a project pin only + a button that opens Google Maps by coordinates.
    Projects without coordinates get only a "search in Google Maps" button (no pin, no invented point).
    Rented / sold rooms get no map.
  - adds a 'แผนที่' toggle on station hubs (stations/<slug>/) with pins linking to project pages.
  - adds JSON-LD geo (GeoCoordinates) to project and room pages where it was missing.
Run from the repo root (build-agent-files.py and rooms248/listing_project_maps.py call it).
Never print owner names, phones, LINE ID text, unit numbers, pets wording, or room codes.
"""
import glob, html, json, os, re, sys
from datetime import date
from urllib.parse import quote_plus

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(ROOT)
BASE = "https://banditkmc23-ai.github.io/movecondo/"
STORE = "data/project-coords.json"
MISSING = "data/project-coords-missing.json"
START, END = "<!-- pmap:start -->", "<!-- pmap:end -->"
SEC_RE = re.compile(r"\n?[ \t]*" + re.escape(START) + r".*?" + re.escape(END) + r"[ \t]*\n?", re.S)
BAN = re.compile(r"MC-\d{3}")

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

def valid_bkk(lat, lng):
    return isinstance(lat, (int, float)) and isinstance(lng, (int, float)) and 13.4 <= lat <= 14.1 and 100.3 <= lng <= 100.95

# ---------------------------------------------------------------- data
def load_all():
    L = json.load(open("data/listings.json", encoding="utf-8"))["rooms"]
    by_id = {r["id"]: r for r in L}
    projects = json.load(open("data/projects.json", encoding="utf-8"))["projects"]
    stations = {s["name_th"]: s for s in json.load(open("data/stations.json", encoding="utf-8"))["stations"]}
    store = json.load(open(STORE, encoding="utf-8")) if os.path.exists(STORE) else {"projects": {}}
    store.setdefault("projects", {})
    return L, by_id, projects, stations, store

def merge_store(L, store):
    added = 0
    for r in L:
        p = r["project"]
        if p in store["projects"]:
            continue
        if valid_bkk(r.get("lat"), r.get("lng")):
            store["projects"][p] = {
                "lat": round(float(r["lat"]), 6), "lng": round(float(r["lng"]), 6),
                "source": (r.get("coordSource") or "MoveCondo listing data (OpenStreetMap geocoding)")[:140],
                "kind": "project",
                "added": date.today().isoformat(),
            }
            added += 1
    store["generated"] = date.today().isoformat()
    write(STORE, json.dumps(store, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    return added

def gmaps_pin(lat, lng):
    return f"https://www.google.com/maps/search/?api=1&query={lat},{lng}"

def gmaps_search(name, area):
    q = " ".join(x for x in [name, area, "กรุงเทพ"] if x)
    return "https://www.google.com/maps/search/?api=1&query=" + quote_plus(q)

# ---------------------------------------------------------------- markup
def map_section(name, area, coord):
    """Compact map card. coord=None -> search-only fallback (no pin)."""
    head = ('<div class="section-head"><div>\n'
            '        <div class="eyebrow">ตำแหน่งโครงการ</div>\n'
            '        <h2>ดูแผนที่โครงการ</h2>\n')
    if coord:
        lat, lng = coord["lat"], coord["lng"]
        body = (head + '        <p>หมุดแสดงตำแหน่งโครงการโดยประมาณ ไม่ใช่ตำแหน่งห้อง</p>\n      </div></div>\n'
                f'      <div class="pmap-shell"><div class="pmap-canvas" data-pmap data-lat="{lat}" data-lng="{lng}" '
                'role="region" aria-label="แผนที่ตำแหน่งโครงการ">'
                '<button type="button" class="pmap-load">แตะเพื่อดูแผนที่</button></div></div>\n'
                f'      <div class="pmap-actions"><a class="btn btn-md btn-primary" href="{esc(gmaps_pin(lat, lng))}" target="_blank" rel="noopener noreferrer">'
                '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-10.2A7 7 0 1 0 5 10.8C5 14.8 12 21 12 21z"/><circle cx="12" cy="11" r="2.4"/></svg>'
                '<span>เปิดใน Google Maps</span></a>'
                '<span class="pmap-credit">แผนที่ © OpenStreetMap</span></div>\n')
    else:
        body = (head + '        <p>ค้นหาตำแหน่งโครงการบนแผนที่</p>\n      </div></div>\n'
                f'      <div class="pmap-actions"><a class="btn btn-md btn-primary" href="{esc(gmaps_search(name, area))}" target="_blank" rel="noopener noreferrer">'
                '<span>ค้นหาใน Google Maps</span></a></div>\n')
    return (f'{START}\n    <section class="section project-map" id="project-map">\n      {body}    </section>\n    {END}\n')

def station_block(pins, station):
    data = esc(json.dumps({"pins": pins, "station": station}, ensure_ascii=False, separators=(",", ":")))
    return (f'{START}\n      <div class="station-map-bar"><button type="button" class="btn btn-md btn-ghost" data-pmap-toggle aria-expanded="false" aria-controls="station-map">'
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"/><path d="M9 4v13M15 7v13"/></svg>'
            '<span>แผนที่</span></button>'
            f'<span class="station-map-note">{len(pins)} โครงการบนแผนที่</span></div>\n'
            f'      <div class="pmap-shell station-map" id="station-map" hidden><div class="pmap-canvas" data-pmap-multi data-pins="{data}" role="region" aria-label="แผนที่โครงการใกล้สถานี"></div></div>\n'
            f'      {END}\n')

def ensure_assets(s, pre):
    tok = re.search(r"assets/app\.js\?v=([^\"']+)", s)
    tok = tok.group(1) if tok else "1"
    s = re.sub(r'\n?[ \t]*<script src="[^"]*assets/project-map\.js[^"]*" defer></script>', "", s)
    tag = f'<script src="{pre}assets/project-map.js?v={tok}" defer></script>'
    m = re.search(r'<script src="[^"]*assets/app\.js[^"]*" defer></script>', s)
    if m:
        s = s[:m.start()] + tag + "\n  " + m.group(0) + s[m.end():]
    return s

def strip_sections(s):
    s = SEC_RE.sub("\n", s)
    s = re.sub(r'\n?[ \t]*<script src="[^"]*assets/project-map\.js[^"]*" defer></script>', "", s)
    return s

# ---------------------------------------------------------------- JSON-LD geo
def patch_geo(s, coord, want_types):
    if not coord:
        return s
    geo = {"@type": "GeoCoordinates", "latitude": coord["lat"], "longitude": coord["lng"]}
    def fix(m):
        raw = m.group(2)
        try:
            ld = json.loads(raw)
        except Exception:
            return m.group(0)
        changed = False
        nodes = ld.get("@graph", [ld]) if isinstance(ld, dict) else []
        for n in nodes:
            if isinstance(n, dict) and n.get("@type") in want_types and "geo" not in n:
                n["geo"] = geo; changed = True
                cp = n.get("containedInPlace")
                if isinstance(cp, dict) and "geo" not in cp:
                    cp["geo"] = geo
        if not changed:
            return m.group(0)
        return m.group(1) + "\n" + json.dumps(ld, ensure_ascii=False, indent=2) + "\n" + m.group(3)
    return re.sub(r'(<script type="application/ld\+json"[^>]*>)(.*?)(</script>)', fix, s, flags=re.S)

# ---------------------------------------------------------------- pages
def patch_project_pages(projects, store, areas_by_name):
    n_map = n_search = 0
    for p in projects:
        path = f"condo/{p['slug']}/index.html"
        if not os.path.exists(path):
            continue
        s = strip_sections(read(path))
        coord = store["projects"].get(p["name"])
        sec = map_section(p["name"], p.get("area"), coord)
        if "</main>" in s:
            s = s.replace("</main>", sec + "  </main>", 1)
        s = ensure_assets(s, "../../")
        s = patch_geo(s, coord, {"ApartmentComplex"})
        write(path, s)
        n_map += bool(coord); n_search += (not coord)
    return n_map, n_search

def patch_room_pages(by_id, store, projects):
    n_map = n_search = n_skip = 0
    pr_area = {p["name"]: p.get("area") for p in projects}
    for path in glob.glob("rooms/*/index.html"):
        m = re.search(r"rooms/(mc-\d+)/", path + "/")
        rid = m.group(1).upper() if m else None
        s = read(path)
        l = by_id.get(rid)
        if not l or "badge-rented" in s or "badge-sold" in s:
            s2 = strip_sections(s)
            if s2 != s:
                write(path, s2)
            n_skip += 1
            continue
        s = strip_sections(s)
        coord = store["projects"].get(l["project"])
        sec = map_section(l["project"], pr_area.get(l["project"]) or l.get("area"), coord)
        anchor = re.search(r'[ \t]*<section class="section map3d-section" id="map">', s) or \
                 re.search(r'[ \t]*<section class="nearby-box" id="nearby">', s)
        if anchor:
            s = s[:anchor.start()] + sec + s[anchor.start():]
        elif "</main>" in s:
            s = s.replace("</main>", sec + "  </main>", 1)
        else:
            continue
        s = ensure_assets(s, "../../")
        s = patch_geo(s, coord, {"Apartment"})
        write(path, s)
        n_map += bool(coord); n_search += (not coord)
    return n_map, n_search, n_skip

def patch_station_pages(by_id, store, projects, stations):
    hubs = json.load(open("data/station-hubs.json", encoding="utf-8"))["stations"] if os.path.exists("data/station-hubs.json") else []
    purl = {p["name"]: p for p in projects}
    out = 0
    for h in hubs:
        path = f"stations/{h['slug']}/index.html"
        if not os.path.exists(path):
            continue
        s = strip_sections(read(path))
        agg = {}
        for rid in h["rooms"]:
            l = by_id.get(rid)
            if not l:
                continue
            nm = l["project"]
            c = store["projects"].get(nm)
            pj = purl.get(nm)
            if not c or not pj:
                continue
            a = agg.setdefault(nm, {"name": nm, "lat": c["lat"], "lng": c["lng"], "n": 0, "min": None, "max": None,
                                    "url": f"../../condo/{pj['slug']}/"})
            a["n"] += 1
            a["min"] = l["price"] if a["min"] is None else min(a["min"], l["price"])
            a["max"] = l["price"] if a["max"] is None else max(a["max"], l["price"])
        pins = sorted(agg.values(), key=lambda a: (-a["n"], a["name"]))
        if pins:
            st = stations.get(h["name_th"]) or {}
            station = {"name": h["name_th"], "en": h.get("name_en"), "lat": st.get("lat"), "lng": st.get("lng")} if st.get("lat") is not None else None
            blk = station_block(pins, station)
            anchor = re.search(r'[ \t]*<div class="grid" data-more-grid>', s)
            if anchor:
                s = s[:anchor.start()] + blk + s[anchor.start():]
                s = ensure_assets(s, "../../")
                out += 1
        write(path, s)
    return out

def main():
    L, by_id, projects, stations, store = load_all()
    added = merge_store(L, store)
    live = [p["name"] for p in projects]
    missing = [n for n in live if n not in store["projects"]]
    write(MISSING, json.dumps({"generated": date.today().isoformat(), "count": len(missing),
                               "projects": missing}, ensure_ascii=False, indent=1) + "\n")
    pm, ps = patch_project_pages(projects, store, {})
    rm, rs, rk = patch_room_pages(by_id, store, projects)
    sm = patch_station_pages(by_id, store, projects, stations)
    print(f"project maps: store={len(store['projects'])} (+{added} new) live projects={len(live)} "
          f"with map={len(live) - len(missing)} search-only={len(missing)}; "
          f"project pages map/search={pm}/{ps}; room pages map/search/skipped={rm}/{rs}/{rk}; station hub maps={sm}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
