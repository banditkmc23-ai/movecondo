/* Partner registration form → Supabase public.partner_applications (insert-only for visitors).
 * Anti-spam: hidden honeypot field, minimum fill time, one submission per minute per browser,
 * and a database rate limit (3 per email/phone per hour). Nothing here is written to public files. */
(function () {
  "use strict";
  var form = document.getElementById("partnerForm"); if (!form) return;
  var SB = "https://cypxbfueevkaytqqeynd.supabase.co", KEY = "sb_publishable_hBlz3-ebT0TbATbvcLkPVg_3zGI02yS";
  var EN = document.documentElement.classList.contains("mc-en");
  var t0 = Date.now(), err = document.getElementById("pfErr"), done = document.getElementById("pfDone");
  var M = {
    business_name: ["กรอกชื่อธุรกิจ (2–120 ตัวอักษร)", "Enter the business name (2–120 characters)"],
    business_type: ["เลือกประเภทธุรกิจ", "Choose a business type"],
    contact_name: ["กรอกชื่อผู้ติดต่อ", "Enter a contact name"],
    phone: ["กรอกเบอร์โทรให้ถูกต้อง (9–15 หลัก)", "Enter a valid phone number (9–15 digits)"],
    email: ["กรอกอีเมลให้ถูกต้อง", "Enter a valid email"],
    line_id: ["LINE ID ยาวเกินไป", "LINE ID is too long"],
    interests: ["เลือกอย่างน้อย 1 เรื่องที่สนใจ", "Choose at least one interest"],
    website: ["ลิงก์เว็บไซต์ยาวเกินไป", "Website link is too long"],
    consent: ["กรุณายืนยันการให้ข้อมูล", "Please tick the consent box"],
    agent_years: ["ประสบการณ์ต้องเป็นตัวเลข 0–60 ปี", "Experience must be a number from 0 to 60 years"],
    fast: ["ส่งเร็วเกินไป ลองอีกครั้งใน 1 นาที", "Please wait a minute before sending again"],
    rate: ["ส่งใบสมัครบ่อยเกินไป ลองใหม่ภายหลัง หรือทัก LINE ได้เลย", "Too many applications. Try again later or message us on LINE."],
    fail: ["ส่งไม่สำเร็จ ลองอีกครั้ง หรือทัก LINE ได้เลย", "Could not send. Try again or message us on LINE."],
    sending: ["กำลังส่ง…", "Sending…"]
  };
  function msg(k) { return M[k][EN ? 1 : 0]; }
  form.querySelectorAll("option[data-th]").forEach(function (o) { o.textContent = EN ? o.getAttribute("data-en") : o.getAttribute("data-th"); });
  // Co-Agent: extra optional fields appear when Co-Agent is chosen as the type or an interest
  var co = document.getElementById("pfCo");
  function isCo() { return form.elements.business_type.value === "coagent" || !!form.querySelector('input[name="interests"][value="coagent"]:checked'); }
  function syncCo() { var on = isCo(); co.hidden = !on; form.classList.toggle("is-coagent", on); }
  form.addEventListener("change", function (e) {
    if (e.target.name === "business_type" && e.target.value === "coagent") { var c = form.querySelector('input[name="interests"][value="coagent"]'); if (c) c.checked = true; }
    syncCo();
  });
  function presetCo() {
    form.elements.business_type.value = "coagent";
    var c = form.querySelector('input[name="interests"][value="coagent"]'); if (c) c.checked = true;
    syncCo();
  }
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-coagent-apply]")) presetCo(); });
  if (/^#(co-agent|coagent)$/.test(location.hash) && /[?&]apply=1/.test(location.search)) presetCo();
  syncCo();
  function v(n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function checked(n) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + n + '"]:checked'), function (i) { return i.value; }); }
  function bad(name, key) {
    err.textContent = msg(key || name);
    var el = form.elements[name]; el = el && el.length && !el.tagName ? el[0] : el;
    form.querySelectorAll(".pf-bad").forEach(function (x) { x.classList.remove("pf-bad"); });
    if (el) { var box = el.closest(".pf-f, .pf-set, .pf-consent"); if (box) box.classList.add("pf-bad"); try { el.focus({ preventScroll: false }); } catch (e) {} }
    return false;
  }
  form.addEventListener("input", function (e) { var b = e.target.closest(".pf-bad"); if (b) b.classList.remove("pf-bad"); });
  form.addEventListener("submit", function (e) {
    e.preventDefault(); err.textContent = "";
    var d = {
      business_name: v("business_name"), business_type: v("business_type"), contact_name: v("contact_name"),
      phone: v("phone").replace(/\s+/g, " "), email: v("email").toLowerCase(), line_id: v("line_id") || null,
      areas: checked("areas").slice(0, 20), interests: checked("interests"), website: v("website") || null,
      message: v("message") || null, consent: !!form.elements.consent.checked, lang: EN ? "en" : "th"
    };
    if (d.interests.indexOf("coagent") === -1 && d.business_type === "coagent") d.interests.push("coagent");
    if (d.interests.indexOf("coagent") !== -1) {
      var yrs = v("agent_years"), kind = form.querySelector('input[name="agent_kind"]:checked');
      d.agent_rooms = v("agent_rooms") || null;
      d.agent_kind = kind ? kind.value : null;
      d.agent_years = yrs === "" ? null : +yrs;
      d.owner_permission = form.elements.owner_permission.checked ? true : null;
      if (d.agent_years != null && !(Number.isInteger(d.agent_years) && d.agent_years >= 0 && d.agent_years <= 60)) return bad("agent_years");
    }
    var digits = d.phone.replace(/\D/g, "");
    if (d.business_name.length < 2 || d.business_name.length > 120) return bad("business_name");
    if (!d.business_type) return bad("business_type");
    if (d.contact_name.length < 2 || d.contact_name.length > 80) return bad("contact_name");
    if (!/^[0-9+() -]{9,20}$/.test(d.phone) || digits.length < 9 || digits.length > 15) return bad("phone");
    if (d.email.length > 120 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return bad("email");
    if (d.line_id && d.line_id.length > 40) return bad("line_id");
    if (!d.interests.length) return bad("interests");
    if (d.website && (d.website.length < 3 || d.website.length > 200)) return bad("website");
    if (!d.consent) return bad("consent");
    // honeypot / too fast: pretend success, send nothing
    if (v("company_url") || Date.now() - t0 < 3000) { showDone(); return; }
    var last = 0; try { last = +localStorage.getItem("mc-partner-sent") || 0; } catch (x) {}
    if (Date.now() - last < 60e3) { err.textContent = msg("fast"); return; }
    var btn = form.querySelector(".pf-submit"), label = btn.innerHTML; btn.disabled = true; btn.textContent = msg("sending");
    fetch(SB + "/rest/v1/partner_applications", { method: "POST", credentials: "omit",
      headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(d) })
      .then(function (r) {
        if (r.ok) { try { localStorage.setItem("mc-partner-sent", String(Date.now())); } catch (x) {} showDone(); return; }
        return r.json().catch(function () { return {}; }).then(function (j) { err.textContent = /rate limited/.test(j && j.message || "") ? msg("rate") : msg("fail"); });
      })
      .catch(function () { err.textContent = msg("fail"); })
      .then(function () { btn.disabled = false; btn.innerHTML = label; });
  });
  function showDone() {
    form.hidden = true; done.hidden = false;
    try { done.focus(); done.scrollIntoView({ block: "start" }); } catch (e) {}
  }
})();
