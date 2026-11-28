/* MoveCondo home/search map: Airbnb-style floating "แผนที่" pill + full-screen map + card map-pin tiles.
   Pins = condo PROJECTS only (never units), built from rooms that are currently available
   (rented rooms are not in LISTINGS) and verified coordinates in data/project-coords.json.
   Reuses the lazy Leaflet loader exported by project-map.js. */
(function () {
  "use strict";
  var script = document.currentScript;
  var SRC = script ? script.src : "";
  var VER = (SRC.match(/\?v=([^&]+)/) || [])[1] || "1";
  var B = function () { return window.MCMapBridge; };
  var ML = function () { return window.MoveCondoLeaflet; };
  var T = {
    th: { map: "แผนที่", list: "รายการ", rooms: "ห้องว่าง", mo: "/เดือน", proj: "โครงการ", view: "ดูโครงการ", none: "ยังไม่มีพิกัดโครงการสำหรับผลการค้นหานี้", fail: "โหลดแผนที่ไม่สำเร็จ", close: "ปิดแผนที่", label: "แผนที่โครงการ" },
    en: { map: "Map", list: "List", rooms: "available", mo: "/mo", proj: "projects", view: "View project", none: "No mapped projects for this search yet", fail: "Couldn't load the map", close: "Close map", label: "Project map" }
  };
  function en() { return (window.MoveCondoLeaflet && ML().isEn()) || document.documentElement.lang === "en"; }
  function t(k) { return (en() ? T.en : T.th)[k]; }

  var ICON_MAP = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"/><path d="M9 4v13M15 7v13"/></svg>';
  var ICON_LIST = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>';

  var coords = null, coordsP = null, fab = null, ov = null, map = null, markers = {}, openState = false, selected = null, pushed = false, ignorePop = 0;

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
      var ok = !!coords[els[i].getAttribute("data-map-project")];
      if (ok) els[i].setAttribute("data-ok", ""); else els[i].removeAttribute("data-ok");
    }
  }
  var mq = 0;
  function scheduleMark() { if (mq) return; mq = requestAnimationFrame(function () { mq = 0; markCards(); }); }

  function groupRows(rows) {
    var g = {}, order = [];
    rows.forEach(function (l) {
      if (!coords || !coords[l.project]) return;
      var p = g[l.project];
      if (!p) { p = g[l.project] = { name: l.project, n: 0, min: null, max: null, area: l.area, photo: B().photo(l), href: B().href(l.project), lat: coords[l.project].lat, lng: coords[l.project].lng }; order.push(p); }
      p.n++; p.min = p.min == null ? l.price : Math.min(p.min, l.price); p.max = p.max == null ? l.price : Math.max(p.max, l.price);
    });
    return order;
  }
  function k(n) { var v = Math.round(n / 100) / 10; return "฿" + (v % 1 ? v.toFixed(1) : v.toFixed(0)) + "k"; }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }

  function buildFab() {
    if (fab) return;
    fab = document.createElement("button");
    fab.type = "button"; fab.className = "mc-fab"; fab.hidden = true;
    fab.addEventListener("click", function () { openState ? close() : open(); });
    document.body.appendChild(fab);
    setFab(false);
  }
  function setFab(isOpen) {
    fab.innerHTML = (isOpen ? ICON_LIST : ICON_MAP) + "<span></span>";
    fab.lastChild.textContent = isOpen ? t("list") : t("map");
    fab.setAttribute("aria-label", isOpen ? t("list") : t("map"));
  }

  function sync() {
    buildFab();
    var r = B() && B().route();
    var show = r === "home" || r === "search";
    fab.hidden = !show;
    document.documentElement.classList.toggle("mc-has-fab", show);
    if (!show && openState) close(true);
    loadCoords(); scheduleMark();
  }

  function buildOverlay() {
    if (ov) return;
    ov = document.createElement("div");
    ov.className = "mcmap"; ov.id = "mcMap"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = '<div class="mcmap-canvas"></div><div class="mcmap-chip" hidden></div><a class="mcmap-card" hidden><img alt="" width="72" height="72"><span class="mcmap-card-b"><b></b><span class="mcmap-card-s"></span><span class="mcmap-card-a"></span></span><span class="mcmap-card-go" aria-hidden="true">›</span></a>';
    document.body.appendChild(ov);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openState) close(); });
  }

  function select(name, pan) {
    var prev = selected && markers[selected.name];
    if (prev && prev.getElement()) prev.getElement().classList.remove("sel");
    var card = ov.querySelector(".mcmap-card");
    if (!name) { selected = null; card.hidden = true; return; }
    var p = markers[name] && markers[name].__p; if (!p) return;
    selected = p;
    if (markers[name].getElement()) markers[name].getElement().classList.add("sel");
    markers[name].setZIndexOffset(1000);
    card.href = p.href + (en() ? "?lang=en" : "");
    var img = card.querySelector("img");
    if (p.photo) { img.src = p.photo; img.style.visibility = "visible"; } else img.style.visibility = "hidden";
    card.querySelector("b").textContent = p.name;
    card.querySelector(".mcmap-card-s").textContent = p.n + " " + t("rooms") + " · ฿" + fmt(p.min) + (p.max !== p.min ? "–" + fmt(p.max) : "") + t("mo");
    card.querySelector(".mcmap-card-a").textContent = p.area || "";
    card.hidden = false;
    if (pan) map.setView([p.lat, p.lng], Math.max(map.getZoom(), 16), { animate: true });
  }

  function open(focusName) {
    if (openState && !focusName) return;
    buildOverlay();
    var bridge = B(); if (!bridge || !ML()) return;
    openState = true;
    document.documentElement.classList.add("mcmap-open");
    ov.hidden = false; setFab(true);
    try { history.pushState({ mcmap: 1 }, "", location.href); pushed = true; } catch (e) { pushed = false; }
    Promise.all([loadCoords(), ML().load()]).then(function (res) {
      if (!openState) return;
      var L = res[1];
      var rows = bridge.rows();
      var pins = groupRows(rows);
      if (focusName && !pins.some(function (p) { return p.name === focusName; })) {
        pins = pins.concat(groupRows(bridge.all().filter(function (l) { return l.project === focusName; })));
      }
      var canvas = ov.querySelector(".mcmap-canvas");
      if (map) { map.remove(); map = null; canvas.innerHTML = ""; }
      markers = {};
      map = ML().baseMap(L, canvas, true);
      map.setView([13.735, 100.57], 12);
      var chip = ov.querySelector(".mcmap-chip");
      var pts = [];
      pins.forEach(function (p) {
        var m = L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: "mcmap-ico", html: '<span class="mcmap-pill">' + k(p.min) + "</span>", iconSize: [64, 30], iconAnchor: [32, 15] }),
          title: p.name, alt: p.name, keyboard: true
        }).addTo(map);
        m.__p = p; markers[p.name] = m;
        m.on("click", function () { select(p.name, false); });
        pts.push([p.lat, p.lng]);
      });
      map.on("click", function () { select(null); });
      var setCompact = function () { ov.classList.toggle("compact", map.getZoom() < 14); };
      map.on("zoomend", setCompact);
      chip.hidden = false;
      chip.textContent = pins.length ? pins.length + " " + t("proj") : t("none");
      setTimeout(function () {
        map.invalidateSize();
        if (pts.length > 1) map.fitBounds(pts, { padding: [48, 48], maxZoom: 15 });
        else if (pts.length === 1) map.setView(pts[0], 15);
        setCompact();
        if (focusName) select(focusName, true); else select(null);
      }, 60);
      ov.__count = pins.length;
    }).catch(function () {
      var chip = ov.querySelector(".mcmap-chip"); chip.hidden = false; chip.textContent = t("fail");
    });
  }

  function close(fromRoute) {
    if (!openState) return;
    openState = false;
    document.documentElement.classList.remove("mcmap-open");
    if (ov) ov.hidden = true;
    if (fab) setFab(false);
    if (pushed) { pushed = false; if (!fromRoute && history.state && history.state.mcmap) { ignorePop++; history.back(); } }
  }
  window.addEventListener("popstate", function () { if (ignorePop > 0) { ignorePop--; return; } if (openState) { pushed = false; close(true); } });

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".card-map");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var name = b.getAttribute("data-map-project");
    if (openState) { select(name, true); return; }
    open(name);
  }, true);

  function boot() {
    sync();
    var host = document.getElementById("view-home");
    if (host && "MutationObserver" in window) new MutationObserver(scheduleMark).observe(host, { childList: true, subtree: true });
  }
  window.MoveCondoMapFab = { sync: sync, open: open, close: close, isOpen: function () { return openState; }, pinCount: function () { return ov ? ov.__count : null; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
