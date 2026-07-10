# Security Policy

## Scope

This is a static HTML/CSS/JS site with no build step, no backend, and no
runtime dependencies — `package.json` only pulls in dev-time linting tools via
`npx`, none of which ship to production. There's no database, no server code,
and no user accounts, so most traditional web vulnerability classes (SQLi,
auth bypass, SSRF, etc.) don't apply here.

Realistic risk areas for this repo:

- **XSS via content edits** — `assets/js/scripts.js` writes some user-influenced
  values into the DOM (e.g. the availability form's error messages). Any change
  there should keep using safe DOM APIs (`textContent`, not `innerHTML` with
  unsanitized input).
- **Third-party CDN dependencies** — Swiper and Font Awesome are loaded from
  `unpkg.com`/`cdnjs.cloudflare.com`. `assets/css/styles.css` and
  `assets/js/scripts.js` are self-hosted and version-pinned deliberately; the
  CDN scripts should stay version-pinned too (see `docs/prds/PRD-002-media-performance.md`).
- **GitHub Pages deploy integrity** — every push to `main` is live within
  minutes (see `CLAUDE.md`). There's no staging gate beyond CI
  (`.github/workflows/ci.yml`) and manual review.

## Reporting a Vulnerability

Please report security issues privately rather than opening a public GitHub
issue:

1. Preferred: use GitHub's private vulnerability reporting for this repository
   (the "Security" tab → "Report a vulnerability"), if enabled for this repo.
2. Otherwise: contact the owner via the WhatsApp number listed on the site
   (`https://juanelopezm.github.io/san-antero-condo/`) — the same number used
   for the booking funnel.

This is a small, unpaid-maintenance project — there's no formal SLA, but
reports will be looked at and, if valid, fixed and deployed promptly given how
fast changes to `main` go live.
