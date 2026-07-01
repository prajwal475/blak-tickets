# BLAK TICKETS — Landing Page Rebuild Plan

> Status: **PLAN ONLY (no code yet)** — awaiting approval.
> Date: 2026-06-28. The previous codebase was lost from disk; this is a clean rebuild.

---

## 0. Locked decisions (from user)

| Decision | Choice |
|---|---|
| Scope | Plan first, then build (in installments) |
| Stack | My call, GSAP allowed → **Vite + React + R3F + drei + GSAP/ScrollTrigger + Lenis** |
| Theme | **White + Emerald, Swiss-clinical** (new palette below — replaces purple / Lamborghini-dark / ticket-stub) |

**Palette → CSS tokens**

```
--white      #FFFFFF   primary background
--off-white  #F7F7F5   secondary sections
--surface    #FAFAFA   surface backgrounds
--card       #FFFFFF   card face (with --line border)  /  #EFEFEF alt card
--ink        #181818   headlines (charcoal)
--body       #4A4A4A   body text
--muted      #8E8E8E   secondary text
--line       #D9D9D6   borders & dividers
--disabled   #C8C8C8   disabled elements
--emerald    #0F8F73   primary CTA, links, highlights
--emerald-2  #066A56   hover states
--mint       #D8F4EC   success cards & subtle backgrounds
```

Brand feel: clean, clinical, Swiss-inspired, premium, scientific, minimal, high-contrast,
generous whitespace, soft shadows, rounded UI, glassmorphism used **sparingly**.

> **Spec override:** the written spec (Vol 1/2) uses purple `#6D4CFF`. Everywhere it says
> purple / purple gradient / purple glow → use **emerald** `#0F8F73 → #066A56` instead.

---

## 1. Design system

- **Type:** Display = *Satoshi* (Fontshare), Body = *General Sans* (Fontshare), fallback *Inter* (Google).
  Logo wordmark stays an **image** (groovy retro) — not used as a UI font (keeps the Swiss discipline).
- **Type scale:** Hero `clamp(40px,7vw,72px)` · Section 56 · Subhead 28 · Body 18 · Caption 14.
- **Grid:** 1440 / 12-col / 80px margins / 24px gutters. Tablet 8-col, mobile 4-col.
- **Spacing:** 8pt scale (8/16/24/32/40/48/64/80/96/120/160).
- **Radius:** buttons 16 · cards 24 · images 24 · inputs 18 · badges 999.
- **Shadows:** card `0 20px 60px rgba(0,0,0,.08)` · hover `0 30px 80px rgba(0,0,0,.12)`.
- **Motion:** standard 300ms `cubic-bezier(.22,.61,.36,1)`; scroll reveal fade + up 16px, 700ms.
  Lenis smooth scroll; GSAP ScrollTrigger for reveals, pins, count-ups, marquee, carousel.

---

## 2. Architecture & file structure

```
src/
  main.jsx, App.jsx
  styles/tokens.css, base.css, sections.css
  lib/  capabilities.js (WebGL + reduced-motion gate) · lenis.js · gsap.js (ScrollTrigger reg)
        analytics.js · app.js (store handoff)
  hooks/ useReveal.js · useCountUp.js · useMediaQuery.js
  config/ events.js · categories.js · testimonials.js · stats.js
  components/
    layout/   Nav.jsx · Footer.jsx · StickyCTA.jsx · Logo.jsx
    hero/     Hero.jsx · HeroVideo.jsx (Initial Scene) · BrandReveal.jsx
    sections/ Explore · FindNearYou · Featured · WhyBlak · UpcomingWeek · TrustedBy
    ui/       Button.jsx · GlassCard.jsx · Marquee.jsx · Pill.jsx · Chip.jsx
    three/    CategoryOrbit.jsx · CityMap.jsx (optional R3F) · TicketMesh.jsx
    fallback/ StaticPage.jsx (reduced-motion / no-WebGL) · ErrorBoundary.jsx
public/
  brand/{lockup,mark,wordmark}.png   (extracted from imagge/ logo art)
  hero/ initial-scene frames OR initial-scene.mp4
  events/*.jpg
  site.webmanifest, robots.txt, sitemap.xml
```

Dependencies: `react react-dom three @react-three/fiber @react-three/drei gsap lenis`
(+ dev: `vite @vitejs/plugin-react`, `ffmpeg-static` if frame-extracting the hero video).

