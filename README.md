# BLAK Tickets

One platform for every experience — a premium event discovery and ticketing landing site.
Built with React + Vite, GSAP + Lenis for motion, and a lightweight custom router.

## Highlights

- **Intro splash** — brand logo animation that fades in/out (~3s) on first load.
- **Scroll-scrubbed hero** — a full-bleed booking clip broken into frames and played frame-by-frame as you scroll.
- **Explore** — an orbiting category hub on desktop, a draggable swipe-stack on mobile.
- **Live "This week"** — a rolling day strip (today → +6) with a functional month calendar.
- **Trusted by thousands** — a stylised India map with live city pins and count-up stats.
- **Content pages** — About, Press, Blog, Safety, Terms, Privacy, plus `/explore` and per-category event pages, generated from source PDFs.
- Fully responsive, reduced-motion aware, and accessible.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to /dist
npm run preview    # preview the build
```

## Project structure

```
src/
  components/      hero, sections, layout, pages, Preloader, SwipeStack
  config/          events, categories, stats, testimonials (mock data)
  content/         About/Privacy/Terms/… as structured JSON (from PDFs)
  lib/             router, lenis, gsap, analytics, capabilities
  hooks/           useReveal, useMediaQuery, useCountUp, useDragScroll
public/
  hero/seq/        the 120 booking-flow frames
  intro/           the intro splash clip
  events/ brand/   imagery
scripts/
  extract-content.py    PDFs  → src/content/*.json
  prepare-sequence.mjs  clip  → public/hero/seq frames
  prepare-hero.mjs      hero media
  shoot.mjs + make_pdf.py   capture screenshots → preview PDF
```

## Tooling scripts

- `python scripts/extract-content.py` — regenerate the content JSON from the source PDFs.
- `node scripts/prepare-sequence.mjs <clip.mp4>` — re-extract the scroll-scrubbed frames.
- `node scripts/shoot.mjs && python scripts/make_pdf.py` — regenerate the screenshot preview deck (needs the dev server running and system Chrome).
