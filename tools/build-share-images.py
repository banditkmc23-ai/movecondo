#!/usr/bin/env python3
"""Social share (Open Graph / Twitter) images for room and project pages.

- Picks the best overview photo per room (living area / window / wide shot; avoids bed close-ups,
  bathrooms, building renders and portrait shots) with a small YOLO object score. Picks are cached in
  data/share-covers.json so they stay stable; delete an entry (or set it by hand) to change one.
- Renders images/share/<mc-xxx>.jpg and images/share/condo-<slug>.jpg at 1200x630 with a slim white
  strip: name · price (terracotta), "MoveCondo" on the right. No room codes, LINE IDs or owner info.
- Rewrites og:image (+ width/height/type/alt) and twitter:image(+alt) on rooms/*/ and condo/*/ pages.
Run from the repo root (build-agent-files.py calls it after build-project-pages.py). Idempotent.
"""
import glob, hashlib, html, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

BASE = "https://banditkmc23-ai.github.io/movecondo/"
W, H, STRIP = 1200, 630, 92
TERRA = (185, 83, 47)
FONT_DIR = "/usr/share/fonts/truetype/sand-box/google/Prompt/"
CACHE = "data/share-covers.json"

def font(weight, size):
    for f in (f"{FONT_DIR}Prompt-{weight}.ttf", f"{FONT_DIR}Prompt-Regular.ttf"):
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()

def money(n): return f"{int(n):,}"
def esc(s): return html.escape(str(s), quote=True)

_yolo = None
def yolo():
    global _yolo
    if _yolo is None:
        try:
            from ultralytics import YOLO
            m = "/workspace/movecondo-data/m_yolov8n.pt"
            _yolo = YOLO(m) if os.path.exists(m) else False
        except Exception:
            _yolo = False
    return _yolo

def score(path, idx):
    im = Image.open(path).convert("RGB"); w, h = im.size
    s = 0.6 if idx == 0 else (0.3 if idx == 1 else 0.0)        # respect the curated order a little
    if w / h < 1.15: s -= 2.5                                    # portrait / square crops badly to 1.9:1
    g = im.convert("L").resize((64, 48)); mean = sum(g.tobytes()) / (64 * 48) / 255
    s += 1.0 - abs(mean - 0.6) * 2.2                             # bright, not blown out
    m = yolo()
    if m:
        r = m.predict(im, conf=0.3, verbose=False)[0]; names = r.names; area = w * h; seen = {}
        for c, b in zip(r.boxes.cls.tolist(), r.boxes.xyxy.tolist()):
            n = names[int(c)]; a = (b[2] - b[0]) * (b[3] - b[1]) / area
            seen[n] = max(seen.get(n, 0), a)
        if "person" in seen: s -= 10
        s += 3.0 * min(1, seen.get("couch", 0) * 6) + 1.2 * ("tv" in seen) + 1.0 * ("dining table" in seen) \
             + 0.4 * ("chair" in seen) + 0.3 * ("potted plant" in seen)
        bed = seen.get("bed", 0)
        s -= 3.5 * min(1, bed * 2.2) if bed > 0.12 else 0.3 * bool(bed)
        s -= 4 * ("toilet" in seen) + 1.0 * ("sink" in seen and "couch" not in seen)
        if not seen: s -= 2.0                                    # renders / pool / facade
    return round(s, 3)

def cover_crop(im, w, h, top_bias=0.45):
    sc = max(w / im.width, h / im.height); t = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    l = (t.width - w) // 2; tp = int((t.height - h) * top_bias); return t.crop((l, tp, l + w, tp + h))

def fit(d, text, f, maxw):
    if d.textlength(text, font=f) <= maxw: return text
    while text and d.textlength(text + "…", font=f) > maxw: text = text[:-1]
    return text.rstrip() + "…"

def render(src, title, sub, out):
    im = Image.open(src).convert("RGB")
    canvas = Image.new("RGB", (W, H), "white")
    canvas.paste(cover_crop(im, W, H - STRIP), (0, 0))
    d = ImageDraw.Draw(canvas)
    d.rectangle((0, H - STRIP, W, H), fill="white")
    d.rectangle((0, H - STRIP, 10, H), fill=TERRA)
    ft, fs, fb = font("SemiBold", 34), font("Regular", 24), font("SemiBold", 28)
    brand = "MoveCondo"; bw = d.textlength(brand, font=fb)
    d.text((W - 36 - bw, H - STRIP / 2), brand, font=fb, fill=TERRA, anchor="lm")
    maxw = W - 36 - bw - 40 - 34
    d.text((34, H - STRIP + 26), fit(d, title, ft, maxw), font=ft, fill=(26, 26, 26), anchor="lm")
    d.text((34, H - STRIP + 66), fit(d, sub, fs, maxw), font=fs, fill=TERRA, anchor="lm")
    canvas.save(out, "JPEG", quality=84, optimize=True, progressive=True)

