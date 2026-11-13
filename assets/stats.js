/* MoveCondo visitor counter (people only).
   PDPA: no cookies, no IP, no names, no fingerprinting. Sends page path, TH/EN,
   referring site, mobile/desktop, random ids (daily visitor id, 30-min session id,
   page-view id), visible time on page, cleaned search words (no digits runs of 6+,
   nothing with @), matcher choices, LINE clicks and photo swipes.
   Bots and automated browsers are skipped. See tools/stats/README.md. */
(function () {
  try {
    var n = navigator, w = window, d = document, ls = w.localStorage;
    if (n.webdriver) return;
    if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|python|curl|wget|httpclient|facebookexternalhit|embedly|GPT|Claude|Perplexity|Bytespider|Amazonbot|Applebot/i.test(n.userAgent || "")) return;
    if (ls && ls.getItem("mc-nostats") === "1") return; // owner's own browser (set from the dashboard)
    var API = "https://cypxbfueevkaytqqeynd.supabase.co/rest/v1/";
    var KEY = "sb_publishable_hBlz3-ebT0TbATbvcLkPVg_3zGI02yS";
    var now = function () { return Date.now(); };
    var rid = function (len) {
      var a = new Uint8Array(len); (w.crypto || w.msCrypto).getRandomValues(a);
      return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    };
    var today = new Date(now() + 7 * 36e5).toISOString().slice(0, 10); // Bangkok day
    var vid = null, sid = null;
    try {
      var s = JSON.parse(ls.getItem("mc-vid") || "null");
      if (s && s.d === today && /^[A-Za-z0-9_-]{8,40}$/.test(s.id)) vid = s.id;
      if (!vid) { vid = rid(12); ls.setItem("mc-vid", JSON.stringify({ d: today, id: vid })); }
    } catch (e) {}
    function session() { // 30 minutes of inactivity starts a new visit
      try {
        var o = JSON.parse(ls.getItem("mc-sid") || "null");
        if (!o || !/^[A-Za-z0-9]{6,24}$/.test(o.id) || now() - o.t > 18e5) o = { id: rid(8) };
        o.t = now(); ls.setItem("mc-sid", JSON.stringify(o)); sid = o.id;
      } catch (e) { sid = sid || rid(8); }
      return sid;
    }
    var ref = null;
    try { var r = d.referrer && new URL(d.referrer).hostname; if (r && r !== location.hostname) ref = r.slice(0, 120); } catch (e) {}
    var mobile = /Mobi|Android|iPhone|iPod/i.test(n.userAgent) || (w.matchMedia && w.matchMedia("(max-width: 760px)").matches);
    function post(table, row) {
      try {
        fetch(API + table, { method: "POST", keepalive: true, mode: "cors", credentials: "omit",
          headers: { "apikey": KEY, "Content-Type": "application/json", "Prefer": "return=minimal" }, body: JSON.stringify(row) }).catch(function () {});
      } catch (e) {}
    }
    var pv = null, curPath = "", last = "";
    function pathNow() {
      var h = location.hash && location.hash.indexOf("#/") === 0 ? location.hash.split("?")[0] : "";
      if (h === "#/") h = "";
      return (location.pathname + h).slice(0, 200);
    }
    function ev(name, props) {
      if (!pv) return;
      post("events", { name: name, path: curPath, visitor_hash: vid, session_id: sid, pv_id: pv, props: props || {} });
    }
    // ---- visible, active time ------------------------------------------------
    var acc = 0, tickAt = 0, lastAct = now();
    function tick() {
      var t = now();
      if (tickAt && d.visibilityState === "visible") acc += Math.max(0, Math.min(t, lastAct + 12e4) - tickAt);
      tickAt = d.visibilityState === "visible" ? t : 0;
    }
    ["scroll", "pointerdown", "keydown", "touchstart", "mousemove", "wheel"].forEach(function (e) {
      w.addEventListener(e, function () { var t = now(); if (t - lastAct > 1000) { tick(); lastAct = t; } }, { passive: true, capture: true });
    });
    setInterval(tick, 5000);
    // ---- photo swipes, counted per room and sent with the time --------------
    var swipes = {};
    function swiped(el) {
      var box = el && el.closest && el.closest("[data-listing]");
      var room = box && box.getAttribute("data-listing");
      if (room && /^MC-\d{3}$/.test(room)) swipes[room] = (swipes[room] || 0) + 1;
    }
    function flush() {
      tick();
      var ms = Math.min(Math.round(acc), 18e5); acc = 0;
      if (ms >= 500) ev("engage", { ms: ms });
      for (var k in swipes) ev("photo_swipe", { room: k, n: Math.min(swipes[k], 200) });
      swipes = {};
    }
    function pageview() {
      var p = pathNow();
      if (p === last) return;
      if (pv) flush();
      last = p; curPath = p; pv = rid(8); session(); acc = 0; tickAt = d.visibilityState === "visible" ? now() : 0; lastAct = now();
      var lang = (d.documentElement.lang || "th").slice(0, 2) === "en" ? "en" : "th";
      post("visits", { path: p, lang: lang, referrer_host: ref, device: mobile ? "mobile" : "desktop", visitor_hash: vid, session_id: sid, pv_id: pv });
      ref = null; // referrer only on the first page of the visit
      searchCheck();
    }
    d.addEventListener("visibilitychange", function () { if (d.visibilityState === "hidden") flush(); else { session(); tickAt = now(); lastAct = now(); } });
    w.addEventListener("pagehide", flush);
    // ---- search words (cleaned) ----------------------------------------------
    function clean(q) {
      q = String(q || "").toLowerCase().split(/\s+/).filter(function (t) { return t && t.indexOf("@") < 0; }).join(" ");
      return q.replace(/[0-9๐-๙]{6,}/g, "").replace(/\s+/g, " ").trim().slice(0, 60).trim();
    }
    var via = "submit", sentQ = {};
    function sendSearch(q, num, how, extra) {
      q = clean(q); if (!q || sentQ[pv + q]) return; sentQ[pv + q] = 1;
      var p = { q: q, n: Math.max(0, Math.min(999, num | 0)), via: how };
      if (extra) for (var k in extra) p[k] = extra[k];
      if (JSON.stringify(p).length > 480) { delete p.f; }
      ev("search", p);
    }
    function results() {
      var home = d.getElementById("view-home");
      if (!home || home.querySelector(".search-empty")) return 0;
      var c = home.querySelector(".search-count"), m = c && /(\d+)/.exec(c.textContent || "");
      return m ? +m[1] : home.querySelectorAll(".grid .card").length;
    }
    function searchCheck() {
      var m = /[?&]q=([^&]*)/.exec(location.hash || "");
      if (!m) return;
      var q; try { q = decodeURIComponent(m[1].replace(/\+/g, " ")); } catch (e) { return; }
      var how = via; via = "submit";
      setTimeout(function () { sendSearch(q, results(), how); }, 600);
    }
    d.addEventListener("submit", function (e) {
      var f = e.target;
      if (f && f.classList && f.classList.contains("hero-search-form")) {
        via = "submit"; var inp = f.querySelector(".hero-search-input"), v = inp ? inp.value : "";
        setTimeout(function () { sendSearch(v, results(), "submit"); }, 900);
      }
      if (f && f.id === "matchForm") {
        var on = function (k, label) { return Array.prototype.map.call(f.querySelectorAll('[data-chip-field="' + k + '"] .sel-chip.on'), function (b) { return String((label ? b.textContent.trim() : b.getAttribute("data-chip-val")) || "").slice(0, 30); }).slice(0, 8); };
        var num = function (id) { var el = f.querySelector("#" + id); return el ? Math.round(+el.value) || 0 : null; };
        var a = num("budgetMin"), b = num("budgetMax"); if (a != null && b != null && a > b) { var t = a; a = b; b = t; }
        var props = { areas: on("areas"), type: on("type")[0] || "any", size: on("size")[0] || "", walk: on("walk")[0] || "", contract: on("contract")[0] || "", must: on("must", 1) };
        if (a != null) props.bmin = a; if (b != null) props.bmax = b;
        if (JSON.stringify(props).length < 450 && !/@/.test(JSON.stringify(props))) ev("match", props);
      }
    }, true);
    d.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      if (t.closest("[data-search-area]")) via = "area";
      else if (t.closest("[data-search-station]")) via = "suggest";
      else if (t.closest("[data-search-apply]")) via = "all";
      var sug = t.closest(".hero-suggest-item[href]");
      if (sug && /rooms\/mc-\d{3}|\/condo\//.test(sug.getAttribute("href") || "")) {
        var box = sug.closest(".hero-search"), inp = box && box.querySelector(".hero-search-input");
        var all = box && box.querySelector(".hero-suggest-all"), cnt = all ? parseInt((all.textContent.match(/\d+/) || ["0"])[0], 10) : box ? box.querySelectorAll(".hero-suggest-item[href*='rooms/']").length : 1;
        if (inp) sendSearch(inp.value, cnt, /\/condo\//.test(sug.getAttribute("href") || "") ? "suggest" : "suggest");
      }
      var a = t.closest('a[href*="line.me"]');
      if (a) {
        var m = /\/rooms\/(mc-\d{3})/.exec(location.pathname), holder = a.closest("[data-listing]");
        var room = m ? m[1].toUpperCase() : holder ? holder.getAttribute("data-listing") : null;
        var place = m ? "room" : /\/areas\//.test(location.pathname) ? "area" : (/^#\/(match|results)/.exec(location.hash || "") || [0, "home"])[1];
        var props = { place: place }; if (room && /^MC-\d{3}$/.test(room)) props.room = room;
        ev("line_click", props);
      }
      if (t.closest("[data-listing] .gal-btn, [data-listing] .card-dot, [data-listing] .gal-dot, [data-listing] [data-gal]")) swiped(t);
    }, true);
    var sx = null, sy = 0, st = null;
    d.addEventListener("touchstart", function (e) { var p = e.touches && e.touches[0]; st = e.target; sx = p ? p.clientX : null; sy = p ? p.clientY : 0; }, { passive: true, capture: true });
    d.addEventListener("touchend", function (e) { var p = e.changedTouches && e.changedTouches[0]; if (sx != null && p && Math.abs(p.clientX - sx) > 30 && Math.abs(p.clientX - sx) > Math.abs(p.clientY - sy)) swiped(st); sx = null; }, { passive: true, capture: true });
    d.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") { st = e.target; sx = e.clientX; sy = e.clientY; } }, true);
    d.addEventListener("pointerup", function (e) { if (e.pointerType === "mouse" && sx != null && Math.abs(e.clientX - sx) > 30 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) swiped(st); if (e.pointerType === "mouse") sx = null; }, true);
    // ---- advanced-search filters (numbers, room types and station names only) ----
    var fT = null;
    d.addEventListener("mc:search-filters", function (e) {
      var x = e.detail || {}; clearTimeout(fT);
      fT = setTimeout(function () {
        var n = function (v) { v = Math.round(+v || 0); return v > 0 && v < 1e7 ? v : 0; };
        var list = function (a, k) { return (Array.isArray(a) ? a : []).map(function (v) { return String(v).slice(0, 40); }).filter(function (v) { return !/@|\d{6,}/.test(v); }).slice(0, k); };
        // The stats table only accepts the existing event names, so filters ride along on a keyword "search" event.
        if (!x.q) return;
        sendSearch(x.q, x.n, "all", { f: { pmin: n(x.pmin), pmax: n(x.pmax), smin: n(x.smin), smax: n(x.smax), type: list(x.type, 4), st: list(x.st, 4), sort: String(x.sort || "rec").slice(0, 12) } });
      }, 900);
    });
    // ---- home category rows: clicks ride on a "search" event (allowed names only), word prefixed with "หมวด" ----
    d.addEventListener("mc:category", function (e) {
      var l = String((e.detail || {}).label || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (l) sendSearch("หมวด " + l, 0, "all");
    });
    // ---- start -----------------------------------------------------------------
    function go() { (w.requestIdleCallback || function (f) { setTimeout(f, 1500); })(pageview, { timeout: 4000 }); }
    if (d.readyState === "complete") go(); else w.addEventListener("load", go);
    w.addEventListener("hashchange", function () { setTimeout(function () { if (pathNow() !== last) pageview(); else searchCheck(); }, 300); });
  } catch (e) {}
})();
