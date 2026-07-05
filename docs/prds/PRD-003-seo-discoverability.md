# PRD-003: SEO and discoverability infrastructure

- **Status:** Not started
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
- Search Console registration (owner action; note it in the completion summary).

## Acceptance criteria

- [ ] `sitemap.xml`, `robots.txt`, `404.html`, favicon set, `site.webmanifest` exist at repo root and validate
- [ ] Both pages contain static, valid JSON-LD (test with `node -e` JSON.parse extraction or the Rich Results test)
- [ ] `og:image` is an absolute URL on both pages; sharing the URL in WhatsApp shows a preview image
- [ ] `node scripts/verify.mjs` passes including new SEO checks
- [ ] ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
