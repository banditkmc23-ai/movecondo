#!/usr/bin/env python3
"""Turn a room (or sale) page that is no longer available into a kept, noindex
'มีผู้เช่าแล้ว' / 'ขายแล้ว' page. Used by the apply-now tool and by the nightly
sync hook (rooms248/listing_availability.py). Does not run gen.py.

Unavailable rooms stay at their URL with a grey badge and a link down to the
existing nearby-rooms carousel, but they are left out of listings, search,
homepage rows, project pages, related carousels, sitemap and agent files.
Duplicate listings (kind=room) still use a redirect stub.
"""
from __future__ import annotations

import json, os, re, subprocess
from datetime import date, datetime
from pathlib import Path

ROOT = Path("/workspace/movecondo")
BASE = "https://banditkmc23-ai.github.io/movecondo/"
ASSET_V = "20261128m1"
RENTED_LABEL = {"rented": "มีผู้เช่าแล้ว", "sold": "ขายแล้ว"}
RENTED_NOTE = {
    "rented": (
        "ห้องนี้มีผู้เช่าแล้ว ดูห้องอื่นในย่านเดียวกันด้านล่างได้เลย",
        "This room is already rented. See other rooms in the same area below.",
    ),
    "sold": (
        "ห้องนี้ขายแล้ว ดูห้องอื่นในย่านเดียวกันด้านล่างได้เลย",
        "This property has been sold. See other listings in the area below.",
    ),
}


def _read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def _write(p: Path, s: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s, encoding="utf-8")


def slug_of(mc: str) -> str:
    return mc.lower() if mc.upper().startswith("MC-") else mc.lower()


def mid_of(slug: str) -> str:
    m = re.match(r"mc-(\d+)", slug.lower())
    return f"MC-{int(m.group(1)):03d}" if m else slug.upper()


def live_ids(root: Path = ROOT) -> set[str]:
    p = root / "data" / "listings.json"
    if not p.exists():
        return set()
    return {r["id"] for r in json.loads(p.read_text(encoding="utf-8")).get("rooms", [])}


def is_redirect_stub(html: str) -> bool:
    return "location.replace" in html and "data-mc-removed" in html[:400]


def last_full_commit(slug: str, root: Path = ROOT) -> str | None:
    """Git commit that last held a full room page (not a redirect stub)."""
    rel = f"rooms/{slug}/index.html"
    out = subprocess.check_output(
        ["git", "log", "--follow", "--pretty=%H", "--", rel],
        cwd=root, text=True,
    ).split()
    for h in out:
        try:
            blob = subprocess.check_output(
                ["git", "cat-file", "-p", f"{h}:{rel}"], cwd=root
            )
        except subprocess.CalledProcessError:
            continue
        try:
            text = blob.decode("utf-8")
        except UnicodeDecodeError:
            continue
        if len(text) > 2000 and not is_redirect_stub(text):
            return h
    return None


def restore_from_git(slug: str, root: Path = ROOT) -> bool:
    """Restore the last full HTML, images, and map JSON from git. Returns True if HTML was restored."""
    commit = last_full_commit(slug, root)
    if not commit:
        return False
    paths = [f"rooms/{slug}/index.html"]
    # images + map if they existed in that commit
    for prefix in (f"images/rooms/{slug}", f"data/maps/rooms/{slug}.json"):
        r = subprocess.run(
            ["git", "ls-tree", "-r", "--name-only", commit, prefix],
            cwd=root, capture_output=True, text=True,
        )
        paths.extend(p for p in r.stdout.splitlines() if p)
    subprocess.check_call(["git", "checkout", commit, "--", *paths], cwd=root)
    return True


def _set_html_attr(html: str, extra: str) -> str:
    def repl(m):
        tag = m.group(0)
        for a in extra.split():
            name = a.split("=")[0]
            if re.search(rf"\b{re.escape(name)}(=|\s|>)", tag):
                tag = re.sub(rf"\s{re.escape(name)}(=\"[^\"]*\")?", "", tag)
            # insert before closing >
            tag = re.sub(r"\s*>$", " " + a + ">", tag)
        return tag
    return re.sub(r"<html\b[^>]*>", repl, html, count=1)


def _bump_tokens(html: str, token: str) -> str:
    return re.sub(r"(\?v=)2026\d{4}[a-z0-9]+", rf"\g<1>{token}", html)


def _replace_main_badge(html: str, label: str, cls: str) -> str:
    """Change only the gallery-stage badge, not badges on related-room cards."""
    def stage(m):
        block = m.group(0)
        block = re.sub(
            r'<span class="badge-vacant[^"]*"[^>]*>[^<]*</span>',
            f'<span class="badge-vacant {cls}">{label}</span>',
            block,
            count=1,
        )
        return block
    html = re.sub(
        r'<div class="gallery-stage"[^>]*>.*?</div>\s*<div class="gallery-nav">',
        stage, html, count=1, flags=re.S,
    )
    # cover/hero fallback if a page uses .cover instead
    html = re.sub(
        r'(<div class="cover"[^>]*>.*?)<span class="badge-vacant[^"]*"[^>]*>[^<]*</span>',
        rf'\1<span class="badge-vacant {cls}">{label}</span>',
        html, count=1, flags=re.S,
    )
    return html