---

## 3. Asset pipeline

1. **Logo** — reuse `scripts/extract_logo.py` (Pillow/numpy) to key white→transparent and split the
   lockup into `brand/{lockup,mark,wordmark}.png`. Source: `imagge/Invert_the_color_theme_of_*1243.jpeg`.
   (Python 3.14 present; will verify Pillow/numpy, else `pip install`.)
2. **Hero video** — `Initial_Scene_-_2026-06-28_*.mp4` (28.8 MB) is the cinematic centerpiece.
   - ffmpeg is **not on PATH**. Two options:
     - **(A, recommended)** `npm i -D ffmpeg-static` → extract ~120 JPGs (≈540px) for an
       Apple-style scroll-scrubbed sequence (buttery, deterministic).
     - **(B)** Native `<video>` + scroll-driven `currentTime` (no extraction, smaller repo,
       seek can stutter on some browsers).
3. **Event photos** — license-free placeholders (picsum/Unsplash) unless you provide real ones.

---

## 4. Section build (maps to spec; purple→emerald)

| # | Section | Build notes |
|---|---|---|
| 1 | **Cinematic Hero** | Logo "print-in" reveal → Initial Scene video centerpiece + headline + emerald primary CTA + ghost CTA. Reduced-motion: static poster. |
| 2 | **Explore Every Experience** | Logo-centred orbiting category hub (10 bubbles, 40s rotation, float, hover scale 1.08 emerald ring). DOM+GSAP orbit (R3F optional). Mobile = swipe cards. |
| 3 | **Find Events Near You** | 40/60 split: search panel (field + Category/City/Date/Price/Distance + emerald Search btn) / stylized map with pulsing emerald pins + hover preview card. Stylized SVG/canvas map (no API key) unless you want Mapbox. |
| 4 | **Featured This Week** | Horizontal carousel, 5 cards desktop, glass "Trending/New" badges, hover lift, drag + wheel + swipe, staggered entrance. |
| 5 | **Why BLAK Tickets** | 2×2 glass feature cards w/ mouse parallax + per-card animated illustration (Book in Seconds / Secure / Verified / QR). Trusted-logos marquee (40%→100% on hover). "Become an Organizer" outlined→emerald-fill CTA. |
| 6 | **Upcoming This Week** | Weekly day-pills (date/day/event-count, click expands), filter chips (Today/Tomorrow/Weekend/Free/Popular/Nearby/Newest), 3-col event cards. Mobile = swipe timeline + carousel. |
| 7 | **Trusted By Thousands** | Count-up stats (25k+/2M+/120+/4.9★, 2s), interactive world map w/ emerald city dots + hover tooltip, 3 community cards, testimonials slider (glass), awards strip, dual CTA (Start Exploring / Download App). |
| — | **Footer** | Links, social, legal, app-store badges. |

---

## 5. Installment order (each verified in-browser, zero console errors before next)

1. **Foundation** — scaffold, tokens/fonts, Lenis+GSAP, capability gate + StaticPage fallback,
   ErrorBoundary, logo extraction, Nav + Footer shell, reveal/count-up hooks.
2. **Hero** — Initial Scene video + brand reveal + CTAs.
3. **Explore (2) + Featured (4)**.
4. **Find Near You (3)**.
5. **Why (5)**.
6. **Upcoming (6) + Trusted (7)**.
7. **Polish** — a11y/reduced-motion, perf gating (AdaptiveDpr, code-split, lazy 3D),
   SEO/PWA (OG, JSON-LD, manifest, sitemap), responsive QA, Lighthouse pass.

---

## 6. Quality targets

- WCAG AA contrast, keyboard nav, visible focus, 44px touch targets, reduced-motion support.
- Lighthouse ≥95 (Perf/A11y/BP/SEO); LCP <2.5s, INP <200ms, CLS <0.1.

---

## 7. Open questions (defaults in **bold** — I'll proceed with these unless you say otherwise)

1. Hero video: **frame-sequence via `ffmpeg-static` (A)** vs native `<video>` (B)?
2. Event photos: **license-free placeholders** vs your real photos?
3. Map: **stylized canvas/SVG (no key)** vs real Mapbox tiles (needs token)?
4. Logo wordmark used only as image, UI in grotesk — **yes**?
5. Store/domain URLs: **placeholders** for now, replace at launch?
```
