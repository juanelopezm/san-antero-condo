# Backlog

Single source of truth for PRD status. Agents: update your PRD's row (status +
commit hash) in the **same commit** that completes it. Work top-down within a
priority band unless dependencies force otherwise.

| PRD | Title | Priority | Depends on | Status | Completed in |
|---|---|---|---|---|---|
| [PRD-001](prds/PRD-001-bilingual-unification.md) | Bilingual architecture unification | P0 | — | Done | d1b5891 |
| [PRD-004](prds/PRD-004-booking-funnel.md) | Booking funnel hardening | P0 | PRD-001 | In progress (phone/validation/how-to-book done; pricing blocked on owner data) | |
| [PRD-002](prds/PRD-002-media-performance.md) | Media and performance optimization | P0 | PRD-001 | Done (Lighthouse score unmeasurable in this sandbox — see PRD notes) | |
| [PRD-005](prds/PRD-005-quality-ci.md) | Quality tooling and CI | P0 | — | Done | |
| [PRD-003](prds/PRD-003-seo-discoverability.md) | SEO and discoverability | P1 | — | Done | |
| [PRD-006](prds/PRD-006-accessibility.md) | Accessibility (WCAG 2.1 AA) | P1 | PRD-001 | Done | |
| [PRD-007](prds/PRD-007-analytics.md) | Analytics and conversion measurement | P2 | PRD-004 | In progress (instrumentation done, inert until a real GA4 ID exists) | |
| [PRD-008](prds/PRD-008-content-trust.md) | Content accuracy and trust | P2 | — | In progress (README/attractions/security/footer done; reviews blocked on owner data) | |

## Recommended order

1. **PRD-001** — everything else touches shared files; kill the duplication first.
2. **PRD-004** — the funnel is the business; the two-number split may be losing inquiries today.
3. **PRD-002** — biggest visitor-facing win after the funnel works.
4. **PRD-005** — finish the CI gate so 001–004 can't regress.
5. **PRD-003 → PRD-006 → PRD-008 → PRD-007.**

## Decisions needed from the owner

Agents: when you hit one of these, don't guess — leave the item flagged and note it
in your completion summary.

- [ ] Canonical WhatsApp number: **applied default** — the hero "Reserva Ahora"/
      "Book Now" button now points to `+573015382699` (matching the other 18 of 20
      links) and `+573014109986` was removed from the funnel entirely. If
      `+573014109986` was actually a second manager's line rather than a typo,
      tell us and we'll revert + route it deliberately. (PRD-004)
- [ ] Real pricing per unit/season for `pricing.json` (PRD-004)
- [ ] Analytics: **applied default** — instrumentation built for GA4 (per this
      PRD's own recommendation), fully inert until a real Measurement ID
      exists. Need: (1) confirm GA4 vs GoatCounter, (2) if GA4, create the
      property and give us the `G-XXXXXXXXXX` ID to drop into
      `GA_MEASUREMENT_ID` in `assets/js/scripts.js`, (3) once live, mark
      `whatsapp_click` as a key event in GA4 Admin → Events (PRD-007)
- [ ] 2–3 recent, real, dated, sourced guest reviews — the 2 existing reviews
      have a name each but no date/platform, and were left as-is rather than
      have a date/platform invented for them (PRD-008)
- [ ] Register `sitemap.xml` with Google Search Console / Bing Webmaster Tools once PRD-003 is live — agents can't do this, needs the owner's Google/Microsoft account (PRD-003, done otherwise)
- [ ] Confirm whether any gallery/apartment video has spoken narration — audio
      streams exist on a few clips but content wasn't exhaustively checked; if any
      has speech, that clip needs real captions, not just the descriptive
      `aria-label` every video now has (PRD-006, done otherwise)

## Resolved debt

- ~~`assets/css/styles.css` duplicate selectors~~ — fixed. Investigated all 11
  flagged by re-enabling `no-duplicate-selectors`: `body` and `.apartment` had
  no/partial property conflicts, computed the actual cascade-effective values
  and merged into one rule each, preserving rendered output exactly (verified
  via `getComputedStyle` before touching anything, since later-wins isn't
  always obvious from source order). `.pricing-grid` was a genuine collision
  between the PRD-004 pricing table (new) and a ~70-line dead legacy
  "pricing cards" component (`.pricing-card`, `.featured-label`, `.amount`,
  `.period`, confirmed zero HTML references) — renamed the live table to
  `.pricing-rates-table` and deleted the entire dead block, including its
  entangled duplicate `.features`/`.features i` rules (merged those into the
  one real, actually-used `.features` definition, again preserving the
  cascade-effective computed color). `.gallery-nav`/`.popup-gallery`/etc. were
  the CSS remnant of the lightbox JS already deleted as dead code in PRD-001 —
  confirmed zero references anywhere and deleted the ~300-line block outright.
  `no-duplicate-selectors` is enforced again in `.stylelintrc.json`; visually
  regression-checked apartment cards, gallery grid, and pricing section
  screenshots before/after.
- ~~Bare `.cta-button` (no `.primary`) has no color of its own~~ — fixed. Audited
  all 8 usages (6 apartment cards, festival CTA, "view route" link) — all on
  light backgrounds, none actually invisible, but inconsistent with the site's
  button aesthetic (read as a plain hyperlink). Gave the shared base rule a
  real secondary/outline treatment using `--primary-text` (the WCAG-checked
  color from PRD-006). `404.html`'s local dark-page override still wins there
  via specificity, unchanged.
