# PRD-004: Booking funnel hardening

- **Status:** Not started
- **Priority:** P0
- **Depends on:** PRD-001 (single shared scripts.js)
- **Goal traceability:** "Generate booking inquiries"

## Problem

The entire business runs through the WhatsApp funnel, and it has cracks:

- **Two different WhatsApp numbers** are live: `+573015382699` (9 links per page +
  `scripts.js` default) and `+573014109986` (1 link per page — the *primary hero
  "Reserva Ahora" button*, `index.html:85`). Inquiries split across two phones; the
  most prominent CTA may go to the wrong one. `scripts.js:23` even carries a comment
  acknowledging the ambiguity.
- The availability form does not validate dates: checkout can precede checkin, and
  past dates are accepted; the resulting WhatsApp message can be nonsense
  ("del 2026-09-10 al 2026-09-05").
- The "Disponibilidad" (pricing) section exists but pricing data is embedded prose —
  there is no structured price/season data an agent or the owner can update safely.
- No guidance on response expectations (hours, deposit, cancellation), which costs
  conversions and creates repetitive WhatsApp questions already covered by the FAQ.

## Outcome

Every CTA reaches one canonical number with a well-formed, pre-qualified message;
the form cannot produce invalid inquiries; pricing/availability data lives in one
editable JSON file rendered onto both pages.

## Requirements

1. Confirm the canonical booking number with the owner (default assumption:
   **+573015382699**, since 18 of 20 links use it), then make every `wa.me` link and
   `scripts.js` use a single `const BOOKING_PHONE` / data attribute. If the second
   number is intentional (e.g., a second manager), document it in `CLAUDE.md` and
   route it deliberately, not accidentally.
2. Form validation in `scripts.js`: checkin ≥ today, checkout > checkin, guests
   within 1–10, apartment capacity hint (studios max 5, apartments max 10) — show
   inline bilingual error text, never a broken WhatsApp message.
3. Create `assets/data/pricing.json`: per-unit type (studio/apartment), season
   (low/high/holiday), nightly price in COP, min-stay. Render it into the
   `#pricing` section on both pages with a tiny loader in `scripts.js` (graceful
   fallback text if fetch fails on `file://`).
4. WhatsApp message template includes the page language, selected unit, dates,
   guest count, and the price the visitor saw, so the owner can answer in one message.
5. Add a short "Cómo reservar / How to book" block near the form: response time,
   deposit expectation, cancellation summary (pull wording from existing FAQ).

## Out of scope

- Real-time availability calendar or double-booking prevention (owner-managed).
- Payment links.

## Acceptance criteria

- [ ] `grep -roE 'wa.me/[+0-9]+' index.html en/index.html assets/js | sort -u` returns exactly one number (or two, each documented in CLAUDE.md with its purpose)
- [ ] Form rejects: past checkin, checkout ≤ checkin, guests out of range — with visible bilingual messages
- [ ] `assets/data/pricing.json` exists, is valid JSON, and both pages render it
- [ ] Submitting the form opens a WhatsApp URL whose decoded text contains dates, guests, unit, and price
- [ ] `node scripts/verify.mjs` passes including the single-number check
- [ ] ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
