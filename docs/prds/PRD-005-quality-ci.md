# PRD-005: Quality tooling and CI

- **Status:** In progress (bootstrapped by the harness commit; finish the remaining items)
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

## Acceptance criteria

- [ ] `.github/workflows/ci.yml` runs verify + html-validate + stylelint on every push/PR and passes on `main`
- [ ] `.htmlvalidate.json` and `.stylelintrc.json` committed; both pages pass
- [ ] Weekly external-link-check workflow exists
- [ ] `node scripts/verify.mjs` runs with no `node_modules` present
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
