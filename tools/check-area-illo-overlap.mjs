#!/usr/bin/env node
/**
 * Asserts that every home area-map illustration has no overlapping
 * labels / chips / pins / station box / road labels / compass / legend,
 * with a >= 6px gap, at 1440px and 390px viewports.
 *
 * Usage: node tools/check-area-illo-overlap.mjs [--url http://127.0.0.1:PORT] [--screenshots]
 */
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AREAS = ["ทองหล่อ", "พร้อมพงษ์", "เอกมัย", "พระโขนง", "อ่อนนุช", "อโศก", "อารีย์", "พระราม 9", "เจริญนคร", "บางนา"];
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 1100 },
  { name: "390", width: 390, height: 844 }
];
const GAP = 6;
const ROLES = ["pin", "label", "chip", "station-dot", "station-label", "road", "river", "compass", "legend"];

function loadPlaywright() {
  const candidates = [
    "/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright",
    "/usr/local/lib/pnpm/5/.pnpm/playwright@1.63.0-alpha-2026-08-31/node_modules/playwright",
    join(ROOT, "node_modules/playwright")
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* try next */ }
  }
  return require("playwright");
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

function startStaticServer(root) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/") rel = "/index.html";
      const file = join(root, rel);
      if (!file.startsWith(root) || !existsSync(file)) {
        res.writeHead(404); res.end("not found"); return;
      }
      const data = readFileSync(file);
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolvePromise({ server, url: `http://127.0.0.1:${port}/` });
    });
  });
}

function gapBetween(a, b) {
  const sepX = Math.max(0, Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)));
  const sepY = Math.max(0, Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)));
  const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
  const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
  if (overlapX && overlapY) return -Math.min((a.x + a.w) - b.x, (b.x + b.w) - a.x, (a.y + a.h) - b.y, (b.y + b.h) - a.y);
  if (overlapX) return sepY;
  if (overlapY) return sepX;
  return Math.hypot(sepX, sepY);
}

function sameGroup(a, b) {
  if (a.group && b.group && a.group === b.group) return true;
  return false;
}

async function collectBoxes(page) {
  return page.evaluate((roles) => {
    const svg = document.querySelector(".hood-illo svg");
    if (!svg) return { error: "no svg", boxes: [], cssScale: 1 };
    const svgRect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const cssScale = svgRect.width / (vb && vb.width ? vb.width : 400);
    const nodes = [...svg.querySelectorAll("[data-illo]")];
    const boxes = [];
    const inv = svg.getScreenCTM().inverse();
    function userBox(el) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      const p1 = new DOMPoint(r.left, r.top).matrixTransform(inv);
      const p2 = new DOMPoint(r.right, r.bottom).matrixTransform(inv);
      const x = Math.min(p1.x, p2.x), y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
      if (w < 0.5 && h < 0.5) return null;
      return { x, y, w, h };
    }
    for (const el of nodes) {
      const role = el.getAttribute("data-illo") || "";
      if (!roles.includes(role)) continue;
      const bb = userBox(el);
      if (!bb) continue;
      const name = el.getAttribute("data-illo-name") || "";
      const group = (role === "chip" || role === "label" || role === "label-name")
        ? ("place:" + name)
        : (role + (name ? ":" + name : ""));
      boxes.push({ role, name, group, x: bb.x, y: bb.y, w: bb.w, h: bb.h });
    }
    return { boxes, cssScale, error: null, area: document.querySelector(".hood-illo")?.getAttribute("data-area-illo") || "" };
  }, ROLES);
}

