/* MoveCondo project maps — Leaflet + OpenStreetMap, lazy-loaded.
   Shows the PROJECT pin only (never a unit). Leaflet is vendored in assets/vendor/leaflet/. */
(function () {
  "use strict";
  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName("script");
    for (var i = s.length - 1; i >= 0; i--) if (/project-map\.js/.test(s[i].src)) return s[i];
  })();
  var SRC = script ? script.src : "";
  var BASE = SRC.replace(/project-map\.js.*$/, "") + "vendor/leaflet/";
  var VER = (SRC.match(/\?v=([^&]+)/) || [])[1] || "1";
  var PIN = '<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 1C8 1 2 7.2 2 15c0 10.4 14 26 14 26s14-15.6 14-26C30 7.2 24 1 16 1z" fill="#B9532F" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15" r="5.2" fill="#fff"/></svg>';
  var STN = '<svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#2b2622" stroke="#fff" stroke-width="2.4"/><circle cx="14" cy="14" r="4.2" fill="#fff"/></svg>';
  var leafletP = null;

  function isEn() {
    return document.documentElement.lang === "en" || /[?&]lang=en\b/.test(location.search);
  }
  var T = {
    th: { rooms: "ห้องว่าง", mo: "/เดือน", view: "ดูโครงการ", station: "สถานี", fail: "โหลดแผนที่ไม่สำเร็จ ลองกด “เปิดใน Google Maps” แทน", project: "โครงการ" },
    en: { rooms: "rooms available", mo: "/mo", view: "View project", station: "Station", fail: "Map could not load. Please use “Open in Google Maps” instead.", project: "Project" }
  };
  function t(k) { return (isEn() ? T.en : T.th)[k]; }

  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (leafletP) return leafletP;
    leafletP = new Promise(function (res, rej) {
      var css = document.createElement("link");
      css.rel = "stylesheet"; css.href = BASE + "leaflet.css?v=1.9.4";
      document.head.appendChild(css);
      var s = document.createElement("script");
      s.src = BASE + "leaflet.js?v=1.9.4"; s.async = true;
      s.onload = function () { window.L ? res(window.L) : rej(new Error("no L")); };
      s.onerror = function () { leafletP = null; rej(new Error("leaflet load")); };
      document.head.appendChild(s);
    });
    return leafletP;
  }

  function baseMap(L, el, full) {
    var touch = L.Browser.mobile || L.Browser.touch;
    var map = L.map(el, {
      scrollWheelZoom: !!full, dragging: full ? true : !touch, tap: false, touchZoom: true,
      zoomControl: true, attributionControl: true, worldCopyJump: false
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);
    if (touch && !full) {
      // single-finger drag keeps the page scrolling; two-finger pinch zooms/pans the map
      var cont = map.getContainer();
      cont.style.touchAction = "pan-y";
      map.touchZoom.enable();
    }
    return map;
  }
  function icon(L, html, w, h, ax, ay, cls) {
    return L.divIcon({ className: "pmap-ico " + (cls || ""), html: html, iconSize: [w, h], iconAnchor: [ax, ay], popupAnchor: [0, -ay + 6] });
  }
  function fail(el) {
    el.innerHTML = "";
    var p = document.createElement("p");
    p.className = "pmap-fail"; p.textContent = t("fail");
    el.appendChild(p);
  }

  function initSingle(el) {
    if (el.__pmap) return; el.__pmap = 1;
    var lat = parseFloat(el.getAttribute("data-lat")), lng = parseFloat(el.getAttribute("data-lng"));
    if (!isFinite(lat) || !isFinite(lng)) return;
    loadLeaflet().then(function (L) {
      el.innerHTML = "";
      var map = baseMap(L, el);
      map.setView([lat, lng], 16);
      L.marker([lat, lng], { icon: icon(L, PIN, 32, 42, 16, 41, "pmap-pin"), keyboard: false, interactive: false }).addTo(map);
      el.__map = map;
      setTimeout(function () { map.invalidateSize(); }, 200);
    }).catch(function () { fail(el); });
  }

  function initMulti(el) {
    if (el.__pmap) return; el.__pmap = 1;
    var data; try { data = JSON.parse(el.getAttribute("data-pins")); } catch (e) { return; }
    var pins = data.pins || [];
    loadLeaflet().then(function (L) {
      el.innerHTML = "";
      var map = baseMap(L, el);
      var pts = [];
      pins.forEach(function (p) {
        var m = L.marker([p.lat, p.lng], { icon: icon(L, PIN, 32, 42, 16, 41, "pmap-pin"), title: p.name, alt: p.name }).addTo(map);
        var box = document.createElement("div"); box.className = "pmap-pop";
        var b = document.createElement("b"); b.textContent = p.name; box.appendChild(b);
        var d = document.createElement("div"); d.className = "pmap-pop-sub";
        d.textContent = p.n + " " + t("rooms") + (p.min ? " · ฿" + Number(p.min).toLocaleString("en-US") + (p.max && p.max !== p.min ? "–" + Number(p.max).toLocaleString("en-US") : "") + t("mo") : "");
        box.appendChild(d);
        var a = document.createElement("a"); a.href = p.url + (isEn() ? "?lang=en" : ""); a.className = "pmap-pop-link"; a.textContent = t("view") + " →";
        box.appendChild(a);
        m.bindPopup(box, { closeButton: true, maxWidth: 240 });
        pts.push([p.lat, p.lng]);
      });
      var st = data.station;
      if (st && isFinite(st.lat)) {
        L.marker([st.lat, st.lng], { icon: icon(L, STN, 26, 26, 13, 13, "pmap-stn"), title: st.name, keyboard: false })
          .addTo(map).bindPopup(document.createTextNode((isEn() && st.en ? st.en : st.name)), { maxWidth: 200 });
        pts.push([st.lat, st.lng]);
      }
      if (pts.length > 1) map.fitBounds(pts, { padding: [28, 28], maxZoom: 16 });
      else if (pts.length) map.setView(pts[0], 16);
      el.__map = map;
      setTimeout(function () { map.invalidateSize(); if (pts.length > 1) map.fitBounds(pts, { padding: [28, 28], maxZoom: 16 }); }, 200);
    }).catch(function () { fail(el); });
  }

  function lazySingles() {
    var els = document.querySelectorAll("[data-pmap]");
    if (!els.length) return;
    Array.prototype.forEach.call(els, function (el) {
      var btn = el.querySelector(".pmap-load");
      if (btn) btn.addEventListener("click", function () { initSingle(el); });
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); initSingle(e.target); } });
      }, { rootMargin: "200px 0px" });
      Array.prototype.forEach.call(els, function (el) { io.observe(el); });
    }
  }

  function stationToggle() {
    var btn = document.querySelector("[data-pmap-toggle]");
    var shell = document.getElementById("station-map");
    if (!btn || !shell) return;
    btn.addEventListener("click", function () {
      var open = shell.hasAttribute("hidden");
      if (open) {
        shell.removeAttribute("hidden");
        var c = shell.querySelector("[data-pmap-multi]");
        if (c.__pmap && c.__map) c.__map.invalidateSize(); else initMulti(c);
        try { shell.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {}
      } else shell.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  window.MoveCondoLeaflet = { load: loadLeaflet, baseMap: baseMap, icon: icon, PIN: PIN, STN: STN, isEn: isEn };

  function boot() { lazySingles(); stationToggle(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
