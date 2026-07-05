# PRD-007: Analytics and conversion measurement

- **Status:** Not started
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

## Acceptance criteria

- [ ] Analytics loads on both pages; realtime view shows a test visit
- [ ] Clicking any WhatsApp CTA registers an event with a distinguishing location param
- [ ] Availability form submit registers with unit/guests params
- [ ] Lighthouse performance delta from the snippet ≤ 3 points
- [ ] Owner-console steps documented in this PRD on completion
- [ ] `node scripts/verify.mjs` passes; ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
