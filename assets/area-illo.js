/* Hand-drawn flat SVG mini-maps for the home area switcher. */
(function (global) {
  const FONT = "Noto Sans Thai, Prompt, ui-sans-serif, sans-serif";
  const T = "#B9532F";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const ILLO = {
    "ทองหล่อ": {
      system: "BTS",
      station: "BTS ทองหล่อ",
      places: [
        { kind: "mall", name: "theCOMMONS" },
        { kind: "cafe", name: "CPS Coffee Sukhumvit 53", short: "CPS Coffee" },
        { kind: "food", name: "Baan Ice" }
      ]
    },
    "พร้อมพงษ์": {
      system: "BTS",
      station: "BTS พร้อมพงษ์",
      places: [
        { kind: "mall", name: "EmQuartier" },
        { kind: "park", name: "สวนเบญจสิริ" },
        { kind: "mall", name: "EmSphere" }
      ]
    },
    "เอกมัย": {
      system: "BTS",
      station: "BTS เอกมัย",
      places: [
        { kind: "mall", name: "Gateway Ekkamai", short: "Gateway" },
        { kind: "mall", name: "Donki Mall Ekkamai", short: "Donki Mall" },
        { kind: "food", name: "Wattana Panich" }
      ]
    },
    "พระโขนง": {
      system: "BTS",
      station: "BTS พระโขนง",
      places: [
        { kind: "mall", name: "W District" },
        { kind: "cafe", name: "Hands and Heart Coffee Roasters", short: "Hands and Heart" },
        { kind: "food", name: "Shakariki432" }
      ]
    },
    "อ่อนนุช": {
      system: "BTS",
      station: "BTS อ่อนนุช",
      places: [
        { kind: "mall", name: "Lotus's อ่อนนุช" },
        { kind: "market", name: "ตลาดอ่อนนุช" },
        { kind: "cafe", name: "THE WOOD LAND" }
      ]
    },
    "อโศก": {
      system: "BTS",
      station: "BTS อโศก",
      transfer: "MRT สุขุมวิท",
      places: [
        { kind: "mall", name: "Terminal 21 Asok", short: "Terminal 21" },
        { kind: "park", name: "สวนเบญจกิติ" },
        { kind: "cafe", name: "Bartels Asok" }
      ]
    },
    "อารีย์": {
      system: "BTS",
      station: "BTS อารีย์",
      places: [
        { kind: "cafe", name: "NANA Coffee Roasters", short: "NANA Coffee" },
        { kind: "mall", name: "GUMP'S Ari" },
        { kind: "food", name: "Ongtong Khaosoi" }
      ]
    },
    "พระราม 9": {
      system: "MRT",
      station: "MRT พระราม 9",
      places: [
        { kind: "mall", name: "เซ็นทรัลพระราม 9", short: "เซ็นทรัล พระราม 9" },
        { kind: "mall", name: "ฟอร์จูนทาวน์" },
        { kind: "cafe", name: "After You Dessert Cafe Esplanade Ratchadapisek", short: "After You" }
      ]
    },
    "เจริญนคร": {
      system: "BTS",
      station: "BTS กรุงธนบุรี",
      river: "แม่น้ำเจ้าพระยา",
      places: [
        { kind: "mall", name: "ICONSIAM" },
        { kind: "mall", name: "Lhong 1919" }
      ]
    },
    "บางนา": {
      system: "BTS",
      station: "BTS บางนา",
      places: [
        { kind: "mall", name: "เซ็นทรัล บางนา" },
        { kind: "mall", name: "BITEC" },
        { kind: "park", name: "SAMA Garden" }
      ]
    }
  };

  const PAD = {
    mall: "#F6E4D8",
    cafe: "#F8EFE4",
    food: "#F3E6DC",
    park: "#D9E4D6",
    market: "#F6E4D8",
    boat: "#E4EEF3"
  };

  /* 24x24 terracotta icons, flat and rounded. */
  const ICONS = {
    mall: '<rect x="4.5" y="7.5" width="15" height="13.5" rx="2.2" fill="#B9532F"/><path fill="#B9532F" d="M3.6 7.5h16.8l-1.4 2.6H5z"/><rect x="6.2" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="10.5" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="14.8" y="11.2" width="3" height="3" rx=".6" fill="#FBF9F6"/><rect x="10.4" y="16.2" width="3.2" height="4.8" rx=".6" fill="#FBF9F6"/>',
    cafe: '<path fill="#B9532F" d="M5.2 9.1h11.2v5.8A4 4 0 0 1 12.4 19H9.1A4 4 0 0 1 5.2 14.9V9.1z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M16.4 10.6h2a2.2 2.2 0 1 1 0 4.4h-2"/><path fill="none" stroke="#B9532F" stroke-width="1.4" stroke-linecap="round" d="M8.2 4.4c.2 1-.3 1.6-.3 2.4M11.4 4.4c.2 1-.3 1.6-.3 2.4M14.5 4.4c.2 1-.3 1.6-.3 2.4"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M6.2 20.4h9.4"/>',
    food: '<path fill="#B9532F" d="M4.6 12.2h14.8c-.9 5.2-3.8 8.2-7.4 8.2s-6.5-3-7.4-8.2z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M10 4.2l2.6 8M14.6 4.2l-2 8"/>',
    park: '<path fill="#B9532F" d="M8.8 14.6c-2.6 0-4.2-2-4.2-4.2C4.6 7.6 7 5.6 9.4 6.2c.6-1.8 2.2-3 4.1-3 2.4 0 4.2 1.8 4.4 4.1 1.8.4 3.5 2.1 3.5 4.3 0 2.4-2 4-4.4 4z"/><path fill="#B9532F" d="M11.6 14.4v6.2h2.2v-6.2z"/>',
    market: '<path fill="#B9532F" d="M4.4 9.2l2.4-4.4h10.4l2.4 4.4z"/><path fill="none" stroke="#B9532F" stroke-width="1.6" stroke-linecap="round" d="M6.2 9.2v9.4M17.8 9.2v9.4M4.6 18.8h14.8"/><path fill="#FBF9F6" d="M8.4 11.2h3v5.2h-3zM12.6 11.2h3v5.2h-3z"/>',
    boat: '<path fill="#B9532F" d="M4.4 14.2h15.2c-.6 2.8-3.2 4.6-7.6 4.6s-7-1.8-7.6-4.6z"/><path fill="#B9532F" d="M9 8.2h6.2l1.6 6H7.6z"/><path fill="none" stroke="#B9532F" stroke-width="1.5" stroke-linecap="round" d="M12.2 5.2v3"/>'
  };

  function wrapLabel(text, max) {
    if (text.length <= max) return [text];
    const parts = text.split(/\s+/);
    if (parts.length === 1) return [text];
    const lines = ["", ""];
    let li = 0;
    parts.forEach((w) => {
      const next = lines[li] ? lines[li] + " " + w : w;
      if (li === 0 && next.length > max && lines[li]) li = 1;
      lines[li] = lines[li] ? lines[li] + " " + w : w;
    });
    return lines.filter(Boolean).slice(0, 2);
  }

  function badge(x, y, place) {
    const kind = place.kind;
    const lines = wrapLabel(place.short || place.name, 13);
    const pad = PAD[kind] || PAD.mall;
    const icon = ICONS[kind] || ICONS.mall;
    const text = lines
      .map(
        (ln, i) =>
          `<text x="${x}" y="${y + 32 + i * 14}" text-anchor="middle" fill="#3A2F29" font-size="12" font-weight="600" font-family="${FONT}">${esc(ln)}</text>`
      )
      .join("");
    return `<g>
      <title>${esc(place.name)}</title>
      <circle cx="${x}" cy="${y}" r="23" fill="#fff" stroke="#E7E2DB" stroke-width="1"/>
      <circle cx="${x}" cy="${y}" r="18.5" fill="${pad}"/>
      <g transform="translate(${x - 12},${y - 12}) scale(1)">${icon}</g>
      ${text}
    </g>`;
  }

  function train(x, y, system) {
    const stripe = system === "MRT" ? "#8FA8C8" : T;
    return `<g transform="translate(${x},${y})">
      <rect x="0" y="0" width="152" height="42" rx="15" fill="#fff" stroke="#E0DAD2" stroke-width="1.2"/>
      <rect x="10" y="30" width="132" height="6" rx="3" fill="${stripe}"/>
      <rect x="14" y="8" width="22" height="15" rx="5" fill="#E8F0F4"/>
      <rect x="42" y="8" width="22" height="15" rx="5" fill="#E8F0F4"/>
      <rect x="70" y="8" width="22" height="15" rx="5" fill="#E8F0F4"/>
      <rect x="104" y="7" width="28" height="17" rx="6" fill="#E8F0F4" stroke="#D5DEE3" stroke-width=".8"/>
      <circle cx="144" cy="21" r="4.2" fill="#F6E7A8"/>
      <rect x="8" y="-6" width="20" height="6" rx="2.5" fill="#E7E2DB"/>
    </g>`;
  }

  function areaIlloHTML(area) {
    const spec = ILLO[area] || ILLO["ทองหล่อ"];
    const slug = (global.AREA_SLUGS && global.AREA_SLUGS[area]) || "area";
    const uid = "illo-" + slug;
    const isMrt = spec.system === "MRT";
    const rail = isMrt ? "#C9D6E8" : "#C5D6C4";
    const river = spec.river
      ? `<path d="M0 238 C80 228 150 258 230 244 C310 230 350 260 400 246 L400 300 L0 300 Z" fill="#DCE8EF"/>
         <path d="M0 268 C90 258 170 280 250 266 C320 256 360 276 400 266 L400 300 L0 300 Z" fill="#D0DEE8"/>
         <g transform="translate(86,250)">
           <ellipse cx="40" cy="26" rx="28" ry="5" fill="#BCD0DC"/>
           <path d="M10 17h60c-3 8-14 13-30 13S13 25 10 17z" fill="${T}"/>
           <path d="M28 7h24l7 10H22z" fill="#9A4328"/>
           <rect x="36" y="9" width="8" height="6" rx="1.2" fill="#FBF9F6"/>
         </g>
         <text x="260" y="292" text-anchor="middle" fill="#4A6578" font-size="11.5" font-weight="600" font-family="${FONT}">${esc(spec.river)}</text>`
      : `<path d="M0 258 C80 248 160 270 240 258 C320 246 360 268 400 256 L400 300 L0 300 Z" fill="#F1EBE3"/>
         <path d="M0 276 C90 268 180 286 260 274 C330 264 370 282 400 274 L400 300 L0 300 Z" fill="#E8E1D8"/>`;

    const transfer = spec.transfer || "";

    const places = spec.places || [];
    const slots = spec.river
      ? [[86, 78], [328, 80]]
      : [[86, 78], [328, 80], [90, 242]];
    const badges = places
      .map((p, i) => (slots[i] ? badge(slots[i][0], slots[i][1], p) : ""))
      .join("");

    const signW = Math.max(108, Math.min(132, 18 + Math.max(spec.station.length, (spec.transfer||"").length) * 7.6));
    const signH = spec.transfer ? 34 : 22;
    const signX = 252;
    const signCx = signX + signW / 2;
    const signY = spec.transfer ? 156 : 166;
    const stationText = spec.transfer
      ? `<text x="${signCx}" y="${signY + 14}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="${FONT}">${esc(spec.station)}</text>
         <text x="${signCx}" y="${signY + 27}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="${FONT}">${esc(spec.transfer)}</text>`
      : `<text x="${signCx}" y="${signY + 15.5}" text-anchor="middle" fill="#fff" font-size="11.5" font-weight="700" font-family="${FONT}">${esc(spec.station)}</text>`;

    const svg = `<svg viewBox="0 0 400 300" role="img" aria-label="ภาพประกอบย่าน${esc(area)} ไม่ใช่แผนที่จริง" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#FBF9F6"/>
      <!-- soft distant blocks, no window grid -->
      <rect x="28" y="148" width="36" height="70" rx="10" fill="#EEE8E0"/>
      <rect x="58" y="128" width="44" height="90" rx="10" fill="#E8E2D9"/>
      <rect x="348" y="140" width="32" height="78" rx="10" fill="#EEE8E0"/>
      ${river}
      <!-- elevated track -->
      <rect x="28" y="208" width="12" height="52" rx="4" fill="#E3DBD2"/>
      <rect x="23" y="256" width="22" height="6" rx="2" fill="#D8D1C8"/>
      <rect x="154" y="208" width="12" height="52" rx="4" fill="#E3DBD2"/>
      <rect x="149" y="256" width="22" height="6" rx="2" fill="#D8D1C8"/>
      <rect x="286" y="208" width="12" height="52" rx="4" fill="#E3DBD2"/>
      <rect x="281" y="256" width="22" height="6" rx="2" fill="#D8D1C8"/>
      <rect x="16" y="194" width="368" height="16" rx="6" fill="#D6CFC6"/>
      <rect x="20" y="198" width="360" height="5" rx="2.5" fill="${rail}"/>
      <!-- station canopy + sign -->
      <rect x="246" y="146" width="128" height="12" rx="6" fill="#fff" stroke="#E0DAD2" stroke-width="1"/>
      <rect x="246" y="146" width="128" height="4" rx="2" fill="${T}"/>
      <rect x="258" y="158" width="5" height="36" rx="2" fill="#E3DBD2"/>
      <rect x="356" y="158" width="5" height="36" rx="2" fill="#E3DBD2"/>
      <rect x="${signX}" y="${signY}" width="${signW}" height="${signH}" rx="11" fill="${T}"/>
      ${stationText}
      ${train(62, 154, spec.system)}
      ${badges}
    </svg>`;

    return `<div class="hood-illo">${svg}</div>`;
  }

  global.areaIlloHTML = areaIlloHTML;
  global.AREA_ILLO_SPEC = ILLO;
})(window);