def _insert_note(html: str, kind: str) -> str:
    th, en = RENTED_NOTE[kind]
    note = (
        f'<p class="rented-note"><span class="t-th">{th}</span>'
        f'<span class="t-en">{en}</span></p>\n'
    )
    # Re-run safe: drop a previous note so we can place it once, after the intro.
    html = re.sub(r'\s*<p class="rented-note">.*?</p>\s*', "\n", html, count=1, flags=re.S)
    if re.search(r"</header>\s*<div class=\"gallery-hero\"", html):
        return re.sub(r"</header>(\s*<div class=\"gallery-hero\")", r"</header>\n" + note + r"\1", html, count=1)
    if "</h1>" in html:
        return html.replace("</h1>", "</h1>\n" + note, 1)
    return html


def _patch_jsonld(html: str, label: str) -> str:
    html = html.replace("https://schema.org/InStock", "https://schema.org/OutOfStock")
    # status property in ld-room only
    def ld(m):
        block = m.group(0)
        block = re.sub(r'("value"\s*:\s*)"(ว่าง|กำลังจะว่าง[^"]*)"', rf'\1"{label}"', block)
        return block
    html = re.sub(
        r'<script type="application/ld\+json" id="ld-room">.*?</script>',
        ld, html, count=1, flags=re.S,
    )
    return html


def _patch_meta(html: str, label: str) -> str:
    html = re.sub(
        r'(<meta name="robots" content=")[^"]*(")',
        r"\1noindex,follow\2", html, count=1,
    )
    # drop instant redirects if a stub slipped through
    html = re.sub(r'\s*<meta http-equiv="refresh"[^>]*>', "", html)
    html = re.sub(r'\s*<script>location\.replace\([^<]*</script>', "", html)
    # visible/meta "ว่าง" / soon wording in title + descriptions, not in body cards
    def meta(m):
        s = m.group(0)
        s = re.sub(r"กำลังจะว่าง(?: · ว่าง [^·<]+)?", label, s)
        s = re.sub(r"· ว่าง ·", f"· {label} ·", s)
        s = re.sub(r" ให้เช่า ", f" {label} ", s)
        return s
    html = re.sub(r"<title>.*?</title>", meta, html, count=1)
    html = re.sub(r'<meta name="description" content="[^"]*"', meta, html)
    html = re.sub(r'<meta property="og:description" content="[^"]*"', meta, html)
    html = re.sub(r'<meta name="twitter:description" content="[^"]*"', meta, html)
    html = re.sub(r'<meta property="og:title" content="[^"]*"', meta, html)
    return html


def _filter_related(html: str, keep: set[str]) -> str:
    def grid(m):
        inner = m.group(1)
        cards = re.split(r"(?=<article class=\"card\")", inner)
        kept = []
        for c in cards:
            if "<article" not in c:
                if c.strip():
                    kept.append(c)
                continue
            href = re.search(r'href="[^"]*/rooms/(mc-\d+)/', c)
            mid = mid_of(href.group(1)) if href else None
            if mid and mid in keep:
                kept.append(c)
        return m.group(0)[: m.start(1) - m.start(0)] + "".join(kept) + "</div>"
    return re.sub(
        r'(<section class="section section-related"[^>]*>.*?<div class="grid">)(.*?)(</div>\s*</section>)',
        lambda m: m.group(1) + _filter_cards(m.group(2), keep) + m.group(3),
        html, count=1, flags=re.S,
    )


def _filter_cards(inner: str, keep: set[str]) -> str:
    parts = re.split(r"(?=<article class=\"card\")", inner)
    out = []
    for c in parts:
        if "<article" not in c:
            continue
        href = re.search(r'href="[^"]*/rooms/(mc-\d+)/', c)
        mid = mid_of(href.group(1)) if href else None
        if mid and mid in keep:
            out.append(c if c.startswith("<article") else c)
    return "".join(out)


def _copy_related_from_area(html: str, area_slug: str, keep: set[str], root: Path) -> str:
    area = root / "areas" / area_slug / "index.html"
    if not area.exists():
        return html
    src = _read(area)
    m = re.search(r'<section class="section" id="rooms">.*?<div class="grid">(.*?)</div>', src, re.S)
    if not m:
        return html
    cards = _filter_cards(m.group(1), keep) 
    # keep at most 4
    arts = re.findall(r"<article class=\"card\".*?</article>", cards, re.S)
    cards = "".join(arts[:4])
    if not cards:
        return html
    if re.search(r'<section class="section section-related"', html):
        return re.sub(
            r'(<section class="section section-related"[^>]*>.*?<div class="grid">).*?(</div>\s*</section>)',
            rf"\1{cards}\2", html, count=1, flags=re.S,
        )
    # append before footer
    section = (
        '\n        <section class="section section-related" style="padding-top:8px">\n'
        '          <h2>ห้องอื่นในย่านนี้</h2>\n'
        f'          <div class="grid">{cards}</div>\n'
        "        </section>\n"
    )
    html = re.sub(r"</main>", section + "</main>", html, count=1)
    return html


