# PRD-008: Content accuracy and trust

- **Status:** Not started
- **Priority:** P2
- **Depends on:** none
- **Goal traceability:** "Build trust"

## Problem

Several content-level issues undermine credibility and maintenance:

- `README.md` documents a `src/` layout and an S3 deployment that don't exist —
  the repo actually deploys via GitHub Pages with an `assets/` + `en/` layout.
  Anyone (human or agent) following the README gets lost immediately.
- History shows island names were corrected once already (`f36e8f8`, Rosario →
  "San Anofre"); the real archipelago near San Antero is **Islas de San Bernardo**
  (Isla Múcura, Tintipán — matching `Mucura.jpeg`, `tintinpan.mp4` in assets).
  Attraction names need a factual pass against what the tours actually visit.
- Reviews in `#reviews` are hardcoded with no dates or sources; stale or
  unverifiable reviews read as fake.
- `SECURITY.md` exists but likely doesn't reflect a static-site reality (no
  dependencies to patch, contact route unclear).
- No `humans.txt`/contact page beyond WhatsApp; no last-updated signal anywhere.

## Outcome

Everything a visitor or contributor reads is accurate: README matches reality,
place names are factually right in both languages, and reviews carry enough
context to be believable.

## Requirements

1. Rewrite `README.md`: actual structure (`index.html`, `en/`, `assets/`,
   `docs/`, `scripts/`), GitHub Pages deployment ("push to main = deploy"),
   local preview (`bash scripts/serve.sh`), quality gate (`node scripts/verify.mjs`),
   and a pointer to `docs/PRODUCT.md` + `docs/BACKLOG.md` for the roadmap.
2. Fact-check attraction names/descriptions in both languages against the media in
   `assets/images/` and public sources (Islas de San Bernardo, Isla Múcura,
   Tintipán, Festival del Burro, mangroves/Bahía de Cispatá). Where the correct
   name is uncertain, flag for owner confirmation instead of guessing.
3. Reviews: add reviewer first name + month/year + origin platform if known; ask
   the owner for 2–3 recent real reviews; remove any that can't be attributed.
4. Update `SECURITY.md` to the static-site reality: what's in scope (XSS via
   content edits, dependency CDNs), how to report (owner email/WhatsApp).
5. Add a footer "last updated" year to both pages (a static year is fine — no
   build step).

## Out of scope

- New marketing copy, blog, photography.

## Acceptance criteria

- [ ] README describes the real repo (no `src/`, no S3) and the harness workflow
- [ ] Attraction names verified or explicitly flagged in both languages, consistent ES↔EN
- [ ] Reviews carry attribution context on both pages
- [ ] `node scripts/verify.mjs` passes; ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