async function waitForMap(page, area) {
  await page.waitForFunction((wanted) => {
    const el = document.querySelector(".hood-illo");
    const svg = el && el.querySelector("svg");
    const name = el && (el.getAttribute("data-area-illo") || "");
    return !!(svg && (!wanted || name === wanted));
  }, area, { timeout: 15000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // Give the font-ready relayout a moment if it is still pending
  await page.waitForFunction(() => window.__areaIlloReady !== false, null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(120);
}

async function selectArea(page, area) {
  const clicked = await page.evaluate((area) => {
    const btn = document.querySelector(`.hood-chips [data-area="${area}"]`);
    if (!btn) return false;
    btn.click();
    return true;
  }, area);
  if (!clicked) throw new Error("No chip for area " + area);
  await waitForMap(page, area);
}

async function run() {
  const args = process.argv.slice(2);
  let base = null;
  const wantShots = args.includes("--screenshots");
  const urlIdx = args.indexOf("--url");
  if (urlIdx >= 0) base = args[urlIdx + 1];
  const shotDir = args.includes("--shot-dir") ? args[args.indexOf("--shot-dir") + 1] : "/workspace/rental-site-mockup";

  let server = null;
  if (!base) {
    const started = await startStaticServer(ROOT);
    server = started.server;
    base = started.url;
  }

  const { chromium } = loadPlaywright();
  const launchOpts = { headless: true, args: ["--font-render-hinting=none"] };
  const exe = "/home/box/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell";
  const chrome = "/usr/bin/google-chrome";
  let browser;
  try {
    browser = await chromium.launch(launchOpts);
  } catch (e) {
    if (existsSync(exe)) browser = await chromium.launch({ ...launchOpts, executablePath: exe });
    else if (existsSync(chrome)) browser = await chromium.launch({ ...launchOpts, executablePath: chrome });
    else throw e;
  }

  const report = [];
  let failures = 0;
  const shotPaths = [];

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
      await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForSelector(".hood-chips [data-area]", { timeout: 20000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      // Scroll the area switcher into view
      await page.locator(".hood-chips").first().scrollIntoViewIfNeeded();
      await waitForMap(page, null);
      // Fonts may trigger a relayout
      await page.evaluate(() => {
        if (window.areaIlloRefresh) window.areaIlloRefresh();
        window.__areaIlloFontReady = true;
        if (window.areaIlloRefresh) window.areaIlloRefresh();
      });
      await page.waitForTimeout(200);

      for (const area of AREAS) {
        await selectArea(page, area);
        await page.evaluate(() => { if (window.areaIlloRefresh) window.areaIlloRefresh(); });
        await page.waitForTimeout(80);
        const collected = await collectBoxes(page);
        const row = { viewport: vp.name, area, cssScale: collected.cssScale, overlaps: [], boxCount: collected.boxes.length, error: collected.error };
        if (collected.error) {
          row.overlaps.push({ message: collected.error });
          failures++;
        } else {
          const boxes = collected.boxes;
          for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i], b = boxes[j];
              if (sameGroup(a, b)) continue;
              const gap = gapBetween(a, b);
              if (gap < GAP - 0.05) {
                row.overlaps.push({
                  a: `${a.role}${a.name ? ":" + a.name : ""}`,
                  b: `${b.role}${b.name ? ":" + b.name : ""}`,
                  gap: Math.round(gap * 100) / 100,
                  aBox: [round(a.x), round(a.y), round(a.w), round(a.h)],
                  bBox: [round(b.x), round(b.y), round(b.w), round(b.h)]
                });
                failures++;
              }
            }
          }
        }
        report.push(row);
        const status = row.overlaps.length ? "FAIL" : "PASS";
        const extra = row.overlaps.length
          ? "  " + row.overlaps.map((o) => `${o.a} <> ${o.b} gap=${o.gap}`).join(" | ")
          : "";
        console.log(`[${vp.name}] ${status} ${area}  boxes=${row.boxCount}${extra}`);

        if (wantShots) {
          mkdirSync(shotDir, { recursive: true });
          const safe = areaSlug(area);
          const target = page.locator(".hood-illo").first();
          await target.scrollIntoViewIfNeeded();
          const dest = join(shotDir, `area-map-v4-${safe}-${vp.name}.png`);
          await target.screenshot({ path: dest, omitBackground: false });
          shotPaths.push(dest);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }

  function round(n) { return Math.round(n * 10) / 10; }
  function areaSlug(area) {
    const map = {
      "ทองหล่อ": "thonglor", "พร้อมพงษ์": "phrom-phong", "เอกมัย": "ekkamai",
      "พระโขนง": "phrakhanong", "อ่อนนุช": "on-nut", "อโศก": "asok",
      "อารีย์": "ari", "พระราม 9": "rama-9", "เจริญนคร": "charoennakhon", "บางนา": "bangna"
    };
    return map[area] || area;
  }

  console.log("");
  console.log("==== summary ====");
  const byVp = {};
  for (const vp of VIEWPORTS) {
    const rows = report.filter((r) => r.viewport === vp.name);
    const failed = rows.filter((r) => r.overlaps.length || r.error);
    byVp[vp.name] = { total: rows.length, failed: failed.length };
    console.log(`  ${vp.name}px: ${rows.length - failed.length}/${rows.length} areas clean`);
    failed.forEach((r) => {
      r.overlaps.forEach((o) => console.log(`    ${r.area}: ${o.a} <> ${o.b} gap=${o.gap}`));
    });
  }
  if (wantShots) {
    console.log("screenshots:", shotPaths.length);
    shotPaths.forEach((p) => console.log("  " + p));
  }
  if (failures) {
    console.log(`OVERLAP CHECK FAILED (${failures} intersecting pairs)`);
    process.exit(1);
  }
  console.log("OVERLAP CHECK PASSED: 0 bbox intersections in all 10 areas at 1440 and 390 (>=6px gap).");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
