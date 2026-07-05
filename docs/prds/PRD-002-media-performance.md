# PRD-002: Media and performance optimization

- **Status:** Not started
- **Priority:** P0
- **Depends on:** PRD-001 (do shared-asset work once, not twice)
- **Goal traceability:** "Performance" invariant, "Generate booking inquiries" (slow pages lose mobile visitors)

## Problem

`assets/images/` weighs **93 MB**. The worst offenders are raw phone videos served
directly in the gallery: `201.mp4` (15 MB), `202.mp4` (11 MB), `102.mp4` (8.4 MB),
`104-4.mp4` (7.8 MB), `101.mp4` (7.5 MB) — nine videos over 4 MB. Hero images
(`casa2.jpeg`, `atardecer.jpg`, `jacuzzi.jpg`, `pool1.jpg`) are full-resolution
camera output loaded as CSS backgrounds, which cannot lazy-load. Only 18 media
elements have `loading="lazy"`. Fonts, Font Awesome, and Swiper come from three
different CDNs as render-blocking requests. Target guests are on Colombian mobile
networks.

## Outcome

The home page becomes interactive in a few seconds on a mid-range phone over 4G.
Total transfer for an initial visit drops under ~2.5 MB; videos only download when
the visitor plays them.

## Requirements

1. Re-encode gallery videos to ≤ 2 MB each (720p, H.264, `ffmpeg -crf 28` or
   similar) OR keep originals but add `preload="none"` plus a `poster` image so
   nothing downloads until play is pressed. Requirement: no video bytes on initial
   page load.
2. Generate web-sized variants of all hero and gallery images (max 1600px wide,
   quality ~80, target ≤ 300 KB each) and reference the variants; keep originals
   out of the page path (they may stay in the repo or move to a `originals/`
   folder excluded from pages).
3. Every `<img>` below the fold gets `loading="lazy"` and explicit
   `width`/`height` (or `aspect-ratio` CSS) to prevent layout shift.
4. Hero CSS background images: preload only the first slide's image; slides 2–3
   load their backgrounds lazily (e.g., class added on Swiper `slideChange`).
5. Reduce render-blocking third parties: self-host or subset the two Google Fonts,
   pin Swiper to a specific version (unversioned `unpkg.com/swiper` can break the
   site overnight), and load Font Awesome with `media="print" onload` swap or
   replace the ~10 icons actually used with inline SVG.
6. Rename `assets/images/102?.jpeg` (literal `?` in filename) — unreferenced today
   but a landmine for any tooling and for URL encoding.
7. Add a `verify.mjs` budget check: fail if any file referenced by an HTML page
   exceeds 2.5 MB, warn over 500 KB.

## Out of scope

- Moving media to a CDN or external host (keeps the zero-cost constraint).
- Redesigning the gallery UX.

## Acceptance criteria

- [ ] No referenced video downloads on initial load (`preload="none"` + `poster`, verify in devtools network tab)
- [ ] All referenced images ≤ 500 KB except at most the first hero image (≤ 800 KB)
- [ ] Swiper CDN URLs are version-pinned
- [ ] Lighthouse mobile performance score ≥ 80 on the ES home page (record score in the PRD on completion)
- [ ] `node scripts/verify.mjs` passes including the new media-budget check
- [ ] ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
