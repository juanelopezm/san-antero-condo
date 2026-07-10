# PRD-008: Content accuracy and trust

- **Status:** In progress — requirements 1, 2, 4, 5 done; requirement 3 (reviews) blocked on owner data
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

## Resolution notes

- **Requirement 1 (README):** rewritten from scratch — real project structure
  (`index.html`/`en/`/`assets/`/`docs/`/`scripts/`/`.github/`), GitHub Pages
  deploy model, local dev commands (`scripts/serve.sh`, `verify.mjs`,
  `npm run check`/`lint:css`), and pointers to `docs/PRODUCT.md`/`docs/BACKLOG.md`/
  `CLAUDE.md`. Removed the fictional `src/` layout and S3 deployment section
  entirely.
- **Requirement 2 (attraction names):** confirmed and fixed the exact issue the
  PRD flagged — both pages' attractions section headed the island cluster
  "Islas de San Anofre" / "San Anofre Islands", which isn't a real place name.
  The archipelago containing Isla Múcura and Isla Tintipán (matching
  `Mucura.jpeg`/`tintinpan.mp4` already in `assets/images/`) is **Islas de San
  Bernardo** — fixed on both pages. Did not exhaustively re-verify every other
  claim in that section (e.g. "Tintipán is the largest island in the
  archipelago") — scoped the fact-check to the specific naming issue the PRD
  identified with a confident answer, rather than re-litigate every sentence
  without a similarly solid source.
- **Requirement 3 (reviews):** **not done** — left the two existing reviews
  untouched. They already carry a name (`Leonardo Antonio Rincon Valencia`,
  `Franco Franco`) but no date or source platform, and I have no way to
  determine either without inventing them, which CLAUDE.md explicitly
  prohibits. Removing the two existing reviews would take trust content to
  zero, which isn't obviously better than what's there — so this stays
  blocked on the owner supplying 2–3 real, dated, sourced reviews rather than
  either fabricating data or deleting real (if incompletely attributed)
  guest feedback. Flagged in `docs/BACKLOG.md`.
- **Requirement 4 (SECURITY.md):** replaced the unfilled GitHub template with
  the actual static-site threat model (XSS via content edits, pinned CDN
  dependencies, GitHub Pages deploy speed) and a real reporting path (GitHub
  private vulnerability reporting, WhatsApp as fallback — there's no security
  email anywhere in this repo to point to).
- **Requirement 5 (footer year):** bumped `&copy; 2025` → `2026` on both pages
  (also fixed a missing accent: "Paraiso" → "Paraíso", while touching that
  line) and added a `CLAUDE.md` gotcha to bump it again next time someone
  touches the footer.

## Acceptance criteria

- [x] README describes the real repo (no `src/`, no S3) and the harness workflow
- [x] Attraction names verified or explicitly flagged in both languages, consistent ES↔EN
- [ ] Reviews carry attribution context on both pages — blocked on the owner; existing reviews left as-is rather than invented or deleted
- [x] `node scripts/verify.mjs` passes; ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash — kept at "In progress" until requirement 3 has real data
