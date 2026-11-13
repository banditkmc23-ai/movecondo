/* MoveCondo self-managed ads.
 * Data: ads/ads.json (see tools/ads/README.md). An ad shows only when active === true and
 * today (Bangkok) is within start..end. Ads marked "example" never show publicly; they appear
 * only in preview mode (?adpreview=1, remembered for the browser tab; ?adpreview=0 turns it off).
 * Slots: home (between category rows), room (under the Detail block), area / project (between room cards).
 * When a slot has no live ad, a house placeholder ("พื้นที่โฆษณา · Ad space") linking to the Partner page is shown instead.
 * Links to real ads use rel="sponsored noopener".
 */
(function () {
  "use strict";
  var me = document.currentScript;
  var DATA_URL = new URL("../ads/ads.json", me ? me.src : location.href);
  var PREVIEW = false;
  try {
    var qp = new URLSearchParams(location.search).get("adpreview");
    if (qp === "1") sessionStorage.setItem("mc-adpreview", "1");
    if (qp === "0") sessionStorage.removeItem("mc-adpreview");
    PREVIEW = sessionStorage.getItem("mc-adpreview") === "1";
  } catch (e) {}
  var ADS = null, picked = {};

  function today() { return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); }
  function isEN() { return document.documentElement.classList.contains("mc-en") || document.documentElement.lang === "en"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tx(v) { if (!v) return ""; if (typeof v === "string") return v; return (isEN() ? (v.en || v.th) : (v.th || v.en)) || ""; }
  function safeLink(u) { u = String(u || "#").trim(); return /^(https?:\/\/|#|\/|\.\.?\/)/i.test(u) && !/^javascript:/i.test(u) ? u : "#"; }
  function live(a) {
    if (!a || !a.id || !a.image) return false;
    if (a.example) return PREVIEW;
    if (PREVIEW) return true;
    if (a.active !== true) return false;
    var t = today();
    if (a.start && t < a.start) return false;
    if (a.end && t > a.end) return false;
    return true;
  }
  function forSlot(slot) { return (ADS || []).filter(function (a) { return live(a) && (a.slots || []).indexOf(slot) !== -1; }); }
  // weighted random pick, avoiding ads already used on this page when possible
  function pick(slot) {
    var all = forSlot(slot); if (!all.length) return null;
    var fresh = all.filter(function (a) { return !picked[a.id]; }); var pool = fresh.length ? fresh : all;
    var tot = pool.reduce(function (s, a) { return s + Math.max(0.1, +a.weight || 1); }, 0), r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= Math.max(0.1, +pool[i].weight || 1); if (r <= 0) { picked[pool[i].id] = 1; return pool[i]; } }
    picked[pool[0].id] = 1; return pool[0];
  }
  function html(a, slot) {
    var img = new URL(a.image, DATA_URL).href, en = isEN();
    var cta = tx(a.cta);
    return '<aside class="ad-slot ad-' + slot + (a.example ? ' ad-example' : '') + '" data-i18n-skip data-ad="' + esc(a.id) + '" aria-label="' + (en ? "Advertisement" : "โฆษณา") + '">' +
      '<a class="ad-card" href="' + esc(safeLink(a.link)) + '" target="_blank" rel="sponsored noopener">' +
      '<span class="ad-media"><img src="' + esc(img) + '" alt="' + esc(tx(a.alt) || tx(a.title)) + '" width="1200" height="600" loading="lazy" decoding="async"></span>' +
      '<span class="ad-body"><span class="ad-label">' + (en ? "Ad" : "โฆษณา · Ad") + (a.example ? (en ? " · example" : " · ตัวอย่าง") : "") + '</span>' +
      '<b class="ad-title">' + esc(tx(a.title)) + '</b>' + (tx(a.text) ? '<span class="ad-text">' + esc(tx(a.text)) + '</span>' : "") +
      (cta ? '<span class="ad-cta">' + esc(cta) + '</span>' : "") + '</span></a>' +
      '<a class="ad-more" href="' + esc(new URL("../partner/", DATA_URL).href) + '">' + (en ? "Want to advertise here?" : "สนใจลงโฆษณา?") + '</a></aside>';
  }
  // house placeholder: shown when no real (or preview) ad is available for the slot
  function placeholder(slot) {
    var partner = esc(new URL("../partner/#ads", DATA_URL).href);
    return '<aside class="ad-slot ad-ph ad-' + slot + '" data-i18n-skip data-ad="placeholder" aria-label="' + (isEN() ? "Ad space" : "พื้นที่โฆษณา") + '">' +
      '<a class="ad-card" href="' + partner + '">' +
      '<span class="ad-media ad-ph-media" aria-hidden="true"><span class="ad-ph-art"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><span>Ad</span></span></span>' +
      '<span class="ad-body"><span class="ad-label"><span class="t-th">โฆษณา · Ad</span><span class="t-en">Ad</span></span>' +
      '<b class="ad-title"><span class="t-th">พื้นที่โฆษณา</span><span class="t-en">Ad space</span></b>' +
      '<span class="ad-text"><span class="t-th">สนใจลงโฆษณา ติดต่อเรา</span><span class="t-en">Advertise with us</span></span>' +
      '<span class="ad-cta"><span class="t-th">ดูรายละเอียด</span><span class="t-en">Learn more</span></span></span></a></aside>';
  }
  function place(target, where, slot) {
    if (!target) return;
    var a = pick(slot);
    target.insertAdjacentHTML(where, a ? html(a, slot) : placeholder(slot));
  }
  function mount() {
    if (!ADS) return;
    picked = {};
    document.querySelectorAll(".ad-slot").forEach(function (n) { n.remove(); });
    // home: after the 2nd category row and after the 6th
    var home = document.querySelector("#view-home.on .home-browse");
    if (home) {
      var rows = home.querySelectorAll(".cat-row");
      if (rows.length >= 3) place(rows[1], "afterend", "home");
      if (rows.length >= 8) place(rows[5], "afterend", "home");
    }
    // room page: under the Detail block
    var det = document.querySelector(".room-page .detail-more, .detail-main > .detail-more");
    if (det && /\/rooms\//.test(location.pathname)) place(det, "afterend", "room");
    // area + project pages: after the 4th room card (full row), or under the grid when fewer rooms
    var isArea = /\/areas\/[^/]+\/?$/.test(location.pathname), isProj = /\/condo\/[^/]+\/?$/.test(location.pathname);
    if (isArea || isProj) {
      var grid = document.querySelector("#rooms .grid");
      if (grid) {
        var cards = grid.querySelectorAll(":scope > .card");
        if (cards.length > 4) place(cards[3], "afterend", isArea ? "area" : "project");
        else place(grid, "afterend", isArea ? "area" : "project");
      }
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest(".ad-slot a.ad-card");
    if (!a) return;
    var box = a.closest(".ad-slot");
    if (box.classList.contains("ad-example") || PREVIEW) return; // preview clicks are not counted
    try { document.dispatchEvent(new CustomEvent("mc:ad", { detail: { id: box.getAttribute("data-ad"), slot: (box.className.match(/ad-(home|room|area|project)/) || [])[1] || "" } })); } catch (err) {}
  }, true);
  window.MoveCondoAds = { mount: mount, get preview() { return PREVIEW; } };
  fetch(DATA_URL.href, { cache: "no-cache", credentials: "omit" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    ADS = j && Array.isArray(j.ads) ? j.ads : [];
  }).catch(function () { ADS = []; }).then(function () {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  });
})();
