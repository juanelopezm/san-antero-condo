#!/usr/bin/env node
// Quality gate for the site. Zero dependencies — Node stdlib only (PRD-005 rule).
//
// Two severity levels:
//   ERROR   -> exit 1; invariants that must hold on every commit
//   WARNING -> exit 0; known gaps tracked by a PRD, printed with its PRD id
//
// Each PRD flips its flag in ENFORCE to true in the same commit that fixes the
// gap, converting its warnings into permanent errors.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const ENFORCE = {
  sharedAssetsOnly: true,  // PRD-001: en/ must use shared assets/css + assets/js (Done)
  mediaBudget: false,      // PRD-002: referenced media within size budget
  seoFiles: false,         // PRD-003: sitemap/robots/404/favicon/manifest exist
  singlePhone: true,       // PRD-004: one canonical WhatsApp number (Done)
};

// PRD-004: +573014109986 was a duplicate hero-button number; consolidated onto
// the canonical +573015382699 (18 of 20 links already used it).
const ALLOWED_PHONES = new Set(['573015382699']);

const PAGES = ['index.html', 'en/index.html'];
const errors = [];
const warnings = [];
const flag = (enforced, msg) => (enforced ? errors : warnings).push(msg);

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function isLocalRef(url) {
  return url &&
    !/^(https?:)?\/\//.test(url) &&
    !url.startsWith('data:') &&
    !url.startsWith('mailto:') &&
    !url.startsWith('tel:') &&
    !url.startsWith('#') &&
    !url.startsWith('javascript:');
}

