/* MoveCondo home/search map (v3): floating "แผนที่" pill -> full-screen map with header, clustered pins,
   room-card carousel, filter + list bar, locate-me. Reuses the lazy Leaflet loader from project-map.js.
   Pins = condo PROJECTS only; cards = rooms currently available (rented rooms are not in LISTINGS).
   Never shows room codes, owner info, LINE ID text or pets wording. */
(function () {
  "use strict";
  var script = document.currentScript;
  var SRC = script ? script.src : "";
  var VER = (SRC.match(/\?v=([^&]+)/) || [])[1] || "1";
  var VENDOR = SRC.replace(/map-fab\.js.*$/, "") + "vendor/markercluster/";
  var B = function () { return window.MCMapBridge; };
  var ML = function () { return window.MoveCondoLeaflet; };
  var T = {
    th: { map: "แผนที่", list: "รายการ", filter: "ตัวกรอง", rooms: "ห้อง", mo: "/เดือน", sale: "ขาย", none: "ไม่มีห้องในพื้นที่นี้ ลองเลื่อนหรือซูมออก", empty: "ยังไม่มีพิกัดโครงการสำหรับผลการค้นหานี้", fail: "โหลดแผนที่ไม่สำเร็จ", back: "กลับ", locate: "ตำแหน่งของฉัน", locFail: "ไม่สามารถระบุตำแหน่งของคุณได้", ttl: "แผนที่ปักหมุดคอนโด" },
    en: { map: "Map", list: "List", filter: "Filters", rooms: "rooms", mo: "/mo", sale: "Sale", none: "No rooms in this area. Try moving or zooming out.", empty: "No mapped projects for this search yet", fail: "Couldn't load the map", back: "Back", locate: "My location", locFail: "Couldn't get your location", ttl: "Condo map" }
  };
  function en() { return (window.MoveCondoLeaflet && ML().isEn()) || document.documentElement.lang === "en"; }
  function t(k) { return (en() ? T.en : T.th)[k]; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  var I = {
    map: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"/><path d="M9 4v13M15 7v13"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    locate: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22"/></svg>'
  };

  var coords = null, coordsP = null, fab = null, ov = null, map = null, group = null, L = null;
  var markers = {}, pins = [], selected = null, openState = false, pushed = false, ignorePop = 0;
  var lastHash = "", progUntil = 0, railIgnore = 0, rafR = 0, rt = 0, st = 0, meMarker = null, toastT = 0;

  function loadCoords() {
    if (coordsP) return coordsP;
    var base = (B() && B().base) || "/";
    coordsP = fetch(base + "data/project-coords.json?v=" + VER).then(function (r) { return r.json(); }).then(function (d) {
      coords = d.projects || {}; markCards(); return coords;
    }).catch(function () { coordsP = null; coords = {}; return coords; });
    return coordsP;
  }
  function markCards() {
    if (!coords) return;
    var els = document.querySelectorAll(".card-map[data-map-project]");
    for (var i = 0; i < els.length; i++) {
      if (coords[els[i].getAttribute("data-map-project")]) els[i].setAttribute("data-ok", ""); else els[i].removeAttribute("data-ok");
    }
  }
  var mq = 0;
  function scheduleMark() { if (mq) return; mq = requestAnimationFrame(function () { mq = 0; markCards(); }); }

  function loadCluster() {
    if (window.L && L.markerClusterGroup) return Promise.resolve();
    return new Promise(function (res, rej) {
      var css = document.createElement("link"); css.rel = "stylesheet"; css.href = VENDOR + "MarkerCluster.css?v=1.5.3"; document.head.appendChild(css);
      var s = document.createElement("script"); s.src = VENDOR + "leaflet.markercluster.js?v=1.5.3"; s.async = true;
      s.onload = res; s.onerror = function () { rej(new Error("cluster")); }; document.head.appendChild(s);
    });
  }

  /* ---------- floating pill (home / search) ---------- */
  function buildFab() {
    if (fab) return;
    fab = document.createElement("button");
    fab.type = "button"; fab.className = "mc-fab"; fab.hidden = true;
    fab.addEventListener("click", function () { open(); });
    document.body.appendChild(fab);
    fab.innerHTML = I.map + "<span></span>";
    fab.lastChild.textContent = t("map"); fab.setAttribute("aria-label", t("map"));
  }
  function sync() {
    buildFab();
    var r = B() && B().route();
    var show = r === "home" || r === "search";
    fab.hidden = !show;
    document.documentElement.classList.toggle("mc-has-fab", show);
    if (openState) { if (!show) close(true); else refresh(); }
    loadCoords(); scheduleMark();
  }

  /* ---------- overlay ---------- */
  function buildOverlay() {
    if (ov) return;
    ov = document.createElement("div");
    ov.className = "mcmap"; ov.id = "mcMap"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML =
      '<div class="mcmap-canvas"></div>' +
      '<header class="mcmap-head"><button type="button" class="mcmap-back" data-mm-list></button>' +
      '<h2 class="mcmap-title"><span class="mcmap-t"></span> <small class="mcmap-count"></small></h2>' +
      '<a class="mcmap-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a></header>' +
      '<button type="button" class="mcmap-locate"></button>' +
      '<div class="mcmap-toast" hidden></div>' +
      '<div class="mcmap-rail" role="list"></div>' +
      '<div class="mcmap-bar"><button type="button" class="mcmap-bb" data-mm-filter></button><button type="button" class="mcmap-bb" data-mm-list></button></div>';
    document.body.appendChild(ov);
    ov.querySelector(".mcmap-back").innerHTML = I.back;
    ov.querySelector(".mcmap-locate").innerHTML = I.locate;
    ov.querySelector(".mcmap-locate").addEventListener("click", locate);
    ov.querySelector(".mcmap-rail").addEventListener("scroll", onRailScroll, { passive: true });
    ov.querySelector(".mcmap-rail").addEventListener("click", function (e) {
      var c = e.target.closest(".mcmap-rc"); if (!c) return;
      // tap on a card that is not centred yet only opens the room page (like a normal link)
    });
    ov.addEventListener("click", function (e) {
      if (e.target.closest("[data-mm-list]")) { e.preventDefault(); close(); }
      else if (e.target.closest("[data-mm-filter]")) { e.preventDefault(); if (B()) B().openFilters(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openState && !document.documentElement.classList.contains("fs-open")) close();
    });
  }
  function setLabels() {
    ov.querySelector(".mcmap-t").textContent = t("map");
    ov.querySelector(".mcmap-back").setAttribute("aria-label", t("back"));
    ov.querySelector(".mcmap-locate").setAttribute("aria-label", t("locate"));
    ov.querySelector(".mcmap-locate").title = t("locate");
    ov.setAttribute("aria-label", t("ttl"));
    var fb = ov.querySelector("[data-mm-filter]");
    var n = B() ? B().fcount() : 0;
    fb.innerHTML = I.sliders + "<span>" + esc(t("filter")) + "</span>" + (n ? "<b>" + n + "</b>" : "");
    ov.querySelectorAll("[data-mm-list]")[1].innerHTML = I.list + "<span>" + esc(t("list")) + "</span>";
  }
  function toast(msg) {
    var el = ov.querySelector(".mcmap-toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 3200);
  }

  /* ---------- data ---------- */
  function buildPins(focusName) {
    var bridge = B(), g = {}, out = [];
    function add(l) {
      if (!coords || !coords[l.project]) return;
      var p = g[l.project];
      if (!p) { p = g[l.project] = { name: l.project, rooms: [], lat: coords[l.project].lat, lng: coords[l.project].lng }; out.push(p); }
      p.rooms.push(l);
    }
    bridge.rows().forEach(add);
    if (focusName && !g[focusName]) bridge.all().filter(function (l) { return l.project === focusName; }).forEach(add);
    return out;
  }
  function roomCount() { return pins.reduce(function (a, p) { return a + p.rooms.length; }, 0); }

  function pillIcon(p, sel) {
    return L.divIcon({ className: "mcmap-ico mcmap-ico-pill" + (sel ? " sel" : ""),
      html: '<span class="mcmap-pill"><i></i><span>' + esc(trunc(p.name, 13)) + "</span></span>", iconSize: [0, 0] });
  }
  function clusterIcon(c) {
    var n = 0; c.getAllChildMarkers().forEach(function (m) { n += m.__p.rooms.length; });
    return L.divIcon({ className: "mcmap-ico", html: '<span class="mcmap-cl">' + n + "</span>", iconSize: [44, 44] });
  }

  function drawPins(fit) {
    if (group) { map.removeLayer(group); group = null; }
    markers = {};
    group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 62, spiderfyOnMaxZoom: true, zoomToBoundsOnClick: true, iconCreateFunction: clusterIcon });
    var pts = [];
    pins.forEach(function (p) {
      var m = L.marker([p.lat, p.lng], { icon: pillIcon(p, selected === p.name), title: p.name, alt: p.name, keyboard: true, zIndexOffset: selected === p.name ? 1000 : 0 });
      m.__p = p; markers[p.name] = m;
      m.on("click", function () { selectProject(p.name, { scroll: true }); });
      group.addLayer(m); pts.push([p.lat, p.lng]);
    });
    map.addLayer(group);
    if (fit && pts.length) { prog(); if (pts.length > 1) map.fitBounds(pts, { padding: [56, 56], maxZoom: 15 }); else map.setView(pts[0], 15); }
    ov.querySelector(".mcmap-count").textContent = "(" + roomCount() + " " + t("rooms") + ")";
    return pts;
  }
  function prog() { progUntil = Date.now() + 1100; }

  /* ---------- rail ---------- */
  function cardHTML(l) {
    var c = B().card(l);
    var price = '<span class="mcmap-rc-p">฿' + esc(c.price) + '<small> ' + esc(t("mo")) + "</small></span>";
    var sale = c.salePrice ? '<span class="mcmap-rc-s">' + esc(t("sale")) + " ฿" + esc(c.salePrice) + "</span>" : "";
    return '<a class="mcmap-rc" role="listitem" data-proj="' + esc(l.project) + '" href="' + esc(c.href + (en() ? "?lang=en" : "")) + '">' +
      '<span class="mcmap-rc-img">' + (c.photo ? '<img src="' + esc(c.photo) + '" alt="" width="120" height="120" loading="lazy" decoding="async" draggable="false">' : "") + "</span>" +
      '<span class="mcmap-rc-b"><span class="mcmap-rc-n">' + esc(l.project) + "</span>" + c.badge +
      '<span class="mcmap-rc-m">' + esc(c.meta) + "</span>" + price + sale + "</span></a>";
  }
  function visibleRooms(force) {
    var b = map.getBounds(), cen = map.getCenter(), list = [];
    pins.forEach(function (p) {
      if (!b.contains([p.lat, p.lng])) return;
      var d = Math.pow(p.lat - cen.lat, 2) + Math.pow(p.lng - cen.lng, 2);
      list.push({ p: p, d: d });
    });
    list.sort(function (a, c) { return a.d - c.d; });
    var rooms = [], cap = 80, names = {};
    list.forEach(function (x) { names[x.p.name] = 1; x.p.rooms.forEach(function (l) { if (rooms.length < cap) rooms.push(l); }); });
    if (force && markers[force]) {
      var fp = markers[force].__p;
      rooms = fp.rooms.concat(rooms.filter(function (l) { return l.project !== force; }));
    }
    return rooms;
  }
  function renderRail(force) {
    var rail = ov.querySelector(".mcmap-rail");
    var rooms = visibleRooms(force);
    railIgnore = Date.now() + 500;
    if (!rooms.length) { rail.innerHTML = '<div class="mcmap-rc mcmap-rc-empty">' + esc(pins.length ? t("none") : t("empty")) + "</div>"; return; }
    rail.innerHTML = rooms.map(cardHTML).join("");
    rail.scrollLeft = 0;
    markActive();
  }
  function markActive() {
    var rail = ov.querySelector(".mcmap-rail");
    var cs = rail.querySelectorAll(".mcmap-rc[data-proj]"), first = null;
    for (var i = 0; i < cs.length; i++) {
      var on = selected && cs[i].getAttribute("data-proj") === selected;
      cs[i].classList.toggle("on", !!on);
    }
  }
  function onRailScroll() {
    if (Date.now() < railIgnore) return;
    clearTimeout(st);
    st = setTimeout(function () {
      var rail = ov.querySelector(".mcmap-rail"), cs = rail.querySelectorAll(".mcmap-rc[data-proj]");
      if (!cs.length) return;
      var rr = rail.getBoundingClientRect(), pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0, best = null, bd = 1e9;
      for (var i = 0; i < cs.length; i++) {
        var d = Math.abs(cs[i].getBoundingClientRect().left - rr.left - pad);
        if (d < bd) { bd = d; best = cs[i]; }
      }
      if (!best) return;
      var name = best.getAttribute("data-proj");
      if (name !== selected || !best.classList.contains("on")) selectProject(name, { fromRail: true, card: best });
    }, 140);
  }

  /* ---------- selection ---------- */
  function setSel(name) {
    var prev = selected; selected = name;
    if (prev && markers[prev]) { markers[prev].setIcon(pillIcon(markers[prev].__p, false)); markers[prev].setZIndexOffset(0); }
    if (name && markers[name]) { markers[name].setIcon(pillIcon(markers[name].__p, true)); markers[name].setZIndexOffset(1000); }
  }
  function ensureVisible(name) {
    var m = markers[name]; if (!m || !group) return;
    if (group.getVisibleParent(m) !== m) { prog(); group.zoomToShowLayer(m, function () { setSel(name); }); }
    else if (!map.getBounds().pad(-0.1).contains(m.getLatLng())) { prog(); map.panTo(m.getLatLng()); }
  }
  function selectProject(name, o) {
    o = o || {};
    if (!markers[name]) return;
    setSel(name);
    ensureVisible(name);
    var rail = ov.querySelector(".mcmap-rail");
    if (!o.fromRail) {
      var cs = rail.querySelectorAll(".mcmap-rc[data-proj]"), idx = -1;
      for (var i = 0; i < cs.length; i++) if (cs[i].getAttribute("data-proj") === name) { idx = i; break; }
      railIgnore = Date.now() + 900;
      if (idx < 0 || idx > 3) { renderRail(name); rail.scrollLeft = 0; }
      else {
        var pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
        rail.scrollTo({ left: cs[idx].offsetLeft - pad, behavior: "smooth" });
      }
    }
    markActive();
  }

  /* ---------- open / close / refresh ---------- */
  function open(focusName) {
    if (openState && !focusName) return;
    buildOverlay();
    if (!B() || !ML()) return;
    var wasOpen = openState;
    openState = true;
    document.documentElement.classList.add("mcmap-open");
    ov.hidden = false; setLabels(); lastHash = location.hash;
    if (!wasOpen) { try { history.pushState({ mcmap: 1 }, "", location.href); pushed = true; } catch (e) { pushed = false; } }
    Promise.all([loadCoords(), ML().load()]).then(function (res) {
      L = res[1];
      return loadCluster();
    }).then(function () {
      if (!openState) return;
      var canvas = ov.querySelector(".mcmap-canvas");
      if (map) { map.remove(); map = null; group = null; canvas.innerHTML = ""; }
      map = ML().baseMap(L, canvas, true);
      map.attributionControl.remove();
      map.setView([13.735, 100.57], 12);
      selected = null;
      pins = buildPins(focusName);
      map.on("moveend", function () {
        if (Date.now() < progUntil) return;
        clearTimeout(rt); rt = setTimeout(function () { renderRail(selected); }, 160);
      });
      map.on("click", function () { });
      setTimeout(function () {
        map.invalidateSize();
        drawPins(true);
        if (!pins.length) toast(t("empty"));
        if (focusName && markers[focusName]) {
          prog(); map.setView([markers[focusName].__p.lat, markers[focusName].__p.lng], 16);
          setTimeout(function () { renderRail(focusName); selectProject(focusName, {}); }, 80);
        } else renderRail(null);
      }, 60);
    }).catch(function () { toast(t("fail")); });
  }
  function refresh() {
    if (!openState || !map || !coords) return;
    if (rafR) return;
    rafR = requestAnimationFrame(function () {
      rafR = 0;
      if (!openState || !map) return;
      setLabels();
      var keep = selected;
      pins = buildPins(null);
      selected = (keep && pins.some(function (p) { return p.name === keep; })) ? keep : null;
      drawPins(true);
      if (!pins.length) toast(t("empty"));
      setTimeout(function () { renderRail(selected); }, 120);
    });
  }
  function close(fromRoute) {
    if (!openState) return;
    openState = false;
    document.documentElement.classList.remove("mcmap-open");
    if (ov) ov.hidden = true;
    if (pushed) { pushed = false; if (!fromRoute && history.state && history.state.mcmap) { ignorePop++; history.back(); } }
  }
  window.addEventListener("popstate", function () {
    if (ignorePop > 0) { ignorePop--; return; }
    if (!openState) return;
    // a forward hash change (filters applied from the map) must not close the map; back/forward away from the map entry does
    if (location.hash !== lastHash && !(history.state && history.state.mcmap)) { lastHash = location.hash; return; }
    pushed = false; close(true);
  });

  function locate() {
    if (!navigator.geolocation) { toast(t("locFail")); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (!map || !openState) return;
      var ll = [pos.coords.latitude, pos.coords.longitude];
      if (meMarker) map.removeLayer(meMarker);
      meMarker = L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1, interactive: false }).addTo(map);
      prog(); map.setView(ll, 15);
      clearTimeout(rt); rt = setTimeout(function () { renderRail(selected); }, 1300);
    }, function () { toast(t("locFail")); }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".card-map");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var name = b.getAttribute("data-map-project");
    if (openState) { selectProject(name, {}); return; }
    open(name);
  }, true);

  function boot() {
    sync();
    var host = document.getElementById("view-home");
    if (host && "MutationObserver" in window) new MutationObserver(scheduleMark).observe(host, { childList: true, subtree: true });
  }
  window.MoveCondoMapFab = { sync: sync, open: open, close: close, refresh: refresh, isOpen: function () { return openState; },
    pinCount: function () { return pins.length; }, roomCount: roomCount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
