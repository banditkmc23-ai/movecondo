/* MoveCondo visitor counter (people only).
   PDPA: no cookies, no IP, no names, no fingerprinting. Sends only page path,
   language, referring site, mobile/desktop, and a random id that is reset every
   day (kept in localStorage). Bots and automated browsers are skipped.
   Backend: Supabase project "movecondo-stats" (see tools/stats/README.md). */
(function () {
  try {
    var n = navigator, w = window, ls = w.localStorage;
    if (n.webdriver) return;
    if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|python|curl|wget|httpclient|facebookexternalhit|embedly|GPT|Claude|Perplexity|Bytespider|Amazonbot|Applebot/i.test(n.userAgent || "")) return;
    if (ls && ls.getItem("mc-nostats") === "1") return; // owner's own browser (set from the dashboard)
    var URL_ = "https://cypxbfueevkaytqqeynd.supabase.co/rest/v1/visits";
    var KEY = "sb_publishable_hBlz3-ebT0TbATbvcLkPVg_3zGI02yS";
    var today = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10); // Bangkok day
    var vid = null;
    try {
      var s = JSON.parse(ls.getItem("mc-vid") || "null");
      if (s && s.d === today && /^[A-Za-z0-9_-]{8,40}$/.test(s.id)) vid = s.id;
      if (!vid) {
        var a = new Uint8Array(12); (w.crypto || w.msCrypto).getRandomValues(a);
        vid = Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
        ls.setItem("mc-vid", JSON.stringify({ d: today, id: vid }));
      }
    } catch (e) {}
    var ref = null;
    try { var r = document.referrer && new URL(document.referrer).hostname; if (r && r !== location.hostname) ref = r.slice(0, 120); } catch (e) {}
    var mobile = /Mobi|Android|iPhone|iPod/i.test(n.userAgent) || (w.matchMedia && w.matchMedia("(max-width: 760px)").matches);
    var last = "";
    function send() {
      var h = location.hash && location.hash.indexOf("#/") === 0 ? location.hash.split("?")[0] : "";
      if (h === "#/") h = "";
      var p = (location.pathname + h).slice(0, 200);
      if (p === last) return; last = p;
      var lang = (document.documentElement.lang || "th").slice(0, 2) === "en" ? "en" : "th";
      var body = JSON.stringify({ path: p, lang: lang, referrer_host: ref, device: mobile ? "mobile" : "desktop", visitor_hash: vid });
      ref = null; // referrer only on the first page of the visit
      try {
        fetch(URL_, { method: "POST", keepalive: true, mode: "cors", credentials: "omit",
          headers: { "apikey": KEY, "Content-Type": "application/json", "Prefer": "return=minimal" }, body: body }).catch(function () {});
      } catch (e) {}
    }
    function go() { (w.requestIdleCallback || function (f) { setTimeout(f, 1500); })(send, { timeout: 4000 }); }
    if (document.readyState === "complete") go(); else w.addEventListener("load", go);
    w.addEventListener("hashchange", function () { setTimeout(send, 300); });
  } catch (e) {}
})();
