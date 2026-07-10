# PRD-007: Analytics and conversion measurement

- **Status:** In progress — instrumentation (requirements 2, 3, 4, 6) done and inert-safe; activation (requirements 1, 5) blocked on the owner creating a GA4 property
- **Priority:** P2
- **Depends on:** PRD-004 (measure the finished funnel, not the broken one)
- **Goal traceability:** "Generate booking inquiries" (you can't improve an unmeasured funnel)

## Problem

`assets/js/scripts.js` already pushes `whatsapp_floating_click` and
`availability_submit` events into `window.dataLayer` — but no analytics tool is
installed, so `dataLayer` never exists and every event falls into a `console.log`.
The owner has no idea how many visitors arrive, from where, in which language, or
how many convert to WhatsApp taps.

## Outcome

The owner can answer: visits per week, ES vs EN split, traffic sources, and — the
number that matters — WhatsApp click-through rate per CTA.

## Requirements

1. Choose the tool with the owner. Default recommendation: **GA4** (free, no
   cookie banner needed in Colombia for basic config, integrates with the existing
   `dataLayer` hooks). Privacy-lighter alternative if preferred: GoatCounter
   (free, no consent needed anywhere).
2. Install on both pages (shared snippet or head include on each; keep parity).
3. Wire events for every funnel action: each hero/section WhatsApp CTA (with a
   `cta_location` param), floating button, availability form submit (with unit +
   guests params), language switch, FAQ expand.
4. Store the measurement ID in one obvious place; document in `CLAUDE.md` how to
   rotate it.
5. If GA4: mark `whatsapp_click` as a key event (conversion). Document the steps
   the owner performs in the GA console (agents can't do those).
6. Do not degrade performance: load the snippet `defer`/async after content
   (PRD-002 budgets still apply).

## Out of scope

- A/B testing, heatmaps, cookie-consent banners (revisit only if EU traffic
  becomes real).

## Resolution notes

**Requirement 1 (choose the tool):** used the PRD's own documented default,
GA4 — genuinely blocked past that point, though: activating it needs a real
Measurement ID from a GA4 property only the owner can create. Rather than wait
on that to land any of this PRD, built everything **inert until configured**:
`assets/js/scripts.js` has a single `GA_MEASUREMENT_ID = ''` constant, and
`initAnalytics()` (called from `DOMContentLoaded`) does nothing at all while
it's empty — no `gtag.js` request, no `window.dataLayer`, verified via a
headless-browser network-request check (zero requests to
`googletagmanager.com`). The moment the owner supplies a real ID, everything
below activates site-wide with no further code changes.

**Requirement 2 (install on both pages):** the loader lives once in the shared
`assets/js/scripts.js`, so "installing" it is inherently in parity — no
per-page snippet to duplicate or drift.

**Requirement 3 (event instrumentation):** rebuilt from the two ad-hoc events
the harness bootstrap had (`whatsapp_floating_click`, a bare
`availability_submit` with no params) into full coverage:
- Every WhatsApp CTA on the page — hero, all 6 apartment cards, pricing
  section, footer contact line, sticky mobile bar, and the JS-injected floating
  button (11 links total) — now carries a `data-cta-location` attribute and
  fires one consistent `whatsapp_click` event with that location. Verified
  headless: all 11 locations are distinct and correct
  (`hero`, `apartment-101`...`apartment-202`, `pricing`, `footer-contact`,
  `sticky-mobile`, `floating_button`).
- `availability_submit` now fires with `{ apartment, guests }` params, and only
  on a submission that actually passes the PRD-004 validation (moved the
  tracking call to fire alongside the real `wa.me` handoff, not on every raw
  `submit` event, so rejected attempts don't inflate the funnel count).
  Verified: filling the form and submitting logs
  `availability_submit {apartment: 101, guests: 4}`.
- Added `language_switch` (not in the original ad-hoc set, but explicitly
  asked for by this requirement) — verified firing with `{ to: 'en' }` /
  `{ to: 'es' }`.
- **FAQ expand: not implemented — there's nothing to instrument.** The FAQ
  section (`#faq .faq-item`) is static always-visible text, not an accordion;
  there's no expand/collapse interaction anywhere in the current markup or CSS.
  Instrumenting an interaction that doesn't exist would mean either fabricating
  a fake event or building new accordion UI as a side effect of an analytics
  PRD — out of scope here. If accordion behavior gets added later, this event
  should be added in that same change.

**Requirement 4 (measurement ID location):** one constant,
`GA_MEASUREMENT_ID` at the top of `assets/js/scripts.js`, documented inline
with a comment explaining the format and what happens while it's empty.

**Requirement 5 (mark `whatsapp_click` as a GA4 key event):** this is a GA4
*console* action (Admin → Events → mark as key event), not a code change — it
also can't be done before a GA4 property exists. Documented here as the first
owner step once they've created the property and dropped in the Measurement
ID: open GA4 Admin → Events → find `whatsapp_click` → toggle "Mark as key
event."

**Requirement 6 (no performance regression):** the loader only ever runs (and
`gtag.js` only ever loads) once a real ID is present — with the current empty
default there is categorically zero performance cost. Once activated, `gtag.js`
loads via a dynamically-created `<script async>` after `DOMContentLoaded`, so
it can't block first paint/LCP; a real before/after Lighthouse comparison
still needs an actual deployed ID to be meaningful (see PRD-002's note on why
Lighthouse can't run in this sandbox either).

## Acceptance criteria

- [ ] Analytics loads on both pages; realtime view shows a test visit — blocked on a real GA4 property existing
- [x] Clicking any WhatsApp CTA registers an event with a distinguishing location param (headless-browser verified, all 11 CTAs)
- [x] Availability form submit registers with unit/guests params (headless-browser verified)
- [ ] Lighthouse performance delta from the snippet ≤ 3 points — unmeasurable without a real ID and outside this sandbox's network policy (see PRD-002)
- [x] Owner-console steps documented in this PRD on completion (requirement 5, above)
- [x] `node scripts/verify.mjs` passes; ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash — kept at "In progress" until a real Measurement ID activates this
