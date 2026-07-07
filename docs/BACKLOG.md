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
| [PRD-006](prds/PRD-006-accessibility.md) | Accessibility (WCAG 2.1 AA) | P1 | PRD-001 | Not started | |
| [PRD-007](prds/PRD-007-analytics.md) | Analytics and conversion measurement | P2 | PRD-004 | Not started | |
| [PRD-008](prds/PRD-008-content-trust.md) | Content accuracy and trust | P2 | — | Not started | |

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
- [ ] Analytics choice: GA4 (recommended) vs GoatCounter, and who owns the account (PRD-007)
- [ ] 2–3 recent attributable guest reviews (PRD-008)
- [ ] Confirm tour destinations: Islas de San Bernardo / Múcura / Tintipán naming (PRD-008)
- [ ] Register `sitemap.xml` with Google Search Console / Bing Webmaster Tools once PRD-003 is live — agents can't do this, needs the owner's Google/Microsoft account (PRD-003, done otherwise)

## Known debt (not blocking, flagged for a future pass)

- `assets/css/styles.css` has several genuine duplicate selectors (`body`,
  `.apartment`, `.gallery-nav`, `.popup-gallery`, others) — `stylelint`'s
  `no-duplicate-selectors` rule is disabled rather than auto-merged, since
  collapsing them risks silently changing which declaration wins. (found in PRD-005)
- The shared `.cta-button` class used *without* `.primary` (8 places across both
  pages) has no color of its own and falls back to default link-blue — invisible
  on light backgrounds, visibly broken on dark ones. `404.html` patches around it
  locally; the underlying shared rule hasn't been audited. (found in PRD-003)
