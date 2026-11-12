/* Top-down illustrated area maps for the home switcher. No SVG <title> (avoids stray tooltips). */
(function (global) {
  const FONT = "Noto Sans Thai, Prompt, ui-sans-serif, sans-serif";
  const T = "#B9532F";
  const LINE = {
    sukhumvit: "#6FBE44",
    silom: "#0A6B3C",
    mrt: "#1D4F9C"
  };
  const VB = { w: 400, h: 372 };
  const PLOT = { x: 22, y: 28, w: 356, h: 300 };
  const FS = { name: 12, chip: 11, station: 12, road: 11, legend: 11, compass: 11 };
  const PIN_R = 12.5;
  const ST_R = 11.5;
  const CHIP_H = 14;
  const GAP = 6;
  const MAX_PINS = 3;
  const LABEL_FLOOR = 342;
  const MARGIN = 6;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const ICONS = {
    mall: '<rect x="4.5" y="7.5" width="15" height="13.5" rx="2.2" fill="#B9532F"/><path fill="#B9532F" d="M3.6 7.5h16.8l-1.4 2.6H5z"/><rect x="6.2" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="10.5" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="14.8" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="10.4" y="16.2" width="3.2" height="4.8" rx=".6" fill="#FBF9F6"/>',
    cafe: '<path fill="#B9532F" d="M5.2 9.1h11.2v5.8A4 4 0 0 1 12.4 19H9.1A4 4 0 0 1 5.2 14.9V9.1z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M16.4 10.6h2a2.2 2.2 0 1 1 0 4.4h-2"/><path fill="none" stroke="#B9532F" stroke-width="1.4" stroke-linecap="round" d="M8.2 4.4c.2 1-.3 1.6-.3 2.4M11.4 4.4c.2 1-.3 1.6-.3 2.4M14.5 4.4c.2 1-.3 1.6-.3 2.4"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M6.2 20.4h9.4"/>',
    food: '<path fill="#B9532F" d="M4.6 12.2h14.8c-.9 5.2-3.8 8.2-7.4 8.2s-6.5-3-7.4-8.2z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M10 4.2l2.6 8M14.6 4.2l-2 8"/>',
    park: '<path fill="#B9532F" d="M8.8 14.6c-2.6 0-4.2-2-4.2-4.2C4.6 7.6 7 5.6 9.4 6.2c.6-1.8 2.2-3 4.1-3 2.4 0 4.2 1.8 4.4 4.1 1.8.4 3.5 2.1 3.5 4.3 0 2.4-2 4-4.4 4z"/><path fill="#B9532F" d="M11.6 14.4v6.2h2.2v-6.2z"/>',
    market: '<path fill="#B9532F" d="M4.4 9.2l2.4-4.4h10.4l2.4 4.4z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M6.2 9.2v9.4M17.8 9.2v9.4M4.6 18.8h14.8"/><path fill="#FBF9F6" d="M8.4 11.2h3v5.2h-3zM12.6 11.2h3v5.2h-3z"/>',
    boat: '<path fill="#B9532F" d="M4.4 14.2h15.2c-.6 2.8-3.2 4.6-7.6 4.6s-7-1.8-7.6-4.6z"/><path fill="#B9532F" d="M9 8.2h6.2l1.6 6H7.6z"/><path fill="none" stroke="#B9532F" stroke-width="1.5" stroke-linecap="round" d="M12.2 5.2v3"/>'
  };
  const PAD = { mall: "#F6E4D8", cafe: "#F8EFE4", food: "#F3E6DC", park: "#D9E4D6", market: "#F6E4D8", boat: "#E4EEF3" };

  /* Places with coordinates only. Far outliers omitted so the scale stays readable. */
  const ILLO = {
    "ทองหล่อ": {
      road: "ถนนสุขุมวิท", roadBearing: 126, line: "sukhumvit",
      station: { name: "BTS ทองหล่อ", lat: 13.72424444, lng: 100.57855833 },
      places: [
        { kind: "mall", name: "theCOMMONS", lat: 13.7349518, lng: 100.5821642 },
        { kind: "cafe", name: "CPS Coffee Sukhumvit 53", short: "CPS Coffee", lat: 13.7306182, lng: 100.5780633 },
        { kind: "food", name: "Baan Ice", lat: 13.7290826, lng: 100.5807186 }
      ]
    },
    "พร้อมพงษ์": {
      road: "ถนนสุขุมวิท", roadBearing: 126, line: "sukhumvit",
      station: { name: "BTS พร้อมพงษ์", lat: 13.73043889, lng: 100.56973056 },
      places: [
        { kind: "mall", name: "EmQuartier", lat: 13.7319633, lng: 100.5696359 },
        { kind: "mall", name: "EmSphere", lat: 13.7325129, lng: 100.5660757 },
        { kind: "park", name: "สวนเบญจสิริ", lat: 13.7307028, lng: 100.5675148 },
        { kind: "food", name: "Err Urban Rustic Thai", short: "Err Urban Rustic", lat: 13.7249563, lng: 100.5794908 }
      ]
    },
    "เอกมัย": {
      road: "ถนนสุขุมวิท", roadBearing: 126, line: "sukhumvit",
      station: { name: "BTS เอกมัย", lat: 13.71955833, lng: 100.585175 },
      places: [
        { kind: "mall", name: "Gateway Ekkamai", short: "Gateway", lat: 13.7184098, lng: 100.585363 },
        { kind: "mall", name: "Donki Mall Ekkamai", short: "Donki Mall", lat: 13.7307288, lng: 100.5856837 },
        { kind: "food", name: "Iron Balls Distillery & Bar", short: "Iron Balls", lat: 13.7232495, lng: 100.5842144 }
      ]
    },
    "พระโขนง": {
      road: "ถนนสุขุมวิท", roadBearing: 126, line: "sukhumvit",
      station: { name: "BTS พระโขนง", lat: 13.71519444, lng: 100.59128333 },
      places: [
        { kind: "mall", name: "W District", lat: 13.7147246, lng: 100.5935413 },
        { kind: "cafe", name: "iki haus", lat: 13.723582, lng: 100.595657 }
      ]
    },
    "อ่อนนุช": {
      road: "ถนนสุขุมวิท", roadBearing: 135, line: "sukhumvit",
      station: { name: "BTS อ่อนนุช", lat: 13.70561111, lng: 100.60108333 },
      places: [
        { kind: "mall", name: "Lotus's อ่อนนุช", short: "Lotus's อ่อนนุช", lat: 13.7050537, lng: 100.6004124 },
        { kind: "market", name: "ตลาดอ่อนนุช", lat: 13.7101783, lng: 100.6006696 },
        { kind: "mall", name: "T77 Community (Habito)", short: "T77 Community", lat: 13.712925, lng: 100.600876 },
        { kind: "cafe", name: "Little Fox Home On Nut", short: "Little Fox", lat: 13.711327, lng: 100.608616 }
      ]
    },
    "อโศก": {
      road: "ถนนสุขุมวิท", roadBearing: 126, line: "sukhumvit",
      cross: { name: "ถนนอโศก", bearing: 11, line: "mrt" },
      station: { name: "BTS อโศก", lat: 13.73703333, lng: 100.56041944 },
      transfer: { name: "MRT สุขุมวิท", lat: 13.738524, lng: 100.561446, line: "mrt" },
      places: [
        { kind: "mall", name: "Terminal 21 Asok", short: "Terminal 21", lat: 13.7379057, lng: 100.5593354 },
        { kind: "food", name: "Cabbages & Condoms", short: "Cabbages", lat: 13.7364794, lng: 100.557891 },
        { kind: "park", name: "สวนเบญจกิติ", lat: 13.7290819, lng: 100.5547642 }
      ]
    },
    "อารีย์": {
      road: "ถนนพหลโยธิน", roadBearing: 0, line: "sukhumvit",
      station: { name: "BTS อารีย์", lat: 13.77970278, lng: 100.54464167 },
      places: [
        { kind: "cafe", name: "NANA Coffee Roasters", short: "NANA Coffee", lat: 13.782685, lng: 100.5419711 },
        { kind: "food", name: "Ongtong Khaosoi", short: "Ongtong", lat: 13.7811037, lng: 100.5444506 },
        { kind: "mall", name: "GUMP'S Ari", lat: 13.7830899, lng: 100.5432399 },
        { kind: "cafe", name: "After You Dessert Cafe La Villa Aree", short: "After You", lat: 13.7798656, lng: 100.5452292 }
      ]
    },
    "พระราม 9": {
      road: "ถนนพระราม 9", roadBearing: 90, line: "mrt-along-cross",
      cross: { name: "ถนนรัชดาภิเษก", bearing: 11, line: "mrt" },
      station: { name: "MRT พระราม 9", lat: 13.75722222, lng: 100.56527778 },
      places: [
        { kind: "mall", name: "เซ็นทรัลพระราม 9", short: "เซ็นทรัล พระราม 9", lat: 13.7585683, lng: 100.5660647 },
        { kind: "mall", name: "ฟอร์จูนทาวน์", lat: 13.7587407, lng: 100.5651044 },
        { kind: "cafe", name: "After You Dessert Cafe Esplanade Ratchadapisek", short: "After You", lat: 13.7664596, lng: 100.5694672 }
      ]
    },
    "เจริญนคร": {
      road: "ถนนเจริญนคร", roadBearing: 10, line: "silom",
      railBearing: 90,
      station: { name: "BTS กรุงธนบุรี", lat: 13.72083333, lng: 100.50277778 },
      river: { name: "แม่น้ำเจ้าพระยา", side: "E" },
      places: [
        { kind: "mall", name: "ICONSIAM", lat: 13.7268227, lng: 100.510294 },
        { kind: "mall", name: "Lhong 1919", lat: 13.734335, lng: 100.5075824 }
      ]
    },
    "บางนา": {
      road: "ถนนบางนา-ตราด", roadBearing: 87, line: "sukhumvit",
      railBearing: 175,
      cross: { name: "ถนนสุขุมวิท", bearing: 175, line: "sukhumvit" },
      station: { name: "BTS บางนา", lat: 13.6682, lng: 100.6047 },
      places: [
        { kind: "mall", name: "BITEC", lat: 13.669801, lng: 100.6085436 },
        { kind: "mall", name: "เซ็นทรัล บางนา", lat: 13.6695356, lng: 100.6345841 }
      ]
    }
  };

  function hav(aLat, aLng, bLat, bLng) {
    const R = 6371000, toR = Math.PI / 180;
    const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function en(lat, lng, slat, slng) {
    const mLat = 110540, mLng = 111320 * Math.cos(slat * Math.PI / 180);
    return { e: (lng - slng) * mLng, n: (lat - slat) * mLat };
  }

  let _ctx = null;
  function fontReady() {
    return !!(global.__areaIlloFontReady);
  }
  function canvasText(str, size, weight) {
    if (typeof document === "undefined") return null;
    try {
      if (!_ctx) _ctx = document.createElement("canvas").getContext("2d");
      if (!_ctx) return null;
      _ctx.font = (weight || "600") + " " + size + "px " + FONT;
      const m = _ctx.measureText(String(str));
      if (!m || !isFinite(m.width) || m.width <= 0) return null;
      return m;
    } catch (e) {
      return null;
    }
  }

  /* Conservative width so layout boxes are never tighter than painted glyphs. */
  function estimateW(str, size) {
    let w = 0;
    for (const ch of String(str)) {
      if (/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(ch)) w += 0;
      else if (ch === "\u0E33") w += size * 0.62;
      else if (ch === " " || ch === "." || ch === "'" || ch === "’" || ch === "·") w += size * 0.32;
      else if (/[~\-–—/]/.test(ch)) w += size * 0.5;
      else if (/[Iilj.,:]/.test(ch)) w += size * 0.32;
      else if (/[MW@]/.test(ch)) w += size * 0.82;
      else if (/[A-Za-z0-9&+]/.test(ch)) w += size * 0.68;
      else w += size * 1.02;
    }
    return w;
  }

  function textW(str, size, weight) {
    const m = fontReady() ? canvasText(str, size, weight) : null;
    const est = estimateW(str, size);
    if (m) return Math.max(m.width, est * 0.92) + 0.5;
    return est;
  }

  function wrapLabel(text, maxW, size) {
    size = size || FS.name;
    if (textW(text, size) <= maxW) return [text];
    const parts = String(text).split(/\s+/).filter(Boolean);
    if (parts.length === 1) return [text];
    const lines = [];
    let cur = "";
    parts.forEach((w) => {
      const next = cur ? cur + " " + w : w;
      if (cur && textW(next, size) > maxW && lines.length < 1) {
        lines.push(cur);
        cur = w;
      } else {
        cur = next;
      }
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  }

  function walkChip(meters) {
    const mins = Math.max(1, Math.round(meters / 80));
    if (mins > 20) return { kind: "ride", text: "นั่งรถ" };
    return { kind: "walk", text: "เดิน ~" + mins + " นาที" };
  }

  function boxesOverlap(a, b, gap) {
    if (!a || !b) return false;
    gap = gap == null ? GAP : gap;
    return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
  }

  function boxHits(b, list, gap) {
    return list.some((o) => o && boxesOverlap(b, o, gap));
  }

  function clampBox(b, floor) {
    const m = MARGIN;
    const fl = floor == null ? LABEL_FLOOR : floor;
    if (b.x < m) b.x = m;
    if (b.y < m) b.y = m;
    if (b.x + b.w > VB.w - m) b.x = VB.w - m - b.w;
    if (b.y + b.h > fl) b.y = fl - b.h;
    if (b.y < m) b.y = m;
    if (b.x < m) b.x = m;
    return b;
  }

  function inBounds(b, floor) {
    const m = MARGIN;
    const fl = floor == null ? LABEL_FLOOR : floor;
    return b.x >= m - 0.01 && b.y >= m - 0.01 && b.x + b.w <= VB.w - m + 0.01 && b.y + b.h <= fl + 0.01;
  }

  function vec(bearing, len) {
    const r = (bearing * Math.PI) / 180;
    return { x: Math.sin(r) * len, y: -Math.cos(r) * len };
  }

  function bearingOf(e, n) {
    if (!e && !n) return 0;
    return (Math.atan2(e, n) * 180) / Math.PI;
  }

  function angDiff(a, b) {
    let d = Math.abs(a - b) % 360;
    if (d > 180) d = 360 - d;
    return d;
  }

  function pinBox(p) {
    const r = PIN_R + 1.2;
    return { x: p.x - r, y: p.y - r, w: r * 2, h: r * 2, role: "pin", name: p.short || p.name };
  }

  function stationDotBox(stS, hasXfer) {
    const r = ST_R + (hasXfer ? 4 : 1.2);
    return { x: stS.x - r, y: stS.y - r, w: r * 2, h: r * 2, role: "station-dot" };
  }

  const COMPASS_BOX = { x: 360, y: 4, w: 36, h: 48, role: "compass" };
  const LEGEND_BOX = { x: 0, y: 348, w: 400, h: 24, role: "legend" };

  function combinations(arr, k) {
    const out = [];
    function rec(start, acc) {
      if (acc.length === k) { out.push(acc.slice()); return; }
      for (let i = start; i < arr.length; i++) {
        acc.push(arr[i]);
        rec(i + 1, acc);
        acc.pop();
      }
    }
    rec(0, []);
    return out;
  }

  function spreadScore(places, st) {
    if (places.length < 2) return 1000;
    const br = places.map((p) => {
      const xy = en(p.lat, p.lng, st.lat, st.lng);
      return bearingOf(xy.e, xy.n);
    });
    let minA = 180, minD = Infinity;
    for (let i = 0; i < places.length; i++) {
      for (let j = i + 1; j < places.length; j++) {
        minA = Math.min(minA, angDiff(br[i], br[j]));
        minD = Math.min(minD, hav(places[i].lat, places[i].lng, places[j].lat, places[j].lng));
      }
    }
    return minA * 4 + Math.min(minD, 800) / 20;
  }

  function choosePlaces(spec) {
    const st = spec.station;
    const raw = spec.places.map((p) => {
      const m = hav(st.lat, st.lng, p.lat, p.lng);
      const xy = en(p.lat, p.lng, st.lat, st.lng);
      const br = bearingOf(xy.e, xy.n);
      const fallback = br || 0;
      return Object.assign({}, p, {
        meters: m,
        chip: walkChip(m),
        e: xy.e,
        n: xy.n,
        bearing: (xy.e === 0 && xy.n === 0) ? (45 + Math.random() * 0) : fallback
      });
    });
    /* Deterministic fallback bearing when a place sits on the station. */
    raw.forEach((p, i) => {
      if (p.e === 0 && p.n === 0) p.bearing = 40 + i * 70;
    });
    if (raw.length <= MAX_PINS) return raw;
    const combos = combinations(raw, MAX_PINS);
    let best = combos[0], bestScore = -1e9;
    combos.forEach((c) => {
      const sc = spreadScore(c, st);
      if (sc > bestScore) { bestScore = sc; best = c; }
    });
    return best;
  }

  function roadPath(cx, cy, bearing, length) {
    const v = vec(bearing, length);
    return { x1: cx - v.x, y1: cy - v.y, x2: cx + v.x, y2: cy + v.y };
  }

  function labelMetrics(p) {
    const lines = wrapLabel(p.short || p.name, 118, FS.name);
    const nameW = Math.max.apply(null, lines.map((ln) => textW(ln, FS.name, "600")));
    const chipW = textW(p.chip.text, FS.chip, "600") + 14;
    const bw = Math.max(nameW, chipW) + 8;
    const lineH = 15;
    const nameH = 5 + lines.length * lineH;
    const bh = nameH + 3 + CHIP_H + 2;
    return { lines, nameW, chipW, bw, bh, nameH, lineH };
  }

  function stLabelMetrics(spec) {
    const stLines = spec.transfer ? [spec.station.name, spec.transfer.name] : [spec.station.name];
    const stW = Math.max.apply(null, stLines.map((ln) => textW(ln, FS.station, "700"))) + 20;
    const stH = stLines.length * 15 + 10;
    return { stLines, stW, stH };
  }

  /* Keep relative bearing; push farther from the station until pin/pin and pin/station gaps hold. */
  function layoutPins(places, spec) {
    const minSt = 92;
    const minPin = 118;
    const hasXfer = !!spec.transfer;

    function project(padMul) {
      const pts = places.concat([{ e: 0, n: 0 }]);
      let minE = Infinity, maxE = -Infinity, minN = Infinity, maxN = -Infinity;
      pts.forEach((p) => {
        if (p.e < minE) minE = p.e;
        if (p.e > maxE) maxE = p.e;
        if (p.n < minN) minN = p.n;
        if (p.n > maxN) maxN = p.n;
      });
      const span = Math.max(maxE - minE, maxN - minN, 200);
      const padM = Math.max(220, 0.55 * span) * padMul;
      minE -= padM; maxE += padM; minN -= padM; maxN += padM;
      let s = Math.min(PLOT.w / (maxE - minE), PLOT.h / (maxN - minN));
      const cx = (minE + maxE) / 2, cy = (minN + maxN) / 2;
      function toScreen(e, n) {
        return {
          x: PLOT.x + PLOT.w / 2 + (e - cx) * s,
          y: PLOT.y + PLOT.h / 2 - (n - cy) * s
        };
      }
      const stS = toScreen(0, 0);
      const pins = places.map((p) => {
        const sc = toScreen(p.e, p.n);
        return Object.assign({}, p, sc);
      });
      return { stS, pins, scale: s };
    }

    function pinInPlot(p) {
      const r = PIN_R + 4;
      return p.x - r >= MARGIN + 8 && p.x + r <= VB.w - MARGIN - 8 - 28 /* compass */
        && p.y - r >= MARGIN + 8 && p.y + r <= LABEL_FLOOR - 8;
    }

    function tryFit(padMul) {
      const { stS, pins, scale } = project(padMul);
      /* Assigned radii along each place's geographic bearing. Preserve distance order. */
      const ordered = pins.slice().sort((a, b) => a.meters - b.meters);
      ordered.forEach((p) => {
        const d = Math.hypot(p.x - stS.x, p.y - stS.y) || 0;
        p._r = Math.max(d, minSt);
      });
      for (let pass = 0; pass < 80; pass++) {
        let moved = false;
        ordered.forEach((p, i) => {
          if (p._r < minSt) { p._r = minSt; moved = true; }
          if (i > 0 && p._r < ordered[i - 1]._r + 18) { p._r = ordered[i - 1]._r + 18; moved = true; }
        });
        for (let i = 0; i < ordered.length; i++) {
          for (let j = i + 1; j < ordered.length; j++) {
            const a = ordered[i], b = ordered[j];
            const va = vec(a.bearing, a._r), vb = vec(b.bearing, b._r);
            const dx = (stS.x + vb.x) - (stS.x + va.x);
            const dy = (stS.y + vb.y) - (stS.y + va.y);
            const d = Math.hypot(dx, dy);
            if (d < minPin) {
              /* Push the farther place out along its bearing. If almost colinear, push both. */
              const need = (minPin - d) + 1;
              const ad = angDiff(a.bearing, b.bearing);
              if (ad < 28) {
                b._r += Math.max(need, 16);
                if (a._r < minSt + 20) a._r = minSt + 8;
              } else {
                b._r += need * 0.75;
                a._r += need * 0.25;
                if (a._r < minSt) a._r = minSt;
              }
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
      ordered.forEach((p) => {
        const v = vec(p.bearing, p._r);
        p.x = stS.x + v.x;
        p.y = stS.y + v.y;
      });
      if (pins.some((p) => !pinInPlot(p))) return null;
      /* Final pairwise check after rounding to the bearing rays. */
      for (let i = 0; i < pins.length; i++) {
        if (Math.hypot(pins[i].x - stS.x, pins[i].y - stS.y) < minSt - 1) return null;
        for (let j = i + 1; j < pins.length; j++) {
          if (Math.hypot(pins[j].x - pins[i].x, pins[j].y - pins[i].y) < minPin - 1) return null;
        }
      }
      return { stS, pins, scale };
    }

    for (let k = 0; k < 10; k++) {
      const fit = tryFit(1 + k * 0.22);
      if (fit) return fit;
    }
    /* Last resort: zoom out hard and clamp radii to the plot along each ray. */
    const fit = project(3.2);
    fit.pins.forEach((p, i) => {
      let r = minSt + i * 36;
      for (let t = 0; t < 40; t++) {
        const v = vec(p.bearing, r);
        p.x = fit.stS.x + v.x;
        p.y = fit.stS.y + v.y;
        if (pinInPlot(p)) break;
        r -= 4;
      }
    });
    return fit;
  }

  function placeBox(bw, bh, anchors, obstacles, opts) {
    opts = opts || {};
    let best = null, bestScore = -1e9;
    anchors.forEach((raw) => {
      const b = clampBox({ x: raw.x, y: raw.y, w: bw, h: bh });
      if (!inBounds(b)) return;
      if (boxHits(b, obstacles, GAP)) return;
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const ax = (raw.ax != null) ? raw.ax : cx, ay = (raw.ay != null) ? raw.ay : cy;
      const dist = Math.hypot(cx - ax, cy - ay);
      if (opts.maxDist && dist > opts.maxDist) return;
      let score = (opts.baseScore || 0) - dist * (opts.distWeight || 1);
      if (raw.bonus) score += raw.bonus;
      /* Slight penalty if clamping slid the box a long way, but still allow it. */
      score -= Math.hypot(b.x - raw.x, b.y - raw.y) * 0.25;
      if (opts.preferAway) {
        const vl = dist || 1;
        score += ((cx - ax) / vl) * opts.preferAway.x + ((cy - ay) / vl) * opts.preferAway.y;
      }
      if (score > bestScore) { bestScore = score; best = b; }
    });
    return best;
  }

  function ringAnchors(ax, ay, bw, bh, dists, steps) {
    const out = [];
    dists.forEach((dist) => {
      for (let a = 0; a < steps; a++) {
        const rad = (a * 2 * Math.PI) / steps;
        const cx = ax + Math.cos(rad) * dist;
        const cy = ay + Math.sin(rad) * dist;
        out.push({ x: cx - bw / 2, y: cy - bh / 2, ax: ax, ay: ay, bonus: 0 });
      }
    });
    return out;
  }

  function sideAnchors(ax, ay, bw, bh, dists) {
    const out = [];
    dists.forEach((d) => {
      out.push({ x: ax - bw / 2, y: ay - d - bh, ax: ax, ay: ay, bonus: 4 });
      out.push({ x: ax - bw / 2, y: ay + d, ax: ax, ay: ay, bonus: 2 });
      out.push({ x: ax + d, y: ay - bh / 2, ax: ax, ay: ay, bonus: 3 });
      out.push({ x: ax - d - bw, y: ay - bh / 2, ax: ax, ay: ay, bonus: 3 });
      out.push({ x: ax + d, y: ay - bh - 4, ax: ax, ay: ay, bonus: 2 });
      out.push({ x: ax - d - bw, y: ay - bh - 4, ax: ax, ay: ay, bonus: 2 });
      out.push({ x: ax + d, y: ay + 4, ax: ax, ay: ay, bonus: 2 });
      out.push({ x: ax - d - bw, y: ay + 4, ax: ax, ay: ay, bonus: 2 });
    });
    return out;
  }

  function gridAnchors(ax, ay, bw, bh, step) {
    const out = [];
    step = step || 8;
    for (let y = MARGIN; y <= LABEL_FLOOR - bh + 0.01; y += step) {
      for (let x = MARGIN; x <= VB.w - MARGIN - bw + 0.01; x += step) {
        out.push({ x: x, y: y, ax: ax, ay: ay });
      }
    }
    return out;
  }

  function closestPointOnBox(box, x, y) {
    const cx = Math.max(box.x, Math.min(x, box.x + box.w));
    const cy = Math.max(box.y, Math.min(y, box.y + box.h));
    return { x: cx, y: cy };
  }

  function leaderNeeded(pin, box) {
    const pt = closestPointOnBox(box, pin.x, pin.y);
    const d = Math.hypot(pt.x - pin.x, pt.y - pin.y);
    return d > PIN_R + 8;
  }

  function layoutMap(area) {
    const spec = ILLO[area] || ILLO["ทองหล่อ"];
    let chosen = choosePlaces(spec);
    let built = null;

    function attempt(places) {
      attempt.lastFail = null;
      const { stS, pins, scale } = layoutPins(places, spec);
      if (global.__areaIlloDebug) console.log("  pins", places.map(p=>p.short||p.name).join(", "), "scale", scale && scale.toFixed(4));
      const reserved = [COMPASS_BOX, LEGEND_BOX];
      const stDot = stationDotBox(stS, !!spec.transfer);
      reserved.push(stDot);
      pins.forEach((p) => reserved.push(pinBox(p)));

      const riverBox = riverLabelBox(spec);
      if (riverBox) reserved.push(riverBox);

      const stM = stLabelMetrics(spec);
      const stAnchors = [];
      const stDists = [18, 26, 36, 48, 62, 78, 96];
      stDists.forEach((d) => {
        sideAnchors(stS.x, stS.y, stM.stW, stM.stH, [d]).forEach((a) => stAnchors.push(a));
      });
      ringAnchors(stS.x, stS.y, stM.stW, stM.stH, stDists, 16).forEach((a) => stAnchors.push(a));
      /* Corners as last-resort parking, still on a leader. */
      [
        { x: MARGIN, y: MARGIN },
        { x: VB.w - stM.stW - 44, y: MARGIN },
        { x: MARGIN, y: LABEL_FLOOR - stM.stH },
        { x: VB.w - stM.stW - 44, y: LABEL_FLOOR - stM.stH }
      ].forEach((c) => stAnchors.push({ x: c.x, y: c.y, ax: stS.x, ay: stS.y, bonus: -40 }));

      let stBox = placeBox(stM.stW, stM.stH, stAnchors, reserved, { maxDist: 180, distWeight: 0.55 });
      if (!stBox) stBox = placeBox(stM.stW, stM.stH, gridAnchors(stS.x, stS.y, stM.stW, stM.stH, 6), reserved, { maxDist: 240, distWeight: 0.8 });
      if (!stBox) { attempt.lastFail = "station-label"; if (global.__areaIlloDebug) console.log("  FAIL stBox"); return null; }
      stBox.role = "station-label";
      reserved.push(stBox);

      const labels = [];
      const ordered = pins.slice().sort((a, b) => {
        const edge = (p) => Math.min(p.x, VB.w - p.x, p.y, LABEL_FLOOR - p.y);
        const ea = edge(a), eb = edge(b);
        if (Math.abs(ea - eb) > 8) return ea - eb; // tightest edge first
        const da = Math.hypot(a.x - stS.x, a.y - stS.y);
        const db = Math.hypot(b.x - stS.x, b.y - stS.y);
        return da - db;
      });

      for (let i = 0; i < ordered.length; i++) {
        const p = ordered[i];
        const m = labelMetrics(p);
        const obstacles = reserved.concat(labels.map((lb) => lb.box));
        /* Prefer the side away from the station and from the nearest other pin. */
        let awayX = p.x - stS.x, awayY = p.y - stS.y;
        let nd = Infinity;
        pins.forEach((q) => {
          if (q === p) return;
          const dd = Math.hypot(q.x - p.x, q.y - p.y);
          if (dd < nd) { nd = dd; awayX = p.x - q.x; awayY = p.y - q.y; }
        });
        const al = Math.hypot(awayX, awayY) || 1;
        const axu = awayX / al, ayu = awayY / al;
        const anchors = [];
        [20, 28, 36, 46, 58, 72, 88, 104].forEach((dist) => {
          anchors.push({ x: p.x + axu * dist - m.bw / 2, y: p.y + ayu * dist - m.bh / 2, ax: p.x, ay: p.y, bonus: 18 });
          const v = vec(p.bearing, dist);
          anchors.push({ x: p.x + v.x - m.bw / 2, y: p.y + v.y - m.bh / 2, ax: p.x, ay: p.y, bonus: 10 });
        });
        sideAnchors(p.x, p.y, m.bw, m.bh, [20, 28, 38, 50, 64, 80, 96]).forEach((a) => anchors.push(a));
        ringAnchors(p.x, p.y, m.bw, m.bh, [28, 40, 54, 70, 88, 108], 16).forEach((a) => anchors.push(a));

        let box = placeBox(m.bw, m.bh, anchors, obstacles, {
          maxDist: 140,
          distWeight: 1.15,
          preferAway: { x: axu * 10, y: ayu * 10 }
        });
        if (!box) {
          box = placeBox(m.bw, m.bh, anchors, obstacles, { maxDist: 220, distWeight: 0.7 });
        }
        if (!box) {
          box = placeBox(m.bw, m.bh, gridAnchors(p.x, p.y, m.bw, m.bh, 6), obstacles, { maxDist: 240, distWeight: 1 });
        }
        if (!box) {
          attempt.lastFail = p.short || p.name;
          if (global.__areaIlloDebug) {
            console.log("  FAIL label", p.short || p.name, "size", m.bw.toFixed(1), m.bh.toFixed(1), "pin", p.x.toFixed(1), p.y.toFixed(1));
            obstacles.forEach((o) => console.log("   obs", o.role, o.name||"", [o.x,o.y,o.w,o.h].map(n=>n.toFixed(1)).join(",")));
          }
          return null;
        }
        const groupId = "place:" + (p.short || p.name);
        box.role = "label";
        box.name = p.short || p.name;
        box.groupId = groupId;
        const chipBox = {
          x: box.x + (box.w - m.chipW) / 2,
          y: box.y + m.nameH + 2,
          w: m.chipW,
          h: CHIP_H,
          role: "chip",
          name: p.chip.text,
          groupId: groupId
        };
        const nameBox = {
          x: box.x,
          y: box.y,
          w: box.w,
          h: m.nameH,
          role: "label-name",
          name: p.short || p.name,
          groupId: groupId
        };
        labels.push({
          pin: p,
          lines: m.lines,
          box: box,
          chipW: m.chipW,
          chipBox: chipBox,
          nameBox: nameBox,
          nameH: m.nameH,
          lineH: m.lineH,
          leader: leaderNeeded(p, box)
        });
      }

      const used = reserved.concat(labels.map((lb) => lb.box));
      function roadAnchorsFor(bearing) {
        const out = [];
        const tw = 80;
        [50, 70, 90, 110, 130, 155, 180, -50, -70, -90, -110, -130, -155, -180].forEach((t) => {
          [14, 20, 28, 38, 48].forEach((off) => {
            [90, -90].forEach((side) => {
              const along = vec(bearing, t);
              const perp = vec(bearing + side, off);
              out.push({
                x: stS.x + along.x + perp.x - tw / 2,
                y: stS.y + along.y + perp.y - 7,
                ax: stS.x + along.x,
                ay: stS.y + along.y,
                bonus: Math.abs(t) > 90 ? 6 : 0
              });
            });
          });
        });
        return out;
      }
      function placeRoad(name, bearing) {
        const w = textW(name, FS.road, "600") + 10, h = 16;
        const anchors = roadAnchorsFor(bearing).map((a) => {
          a.x = a.ax - w / 2 + (a.x + 40 - a.ax);
          return { x: a.ax - w / 2 + (a.x - (a.ax - 40)), y: a.y, ax: a.ax, ay: a.ay, bonus: a.bonus };
        });
        /* Rebuild cleanly */
        const clean = [];
        [50, 70, 90, 110, 130, 155, 180, -50, -70, -90, -110, -130, -155, -180].forEach((t) => {
          [14, 20, 28, 38, 48].forEach((off) => {
            [90, -90].forEach((side) => {
              const along = vec(bearing, t);
              const perp = vec(bearing + side, off);
              clean.push({
                x: stS.x + along.x + perp.x - w / 2,
                y: stS.y + along.y + perp.y - h / 2,
                ax: stS.x + along.x,
                ay: stS.y + along.y,
                bonus: Math.abs(t) > 100 ? 8 : 0
              });
            });
          });
        });
        const box = placeBox(w, h, clean, used, { maxDist: 120, distWeight: 0.35 });
        if (!box) return null;
        box.role = "road";
        box.name = name;
        used.push(box);
        return { box: box, text: name };
      }

      const roadLbl = placeRoad(spec.road, spec.roadBearing);
      let crossLbl = null;
      if (spec.cross) crossLbl = placeRoad(spec.cross.name, spec.cross.bearing);

      return {
        spec, stS, pins, scale, stBox, stM, labels, roadLbl, crossLbl, riverBox,
        boxes: collectBoxes(stS, pins, stBox, labels, roadLbl, crossLbl, riverBox, spec)
      };
    }

    built = attempt(chosen);
    if (!built && chosen.length > 2 && attempt.lastFail) {
      const dropName = attempt.lastFail;
      const reduced = chosen.filter((p) => (p.short || p.name) !== dropName);
      if (reduced.length && reduced.length < chosen.length) built = attempt(reduced);
    }
    if (!built && chosen.length > 2) {
      /* Drop the place that is angularly closest to another, preferring the nearer of that pair. */
      let drop = chosen[chosen.length - 1], worst = 180;
      for (let i = 0; i < chosen.length; i++) {
        for (let j = i + 1; j < chosen.length; j++) {
          const a = angDiff(chosen[i].bearing, chosen[j].bearing);
          if (a < worst) {
            worst = a;
            drop = chosen[i].meters <= chosen[j].meters ? chosen[i] : chosen[j];
          }
        }
      }
      built = attempt(chosen.filter((p) => p !== drop));
    }
    if (!built) built = attempt(chosen.slice(0, Math.min(2, chosen.length)));
    if (!built) built = attempt(chosen.slice(0, 1));
    return built;
  }

  function riverLabelBox(spec) {
    if (!spec.river) return null;
    const text = spec.river.name;
    const w = textW(text, FS.road, "600");
    /* Rotated 90° around (352, 232): width becomes height. */
    const cx = 352, cy = 232;
    return { x: cx - 8, y: cy - w / 2, w: 16, h: w, role: "river", name: text };
  }

  function collectBoxes(stS, pins, stBox, labels, roadLbl, crossLbl, riverBox, spec) {
    const boxes = [];
    boxes.push(Object.assign({}, COMPASS_BOX));
    boxes.push(Object.assign({}, LEGEND_BOX));
    boxes.push(stationDotBox(stS, !!spec.transfer));
    if (stBox) boxes.push(Object.assign({}, stBox));
    pins.forEach((p) => boxes.push(pinBox(p)));
    labels.forEach((lb) => {
      boxes.push(Object.assign({}, lb.box));
      boxes.push(Object.assign({}, lb.chipBox));
      boxes.push(Object.assign({}, lb.nameBox));
    });
    if (roadLbl) boxes.push(Object.assign({}, roadLbl.box));
    if (crossLbl) boxes.push(Object.assign({}, crossLbl.box));
    if (riverBox) boxes.push(Object.assign({}, riverBox));
    return boxes;
  }

  function sameGroup(a, b) {
    if (!a || !b) return false;
    if (a.groupId && b.groupId && a.groupId === b.groupId) return true;
    return false;
  }

  function findOverlaps(boxes, gap) {
    gap = gap == null ? GAP : gap;
    const hits = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (sameGroup(a, b)) continue;
        if (boxesOverlap(a, b, gap)) {
          hits.push({ a: a, b: b });
        }
      }
    }
    return hits;
  }

  function areaIlloHTML(area) {
    const layout = layoutMap(area);
    const spec = layout.spec;
    const { stS, pins, stBox, stM, labels, roadLbl, crossLbl } = layout;
    const lineKey = spec.line === "mrt-along-cross" ? "mrt" : spec.line;
    const lineColor = LINE[lineKey] || LINE.sukhumvit;
    const railBearing = spec.railBearing != null ? spec.railBearing : spec.roadBearing;
    const drawMainRail = spec.line !== "mrt-along-cross";

    const road = roadPath(stS.x, stS.y, spec.roadBearing, 420);
    const rail = roadPath(stS.x, stS.y, railBearing, 420);

    let soi = "";
    for (let t = -180; t <= 180; t += 42) {
      const along = vec(spec.roadBearing, t);
      const perp = vec(spec.roadBearing + 90, (t / 42) % 2 === 0 ? 16 : 11);
      const x = stS.x + along.x, y = stS.y + along.y;
      if (x < 8 || x > 392 || y < 8 || y > 350) continue;
      soi += `<line x1="${x}" y1="${y}" x2="${x + perp.x}" y2="${y + perp.y}" stroke="#E0DAD2" stroke-width="2" stroke-linecap="round"/>`;
    }

    let trees = "";
    const treeSpots = [
      [32, 48], [70, 300], [310, 40], [350, 290], [40, 200], [360, 200]
    ];
    treeSpots.forEach(([tx, ty], i) => {
      const hit = pins.some((p) => Math.hypot(p.x - tx, p.y - ty) < 36) || Math.hypot(stS.x - tx, stS.y - ty) < 36;
      if (hit) return;
      const r = 4.5 + (i % 3);
      trees += `<circle cx="${tx}" cy="${ty}" r="${r}" fill="#D9E4D6"/><circle cx="${tx + 4}" cy="${ty + 2.5}" r="${r - 1.4}" fill="#C7D8C4"/>`;
    });

    let river = "";
    if (spec.river) {
      river = `
        <path d="M 292 8 C 310 70, 278 140, 304 200 C 326 252, 300 310, 318 372 L 400 372 L 400 8 Z" fill="#DCE8EF"/>
        <path d="M 318 8 C 330 80, 300 150, 324 220 C 344 280, 322 330, 338 372 L 400 372 L 400 8 Z" fill="#D0DEE8"/>
        <g transform="translate(330,250)">
          <ellipse cx="22" cy="20" rx="18" ry="4" fill="#BCD0DC"/>
          <path d="M6 14h32c-1.5 5-8 8-16 8s-14.5-3-16-8z" fill="${T}"/>
          <path d="M16 7h14l4 7H12z" fill="#9A4328"/>
        </g>
        <text data-illo="river" data-illo-name="${esc(spec.river.name)}" x="352" y="232" text-anchor="middle" fill="#4A6578" font-size="${FS.road}" font-weight="600" font-family="${FONT}" transform="rotate(90 352 232)">${esc(spec.river.name)}</text>`;
    }

    let cross = "";
    if (spec.cross) {
      const cr = roadPath(stS.x, stS.y, spec.cross.bearing, 420);
      const ccol = LINE[spec.cross.line] || "#D6CFC6";
      const cText = crossLbl ? `<text data-illo="road" data-illo-name="${esc(spec.cross.name)}" x="${(crossLbl.box.x + crossLbl.box.w / 2).toFixed(1)}" y="${(crossLbl.box.y + 12).toFixed(1)}" text-anchor="middle" fill="#7A736C" font-size="${FS.road}" font-weight="600" font-family="${FONT}">${esc(spec.cross.name)}</text>` : "";
      cross = `
        <line x1="${cr.x1}" y1="${cr.y1}" x2="${cr.x2}" y2="${cr.y2}" stroke="#E6E2DC" stroke-width="18" stroke-linecap="butt"/>
        <line x1="${cr.x1}" y1="${cr.y1}" x2="${cr.x2}" y2="${cr.y2}" stroke="${ccol}" stroke-width="4.5" stroke-linecap="butt" opacity="0.95"/>
        ${cText}`;
    }

    const paths = labels.map((lb, i) => {
      const p = lb.pin;
      const dx = p.x - stS.x, dy = p.y - stS.y;
      const d = Math.hypot(dx, dy) || 1;
      const sx = stS.x + (dx / d) * (ST_R + 3), sy = stS.y + (dy / d) * (ST_R + 3);
      const ex = p.x - (dx / d) * (PIN_R + 2), ey = p.y - (dy / d) * (PIN_R + 2);
      const px = (sx + ex) / 2 + (-dy / d) * (8 + (i % 3) * 5);
      const py = (sy + ey) / 2 + (dx / d) * (8 + (i % 3) * 5);
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q ${px.toFixed(1)} ${py.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${T}" stroke-width="1.35" stroke-dasharray="3 3.2" opacity=".7"/>`;
    }).join("");

    const leaders = labels.map((lb) => {
      if (!lb.leader) return "";
      const p = lb.pin;
      const pt = closestPointOnBox(lb.box, p.x, p.y);
      const d = Math.hypot(pt.x - p.x, pt.y - p.y) || 1;
      const sx = p.x + (pt.x - p.x) / d * (PIN_R + 1.5);
      const sy = p.y + (pt.y - p.y) / d * (PIN_R + 1.5);
      return `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="${T}" stroke-width="1.15" stroke-linecap="round" opacity=".7"/>`;
    }).join("");

    const iconScale = 0.66;
    const iconOff = 12 * iconScale;
    const pinIcons = labels.map((lb) => {
      const p = lb.pin;
      const fill = PAD[p.kind] || PAD.mall;
      const icon = ICONS[p.kind] || ICONS.mall;
      return `<g data-illo="pin" data-illo-name="${esc(p.short || p.name)}">
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${PIN_R}" fill="#fff" stroke="${T}" stroke-width="1.55"/>
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${PIN_R - 2.6}" fill="${fill}"/>
        <g transform="translate(${(p.x - iconOff).toFixed(1)},${(p.y - iconOff).toFixed(1)}) scale(${iconScale})">${icon}</g>
      </g>`;
    }).join("");
    const pinLabs = labels.map((lb) => {
      const p = lb.pin;
      const lh = lb.lineH;
      const name = lb.lines.map((ln, i) =>
        `<text x="${(lb.box.x + lb.box.w / 2).toFixed(1)}" y="${(lb.box.y + 13 + i * lh).toFixed(1)}" text-anchor="middle" fill="#3A2F29" font-size="${FS.name}" font-weight="600" font-family="${FONT}">${esc(ln)}</text>`
      ).join("");
      const chipY = lb.chipBox.y;
      const chipX = lb.chipBox.x + lb.chipBox.w / 2;
      const chipBg = p.chip.kind === "ride" ? "#EFE8E0" : "#F3E6DC";
      const chipFg = p.chip.kind === "ride" ? "#6B625A" : T;
      return `<g data-illo="label" data-illo-name="${esc(p.short || p.name)}">
        <g data-illo="label-name" data-illo-name="${esc(p.short || p.name)}">${name}</g>
        <g data-illo="chip" data-illo-name="${esc(p.short || p.name)}">
          <rect x="${lb.chipBox.x.toFixed(1)}" y="${chipY.toFixed(1)}" width="${lb.chipBox.w.toFixed(1)}" height="${CHIP_H}" rx="7" fill="${chipBg}"/>
          <text x="${chipX.toFixed(1)}" y="${(chipY + 10.6).toFixed(1)}" text-anchor="middle" fill="${chipFg}" font-size="${FS.chip}" font-weight="600" font-family="${FONT}">${esc(p.chip.text)}</text>
        </g>
      </g>`;
    }).join("");

    const stText = stM.stLines.map((ln, i) =>
      `<text x="${(stBox.x + stBox.w / 2).toFixed(1)}" y="${(stBox.y + 14 + i * 14).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="${FS.station}" font-weight="700" font-family="${FONT}">${esc(ln)}</text>`
    ).join("");

    const xferDot = spec.transfer ? `<circle cx="${(stS.x + 5.5).toFixed(1)}" cy="${(stS.y - 6.5).toFixed(1)}" r="5.5" fill="#fff" stroke="${LINE.mrt}" stroke-width="2.1"/>` : "";
    const roadText = roadLbl ? `<text data-illo="road" data-illo-name="${esc(spec.road)}" x="${(roadLbl.box.x + roadLbl.box.w / 2).toFixed(1)}" y="${(roadLbl.box.y + 12).toFixed(1)}" text-anchor="middle" fill="#7A736C" font-size="${FS.road}" font-weight="600" font-family="${FONT}">${esc(spec.road)}</text>` : "";

    const svg = `<svg viewBox="0 0 ${VB.w} ${VB.h}" role="img" aria-label="ภาพประกอบแผนที่อย่างง่ายของย่าน${esc(area)} ไม่ใช่แผนที่จริง" xmlns="http://www.w3.org/2000/svg">
      <rect width="${VB.w}" height="${VB.h}" fill="#FBF9F6"/>
      ${river}
      ${trees}
      ${soi}
      ${cross}
      <line x1="${road.x1}" y1="${road.y1}" x2="${road.x2}" y2="${road.y2}" stroke="#E6E2DC" stroke-width="22" stroke-linecap="butt"/>
      ${drawMainRail ? `<line x1="${rail.x1}" y1="${rail.y1}" x2="${rail.x2}" y2="${rail.y2}" stroke="${lineColor}" stroke-width="4.5" stroke-linecap="butt"/>` : ""}
      ${roadText}
      ${paths}
      ${leaders}
      <g data-illo="station-dot">
        <circle cx="${stS.x.toFixed(1)}" cy="${stS.y.toFixed(1)}" r="${ST_R}" fill="#fff" stroke="${lineColor}" stroke-width="4.2"/>
        ${xferDot}
      </g>
      ${pinIcons}
      <g data-illo="station-label">
        <rect x="${stBox.x.toFixed(1)}" y="${stBox.y.toFixed(1)}" width="${stBox.w.toFixed(1)}" height="${stBox.h.toFixed(1)}" rx="7" fill="${lineColor}"/>
        ${stText}
      </g>
      ${pinLabs}
      <g data-illo="compass" transform="translate(376,26)">
        <circle r="11" fill="#fff" stroke="#E0DAD2" stroke-width="1"/>
        <path d="M0 7 L0 -8" stroke="${T}" stroke-width="1.45" stroke-linecap="round"/>
        <path d="M0 -9.5 L2.7 -3.4 L0 -5.2 L-2.7 -3.4 Z" fill="${T}"/>
        <text x="0" y="-12" text-anchor="middle" fill="${T}" font-size="${FS.compass}" font-weight="700" font-family="${FONT}">N</text>
      </g>
      <g data-illo="legend" transform="translate(14,358)" font-family="${FONT}">
        <circle cx="6" cy="0" r="5" fill="#fff" stroke="${lineColor}" stroke-width="2.6"/>
        <text x="14" y="3.8" fill="#5A524C" font-size="${FS.legend}" font-weight="600">สถานี</text>
        <text x="50" y="3.8" fill="#C4BDB6" font-size="${FS.legend}">·</text>
        <circle cx="64" cy="0" r="5" fill="#F6E4D8" stroke="${T}" stroke-width="1.45"/>
        <text x="72" y="3.8" fill="#5A524C" font-size="${FS.legend}" font-weight="600">ร้านดัง</text>
      </g>
    </svg>`;

    const clean = svg.replace(/<path d="M0 0" \/>/g, "").replace(/<g>\s*<path d="Mundefined[^"]*" \/>\s*/g, "<g>");
    return `<div class="hood-illo" data-area-illo="${esc(area)}">${clean}</div>`;
  }

  function refreshVisibleIllo() {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".hood-illo");
    const chip = document.querySelector(".hood-chips .chip.on, .hood-chips [aria-pressed='true']");
    if (!el || !chip) return;
    const area = (chip.getAttribute("data-area") || chip.textContent || "").trim();
    if (!area || !ILLO[area]) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = areaIlloHTML(area);
    const next = tmp.firstElementChild;
    if (next) el.replaceWith(next);
  }

  function armFontRefresh() {
    if (typeof document === "undefined") return;
    const go = function () {
      global.__areaIlloFontReady = true;
      refreshVisibleIllo();
      global.__areaIlloReady = true;
      document.dispatchEvent(new Event("areaillo-ready"));
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go).catch(go);
      setTimeout(function () {
        if (!global.__areaIlloReady) go();
      }, 2500);
    } else {
      go();
    }
  }
  armFontRefresh();

  global.areaIlloHTML = areaIlloHTML;
  global.AREA_ILLO_SPEC = ILLO;
  global.areaIlloLayout = layoutMap;
  global.areaIlloOverlaps = function (area, gap) {
    const layout = layoutMap(area);
    return findOverlaps(layout.boxes, gap == null ? GAP : gap);
  };
  global.areaIlloRefresh = refreshVisibleIllo;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
