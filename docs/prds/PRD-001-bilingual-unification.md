# PRD-001: Bilingual architecture unification

- **Status:** Not started
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

## Acceptance criteria

- [ ] `en/css/` and `en/js/` directories no longer exist
- [ ] `grep -c 'assets/css/styles.css' en/index.html` ≥ 1 (via `../assets/...`)
- [ ] Both pages render correctly when served from repo root (`bash scripts/serve.sh`,
      check `/` and `/en/` at desktop and 360px widths)
- [ ] Section-id parity check in `node scripts/verify.mjs` passes
- [ ] No EN-only visual fix was lost (hero jacuzzi positioning matches on both pages)
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
