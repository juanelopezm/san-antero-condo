# CLAUDE.md — Agent operating manual

Bilingual static site (no build step) for **Cabañas Mi Pequeño Paraíso**, beachfront
vacation rentals in Playa Blanca, San Antero, Córdoba, Colombia. Deploys via
**GitHub Pages from `main`** — every commit to `main` is live to real guests within
minutes. Product definition: `docs/PRODUCT.md`. Work queue: `docs/BACKLOG.md`.

## Layout

```
index.html          Spanish page (primary, canonical)
en/index.html       English page (must stay in structural parity with Spanish)
assets/css|js|images  Shared assets (en/css + en/js are legacy forks — PRD-001 removes them)
docs/PRODUCT.md     Deduced product vision + site-wide invariants
docs/BACKLOG.md     PRD status table + open owner decisions
docs/prds/          One PRD per missing requirement (PRD-000 is the template)
scripts/verify.mjs  Dependency-free quality gate (run on every change)
scripts/serve.sh    Local preview matching the Pages layout
```

## The loop

1. Pick work: next unblocked PRD from `docs/BACKLOG.md` (or the explicit request).
2. Preview: `bash scripts/serve.sh` → check `/` and `/en/` (also at 360px width).
3. Edit. **Any content/structure change to one language must land on the other in
   the same commit.**
4. Gate: `node scripts/verify.mjs` must exit 0. `npm run check` adds HTML validation;
   `npm run lint:css` lints the shared stylesheet (installs `stylelint` locally,
   not saved to `package.json` — same pattern CI uses). CI runs all three on every
   push.
5. When a PRD's acceptance criteria are all met: flip that PRD's flag in the
   `ENFORCE` block of `scripts/verify.mjs` (turns its warnings into errors),
   set the PRD file's Status to Done, and update its `docs/BACKLOG.md` row with
   the commit hash — all in the completing commit.

## Hard invariants (never break, even mid-PRD)

- **Relative paths only.** The site lives at `/san-antero-condo/` on GitHub Pages;
  a leading `/` breaks production. Remember CSS `url()` resolves relative to the
  CSS file (`../images/...` from `assets/css/`), not the page.
- **WhatsApp numbers** only from the allowlist in `scripts/verify.mjs`
  (`+573015382699` primary; `+573014109986` legacy — consolidation pending
  PRD-004 owner decision).
- **No build step, no frameworks, no runtime dependencies.** `package.json` exists
  only for npx-run dev tooling. Never commit `node_modules` or add a bundler.
- **Bilingual parity**: same section ids in the same order on both pages
  (`verify.mjs` enforces this).
- **Don't degrade the funnel**: every page must keep at least one working
  `wa.me` CTA above the fold.

## Owner decisions — do not guess

`docs/BACKLOG.md` has a "Decisions needed from the owner" list (canonical phone
number, real pricing, analytics account, review sourcing, island naming). When a
task hits one, use the documented default if one is stated, flag it in your
summary, and move on — never invent prices, phone numbers, or reviews.

## Gotchas learned from this repo's history

- Safari has repeatedly broken on background-image paths and `backdrop-filter` —
  after CSS changes, sanity-check WebKit (`-webkit-backdrop-filter`, path
  resolution). This is also why `.stylelintrc.json` disables
  `property-no-vendor-prefix` — don't let a linter or `--fix` strip that prefix.
- The hero jacuzzi image's focal point is sensitive: `background-position` is
  deliberately `55%/60%` (commit `fce7d99`). Don't "fix" it without looking at it.
- `styles.css?v=N` cache-busting: bump the version on both pages together when
  changing the stylesheet.
- Some translations differ in nuance, not just language — read the EN text, don't
  machine-copy the Spanish.

## Commits

Conventional prefixes (`feat:`, `fix:`, `perf:`, `docs:`, `chore:`) as in the
existing history. One PRD (or one coherent fix) per commit. Verify before every
commit.
