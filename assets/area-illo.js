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
  const PLOT = { x: 18, y: 22, w: 364, h: 316 };
  const FS = { name: 12, chip: 11, station: 12, road: 11, legend: 11, compass: 11 };
  const PIN_R = 12.5;
  const ST_R = 11.5;
  const CHIP_H = 14;

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

  function textW(str, size) {
    let w = 0;
    for (const ch of String(str)) {
      if (/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(ch)) w += 0; // Thai combining marks
      else if (ch === "\u0E33") w += size * 0.55; // sara am
      else if (ch === " " || ch === "." || ch === "'" || ch === "’" || ch === "·") w += size * 0.28;
      else if (/[~\-–—/]/.test(ch)) w += size * 0.45;
      else if (/[A-Za-z0-9&+]/.test(ch)) w += size * 0.6;
      else w += size * 0.9; // Thai / other letters
    }
    return w;
  }

  function wrapLabel(text, maxCh) {
    if (text.length <= maxCh) return [text];
    const parts = text.split(/\s+/);
    if (parts.length === 1) return [text];
    const lines = ["", ""];
    let li = 0;
    parts.forEach((w) => {
      const next = lines[li] ? lines[li] + " " + w : w;
      if (li === 0 && next.length > maxCh && lines[li]) li = 1;
      lines[li] = lines[li] ? lines[li] + " " + w : w;
    });
    return lines.filter(Boolean).slice(0, 2);
  }

  function walkChip(meters) {
    const mins = Math.max(1, Math.round(meters / 80));
    if (mins > 20) return { kind: "ride", text: "นั่งรถ" };
    return { kind: "walk", text: "เดิน ~" + mins + " นาที" };
  }

  function boxesOverlap(a, b, pad) {
    pad = pad || 4;
    return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
  }

  const LABEL_FLOOR = 336; // keep names/chips out of the legend band

  function clampBox(b) {
    const m = 6;
    if (b.x < m) b.x = m;
    if (b.y < m) b.y = m;
    if (b.x + b.w > VB.w - m) b.x = VB.w - m - b.w;
    if (b.y + b.h > LABEL_FLOOR) b.y = LABEL_FLOOR - b.h;
    if (b.y < m) b.y = m;
    return b;
  }

  function vec(bearing, len) {
    const r = (bearing * Math.PI) / 180;
    return { x: Math.sin(r) * len, y: -Math.cos(r) * len };
  }

  function layout(spec) {
    const st = spec.station;
    const raw = spec.places.map((p) => {
      const m = hav(st.lat, st.lng, p.lat, p.lng);
      const xy = en(p.lat, p.lng, st.lat, st.lng);
      return Object.assign({}, p, { meters: m, chip: walkChip(m), e: xy.e, n: xy.n });
    });

    const pts = raw.concat([{ e: 0, n: 0 }]);
    let minE = Infinity, maxE = -Infinity, minN = Infinity, maxN = -Infinity;
    pts.forEach((p) => {
      if (p.e < minE) minE = p.e;
      if (p.e > maxE) maxE = p.e;
      if (p.n < minN) minN = p.n;
      if (p.n > maxN) maxN = p.n;
    });
    const padM = Math.max(160, 0.36 * Math.max(maxE - minE, maxN - minN, 200));
    minE -= padM; maxE += padM; minN -= padM; maxN += padM;
    let s = Math.min(PLOT.w / (maxE - minE), PLOT.h / (maxN - minN));
    s = Math.min(s, 0.38); // don't over-zoom a tiny cluster
    const cx = (minE + maxE) / 2, cy = (minN + maxN) / 2;
    function toScreen(e, n) {
      return {
        x: PLOT.x + PLOT.w / 2 + (e - cx) * s,
        y: PLOT.y + PLOT.h / 2 - (n - cy) * s
      };
    }

    const stS = toScreen(0, 0);
    const pins = raw.map((p) => {
      const sc = toScreen(p.e, p.n);
      return Object.assign({}, p, sc);
    });

    // keep a readable gap from the station
    const ST_GAP = 62;
    pins.forEach((p) => {
      const dx = p.x - stS.x, dy = p.y - stS.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < ST_GAP) {
        const k = ST_GAP / d;
        p.x = stS.x + dx * k;
        p.y = stS.y + dy * k;
      }
    });
    // separate pins that sit on top of each other
    const PIN_GAP = 56;
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const dx = pins[j].x - pins[i].x, dy = pins[j].y - pins[i].y;
        const d = Math.hypot(dx, dy) || 0.1;
        if (d < PIN_GAP) {
          const push = (PIN_GAP - d) / 2;
          const ux = dx / d, uy = dy / d;
          pins[i].x -= ux * push; pins[i].y -= uy * push;
          pins[j].x += ux * push; pins[j].y += uy * push;
        }
      }
    }

    return { stS, pins, scale: s };
  }

  function roadPath(cx, cy, bearing, length) {
    const v = vec(bearing, length);
    return { x1: cx - v.x, y1: cy - v.y, x2: cx + v.x, y2: cy + v.y };
  }

  function placeLabels(stS, pins, reserved, stBox) {
    const boxes = reserved.slice();
    const out = [];
    const ordered = pins.slice().sort((a, b) => {
      const da = Math.hypot(a.x - stS.x, a.y - stS.y);
      const db = Math.hypot(b.x - stS.x, b.y - stS.y);
      return da - db; // closest first, they need the tight slots
    });
    const pinHitBox = (q) => ({ x: q.x - (PIN_R + 3), y: q.y - (PIN_R + 3), w: (PIN_R + 3) * 2, h: (PIN_R + 3) * 2 });
    const stHitBox = { x: stS.x - (ST_R + 4), y: stS.y - (ST_R + 4), w: (ST_R + 4) * 2, h: (ST_R + 4) * 2 };

    function coversImportant(b) {
      if (pins.some((q) => boxesOverlap(b, pinHitBox(q), 4))) return true;
      if (boxesOverlap(b, stHitBox, 4)) return true;
      if (stBox && boxesOverlap(b, stBox, 6)) return true;
      return false;
    }

    ordered.forEach((p) => {
      const lines = wrapLabel(p.short || p.name, 12);
      const nameW = Math.max.apply(null, lines.map((ln) => textW(ln, FS.name)));
      const chipW = textW(p.chip.text, FS.chip) + 14;
      const bw = Math.max(nameW, chipW) + 4;
      const bh = lines.length * 15 + 16;
      const rayx = p.x - stS.x, rayy = p.y - stS.y;
      const d = Math.hypot(rayx, rayy) || 1;
      const ux = rayx / d, uy = rayy / d;
      let awayX = 1, awayY = -1;
      let nd = Infinity;
      pins.forEach((q) => {
        if (q === p) return;
        const dd = Math.hypot(q.x - p.x, q.y - p.y);
        if (dd < nd) { nd = dd; awayX = p.x - q.x; awayY = p.y - q.y; }
      });
      const al = Math.hypot(awayX, awayY) || 1;
      const ax = awayX / al, ay = awayY / al;

      const candidates = [];
      function add(x, y) { candidates.push({ x: x, y: y }); }
      [24, 32, 42, 52, 64].forEach((dist) => {
        add(p.x + ax * dist - bw / 2, p.y + ay * dist);
        add(p.x + ux * dist - bw / 2, p.y + uy * dist);
      });
      [24, 34, 46, 58].forEach((dist) => {
        add(p.x - bw / 2, p.y - dist - bh);
        add(p.x - bw / 2, p.y + dist);
        add(p.x + dist, p.y - bh / 2);
        add(p.x - dist - bw, p.y - bh / 2);
        add(p.x + dist, p.y + 12);
        add(p.x - dist - bw, p.y + 12);
        add(p.x + dist, p.y - 12 - bh);
        add(p.x - dist - bw, p.y - 12 - bh);
      });
      // 12-way ring for leftover tight clusters
      [36, 50].forEach((dist) => {
        for (let a = 0; a < 12; a++) {
          const rad = (a * Math.PI) / 6;
          add(p.x + Math.cos(rad) * dist - bw / 2, p.y + Math.sin(rad) * dist - bh / 2);
        }
      });

      let best = null, bestScore = -1e9;
      function consider(raw, allowLabelHit) {
        const b = clampBox({ x: raw.x, y: raw.y, w: bw, h: bh });
        if (Math.abs(b.x - raw.x) > 28 || Math.abs(b.y - raw.y) > 28) return;
        if (b.y + b.h > LABEL_FLOOR) return;
        if (coversImportant(b)) return;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const dist = Math.hypot(cx - p.x, cy - p.y);
        if (dist > 70) return; // keep labels close to their own pin
        // don't sit closer to another pin than to this one
        let otherD = Infinity;
        pins.forEach((q) => {
          if (q === p) return;
          otherD = Math.min(otherD, Math.hypot(cx - q.x, cy - q.y));
        });
        if (otherD + 8 < dist) return;
        const labelHit = boxes.some((o) => boxesOverlap(b, o, 5));
        if (labelHit && !allowLabelHit) return;
        let score = 90 - dist * 1.35;
        const vl = dist || 1;
        score += ((cx - p.x) / vl * ax + (cy - p.y) / vl * ay) * 8;
        if (labelHit) score -= 100;
        if (otherD < 50) score -= (50 - otherD);
        if (score > bestScore) { bestScore = score; best = b; }
      }
      candidates.forEach((c) => consider(c, false));
      if (!best) candidates.forEach((c) => consider(c, true));
      const chosen = best || clampBox({ x: p.x - bw / 2, y: Math.min(p.y - 24 - bh, LABEL_FLOOR - bh), w: bw, h: bh });
      boxes.push(chosen);
      out.push({ pin: p, lines, box: chosen, chipW });
    });

    function nearPin(box, pin) {
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      return Math.hypot(cx - pin.x, cy - pin.y) < 78;
    }
    // slide leftover label overlaps apart, keeping each box near its pin and off pins
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) {
          const A = out[i].box, B = out[j].box;
          if (!boxesOverlap(A, B, 5)) continue;
          const a0 = { x: A.x, y: A.y }, b0 = { x: B.x, y: B.y };
          const overlapX = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) + 6;
          const overlapY = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + 6;
          if (overlapX <= overlapY) {
            if (A.x <= B.x) { A.x -= overlapX / 2; B.x += overlapX / 2; }
            else { B.x -= overlapX / 2; A.x += overlapX / 2; }
          } else {
            if (A.y <= B.y) { A.y -= overlapY / 2; B.y += overlapY / 2; }
            else { B.y -= overlapY / 2; A.y += overlapY / 2; }
          }
          clampBox(A); clampBox(B);
          if (!nearPin(A, out[i].pin) || coversImportant(A)) { A.x = a0.x; A.y = a0.y; }
          if (!nearPin(B, out[j].pin) || coversImportant(B)) { B.x = b0.x; B.y = b0.y; }
        }
      }
    }
    return out;
  }

  function areaIlloHTML(area) {
    const spec = ILLO[area] || ILLO["ทองหล่อ"];
    const { stS, pins } = layout(spec);
    const lineKey = spec.line === "mrt-along-cross" ? "mrt" : spec.line;
    const lineColor = LINE[lineKey] || LINE.sukhumvit;
    const railBearing = spec.railBearing != null ? spec.railBearing : spec.roadBearing;
    const drawMainRail = spec.line !== "mrt-along-cross";

    const compassBox = { x: 360, y: 8, w: 34, h: 46 };
    const legendBand = { x: 0, y: 336, w: 400, h: 36 };
    const reserved = [compassBox, legendBand];

    // station label — compact, never covers a pin
    const stLines = spec.transfer ? [spec.station.name, spec.transfer.name] : [spec.station.name];
    const stW = Math.max.apply(null, stLines.map((ln) => textW(ln, FS.station))) + 18;
    const stH = stLines.length * 14 + 8;
    pins.forEach((p) => reserved.push({ x: p.x - (PIN_R + 4), y: p.y - (PIN_R + 4), w: (PIN_R + 4) * 2, h: (PIN_R + 4) * 2 }));
    reserved.push({ x: stS.x - (ST_R + 5), y: stS.y - (ST_R + 5), w: (ST_R + 5) * 2, h: (ST_R + 5) * 2 });
    const pinN = pins.filter((p) => p.y < stS.y - 10).length;
    const pinS = pins.filter((p) => p.y > stS.y + 10).length;
    const pinE = pins.filter((p) => p.x > stS.x + 10).length;
    const pinW = pins.filter((p) => p.x < stS.x - 10).length;
    const stLabelCands = [];
    function addSt(x, y) { stLabelCands.push({ x: x, y: y }); }
    [20, 28, 38, 50].forEach((d) => {
      if (pinE === 0) { addSt(stS.x + d, stS.y - stH / 2); addSt(stS.x + d, stS.y + 14); }
      if (pinW === 0) { addSt(stS.x - d - stW, stS.y - stH / 2); addSt(stS.x - d - stW, stS.y + 14); }
      if (pinS === 0) addSt(stS.x - stW / 2, stS.y + d);
      if (pinN === 0) addSt(stS.x - stW / 2, stS.y - d - stH);
    });
    [20, 28, 38, 50, 62].forEach((d) => {
      addSt(stS.x + d, stS.y - stH / 2);
      addSt(stS.x - d - stW, stS.y - stH / 2);
      addSt(stS.x - stW / 2, stS.y + d);
      addSt(stS.x - stW / 2, stS.y - d - stH);
      addSt(stS.x + d, stS.y + 14);
      addSt(stS.x - d - stW, stS.y + 14);
      addSt(stS.x + d, stS.y - 14 - stH);
      addSt(stS.x - d - stW, stS.y - 14 - stH);
    });
    let stBox = null, bestScore = -1e9;
    function stHitsPin(b) {
      return pins.some((q) => boxesOverlap(b, { x: q.x - (PIN_R + 3), y: q.y - (PIN_R + 3), w: (PIN_R + 3) * 2, h: (PIN_R + 3) * 2 }, 6))
        || boxesOverlap(b, { x: stS.x - (ST_R + 3), y: stS.y - (ST_R + 3), w: (ST_R + 3) * 2, h: (ST_R + 3) * 2 }, 4);
    }
    stLabelCands.forEach((cand) => {
      const raw = { x: cand.x, y: cand.y, w: stW, h: stH };
      const b = clampBox({ x: raw.x, y: raw.y, w: stW, h: stH });
      if (Math.abs(b.x - raw.x) > 16 || Math.abs(b.y - raw.y) > 16) return;
      if (b.y + b.h > LABEL_FLOOR) return;
      if (stHitsPin(b)) return;
      let score = 0;
      let hit = false;
      reserved.forEach((o) => {
        if (boxesOverlap(b, o, 6)) { hit = true; score -= 120; }
        else {
          const gapX = Math.max(0, Math.max(o.x - (b.x + b.w), b.x - (o.x + o.w)));
          const gapY = Math.max(0, Math.max(o.y - (b.y + b.h), b.y - (o.y + o.h)));
          score += Math.min(gapX, 40) + Math.min(gapY, 40);
        }
      });
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      score -= Math.hypot(cx - stS.x, cy - stS.y) * 0.4;
      if (hit) return;
      if (score > bestScore) { bestScore = score; stBox = b; }
    });
    if (!stBox) {
      // last resort: park the label in a free corner above the legend
      const corners = [
        { x: 10, y: LABEL_FLOOR - stH - 4, w: stW, h: stH },
        { x: VB.w - stW - 44, y: LABEL_FLOOR - stH - 4, w: stW, h: stH },
        { x: 10, y: 12, w: stW, h: stH },
        { x: VB.w - stW - 44, y: 12, w: stW, h: stH }
      ];
      stBox = corners.find((b) => !stHitsPin(b) && reserved.every((o) => !boxesOverlap(b, o, 4))) || corners[0];
    }
    reserved.push(stBox);

    const labels = placeLabels(stS, pins, reserved, stBox);

    const road = roadPath(stS.x, stS.y, spec.roadBearing, 420);
    const rail = roadPath(stS.x, stS.y, railBearing, 420);
    function findPlain(text, anchors, boxes, size) {
      const w = textW(text, size) + 8, h = 15;
      let best = null, bestScore = -1e9;
      for (let i = 0; i < anchors.length; i++) {
        const raw = { x: anchors[i].x - w / 2, y: anchors[i].y - 7, w: w, h: h };
        const b = clampBox({ x: raw.x, y: raw.y, w: w, h: h });
        if (Math.abs(b.x - raw.x) > 10 || Math.abs(b.y - raw.y) > 10) continue;
        if (b.y + b.h > LABEL_FLOOR) continue;
        if (boxes.some((o) => boxesOverlap(b, o, 4))) continue;
        const score = -Math.hypot(b.x - raw.x, b.y - raw.y);
        if (score > bestScore) { bestScore = score; best = b; }
      }
      return best ? { box: best, text: text } : null;
    }
    function roadAnchorsFor(bearing) {
      const out = [];
      [60, 90, 120, 150, -60, -90, -120, -150, 180, -180].forEach((t) => {
        [16, 22, 30, 38].forEach((off) => {
          [90, -90].forEach((side) => {
            const along = vec(bearing, t);
            const perp = vec(bearing + side, off);
            out.push({ x: stS.x + along.x + perp.x, y: stS.y + along.y + perp.y });
          });
        });
      });
      return out;
    }

    const usedBoxes = reserved.concat(labels.map((lb) => lb.box));
    const roadLbl = findPlain(spec.road, roadAnchorsFor(spec.roadBearing), usedBoxes, FS.road);
    if (roadLbl) usedBoxes.push(roadLbl.box);

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
        <text x="352" y="232" text-anchor="middle" fill="#4A6578" font-size="${FS.road}" font-weight="600" font-family="${FONT}" transform="rotate(90 352 232)">${esc(spec.river.name)}</text>`;
    }

    let cross = "";
    if (spec.cross) {
      const cr = roadPath(stS.x, stS.y, spec.cross.bearing, 420);
      const ccol = LINE[spec.cross.line] || "#D6CFC6";
      const cLbl = findPlain(spec.cross.name, roadAnchorsFor(spec.cross.bearing), usedBoxes, FS.road);
      if (cLbl) usedBoxes.push(cLbl.box);
      const cText = cLbl ? `<text x="${(cLbl.box.x + cLbl.box.w / 2).toFixed(1)}" y="${(cLbl.box.y + 11).toFixed(1)}" text-anchor="middle" fill="#7A736C" font-size="${FS.road}" font-weight="600" font-family="${FONT}">${esc(spec.cross.name)}</text>` : "";
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

    const iconScale = 0.66;
    const iconOff = 12 * iconScale;
    const pinIcons = labels.map((lb) => {
      const p = lb.pin;
      const fill = PAD[p.kind] || PAD.mall;
      const icon = ICONS[p.kind] || ICONS.mall;
      return `<g>
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${PIN_R}" fill="#fff" stroke="${T}" stroke-width="1.55"/>
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${PIN_R - 2.6}" fill="${fill}"/>
        <g transform="translate(${(p.x - iconOff).toFixed(1)},${(p.y - iconOff).toFixed(1)}) scale(${iconScale})">${icon}</g>
      </g>`;
    }).join("");
    const pinLabs = labels.map((lb) => {
      const p = lb.pin;
      const lh = 14.5;
      const name = lb.lines.map((ln, i) =>
        `<text x="${(lb.box.x + lb.box.w / 2).toFixed(1)}" y="${(lb.box.y + 12 + i * lh).toFixed(1)}" text-anchor="middle" fill="#3A2F29" font-size="${FS.name}" font-weight="600" font-family="${FONT}">${esc(ln)}</text>`
      ).join("");
      const chipY = lb.box.y + lb.lines.length * lh + 2;
      const chipX = lb.box.x + lb.box.w / 2;
      const chipBg = p.chip.kind === "ride" ? "#EFE8E0" : "#F3E6DC";
      const chipFg = p.chip.kind === "ride" ? "#6B625A" : T;
      return `<g>
        ${name}
        <rect x="${(chipX - lb.chipW / 2).toFixed(1)}" y="${chipY.toFixed(1)}" width="${lb.chipW.toFixed(1)}" height="${CHIP_H}" rx="7" fill="${chipBg}"/>
        <text x="${chipX.toFixed(1)}" y="${(chipY + 10.6).toFixed(1)}" text-anchor="middle" fill="${chipFg}" font-size="${FS.chip}" font-weight="600" font-family="${FONT}">${esc(p.chip.text)}</text>
      </g>`;
    }).join("");

    const stText = stLines.map((ln, i) =>
      `<text x="${(stBox.x + stBox.w / 2).toFixed(1)}" y="${(stBox.y + 12 + i * 13).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="${FS.station}" font-weight="700" font-family="${FONT}">${esc(ln)}</text>`
    ).join("");

    const xferDot = spec.transfer ? `<circle cx="${(stS.x + 5.5).toFixed(1)}" cy="${(stS.y - 6.5).toFixed(1)}" r="5.5" fill="#fff" stroke="${LINE.mrt}" stroke-width="2.1"/>` : "";
    const roadText = roadLbl ? `<text x="${(roadLbl.box.x + roadLbl.box.w / 2).toFixed(1)}" y="${(roadLbl.box.y + 11).toFixed(1)}" text-anchor="middle" fill="#7A736C" font-size="${FS.road}" font-weight="600" font-family="${FONT}">${esc(spec.road)}</text>` : "";

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
      <circle cx="${stS.x.toFixed(1)}" cy="${stS.y.toFixed(1)}" r="${ST_R}" fill="#fff" stroke="${lineColor}" stroke-width="4.2"/>
      ${xferDot}
      ${pinIcons}
      <rect x="${stBox.x.toFixed(1)}" y="${stBox.y.toFixed(1)}" width="${stBox.w.toFixed(1)}" height="${stBox.h.toFixed(1)}" rx="7" fill="${lineColor}"/>
      ${stText}
      ${pinLabs}
      <g transform="translate(376,26)">
        <circle r="11" fill="#fff" stroke="#E0DAD2" stroke-width="1"/>
        <path d="M0 7 L0 -8" stroke="${T}" stroke-width="1.45" stroke-linecap="round"/>
        <path d="M0 -9.5 L2.7 -3.4 L0 -5.2 L-2.7 -3.4 Z" fill="${T}"/>
        <text x="0" y="-12" text-anchor="middle" fill="${T}" font-size="${FS.compass}" font-weight="700" font-family="${FONT}">N</text>
      </g>
      <g transform="translate(14,358)" font-family="${FONT}">
        <circle cx="6" cy="0" r="5" fill="#fff" stroke="${lineColor}" stroke-width="2.6"/>
        <text x="14" y="3.8" fill="#5A524C" font-size="${FS.legend}" font-weight="600">สถานี</text>
        <text x="50" y="3.8" fill="#C4BDB6" font-size="${FS.legend}">·</text>
        <circle cx="64" cy="0" r="5" fill="#F6E4D8" stroke="${T}" stroke-width="1.45"/>
        <text x="72" y="3.8" fill="#5A524C" font-size="${FS.legend}" font-weight="600">ร้านดัง</text>
      </g>
    </svg>`;

    const clean = svg.replace(/<path d="M0 0" \/>/g, "").replace(/<g>\s*<path d="Mundefined[^"]*" \/>\s*/g, "<g>");
    return `<div class="hood-illo">${clean}</div>`;
  }

  global.areaIlloHTML = areaIlloHTML;
  global.AREA_ILLO_SPEC = ILLO;
})(window);