def _area_slug_from(html: str) -> str | None:
    m = re.search(r'href="https://banditkmc23-ai.github.io/movecondo/areas/([^/]+)/"', html)
    if m:
        return m.group(1)
    m = re.search(r'href="\.\./\.\./areas/([^/]+)/"', html)
    return m.group(1) if m else None


def transform_room_html(html: str, kind: str = "rented", token: str = ASSET_V,
                        keep_ids: set[str] | None = None, root: Path = ROOT) -> str:
    label = RENTED_LABEL[kind]
    cls = "badge-rented" if kind == "rented" else "badge-sold"
    body_cls = "room-rented" if kind == "rented" else "room-sold"
    html = _set_html_attr(html, 'data-mc-removed data-mc-rented' if kind == "rented" else "data-mc-removed data-mc-sold")
    html = re.sub(
        r'(<body class="[^"]*)"',
        rf'\1 {body_cls}"',
        html, count=1,
    )
    if "<body " in html and body_cls not in html.split("<body")[1][:200]:
        html = html.replace("<body>", f'<body class="room-page {body_cls}">', 1)
    html = _patch_meta(html, label)
    html = _replace_main_badge(html, label, cls)
    html = _insert_note(html, kind)
    html = re.sub(
        r'(<div class="book-card">[\s\S]*?)<a class="btn[^"]*btn-line[^"]*"[^>]*>[\s\S]*?</a>',
        r"\1", html, count=1,
    )
    html = re.sub(
        r'\s*<div class="room-bar"[^>]*>[\s\S]*?</div>\s*(?=<footer|$)',
        "\n", html, count=1,
    )
    html = _patch_jsonld(html, label)
    html = _bump_tokens(html, token)
    keep = keep_ids if keep_ids is not None else live_ids(root)
    html = _filter_related(html, keep)
    # if related is now empty, copy from the area page
    m = re.search(r'<section class="section section-related"[^>]*>.*?<div class="grid">(.*?)</div>', html, re.S)
    empty = (not m) or (not re.search(r"<article class=\"card\"", m.group(1) if m else ""))
    if empty:
        area = _area_slug_from(html)
        if area:
            html = _copy_related_from_area(html, area, keep, root)
    return html


def mark_room(mc: str, kind: str = "rented", token: str = ASSET_V, root: Path = ROOT,
              restore: bool = True, keep_ids: set[str] | None = None) -> dict:
    slug = slug_of(mc)
    page = root / "rooms" / slug / "index.html"
    restored = False
    if restore:
        cur = _read(page) if page.exists() else ""
        if (not cur) or is_redirect_stub(cur) or len(cur) < 2000:
            restored = restore_from_git(slug, root)
    if not page.exists():
        raise FileNotFoundError(page)
    html = _read(page)
    if is_redirect_stub(html):
        raise RuntimeError(f"{mc}: still a redirect stub after restore")
    _write(page, transform_room_html(html, kind=kind, token=token, root=root, keep_ids=keep_ids))
    return {"id": mid_of(slug), "slug": slug, "kind": kind, "restored": restored}


def mark_gone_rooms(gone: list[str], kind: str = "rented", token: str = ASSET_V,
                    root: Path = ROOT, restore: bool = False) -> list[dict]:
    """Nightly entry point. `gone` are MC-ids being dropped from listings.
    restore=False because the full page and images are still on disk during the
    nightly run (we no longer delete them). Subtracts GONE from related-room
    cards even if listings.json has not been rewritten yet."""
    gone_ids = {mid_of(slug_of(mc)) for mc in gone}
    keep = live_ids(root) - gone_ids
    out = []
    for mc in gone:
        out.append(mark_room(mc, kind=kind, token=token, root=root, restore=restore, keep_ids=keep))
    _record(out, root)
    return out


def _record(rows: list[dict], root: Path) -> None:
    p = root / "data" / "rented-rooms.json"
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+07:00")
    data = {"updated": now, "rooms": []}
    if p.exists():
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    by = {r["id"]: r for r in data.get("rooms", [])}
    for r in rows:
        by[r["id"]] = {**r, "markedAt": now}
    data["updated"] = now
    data["rooms"] = [by[k] for k in sorted(by, key=lambda x: int(re.sub(r"\D", "", x) or 0))]
    _write(p, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("rooms", nargs="+", help="MC-007 or mc-007")
    ap.add_argument("--kind", default="rented", choices=("rented", "sold"))
    ap.add_argument("--token", default=ASSET_V)
    args = ap.parse_args()
    rows = [mark_room(r, kind=args.kind, token=args.token, restore=True) for r in args.rooms]
    _record(rows, ROOT)
    print(rows)
