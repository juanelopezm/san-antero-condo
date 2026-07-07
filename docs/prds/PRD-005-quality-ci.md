# PRD-005: Quality tooling and CI

- **Status:** Done
- **Priority:** P0
- **Depends on:** none
- **Goal traceability:** "Stay maintainable at near-zero cost", "No build step" invariant

## Problem

Before the harness there was zero automation: no `package.json`, no linting, no HTML
validation, no link checking, no CI. The git history shows the cost — repeated
"fix Safari", "fix image paths", "fix jacuzzi positioning" commits that a validator
or a preview check would have caught. Pushing to `main` deploys instantly to real
visitors with no gate.

The harness commit bootstraps: `scripts/verify.mjs` (invariant checks),
`scripts/serve.sh` (local preview), `package.json` (npx-based tools), and
`.github/workflows/ci.yml`. This PRD covers finishing and extending that baseline.

## Outcome

Every push runs an automated gate that catches broken asset references, ES/EN
drift, invalid HTML, and funnel regressions before they reach guests.

## Requirements

1. Keep `scripts/verify.mjs` **dependency-free** (Node stdlib only) so it runs
   anywhere without install; heavier tools run via `npx` in CI only.
2. Add HTML validation to CI: `npx html-validate index.html en/index.html 404.html`
   with a committed `.htmlvalidate.json` tuned to this codebase (allow inline
   styles initially; tighten over time). Fix the violations it finds.
3. Add stylesheet linting: `npx stylelint "assets/css/*.css"` with
   `stylelint-config-standard`, auto-fix what's safe, commit the config.
4. Add link checking (internal links always; external links as a scheduled weekly
   workflow, not per-push, to avoid flaky CI).
5. CI must finish in under ~2 minutes and require no secrets.
6. Extend `verify.mjs` as other PRDs land their checks (media budget from PRD-002,
   SEO files from PRD-003, single-number from PRD-004) — each PRD adds its check in
   the same commit that satisfies it.
7. Document the full loop in `CLAUDE.md`: `serve → edit → verify → commit`.

## Out of scope

- JS unit-test framework (146 lines of DOM glue doesn't justify one yet; revisit
  if `scripts.js` grows past ~400 lines or gains pricing logic worth testing).
- Deploy workflow changes (GitHub Pages from `main` stays as-is).
- Merging the CSS's genuine duplicate selectors (`no-duplicate-selectors` found
  real repeats — `body`, `.apartment`, `.gallery-nav`, `.popup-gallery` and others,
  each defined twice in `assets/css/styles.css`). Left the rule disabled rather
  than auto-merge: collapsing a duplicate selector can silently change which
  declaration wins the cascade, and that's not a call to make blind. Flagged for
  a follow-up cleanup pass.

## Resolution notes

- **HTML validation (requirement 2):** running `html-validate` surfaced 18 real
  errors, all `no-redundant-role` — `<header role="banner">`, `<nav
  role="navigation">`, `<main role="main">`, `<footer role="contentinfo">`, and
  `<section role="region">` on sections that already get an implicit "region" role
  from their `aria-labelledby`. Fixed all 18 (removed the redundant attribute,
  kept the `aria-label`/`aria-labelledby` that actually supplies the accessible
  name) plus one warning (missing `<iframe title>` on the Google Maps embed, both
  languages). `npx html-validate index.html en/index.html` now exits 0 — the
  `continue-on-error` escape hatch is removed from CI. 6 `prefer-native-element`
  warnings remain (`<div role="region">` instead of `<section>` for the language
  selector, hero section, and swiper container) — left as non-blocking warnings
  since converting them risks a CSS selector review this PRD isn't scoped for.
- **CSS lint (requirement 3):** `stylelint-config-standard` needs a config
  package that plain `npx stylelint` can't resolve on its own (the extended
  config isn't visible from npx's isolated install). `npm run lint:css` now does
  `npm install --no-save stylelint stylelint-config-standard` (gitignored,
  nothing committed) before running — same pattern CI uses. Found 27 issues on
  first run; disabled 2 rules deliberately rather than auto-fixing them:
  `property-no-vendor-prefix` (would have stripped the `-webkit-backdrop-filter`
  CLAUDE.md already documents as a load-bearing Safari fix) and
  `no-duplicate-selectors` (see Out of scope). Auto-fixed the remaining 12 —
  quote style, hex color length, longhand→shorthand `inset`, blank-line
  formatting — all cosmetic, verified with a before/after screenshot that nothing
  moved.
- **Link checking (requirement 4):** the weekly `link-check.yml` workflow already
  existed from the harness bootstrap; no changes needed.
- **Verify script (requirement 1):** confirmed `node scripts/verify.mjs` still
  exits 0 with `node_modules/` completely absent.
- **CLAUDE.md (requirement 7):** documented `npm run lint:css`'s local-install
  pattern in the loop section, and cross-referenced the vendor-prefix exemption
  from the existing Safari gotcha.

## Acceptance criteria

- [x] `.github/workflows/ci.yml` runs verify + html-validate + stylelint on every push/PR and passes on `main`
- [x] `.htmlvalidate.json` and `.stylelintrc.json` committed; both pages pass
- [x] Weekly external-link-check workflow exists
- [x] `node scripts/verify.mjs` runs with no `node_modules` present
- [x] `docs/BACKLOG.md` row updated to Done with the completing commit hash
