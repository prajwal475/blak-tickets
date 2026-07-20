// Section 5 — Why BLAK Tickets.
// A cinematic 3D feature grid: each card tilts in real perspective with a
// magnetic drift, depth-layered contents (icon / heading / copy / number all on
// their own Z-plane), a glass reflection sweep, GSAP scroll reveals + per-card
// scroll parallax, an idle "breathing" motion and a cursor spotlight. Falls back
// to the flat static layout under reduced-motion / touch.
import { useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { TRUSTED_LOGOS } from '../../config/testimonials'
import { track } from '../../lib/tracking'
import { openApp } from '../../lib/app'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useCardTilt } from '../../hooks/useCardTilt'
import { prefersReducedMotion, isCoarsePointer } from '../../lib/capabilities'
import BookingSequence from './BookingSequence'
import './whyblak.css'

/* ---------- illustrations ---------- */
function BookingIllo() {
  return (
    <svg className="illo illo--booking" viewBox="0 0 200 150" aria-hidden="true">
      <rect className="b-phone" x="78" y="44" width="58" height="96" rx="12" />
      <rect x="86" y="54" width="42" height="68" rx="4" className="b-screen" />
      <g className="b-ticket">
        <rect x="58" y="26" width="84" height="40" rx="7" />
        <circle cx="58" cy="46" r="5" className="b-notch" />
        <circle cx="142" cy="46" r="5" className="b-notch" />
        <line x1="118" y1="32" x2="118" y2="60" className="b-perf" />
        <rect x="68" y="38" width="38" height="5" rx="2.5" className="b-line" />
        <rect x="68" y="48" width="26" height="4" rx="2" className="b-line b-line--dim" />
      </g>
      <g className="b-spark">
        <circle cx="150" cy="40" r="2" /><circle cx="64" cy="70" r="1.6" />
        <circle cx="160" cy="62" r="1.4" /><circle cx="54" cy="34" r="1.5" />
      </g>
    </svg>
  )
}
function SecureIllo() {
  return (
    <svg className="illo illo--secure" viewBox="0 0 200 150" aria-hidden="true">
      <circle className="s-ring s-ring--1" cx="100" cy="78" r="34" />
      <circle className="s-ring s-ring--2" cx="100" cy="78" r="48" />
      <circle className="s-ring s-ring--3" cx="100" cy="78" r="62" />
      <path className="s-shield" d="M100 38 L128 50 V80 C128 100 116 112 100 120 C84 112 72 100 72 80 V50 Z" />
      <rect className="s-lock-body" x="91" y="78" width="18" height="16" rx="3" />
      <path className="s-lock-shackle" d="M94 78 V72 a6 6 0 0 1 12 0 V78" />
    </svg>
  )
}
function VerifiedIllo() {
  return (
    <svg className="illo illo--verified" viewBox="0 0 200 150" aria-hidden="true">
      <rect className="v-poster" x="64" y="30" width="72" height="92" rx="8" />
      <rect x="74" y="42" width="52" height="40" rx="4" className="v-poster-img" />
      <rect x="74" y="90" width="44" height="6" rx="3" className="v-line" />
      <rect x="74" y="102" width="30" height="5" rx="2.5" className="v-line v-line--dim" />
      <g className="v-badge">
        <circle cx="134" cy="44" r="16" className="v-badge-bg" />
        <path className="v-check" d="M126 44 l5 5 9 -10" />
      </g>
    </svg>
  )
}
function QrIllo() {
  // simple deterministic QR-ish matrix
  const cells = [
    [1,1,1,0,1,0,1,1,1],[1,0,1,0,0,1,1,0,1],[1,1,1,0,1,0,1,1,1],
    [0,0,0,1,0,1,0,0,0],[1,0,1,0,1,0,1,0,1],[0,1,0,1,0,1,0,1,0],
    [1,1,1,0,0,1,1,0,1],[1,0,1,1,0,0,1,1,0],[1,1,1,0,1,1,0,1,1],
  ]
  return (
    <svg className="illo illo--qr" viewBox="0 0 200 150" aria-hidden="true">
      <rect className="q-frame" x="64" y="42" width="72" height="72" rx="8" />
      <g className="q-cells" transform="translate(74 52)">
        {cells.flatMap((row, r) =>
          row.map((c, i) => c ? <rect key={`${r}-${i}`} x={i * 6} y={r * 6} width="5" height="5" rx="1" /> : null)
        )}
      </g>
      <rect className="q-beam" x="64" y="42" width="72" height="4" rx="2" />
      <g className="q-done">
        <circle cx="132" cy="106" r="13" className="q-done-bg" />
        <path className="q-check" d="M125 106 l4 4 8 -9" />
      </g>
    </svg>
  )
}

