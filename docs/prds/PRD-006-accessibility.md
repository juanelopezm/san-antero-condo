# PRD-006: Accessibility to WCAG 2.1 AA

- **Status:** Not started
- **Priority:** P1
- **Depends on:** PRD-001 (audit once, not twice)
- **Goal traceability:** "Build trust", "Mobile-first" invariant

## Problem

A previous pass added ARIA roles and labels (commit `534ec60`), but it was
unaudited and partial: redundant landmark roles on semantic elements
(`role="banner"` on `<header>`, `role="main"` on `<main>`), unverified color
contrast on the glassmorphism hero overlays (white text over photos), a date/number
form without associated visible labels (placeholder-only inputs), carousel
controls whose keyboard behavior depends on Swiper defaults, and gallery videos
without captions or descriptive fallbacks.

## Outcome

Both pages pass an automated axe-core scan with zero critical/serious violations
and are usable with keyboard only and with a screen reader.

## Requirements

1. Run `npx @axe-core/cli` (or Playwright + axe) against `/` and `/en/` via
   `scripts/serve.sh`; fix all critical and serious findings; record the final
   report summary in this PRD.
2. Form inputs get real `<label>` elements (visually styled to fit the design) —
   `aria-label` on placeholder-only inputs is a fallback, not a fix, for date
   fields whose format is ambiguous.
3. Text-over-image contrast: ensure hero text meets 4.5:1 (adjust the overlay
   scrim, not the photos).
4. Keyboard: carousel prev/next/pagination focusable and operable; visible focus
   styles site-wide (no `outline: none` without replacement); logical tab order;
   floating WhatsApp button reachable and labeled.
5. Media: every `<img>` keeps meaningful bilingual `alt`; decorative images get
   `alt=""`; videos get `aria-label` or a text description of what they show.
6. Remove redundant ARIA roles that duplicate native semantics.
7. `prefers-reduced-motion`: disable carousel autoplay and CSS animations when set.
8. Add an axe scan step to CI (non-blocking warn at first; flip to blocking once
   green for two weeks).

## Out of scope

- AAA conformance, video captioning of Spanish speech (no speech in clips —
  confirm, then document).

## Acceptance criteria

- [ ] axe-core: 0 critical, 0 serious on both pages (report summary pasted into this file)
- [ ] Full keyboard walkthrough completes: language switch → form submit → carousel → FAQ
- [ ] Hero text contrast ≥ 4.5:1 measured on the rendered page
- [ ] `prefers-reduced-motion` respected
- [ ] `node scripts/verify.mjs` passes; ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
