# Backlog

Single source of truth for PRD status. Agents: update your PRD's row (status +
commit hash) in the **same commit** that completes it. Work top-down within a
priority band unless dependencies force otherwise.

| PRD | Title | Priority | Depends on | Status | Completed in |
|---|---|---|---|---|---|
| [PRD-001](prds/PRD-001-bilingual-unification.md) | Bilingual architecture unification | P0 | — | Not started | |
| [PRD-004](prds/PRD-004-booking-funnel.md) | Booking funnel hardening | P0 | PRD-001 | Not started | |
| [PRD-002](prds/PRD-002-media-performance.md) | Media and performance optimization | P0 | PRD-001 | Not started | |
| [PRD-005](prds/PRD-005-quality-ci.md) | Quality tooling and CI | P0 | — | In progress | |
| [PRD-003](prds/PRD-003-seo-discoverability.md) | SEO and discoverability | P1 | — | Not started | |
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

- [ ] Canonical WhatsApp number: is `+573014109986` (hero "Reserva Ahora") a second
      manager, or a typo for `+573015382699`? (PRD-004)
- [ ] Real pricing per unit/season for `pricing.json` (PRD-004)
- [ ] Analytics choice: GA4 (recommended) vs GoatCounter, and who owns the account (PRD-007)
- [ ] 2–3 recent attributable guest reviews (PRD-008)
- [ ] Confirm tour destinations: Islas de San Bernardo / Múcura / Tintipán naming (PRD-008)
