# Product Vision — Cabañas Mi Pequeño Paraíso

> This document is the deduced product definition for this repository. Every PRD in
> `docs/prds/` traces back to a goal stated here.

## What this project is

A **bilingual (Spanish/English) static marketing and booking-lead website** for
*Cabañas Mi Pequeño Paraíso*: 4 studio apartments (101–104, up to 5 guests each) and
2 full apartments (201–202, up to 10 guests each) inside a beachfront condominium in
Playa Blanca, San Antero, Córdoba, Colombia.

- **Hosting:** GitHub Pages at `https://juanelopezm.github.io/san-antero-condo/`
- **Stack:** hand-written HTML/CSS/JS, no build step, no backend
- **Conversion funnel:** visitor → browses apartments/amenities/gallery → sends a
  pre-filled **WhatsApp** message (availability form or CTA buttons) → owner closes
  the booking manually
- **Primary audience:** Colombian families and groups (Spanish first); secondary:
  international travelers (English version under `/en/`)

## Business goals

1. **Generate booking inquiries** — maximize WhatsApp contact conversions.
2. **Rank locally** — be findable for searches like "cabañas San Antero",
   "alojamiento Playa Blanca Córdoba".
3. **Build trust** — professional presentation, real photos/videos, guest reviews,
   clear pricing and FAQ.
4. **Stay maintainable at near-zero cost** — a non-team-owned static site that one
   person (plus AI agents) can safely evolve. No servers, no paid services required.

## Non-goals

- No online payment processing or real-time booking engine (WhatsApp closes the loop).
- No CMS or database; content lives in the HTML/JSON files in this repo.
- No user accounts.

## Quality bars (site-wide invariants)

| Invariant | Rule |
|---|---|
| Bilingual parity | Every section, CTA, and datum on the ES page exists on the EN page and vice versa |
| Single funnel number | All `wa.me` links use the canonical booking number **+57 301 538 2699** |
| Relative paths only | The site must work from a subpath (GitHub Pages) — never absolute `/` URLs |
| No build step | Pushing to `main` is deploying; every commit must leave the site shippable |
| Mobile-first | Most guests arrive on phones; every feature must work at 360px width |
| Performance | Home page should become interactive fast on Colombian mobile networks |

## Current state vs. target state

The site already has: hero carousel, apartment listings, amenities, events, location,
attractions, reviews, video/photo gallery, availability form → WhatsApp, FAQ,
structured data injection, ES + EN versions.

What is missing is captured as PRDs in `docs/prds/` and tracked in `docs/BACKLOG.md`.
