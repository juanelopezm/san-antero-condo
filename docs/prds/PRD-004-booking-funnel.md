# PRD-004: Booking funnel hardening

- **Status:** In progress — items 1, 2, 5 done; items 3–4 blocked on real pricing/policy data from the owner (see Resolution notes)
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

## Resolution notes

**Done, unblocked (no invented data required):**

- **Requirement 1 (single number):** used the documented default —
  `+573015382699` — since it already covered 18 of 20 `wa.me` links; the outlier
  was only the hero "Reserva Ahora"/"Book Now" button on both pages. Fixed both,
  removed the second number from `scripts.js`'s `BOOKING_PHONE`, and shrank
  `verify.mjs`'s `ALLOWED_PHONES` to the single canonical number with
  `singlePhone` now enforced. **Flagging per CLAUDE.md:** if `+573014109986` was
  actually a second manager's line rather than a typo, this needs to be reverted
  and the second number routed deliberately — owner confirmation still open in
  `docs/BACKLOG.md`.
- **Requirement 2 (form validation):** implemented in `scripts.js`
  (`validateAvailability`): rejects checkin before today, checkout ≤ checkin, and
  guests outside 1–10; also validates guests against the selected unit's real
  capacity (studios 101–104 max 5, apartments 201–202 max 10 — both facts already
  stated in the hero copy). Errors render inline in a bilingual `.form-error` box
  (`role="alert"`) instead of ever building a malformed WhatsApp message.
  Verified end-to-end with a headless-browser script driving all four cases
  (past date, inverted dates, over-capacity, valid submission) — see commit.
- **Requirement 5 ("how to book" block):** added to both pages using only facts
  already verified elsewhere on the site (check-in/check-out times, accepted
  payment methods from the existing FAQ) plus a direct instruction to ask about
  deposit/cancellation via WhatsApp — deliberately **not** inventing a deposit
  percentage, a cancellation deadline, or a response-time SLA, since none of
  those are documented anywhere in the repo and CLAUDE.md prohibits guessing
  this kind of business fact.

**Blocked on the owner (`docs/BACKLOG.md` → "Decisions needed from the owner"):**

- **Requirement 3 (pricing data):** `assets/data/pricing.json` exists with the
  full unit/season/min-stay structure the PRD asked for, but every price field
  is `null` — there is no real pricing anywhere in the repo's history to draw
  from, and CLAUDE.md is explicit: never invent prices. `scripts.js`
  (`loadPricing`/`renderPricingTable`) fetches and parses the file on both pages
  (confirmed via headless browser: no JS errors, `#pricing-table` correctly stays
  `hidden` with empty markup while all prices are null) but **deliberately does
  not render a table of placeholder values to real guests**. The moment the
  owner fills in real numbers, the table renders with zero further code changes.
- **Requirement 4 (price in the WhatsApp message):** the message builder
  (`buildWhatsAppText`) already includes language, unit, dates, and guest count;
  it has a `price` parameter wired to `pricingByUnit` and will append the rate
  the visitor saw the moment requirement 3's data exists — untestable with real
  values until then.

## Acceptance criteria

- [x] `grep -roE 'wa.me/[+0-9]+' index.html en/index.html assets/js | sort -u` returns exactly one number
- [x] Form rejects: past checkin, checkout ≤ checkin, guests out of range — with visible bilingual messages (headless-browser verified)
- [x] `assets/data/pricing.json` exists, is valid JSON, and both pages fetch/parse it — rendering is intentionally withheld until prices are non-null (see notes)
- [ ] Submitting the form opens a WhatsApp URL whose decoded text contains dates, guests, unit, and price — price omitted pending owner data; dates/guests/unit confirmed present
- [x] `node scripts/verify.mjs` passes including the single-number check
- [x] ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash — kept at "In progress" until requirements 3–4 have real data
