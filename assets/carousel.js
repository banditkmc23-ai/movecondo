/* MoveCondo photo carousels: CSS scroll-snap + a small helper. No library. */
(function () {
  const ROOM_MS = 3500;
  const ROOM_IDLE = 5000;
  const CARD_MS = 4000;
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n, t) {
    return String(n).padStart(2, "0") + " / " + String(t).padStart(2, "0");
  }

  function enableDrag(track, onDrag) {
    let down = false, startX = 0, startScroll = 0, moved = false, pid = null;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return; // native touch scrolling + snap
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      down = true; moved = false; pid = e.pointerId;
      startX = e.clientX; startScroll = track.scrollLeft;
      try { track.setPointerCapture(pid); } catch (err) {}
      track.classList.add("is-dragging");
      track.style.scrollSnapType = "none";
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    function end(e) {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      track.style.scrollSnapType = "";
      const w = track.clientWidth || 1;
      const i = Math.round(track.scrollLeft / w);
      const useSmooth = !reduce();
      track.scrollTo({ left: i * w, behavior: useSmooth ? "smooth" : "auto" });
      if (moved) {
        onDrag && onDrag();
        if (e && e.type === "pointerup") {
          const blockClick = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
          track.addEventListener("click", blockClick, { capture: true, once: true });
        }
      }
      moved = false;
    }
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
  }

  function isWebKitEngine() {
    const ua = navigator.userAgent || "";
    const isiOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isWebKit = /\bWebKit\b/.test(ua) && !/\b(Chromium|Chrome|Edg|OPR|Android)\b/.test(ua);
    return isiOS || isWebKit;
  }

  function animateScrollLeft(el, to, ms, done) {
    const from = el.scrollLeft;
    const dist = to - from;
    if (Math.abs(dist) < 1) { el.scrollLeft = to; if (done) done(); return; }
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / (ms || 380));
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      el.scrollLeft = from + dist * ease;
      if (t < 1) requestAnimationFrame(frame);
      else { el.scrollLeft = to; if (done) done(); }
    }
    requestAnimationFrame(frame);
  }

  function mountRoomGallery(root) {
    if (!root || root.__mcCarousel) return root && root.__mcCarousel;
    const stage = root.querySelector(".gallery-stage") || root;
    let track = root.querySelector(".gallery-track");
    if (!track) {
      const art = root.querySelector(".gallery-art");
      if (art) {
        art.classList.add("gallery-track");
        art.classList.remove("gallery-art");
        track = art;
      }
    }
    if (!track) return null;
    const slides = [...track.querySelectorAll(".gallery-slide")];
    if (!slides.length) return null;
    slides.forEach((s) => s.removeAttribute("hidden"));
    const thumbs = [...root.querySelectorAll(".thumb[data-gal]")];
    const thumbStrip = root.querySelector(".gallery-nav .thumbs, .thumbs");
    const count = root.querySelector(".gal-count");
    const n = slides.length;
    let idx = 0, timer = null, idle = null, paused = false, inView = true, holding = false, snapping = false;
    const canAuto = n > 1 && !reduce();
    const webkitBug = isWebKitEngine();

    function width() { return track.clientWidth || stage.clientWidth || 1; }

    function restoreSnap() {
      snapping = false;
      track.style.scrollSnapType = "";
      track.style.scrollBehavior = "";
    }

    function scrollToIndex(i, smooth, wrapping) {
      const left = i * width();
      snapping = true;
      track.style.scrollSnapType = "none";
      track.style.scrollBehavior = "auto";
      const finish = () => { restoreSnap(); };
      // iOS/WebKit: scrollTo({ behavior: "smooth" }) is a no-op (or fights) when
      // the scroller has CSS scroll-snap. Animate scrollLeft ourselves instead.
      const useSmooth = smooth && !reduce() && !wrapping;
      if (useSmooth && webkitBug) {
        animateScrollLeft(track, left, 400, finish);
      } else if (useSmooth) {
        track.scrollTo({ left, behavior: "smooth" });
        const done = () => { track.removeEventListener("scrollend", done); finish(); };
        track.addEventListener("scrollend", done);
        setTimeout(done, 500);
      } else {
        track.scrollLeft = left;
        requestAnimationFrame(finish);
      }
    }

    function go(i, smooth) {
      const next = (i + n) % n;
      const wrapping = n > 2 && Math.abs(next - idx) !== 1 && !(idx === n - 1 && next === 0) && !(idx === 0 && next === n - 1)
        ? false
        : (idx === n - 1 && next === 0) || (idx === 0 && next === n - 1);
      // Loop last→first (and first→last) instantly so we don't rewind through every slide.
      const instantWrap = (idx === n - 1 && next === 0) || (idx === 0 && next === n - 1);
      idx = next;
      scrollToIndex(idx, smooth && !instantWrap, instantWrap);
      sync();
    }

    function sync() {
      slides.forEach((s, i) => s.classList.toggle("on", i === idx));
      thumbs.forEach((b, i) => {
        const on = i === idx;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        if (on && thumbStrip) {
          const left = b.offsetLeft - (thumbStrip.clientWidth - b.offsetWidth) / 2;
          try {
            thumbStrip.scrollTo({ left: Math.max(0, left), behavior: reduce() ? "auto" : "smooth" });
          } catch (err) {
            thumbStrip.scrollLeft = Math.max(0, left);
          }
        }
      });
      if (count) count.textContent = pad(idx + 1, n);
      stage.setAttribute("data-index", String(idx));
    }

    function readIdx() {
      if (snapping) return;
      const w = width();
      const next = Math.round(track.scrollLeft / w);
      if (next !== idx && next >= 0 && next < n) { idx = next; sync(); }
    }

    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function startAuto() {
      stopAuto();
      if (!canAuto || paused || holding || !inView || document.hidden) return;
      timer = setInterval(() => go(idx + 1, true), ROOM_MS);
    }
    function interact() {
      paused = true;
      stopAuto();
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => { paused = false; startAuto(); }, ROOM_IDLE);
    }

    enableDrag(track, interact);
    track.addEventListener("scroll", () => { readIdx(); }, { passive: true });
    // Pause only while a finger is down; resume after idle. A touchstart-only
    // pause could stick on iOS if touchend is swallowed.
    track.addEventListener("touchstart", () => { holding = true; stopAuto(); }, { passive: true });
    track.addEventListener("touchend", () => { holding = false; interact(); }, { passive: true });
    track.addEventListener("touchcancel", () => { holding = false; interact(); }, { passive: true });
    track.setAttribute("tabindex", "0");

    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-gal]");
      if (!t || !root.contains(t)) return;
      const v = t.getAttribute("data-gal");
      if (v === "prev") go(idx - 1, true);
      else if (v === "next") go(idx + 1, true);
      else if (/^\d+$/.test(v)) go(parseInt(v, 10), true);
      else return;
      interact();
    });

    root.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""))) return;
      e.preventDefault();
      go(idx + (e.key === "ArrowRight" ? 1 : -1), true);
      interact();
    });

    // threshold 0 + isIntersecting: iOS often reports a tiny ratio at rest,
    // so a 0.2 cutoff could leave autoplay stopped while the gallery is visible.
    const io = new IntersectionObserver((ents) => {
      inView = ents.some((en) => en.isIntersecting);
      if (inView) startAuto(); else stopAuto();
    }, { threshold: 0, rootMargin: "80px 0px" });
    io.observe(stage);
    io.observe(root);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAuto(); else startAuto();
    });

    window.addEventListener("resize", () => {
      scrollToIndex(idx, false, true);
    });
    go(0, false);
    startAuto();
    // Fallback if IntersectionObserver never fires (some WebKit first-paint cases).
    setTimeout(() => {
      const r = stage.getBoundingClientRect();
      if (r.bottom > 40 && r.top < (window.innerHeight || 800) + 40) {
        inView = true;
        startAuto();
      }
    }, 200);

    const api = { go, get index() { return idx; }, get count() { return n; }, pause() { interact(); }, play() { paused = false; holding = false; startAuto(); } };
    root.__mcCarousel = api;
    return api;
  }

  function mountCardSlider(root, stagger) {
    if (!root || root.__mcCarousel) return root && root.__mcCarousel;
    const track = root.querySelector(".card-track");
    if (!track) return null;
    const slides = [...track.querySelectorAll(".card-slide")];
    const dots = [...root.querySelectorAll(".card-dot")];
    const n = slides.length;
    if (n <= 1) return null;
    let idx = 0, timer = null, inView = false;
    const canAuto = !reduce();

    function width() { return track.clientWidth || root.clientWidth || 1; }
    function go(i, smooth) {
      idx = (i + n) % n;
      track.scrollTo({ left: idx * width(), behavior: (smooth && !reduce()) ? "smooth" : "auto" });
      sync();
    }
    function sync() {
      dots.forEach((d, i) => {
        d.classList.toggle("on", i === idx);
        d.setAttribute("aria-current", i === idx ? "true" : "false");
      });
      root.setAttribute("data-index", String(idx));
    }
    function readIdx() {
      const next = Math.round(track.scrollLeft / (width() || 1));
      if (next !== idx && next >= 0 && next < n) { idx = next; sync(); }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (!canAuto || !inView || document.hidden) return;
      timer = setInterval(() => go(idx + 1, true), CARD_MS);
    }

    enableDrag(track, () => { stop(); setTimeout(start, CARD_MS); });
    track.addEventListener("scroll", readIdx, { passive: true });
    dots.forEach((d, i) => d.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      go(i, true);
    }));

    const io = new IntersectionObserver((ents) => {
      inView = ents.some((en) => en.isIntersecting && en.intersectionRatio > 0.35);
      if (inView) start(); else stop();
    }, { threshold: [0, 0.35, 0.7] });
    io.observe(root);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });
    window.addEventListener("resize", () => go(idx, false));
    go(0, false);
    if (stagger) setTimeout(start, stagger);

    const api = { go, get index() { return idx; }, get count() { return n; } };
    root.__mcCarousel = api;
    return api;
  }


  function mountPlaceMarquee(root) {
    if (!root || root.__mcCarousel) return root && root.__mcCarousel;
    const track = root.querySelector(".place-track");
    if (!track) return null;
    const originals = [...track.children];
    if (!originals.length) return null;
    if (!track.dataset.cloned) {
      const min = Math.max(2, Math.ceil(8 / originals.length));
      for (let i = 0; i < min; i++) {
        originals.forEach((n) => track.appendChild(n.cloneNode(true)));
      }
      track.dataset.cloned = "1";
    }
    const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let paused = false, inView = true, hovering = false, holding = false, focused = false;
    let raf = 0, last = 0, offset = 0;
    const speed = 28; // px/s

    function cycleW() {
      // width of one original set: after clones, total / (1+min)
      // easier: measure first N original cards
      const kids = [...track.children];
      if (kids.length <= originals.length) return track.scrollWidth || 1;
      let w = 0;
      for (let i = 0; i < originals.length; i++) {
        const r = kids[i].getBoundingClientRect();
        const next = kids[i + 1];
        const gap = next ? (next.getBoundingClientRect().left - r.right) : 14;
        w += r.width + gap;
      }
      return w || (track.scrollWidth / 2) || 1;
    }
    function apply() {
      const loop = cycleW();
      if (loop > 0) {
        while (offset >= loop) offset -= loop;
        while (offset < 0) offset += loop;
      }
      track.style.transform = "translate3d(" + (-offset) + "px,0,0)";
    }
    function tick(ts) {
      if (!last) last = ts;
      const dt = Math.min(48, ts - last);
      last = ts;
      const run = !reduceMotion() && inView && !document.hidden && !paused && !hovering && !holding && !focused;
      if (run) { offset += speed * dt / 1000; apply(); }
      raf = requestAnimationFrame(tick);
    }
    function pauseSoft() { /* hover/touch/focus */ }
    root.addEventListener("mouseenter", () => { hovering = true; });
    root.addEventListener("mouseleave", () => { hovering = false; last = 0; });
    root.addEventListener("focusin", () => { focused = true; });
    root.addEventListener("focusout", () => { focused = !root.contains(document.activeElement); last = 0; });
    root.addEventListener("touchstart", () => { holding = true; }, { passive: true });
    root.addEventListener("touchend", () => { holding = false; last = 0; }, { passive: true });
    root.addEventListener("touchcancel", () => { holding = false; last = 0; }, { passive: true });

    let down = false, startX = 0, startOff = 0, moved = false;
    root.addEventListener("pointerdown", (e) => {
      down = true; moved = false; holding = true;
      startX = e.clientX; startOff = offset;
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      root.classList.add("is-dragging");
    });
    root.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      offset = startOff - dx;
      apply();
    });
    function endPtr() {
      if (!down) return;
      down = false; holding = false; last = 0;
      root.classList.remove("is-dragging");
    }
    root.addEventListener("pointerup", endPtr);
    root.addEventListener("pointercancel", endPtr);

    const io = new IntersectionObserver((ents) => {
      inView = ents.some((en) => en.isIntersecting && en.intersectionRatio > 0.15);
      last = 0;
    }, { threshold: [0, 0.15, 0.4] });
    io.observe(root);
    document.addEventListener("visibilitychange", () => { last = 0; });

    if (reduceMotion()) {
      root.style.overflowX = "auto";
      track.style.transform = "none";
    } else {
      raf = requestAnimationFrame(tick);
    }

    const api = { pause() { paused = true; }, play() { paused = false; last = 0; } };
    root.__mcCarousel = api;
    return api;
  }

  function scan() {
    document.querySelectorAll(".gallery-hero").forEach((el) => mountRoomGallery(el));
    const cards = [...document.querySelectorAll("[data-card-slider]")];
    cards.forEach((el, i) => mountCardSlider(el, (i % 6) * 400));
    document.querySelectorAll("[data-place-marquee]").forEach((el) => mountPlaceMarquee(el));
  }

  window.MoveCondoCarousel = { scan, mountRoomGallery, mountCardSlider, mountPlaceMarquee };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
})();
