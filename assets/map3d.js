/* MoveCondo reusable 3D neighborhood map (MapLibre + OpenFreeMap positron).
 *
 * Area pages mount with data-map3d + data-src pointing at /data/maps/<slug>.json
 * (station + real nearby places, no fictional condos).
 *
 * When real rooms arrive at /workspace/movecondo-data/rooms-real.json, build a
 * payload with { condo: { name, lat, lng, approx }, stations, places } and
 * mount the same component on the room page:
 *   MoveCondoMap.mount(el, payload)
 * Condo markers use terracotta #B9532F and may be labelled "ตำแหน่งโดยประมาณ".
 */
(function () {
  const STYLE = "https://tiles.openfreemap.org/styles/positron";
  const ML_JS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
  const ML_CSS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
  const CAT_TH = { shopping: "ช็อปปิ้ง", cafe: "คาเฟ่", restaurant: "ร้านอาหาร", bar: "บาร์", park: "สวน", spa: "สปา" };
  const STATION_COLOR = "#3A3A3A";
  const CONDO_COLOR = "#B9532F";
  const PLACE_FILL = "#ffffff";

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) { return false; }
  }

  function loadMapLibre() {
    if (window.maplibregl) return Promise.resolve();
    if (window.__mcMapLibreP) return window.__mcMapLibreP;
    window.__mcMapLibreP = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-mc-maplibre]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = ML_CSS;
        css.setAttribute("data-mc-maplibre", "1");
        document.head.appendChild(css);
      }
      const s = document.createElement("script");
      s.src = ML_JS;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("maplibre failed to load"));
      document.head.appendChild(s);
    });
    return window.__mcMapLibreP;
  }

  function haversine(aLat, aLng, bLat, bLng) {
    const R = 6371000, toR = Math.PI / 180;
    const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function fmtMeters(m) {
    if (m < 1000) return "ประมาณ " + Math.round(m / 10) * 10 + " เมตร";
    return "ประมาณ " + (m / 1000).toFixed(1).replace(/\.0$/, "") + " กม.";
  }

  function mapsHref(p) {
    if (p.lat != null) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.lat + "," + p.lng);
    if (p.mapsQuery) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.mapsQuery);
    return null;
  }

  function fallbackHTML(data, reason) {
    const rows = (data.stations || []).map((s) => "<li><strong>" + s.name + "</strong> — สถานี</li>")
      .concat((data.places || []).map((p) => {
        const href = mapsHref(p);
        return "<li><strong>" + p.name + "</strong> — " + (p.category || "") +
          (p.minutes ? " · ประมาณ " + p.minutes + " นาทีจากสถานี" : "") +
          (href ? ' (<a href="' + href + '" target="_blank" rel="noopener noreferrer">แผนที่</a>)' : "") +
          "</li>";
      })).join("");
    return '<div class="map3d-fallback"><p>' + (reason || "เบราว์เซอร์นี้ไม่รองรับแผนที่ 3 มิติ") +
      " ดูรายการสถานีและร้านดังด้านล่างได้เลย</p><ul>" + rows + "</ul></div>";
  }

  // Hide clutter once Positron loads. Keep major roads, water, rail, and a few place labels.
  const HIDE_LAYER_IDS = [
    "building",
    "highway_path",
    "highway-name-path",
    "highway-name-minor",
    "highway-shield-non-us",
    "highway-shield-us-interstate",
    "road_shield_us",
    "aeroway-taxiway",
    "aeroway-runway-casing",
    "aeroway-area",
    "aeroway-runway",
    "airport",
    "label_other",
    "label_village",
    "label_state",
    "waterway_line_label",
    "landcover_ice_shelf",
    "landcover_glacier"
  ];

  function minifyStyle(map) {
    HIDE_LAYER_IDS.forEach((id) => {
      if (map.getLayer(id)) {
        try { map.setLayoutProperty(id, "visibility", "none"); } catch (e) {}
      }
    });
    // Thin residential sois so major roads stay dominant.
    if (map.getLayer("highway_minor")) {
      try { map.setPaintProperty("highway_minor", "line-opacity", 0.35); } catch (e) {}
    }
  }

  function ensureBuildings(map) {
    if (map.getLayer("building-3d")) return;
    if (!map.getSource("openmaptiles")) return;
    if (map.getLayer("building")) {
      try { map.setLayoutProperty("building", "visibility", "none"); } catch (e) {}
    }
    // Keep labels above the extrusion.
    const before = map.getLayer("waterway_line_label") ? "waterway_line_label"
      : (map.getLayer("boundary_3") ? "boundary_3" : undefined);
    const layer = {
      id: "building-3d",
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      filter: ["!", ["has", "hide_3d"]],
      paint: {
        "fill-extrusion-color": "#e9e6e2",
        "fill-extrusion-height": ["case", ["==", ["typeof", ["coalesce", ["get", "render_height"], ["get", "height"]]], "number"], ["max", 0, ["coalesce", ["get", "render_height"], ["get", "height"], 8]], 8],
        "fill-extrusion-base": ["case", ["==", ["typeof", ["coalesce", ["get", "render_min_height"], ["get", "min_height"]]], "number"], ["max", 0, ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0]], 0],
        "fill-extrusion-opacity": 0.42
      }
    };
    if (before) map.addLayer(layer, before);
    else map.addLayer(layer);
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function originOf(data) {
    if (data.condo && data.condo.lat != null) return { kind: "condo", ...data.condo };
    const s = (data.stations || []).find((x) => x.primary) || (data.stations || [])[0];
    return s ? { kind: "station", name: s.name, lat: s.lat, lng: s.lng } : null;
  }

  function mount(shell, data) {
    if (!hasWebGL()) {
      shell.innerHTML = fallbackHTML(data);
      return null;
    }

    const view = {
      center: [data.center.lng, data.center.lat],
      zoom: data.zoom || 16.2,
      pitch: data.pitch == null ? 60 : data.pitch,
      bearing: data.bearing == null ? -18 : data.bearing
    };

    shell.innerHTML = "";
    const toolbar = el("div", "map3d-toolbar");
    const chips = el("div", "map3d-chips");
    const cats = [];
    (data.places || []).forEach((p) => {
      if (p.lat == null) return;
      if (cats.indexOf(p.categoryKey) < 0) cats.push(p.categoryKey);
    });
    const active = new Set(cats);
    cats.forEach((k) => {
      const b = el("button", "map3d-chip on");
      b.type = "button";
      b.setAttribute("aria-pressed", "true");
      b.dataset.cat = k;
      const sw = el("span", "swatch");
      b.appendChild(sw);
      b.appendChild(document.createTextNode(CAT_TH[k] || k));
      chips.appendChild(b);
    });
    const reset = el("button", "map3d-reset");
    reset.type = "button";
    reset.textContent = "รีเซ็ตมุมมอง";
    toolbar.appendChild(chips);
    toolbar.appendChild(reset);

    const canvas = el("div", "map3d-canvas");
    canvas.setAttribute("role", "region");
    canvas.setAttribute("aria-label", "แผนที่ 3 มิติย่าน" + (data.area || ""));
    const legend = el("div", "map3d-legend");
    shell.appendChild(toolbar);
    shell.appendChild(canvas);
    shell.appendChild(legend);

    const map = new maplibregl.Map({
      container: canvas,
      style: STYLE,
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      maxPitch: 80,
      attributionControl: false,
      cooperativeGestures: true,
      locale: { "CooperativeGesturesHandler.WindowsHelpText": "ใช้ Ctrl + เลื่อนเพื่อซูมแผนที่", "CooperativeGesturesHandler.MacHelpText": "ใช้ ⌘ + เลื่อนเพื่อซูมแผนที่" }
    });
    map.addControl(new maplibregl.AttributionControl({
      compact: true,
      customAttribution: data.attribution || "OpenFreeMap © OpenMapTiles · ข้อมูลจาก OpenStreetMap"
    }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: true, showCompass: true }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    const markers = [];
    let popup = new maplibregl.Popup({ offset: 18, closeButton: true });
    let walkSrcReady = false;

    function setWalk(to) {
      const from = originOf(data);
      if (!from || !to || to.lat == null) {
        if (walkSrcReady) map.getSource("mc-walk").setData({ type: "FeatureCollection", features: [] });
        return;
      }
      const gj = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: { type: "LineString", coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
          properties: {}
        }]
      };
      if (walkSrcReady) map.getSource("mc-walk").setData(gj);
    }

    function openPlace(p, markerEl) {
      markers.forEach((m) => m.el.classList.toggle("on", m.el === markerEl));
      const from = originOf(data);
      let dist = "";
      if (from && p.lat != null) dist = fmtMeters(haversine(from.lat, from.lng, p.lat, p.lng));
      let walk = "";
      if (p.walkMinEst != null) walk = "ประมาณ " + Math.round(p.walkMinEst) + " นาที";
      else if (p.minutes) walk = "ใช้เวลาประมาณ " + p.minutes + " นาทีจากสถานี (" + (p.mode || "เดิน") + ")";
      let rating = "";
      if (p.rating != null) {
        const reviews = p.reviewCount != null ? " จาก " + Number(p.reviewCount).toLocaleString("th-TH") + " รีวิว" : "";
        rating = p.rating + reviews + " · คะแนนจาก Google (12 พ.ย. 2569)";
      }
      const href = mapsHref(p);
      const approx = p.approx && p.approx_note ? '<div class="approx">' + p.approx_note + "</div>" : (p.approx ? '<div class="approx">ตำแหน่งโดยประมาณ</div>' : "");
      popup.setLngLat([p.lng, p.lat]).setHTML(
        '<div class="mc-popup"><b>' + p.name + "</b><div class=\"meta\">" + (p.category || "") +
        (walk ? "<br>" + walk : "") + (dist ? "<br>" + dist + " เส้นตรงจาก" + (from.kind === "condo" ? "คอนโด" : "สถานี") : "") +
        (rating ? "<br>" + rating : "") +
        "</div>" + approx +
        (href ? '<div style="margin-top:6px"><a href="' + href + '" target="_blank" rel="noopener noreferrer">เปิดใน Google Maps</a></div>' : "") +
        "</div>"
      ).addTo(map);
      setWalk(p);
    }

    function addMarker(item, kind) {
      if (item.lat == null || item.lng == null) return;
      const wrap = el("button", "mc-marker " + kind + (kind === "station" && item.system === "MRT" ? " mrt" : ""));
      wrap.type = "button";
      wrap.setAttribute("aria-label", item.name);
      wrap.appendChild(el("div", "pin"));
      const lbl = el("span", "lbl");
      lbl.textContent = item.name;
      wrap.appendChild(lbl);
      const mk = new maplibregl.Marker({ element: wrap, anchor: "center" }).setLngLat([item.lng, item.lat]).addTo(map);
      wrap.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (kind === "station") {
          markers.forEach((m) => m.el.classList.remove("on"));
          wrap.classList.add("on");
          const href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(item.lat + "," + item.lng);
          popup.setLngLat([item.lng, item.lat]).setHTML(
            '<div class="mc-popup"><b>' + item.name + "</b><div class=\"meta\">สถานี" + (item.line_th ? " · " + item.line_th : "") +
            '</div><div style="margin-top:6px"><a href="' + href + '" target="_blank" rel="noopener noreferrer">เปิดใน Google Maps</a></div></div>'
          ).addTo(map);
          setWalk(null);
        } else if (kind === "condo") {
          wrap.classList.add("on");
          popup.setLngLat([item.lng, item.lat]).setHTML(
            '<div class="mc-popup"><b>' + item.name + "</b><div class=\"meta\">คอนโด" +
            (item.approx ? "</div><div class=\"approx\">ตำแหน่งโดยประมาณ</div>" : "</div>") + "</div>"
          ).addTo(map);
        } else {
          openPlace(item, wrap);
        }
      });
      markers.push({ el: wrap, item, kind, marker: mk });
    }

    function applyFilter() {
      markers.forEach((m) => {
        if (m.kind === "place") {
          const on = active.has(m.item.categoryKey);
          m.el.style.display = on ? "" : "none";
        }
      });
    }

    function renderLegend() {
      const bits = [];
      if (data.condo && data.condo.lat != null) bits.push('<div><i class="condo" style="background:' + CONDO_COLOR + '"></i>คอนโด</div>');
      bits.push('<div><i class="station" style="background:' + STATION_COLOR + '"></i>สถานี</div>');
      if (cats.length) bits.push('<div><i class="place"></i>ร้านดัง</div>');
      legend.innerHTML = bits.join("");
    }
    renderLegend();

    shell.__mcMap = map;
    map.on("load", () => {
      minifyStyle(map);
      ensureBuildings(map);
      map.addSource("mc-walk", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "mc-walk",
        type: "line",
        source: "mc-walk",
        paint: { "line-color": "#5A5550", "line-width": 2.5, "line-dasharray": [2, 1.4], "line-opacity": 0.7 }
      });
      walkSrcReady = true;

      (data.stations || []).forEach((s) => addMarker(s, "station"));
      if (data.condo && data.condo.lat != null) addMarker(data.condo, "condo");
      (data.places || []).forEach((p) => addMarker(p, "place"));
      applyFilter();
      map.resize();
    });

    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".map3d-chip");
      if (!b) return;
      const k = b.dataset.cat;
      if (active.has(k) && active.size === 1) return;
      if (active.has(k)) active.delete(k); else active.add(k);
      b.classList.toggle("on", active.has(k));
      b.setAttribute("aria-pressed", active.has(k) ? "true" : "false");
      applyFilter();
    });
    reset.addEventListener("click", () => {
      map.easeTo({ center: view.center, zoom: view.zoom, pitch: view.pitch, bearing: view.bearing, duration: 800 });
      popup.remove();
      setWalk(null);
      markers.forEach((m) => m.el.classList.remove("on"));
    });

    return map;
  }

  async function boot(shell) {
    const src = shell.getAttribute("data-src");
    let data;
    try {
      if (src) {
        const res = await fetch(src, { credentials: "same-origin" });
        if (!res.ok) throw new Error("map data " + res.status);
        data = await res.json();
      } else if (window.__MOVECONDO_MAP_DATA) {
        data = window.__MOVECONDO_MAP_DATA;
      } else {
        throw new Error("no map data");
      }
    } catch (err) {
      shell.innerHTML = '<div class="map3d-fallback"><p>โหลดข้อมูลแผนที่ไม่สำเร็จ</p></div>';
      return;
    }
    try {
      await loadMapLibre();
      mount(shell, data);
    } catch (err) {
      shell.innerHTML = fallbackHTML(data, "โหลดไลบรารีแผนที่ไม่สำเร็จ");
    }
  }

  function observe(shell) {
    if (!("IntersectionObserver" in window)) { boot(shell); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { io.disconnect(); boot(shell); }
      });
    }, { rootMargin: "240px" });
    io.observe(shell);
  }

  function auto() {
    document.querySelectorAll("[data-map3d]").forEach((el) => {
      if (el.__mcBooted) return;
      el.__mcBooted = true;
      observe(el);
    });
  }

  window.MoveCondoMap = { mount, boot, auto };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto);
  else auto();
})();
