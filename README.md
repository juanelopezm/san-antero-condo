# Cabañas Mi Pequeño Paraíso

Bilingual (Spanish/English) static marketing site for beachfront vacation rentals
in Playa Blanca, San Antero, Córdoba, Colombia — 4 studio apartments and 2 full
apartments. No build step, no backend; the booking funnel is WhatsApp.

Live site: **https://juanelopezm.github.io/san-antero-condo/** (English:
`/en/`). Deploys via **GitHub Pages from `main`** — every merge to `main` is live
to real guests within minutes.

## Features

- Responsive, mobile-first design
- Full bilingual parity (Spanish primary, English at `/en/`)
- Hero carousel, apartment/amenity listings, photo and video galleries
- Availability form and floating button that hand off to WhatsApp
- Static JSON-LD structured data, sitemap, favicon, branded 404 page

## Project structure

```
index.html           Spanish page (primary, canonical)
en/index.html         English page (structural parity with the Spanish page)
assets/
  css/styles.css       Shared stylesheet for both languages
  js/scripts.js         Shared JS: carousel, form validation, WhatsApp links
  fonts/                 Self-hosted webfonts
  images/                 Photos, videos, generated posters, icons
  data/pricing.json        Structured pricing (owner-supplied — see docs/BACKLOG.md)
404.html               Branded bilingual error page
sitemap.xml, robots.txt  SEO infrastructure
favicon.ico/.svg, site.webmanifest, apple-touch-icon.png
docs/
  PRODUCT.md            Deduced product vision + site-wide invariants
  BACKLOG.md             PRD status table + open owner decisions
  prds/                   One PRD per requirement (PRD-000 is the template)
scripts/
  verify.mjs             Dependency-free quality gate — run before every commit
  serve.sh                 Local preview matching the Pages layout
.github/workflows/      CI (verify + html-validate + stylelint + axe) and a
                          weekly external link check
CLAUDE.md               Agent operating manual for this repo
```

## Local development

```bash
bash scripts/serve.sh        # → http://localhost:8080/  and  /en/
node scripts/verify.mjs      # quality gate — must exit 0 before committing
npm run check                # verify + HTML validation
npm run lint:css             # stylelint (installs locally, not committed)
```

There's no build step: edit the HTML/CSS/JS directly, preview, verify, commit.
Any content or structure change to one language must land on the other in the
same commit — `verify.mjs` checks section-id parity between the two pages.

## Roadmap and contributing

- Product vision: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- Work queue and status: [`docs/BACKLOG.md`](docs/BACKLOG.md)
- Individual requirements: [`docs/prds/`](docs/prds/)
- Agent/contributor operating manual: [`CLAUDE.md`](CLAUDE.md)

## Security

See [`SECURITY.md`](SECURITY.md).

## License

This project is open-source and available under the MIT License.