def set_meta(page, url, alt):
    s = open(page, encoding="utf-8").read(); o = s
    s = re.sub(r'(<meta property="og:image" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), s, count=1)
    s = re.sub(r'(<meta name="twitter:image" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), s, count=1)
    s = re.sub(r'<meta property="og:image:(?:type|alt|secure_url)" content="[^"]*" />\n?\s*', "", s)
    s = re.sub(r'<meta name="twitter:image:alt" content="[^"]*" />\n?\s*', "", s)
    s = re.sub(r'(<meta property="og:image:width" content=")\d+', r"\g<1>1200", s, count=1)
    s = re.sub(r'(<meta property="og:image:height" content=")\d+(" />)',
               lambda m: m.group(1) + '630' + m.group(2) + f'\n  <meta property="og:image:type" content="image/jpeg" />\n  <meta property="og:image:alt" content="{esc(alt)}" />', s, count=1)
    s = re.sub(r'(<meta name="twitter:image" content="[^"]*" />)', lambda m: m.group(1) + f'\n  <meta name="twitter:image:alt" content="{esc(alt)}" />', s, count=1)
    if s != o: open(page, "w", encoding="utf-8").write(s); return 1
    return 0

def main():
    L = {r["id"]: r for r in json.load(open("data/listings.json", encoding="utf-8"))["rooms"]}
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    os.makedirs("images/share", exist_ok=True)
    changed_pages = rendered = 0
    def pick(rid):
        r = L[rid]; photos = [p for p in r.get("photos") or [] if os.path.exists(p)]
        if not photos: return None
        key = "|".join(photos) + "|" + str(int(os.path.getmtime(photos[0])))
        c = cache.get(rid)
        if c and (c.get("manual") or c.get("key") == key) and c.get("photo") in photos: return c["photo"]
        best = max(enumerate(photos), key=lambda t: score(t[1], t[0]))[1]
        cache[rid] = {"photo": best, "key": key}; return best
    def out_for(name, src, title, sub):
        nonlocal rendered
        out = f"images/share/{name}.jpg"
        sig = hashlib.sha1(f"{src}|{os.path.getmtime(src)}|{title}|{sub}|v2".encode()).hexdigest()[:10]
        meta = out + ".sig"
        if not (os.path.exists(out) and os.path.exists(meta) and open(meta).read() == sig):
            render(src, title, sub, out); open(meta, "w").write(sig); rendered += 1
        return f"{BASE}{out}?v={sig[:8]}"
    room_pick = {}
    for page in sorted(glob.glob("rooms/mc-*/index.html")):
        rid = page.split("/")[1].upper()
        if rid not in L: continue                                    # redirect stubs
        src = pick(rid)
        if not src: continue
        room_pick[rid] = src
        r = L[rid]; price = f"{money(r['price'])} บาท/เดือน" if r.get("price") else ""
        sub = " · ".join(x for x in (price, r.get("area"), r.get("type") or r.get("beds"), f"{r['size']:g} ตร.ม." if r.get("size") else None) if x)
        url = out_for(rid.lower(), src, r["project"], sub)
        changed_pages += set_meta(page, url, f"ห้อง {r['project']} ย่าน{r.get('area','')}")
    # project pages: reuse the og room the project page already points at
    for page in sorted(glob.glob("condo/*/index.html")):
        s = open(page, encoding="utf-8").read()
        m = re.search(r'<meta property="og:image" content="[^"]*?(?:images/rooms/(mc-\d+)/|images/share/(mc-\d+)\.jpg)', s)
        ids = re.findall(r'data-listing="(MC-\d+)"', s)
        rid = (m.group(1) or m.group(2)).upper() if m else (ids[0] if ids else None)
        if not rid or rid not in room_pick: continue
        rooms = [L[i] for i in dict.fromkeys(ids) if i in L] or [L[rid]]
        name = L[rid]["project"]; n = len(rooms); pmin = min(x["price"] for x in rooms if x.get("price"))
        sub = f"ห้องว่าง {n} ห้อง · เริ่ม {money(pmin)} บาท/เดือน · {L[rid].get('area','')}"
        slug = page.split("/")[1]
        url = out_for(f"condo-{slug}", room_pick[rid], name, sub)
        changed_pages += set_meta(page, url, f"ห้องเช่า {name} ย่าน{L[rid].get('area','')}")
    live = {f"images/share/{i.lower()}.jpg" for i in room_pick} | {f"images/share/condo-{p.split('/')[1]}.jpg" for p in glob.glob('condo/*/index.html')}
    for f in glob.glob("images/share/*.jpg"):
        if f not in live: os.remove(f); os.path.exists(f + ".sig") and os.remove(f + ".sig")
    json.dump(dict(sorted(cache.items())), open(CACHE, "w"), ensure_ascii=False, indent=0)
    print(f"share images: rooms={len(room_pick)} rendered={rendered} pages_changed={changed_pages}")

if __name__ == "__main__":
    main()