const FEATURES = [
  { no: '01', Illo: BookingIllo, title: 'Book in Seconds', desc: 'Reserve your seat with just a few taps and receive your digital ticket instantly.' },
  { no: '02', Illo: SecureIllo, title: '100% Secure Checkout', desc: 'Encrypted transactions with trusted payment partners, every single time.' },
  { no: '03', Illo: VerifiedIllo, title: 'Verified Organizers', desc: 'Every listed event is reviewed to ensure authenticity and reliability.' },
  { no: '04', Illo: QrIllo, title: 'Skip The Queue', desc: 'Walk in with your digital QR ticket. No printing, no waiting required.' },
]

function FeatureCard({ f }) {
  // inner element carries the mouse tilt + magnetic drift + breathing
  const tiltRef = useCardTilt({ maxRX: 10, maxRY: 12, lift: 70, magnet: 16 })

  return (
    <div className="why-card-outer">
      <article className="why-card" ref={tiltRef}>
        <span className="why-card-bg" aria-hidden="true" />
        <span className="why-card-sweep" aria-hidden="true" />
        <span className="why-no">{f.no}</span>
        <div className="why-stage"><f.Illo /></div>
        <div className="why-text">
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      </article>
    </div>
  )
}

export default function WhyBlak() {
  const logos = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS]
  const sectionRef = useRef(null)
  const headRef = useRef(null)

  // cursor spotlight + heading counter-parallax + scroll reveal/parallax
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (prefersReducedMotion()) return

    const gctx = gsap.context(() => {
      const outers = gsap.utils.toArray('.why-card-outer')

      // ---- scroll entrance (staggered) ----
      gsap.set(outers, { opacity: 0, y: 100, rotationX: -18, scale: 0.92, filter: 'blur(10px)' })
      ScrollTrigger.create({
        trigger: '.why-grid',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(outers, {
            opacity: 1, y: 0, rotationX: 0, scale: 1, filter: 'blur(0px)',
            duration: 1.2, ease: 'power4.out', stagger: 0.14,
          })
        },
      })

      // ---- per-card scroll parallax (different speeds) ----
      const speeds = [0.9, 1.1, 1.2, 0.85]
      outers.forEach((o, i) => {
        gsap.to(o, {
          yPercent: (speeds[i] - 1) * 26,
          ease: 'none',
          scrollTrigger: { trigger: '.why-grid', start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      })

      // ---- cursor spotlight + heading counter-parallax ----
      if (!isCoarsePointer()) {
        const hx = gsap.quickTo(headRef.current, 'x', { duration: 1, ease: 'power2.out' })
        const hy = gsap.quickTo(headRef.current, 'y', { duration: 1, ease: 'power2.out' })
        const onMove = (e) => {
          const r = section.getBoundingClientRect()
          section.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`)
          section.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          hx(px * -12)
          hy(py * -8)
        }
        section.addEventListener('pointermove', onMove)
        return () => section.removeEventListener('pointermove', onMove)
      }
    }, section)

    return () => gctx.revert()
  }, [])

  return (
    <section className="section why" id="why" ref={sectionRef}>
      <span className="why-blob why-blob--1" aria-hidden="true" />
      <span className="why-blob why-blob--2" aria-hidden="true" />
      <span className="why-spotlight" aria-hidden="true" />
      <div className="container">
        <header className="sec-head" ref={headRef}>
          <p className="eyebrow" data-reveal>Why BLAK Tickets</p>
          <h2 className="section-title" data-reveal data-reveal-delay="1">
            Why millions choose BLAK Tickets.
          </h2>
          <p className="section-sub" data-reveal data-reveal-delay="2">
            Everything you need to discover, book and enjoy unforgettable experiences —
            securely, instantly and effortlessly.
          </p>
        </header>
      </div>

      <BookingSequence />

      <div className="container">
        <div className="why-grid">
          {FEATURES.map((f) => <FeatureCard key={f.no} f={f} />)}
        </div>
      </div>

      <div className="why-marquee" aria-label="Trusted by leading organizers">
        <div className="why-marquee-track">
          {logos.map((l, i) => <span key={i} className="why-logo">{l}</span>)}
        </div>
      </div>

      <div className="container why-cta">
        <Button variant="ghost" className="btn--organizer" onClick={() => { track('become_organizer'); openApp('organizer') }}>
          Become an organizer
        </Button>
      </div>
    </section>
  )
}
