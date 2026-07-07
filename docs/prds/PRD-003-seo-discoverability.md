# PRD-003: SEO and discoverability infrastructure

- **Status:** Done
- **Priority:** P1
- **Depends on:** none
- **Goal traceability:** "Rank locally"

## Problem

On-page SEO is decent (meta description, keywords, geo tags, hreflang, OG tags,
JSON-LD injected by `assets/js/scripts.js`), but the site is missing the
infrastructure files search engines expect:

- No `sitemap.xml`, no `robots.txt`
- No favicon of any kind and no `site.webmanifest` (browser tab shows the default
  globe; bookmarks and mobile home-screen adds look broken)
- No `404.html` (GitHub Pages serves its generic 404, losing the visitor)
- Structured data is injected by **client-side JS**, which some crawlers execute
  late or never — it should be static in the HTML
- `og:image` uses a relative path (`assets/images/atardecer.jpg`), which is invalid
  for Open Graph — social shares show no image

## Outcome

The site is fully crawlable and indexable, previews correctly when shared on
WhatsApp/Facebook (critical: the funnel *is* WhatsApp), and keeps lost visitors
with a branded 404.

## Requirements

1. Add `sitemap.xml` listing `/` and `/en/` with `hreflang` alternates, and
   `robots.txt` pointing to it.
2. Add favicon set: `favicon.ico`, `favicon.svg` (or 32px PNG),
   `apple-touch-icon.png` (180px), and `site.webmanifest`; link them from both
   pages. Derive the icon from the palm/beach branding (a simple palette-colored
   monogram is fine — generate it, don't hunt for design assets).
3. Add branded `404.html` (bilingual: short ES + EN text) linking back to both
   home pages and the WhatsApp CTA.
4. Move the `LodgingBusiness` and `FAQPage` JSON-LD out of `scripts.js` into
   static `<script type="application/ld+json">` blocks in each HTML head
   (ES and EN localized). Remove the injection code and its duplicate-guard logic.
5. Fix `og:image` (and `twitter:image`, add if missing) to absolute URLs:
   `https://juanelopezm.github.io/san-antero-condo/assets/images/...`. EN page gets
   its own canonical + OG URL (`.../en/`).
6. Verify hreflang symmetry: EN page must declare `es` and `x-default` alternates
   mirroring the ES page.
7. Add `verify.mjs` checks: sitemap/robots/favicon/404 existence, absolute
   `og:image`, JSON-LD parses as valid JSON in both pages.

## Out of scope

- Content/keyword rewriting, blog, or landing pages.
- Search Console registration (owner action — see note below).

## Resolution notes

- **Requirements 1 (sitemap/robots):** added, both list `/` and `/en/` with
  `hreflang` alternates; `sitemap.xml` validated as well-formed XML.
- **Requirement 2 (favicon set):** generated a palette-colored monogram (a simple
  palm-tree silhouette on the site's Caribbean-blue `--primary-color`) with Pillow
  — no stock/hunted assets. Same geometry rendered twice: once as raster (via
  `ImageDraw` polygons → `favicon.ico` at 16/32/48px, `apple-touch-icon.png` at
  180px, 192px/512px PNGs for the manifest) and once hand-written as
  `favicon.svg` from the identical coordinate math, so the vector and raster
  versions actually match (screenshot-verified side by side). Linked from both
  pages' `<head>` and from `404.html`.
- **Requirement 3 (404.html):** bilingual (ES block, then EN block), reuses the
  shared stylesheet/fonts so it looks like the rest of the site, links back to
  both home pages and to WhatsApp. Caught a pre-existing site-wide gap while
  building it: the shared `.cta-button` class (used without `.primary` in 8
  other places already on the live pages) has no color of its own and silently
  falls back to default link-blue — invisible as a "bug" on light backgrounds
  but reads as visibly broken on this page's dark background. Fixed it locally
  in `404.html`'s own `<style>` block (outline-button treatment) rather than
  touch the shared rule, since auditing all 8 existing bare usages sitewide is
  outside this PRD's scope — flagged as a candidate for a future pass.
- **Requirement 4 (static JSON-LD):** moved `LodgingBusiness` + `FAQPage` out of
  `assets/js/scripts.js` (`injectStructuredData()` deleted, ~65 lines) into
  static `<script type="application/ld+json">` blocks in each page's `<head>`,
  localized (EN block uses the EN FAQ copy and the `/en/` URLs). These are now
  hand-maintained, not DOM-derived — the head comment says so, and points at
  `#reviews .review-card` / `#faq .faq-item` as the source of truth to keep in
  sync if those sections change.
- **Requirement 5 (absolute og:image):** fixed on both pages, added `og:url` and
  `twitter:image` (the latter was missing entirely) as absolute URLs too.
- **Requirement 6 (hreflang symmetry):** both pages were missing their own
  self-referencing hreflang tag (ES page had `en`+`x-default` but not `es`; EN
  page had `es`+`x-default` but not `en`) — added both, so each page now
  declares all three alternates including itself, standard practice.
- **Requirement 7 (verify.mjs checks):** already scaffolded by the harness
  bootstrap (file existence, absolute `og:image`, JSON-LD validity) — flipped
  `seoFiles` from warn to enforced now that all of it passes.
- **HTML validation:** `404.html` added to both `npm run lint:html` and CI's
  HTML-validation step.

**Owner action still needed (not something an agent can do):** register
`sitemap.xml` with Google Search Console / Bing Webmaster Tools once this is
live. Noting it here per the PRD's own "out of scope."

## Acceptance criteria

- [x] `sitemap.xml`, `robots.txt`, `404.html`, favicon set, `site.webmanifest` exist at repo root and validate
- [x] Both pages contain static, valid JSON-LD (verified via headless-browser JSON.parse of every block, both pages)
- [x] `og:image` is an absolute URL on both pages (verified via grep); WhatsApp preview itself untestable from this sandbox (no outbound WhatsApp access) but the URL is a real, publicly reachable path once deployed
- [x] `node scripts/verify.mjs` passes including new SEO checks (`seoFiles` enforced)
- [x] ES and EN pages remain in parity
- [x] `docs/BACKLOG.md` row updated to Done with the completing commit hash