function normalizeRef(url) {
  return decodeURIComponent(url.split(/[?#]/)[0]);
}

// --- 1. Every locally referenced asset must exist ---------------------------
const referenced = new Map(); // abs path -> first referencing file

function collectRefs(rel, html) {
  const dir = dirname(join(ROOT, rel));
  const attrRe = /(?:src|href|poster|data-bg)\s*=\s*["']([^"']+)["']/g;
  const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  for (const re of [attrRe, urlRe]) {
    for (const m of html.matchAll(re)) {
      const url = m[1].trim();
      if (!isLocalRef(url)) continue;
      const path = normalizeRef(url);
      if (!path || path.endsWith('/')) continue;
      const abs = resolve(dir, path);
      if (!referenced.has(abs)) referenced.set(abs, rel);
    }
  }
}

const pageHtml = {};
for (const page of PAGES) {
  if (!existsSync(join(ROOT, page))) {
    errors.push(`${page}: page missing`);
    continue;
  }
  pageHtml[page] = read(page);
  collectRefs(page, pageHtml[page]);
}

// Also resolve url() refs inside every referenced/known CSS file
for (const css of ['assets/css/styles.css', 'en/css/styles.css']) {
  if (existsSync(join(ROOT, css))) collectRefs(css, read(css));
}

for (const [abs, from] of referenced) {
  if (!existsSync(abs)) {
    errors.push(`${from}: references missing file ${abs.slice(ROOT.length + 1)}`);
  }
}

// --- 2. ES/EN structural parity ---------------------------------------------
if (pageHtml['index.html'] && pageHtml['en/index.html']) {
  const sectionIds = (html) =>
    [...html.matchAll(/<section[^>]*\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  const es = sectionIds(pageHtml['index.html']);
  const en = sectionIds(pageHtml['en/index.html']);
  if (es.join(',') !== en.join(',')) {
    errors.push(
      `ES/EN section parity broken.\n    es: [${es.join(', ')}]\n    en: [${en.join(', ')}]`
    );
  }
  for (const sel of ['availability-form', 'swiper-slide', 'faq-item', 'review-card']) {
    const count = (html) => (html.match(new RegExp(sel, 'g')) || []).length;
    const [a, b] = [count(pageHtml['index.html']), count(pageHtml['en/index.html'])];
    if (a !== b) warnings.push(`[PRD-001] "${sel}" count differs: es=${a} en=${b}`);
  }
  const lang = (html) => (html.match(/<html[^>]*\blang=["']([^"']+)["']/) || [])[1];
  if (!/^es/.test(lang(pageHtml['index.html']) || '')) errors.push('index.html: <html lang> must be "es"');
  if (!/^en/.test(lang(pageHtml['en/index.html']) || '')) errors.push('en/index.html: <html lang> must be "en"');
  for (const page of PAGES) {
    if (!/hreflang=/.test(pageHtml[page])) warnings.push(`[PRD-003] ${page}: no hreflang alternates`);
  }
}

// --- 3. PRD-001: no forked per-language assets -------------------------------
for (const forked of ['en/css', 'en/js']) {
  if (existsSync(join(ROOT, forked))) {
    flag(ENFORCE.sharedAssetsOnly, `[PRD-001] ${forked}/ exists — EN page must use shared assets/`);
  }
}

// --- 4. PRD-002: media budget ------------------------------------------------
const WARN_BYTES = 500 * 1024;
const FAIL_BYTES = 2.5 * 1024 * 1024;
for (const [abs, from] of referenced) {
  if (!existsSync(abs)) continue;
  const size = statSync(abs).size;
  const relPath = abs.slice(ROOT.length + 1);
  if (size > FAIL_BYTES) {
    flag(ENFORCE.mediaBudget, `[PRD-002] ${relPath} is ${(size / 1048576).toFixed(1)} MB (max 2.5 MB), referenced by ${from}`);
  } else if (size > WARN_BYTES && ENFORCE.mediaBudget) {
    warnings.push(`[PRD-002] ${relPath} is ${(size / 1024).toFixed(0)} KB (target ≤ 500 KB)`);
  }
}
// Unversioned CDN dependencies can change under us overnight
for (const page of PAGES) {
  if (pageHtml[page] && /unpkg\.com\/swiper\//.test(pageHtml[page]) && !/unpkg\.com\/swiper@\d/.test(pageHtml[page])) {
    flag(ENFORCE.mediaBudget, `[PRD-002] ${page}: Swiper CDN URL is not version-pinned`);
  }
}

// --- 5. PRD-003: SEO infrastructure ------------------------------------------
for (const f of ['sitemap.xml', 'robots.txt', '404.html', 'site.webmanifest']) {
  if (!existsSync(join(ROOT, f))) flag(ENFORCE.seoFiles, `[PRD-003] missing ${f}`);
}
if (!['favicon.ico', 'favicon.svg', 'favicon.png'].some((f) => existsSync(join(ROOT, f)))) {
  flag(ENFORCE.seoFiles, '[PRD-003] no favicon at repo root');
}
for (const page of PAGES) {
  const html = pageHtml[page];
  if (!html) continue;
  const og = (html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/) || [])[1];
  if (og && !/^https?:\/\//.test(og)) {
    flag(ENFORCE.seoFiles, `[PRD-003] ${page}: og:image must be an absolute URL (got "${og}")`);
  }
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { errors.push(`${page}: invalid JSON-LD block`); }
  }
}

// --- 6. PRD-004: WhatsApp funnel ----------------------------------------------
const phones = new Set();
const sources = PAGES.filter((p) => pageHtml[p]).map((p) => [p, pageHtml[p]]);
if (existsSync(join(ROOT, 'assets/js/scripts.js'))) {
  sources.push(['assets/js/scripts.js', read('assets/js/scripts.js')]);
}
for (const [file, text] of sources) {
  for (const m of text.matchAll(/wa\.me\/\+?(\d+)/g)) {
    phones.add(m[1]);
    if (!ALLOWED_PHONES.has(m[1])) {
      errors.push(`${file}: unknown WhatsApp number +${m[1]} (allowed: ${[...ALLOWED_PHONES].join(', ')})`);
    }
  }
}
if (phones.size > 1) {
  flag(ENFORCE.singlePhone, `[PRD-004] ${phones.size} different WhatsApp numbers in the funnel: ${[...phones].map((p) => '+' + p).join(', ')}`);
}
if (phones.size === 0) errors.push('No WhatsApp links found — the booking funnel is gone');

// --- 7. PRD-004: pricing data shape ------------------------------------------
const pricingPath = 'assets/data/pricing.json';
if (!existsSync(join(ROOT, pricingPath))) {
  errors.push(`missing ${pricingPath}`);
} else {
  try {
    const pricing = JSON.parse(read(pricingPath));
    if (!Array.isArray(pricing.units) || !Array.isArray(pricing.seasons)) {
      errors.push(`${pricingPath}: expected "units" and "seasons" arrays`);
    }
  } catch {
    errors.push(`${pricingPath}: invalid JSON`);
  }
}

// --- Report -------------------------------------------------------------------
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(
  `\nverify: ${errors.length} error(s), ${warnings.length} warning(s) · ` +
  `${referenced.size} asset refs checked · enforce flags: ` +
  Object.entries(ENFORCE).map(([k, v]) => `${k}=${v ? 'on' : 'off'}`).join(' ')
);
process.exit(errors.length ? 1 : 0);
