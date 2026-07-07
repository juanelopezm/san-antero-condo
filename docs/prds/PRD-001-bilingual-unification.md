# PRD-001: Bilingual architecture unification

- **Status:** Done
- **Priority:** P0
- **Depends on:** none
- **Goal traceability:** "Stay maintainable at near-zero cost", "Bilingual parity" invariant

## Problem

The English site is a full copy of the Spanish site with its **own diverged CSS and
JS**:

- `en/css/styles.css` differs from `assets/css/styles.css` (confirmed via `diff`),
  so visual fixes land on one language and silently miss the other (the git log is
  full of Safari/jacuzzi fixes that had to be made twice or were made once).
- `en/js/main.js` (255 lines) duplicates and diverges from `assets/js/scripts.js`
  (146 lines).
- `index.html` (627 lines) and `en/index.html` (601 lines) drift structurally —
  the 26-line difference is untracked divergence, not translation.

Every content or style change currently requires two edits, and nothing detects when
someone forgets the second one.

## Outcome

One shared stylesheet and one shared script serve both languages; the two HTML files
differ only in text content and locale metadata. Drift becomes mechanically
detectable by `scripts/verify.mjs`.

## Requirements

1. `en/index.html` must reference the shared `../assets/css/styles.css` and
   `../assets/js/scripts.js` (with correct relative paths). Delete `en/css/` and
   `en/js/` after migrating anything EN-only into the shared files.
2. Before deleting, diff `en/css/styles.css` against `assets/css/styles.css` and
   `en/js/main.js` against `assets/js/scripts.js`; port any fix that exists only on
   the EN side into the shared file (do not lose the newest Safari/hero fixes —
   compare rendered output, not just timestamps).
3. Any behavior that must differ by language (WhatsApp message text, labels) must
   key off `document.documentElement.lang`, which `assets/js/scripts.js` already does.
4. Both pages must keep identical section structure: same section `id`s in the same
   order (`apartments`, `amenities`, `special-events`, `location`, `attractions`,
   `reviews`, `pricing`, `faq`, plus hero and galleries).
5. Inline `<style>` blocks in the HTML heads must be removed and merged into the
   shared stylesheet.
6. Cache-busting query strings (`styles.css?v=4`) must be consistent between both
   pages after unification.

## Out of scope

- Template/static-site-generator adoption (would break the "no build step" invariant).
- Translating any new content (parity of existing content only).

## Resolution notes

Actual investigation found the divergence was less dangerous than assumed but the
files were still a hazard:

- `en/css/styles.css` and `en/js/main.js` were **orphaned** — neither was
  referenced by any `<link>`/`<script>` tag in `en/index.html` (EN already loaded
  the shared `../assets/css/styles.css`). They were stale leftovers from an earlier
  gallery implementation, not an active fork.
- `assets/js/main.js` (loaded by `index.html`) mixed one essential piece — Swiper
  carousel init — with ~160 lines of dead code: a `mediaGalleries`/`openGallery`
  lightbox system with no matching markup (`#apartment-101` ids, `.media-container`
  elements) anywhere in either page, plus a no-op "active nav link on scroll"
  handler (the nav has no section links, only the language switcher).
  `assets/js/gallery.js` was a 0-byte stub, also unreferenced.
- `index.html` additionally carried a second, conflicting inline `<script>`
  redefining `openGallery`/`closeGallery` at the bottom of the body — also dead,
  same reason.
- Both pages had a byte-for-byte duplicate inline `<style>` block
  (`.gallery-item img/video`, `.gallery-grid` mobile columns) that was already
  present verbatim in `assets/css/styles.css` — pure redundancy, not divergence.
- `en/index.html`'s only genuinely live JS (Swiper init with slightly different
  options — no `disableOnInteraction`, no scrollbar config) lived in its own
  inline `<script>` since it never loaded `main.js`.

Fix applied: consolidated Swiper initialization into `assets/js/scripts.js`
(`initHeroCarousel()`, called from the existing `DOMContentLoaded` handler) using
the fuller option set (`loop`, `autoplay.disableOnInteraction: false`, pagination,
navigation — scrollbar option dropped, no `.swiper-scrollbar` element exists).
Deleted `en/css/`, `en/js/`, `assets/js/main.js`, `assets/js/gallery.js`. Removed
the duplicate inline `<style>` blocks and both dead inline `<script>` blocks from
both HTML files. Both pages now load exactly one CSS file
(`assets/css/styles.css`) and one JS file (`assets/js/scripts.js`), confirmed live
via local server (200s on shared assets, 404s on the deleted paths). Fixed a
version-string mismatch between `preload` and `stylesheet` links
(`?v=2` vs `?v=4`) on both pages while touching these lines; bumped both to `?v=5`.

## Acceptance criteria

- [x] `en/css/` and `en/js/` directories no longer exist
- [x] `grep -c 'assets/css/styles.css' en/index.html` ≥ 1 (via `../assets/...`)
- [x] Both pages render correctly when served from repo root (`bash scripts/serve.sh`,
      checked `/` and `/en/`; script/CSS wiring verified via curl against a live server)
- [x] Section-id parity check in `node scripts/verify.mjs` passes
- [x] No EN-only visual fix was lost (hero jacuzzi positioning — `55%/60%` — confirmed
      intact in `assets/css/styles.css`, used by both pages)
- [x] `docs/BACKLOG.md` row updated to Done with the completing commit hash
