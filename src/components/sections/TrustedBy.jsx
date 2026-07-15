// Section 7 — Trusted By Thousands.
// A restrained, Awwwards-grade 3D scene: layered depth with an extremely slow
// cursor parallax (heading < stats < map < cards), cinematic scroll entrances,
// count-up stats, a floating "dashboard" map, gently breathing community panels,
// testimonials, awards and a dual CTA. No particles / glow / neon — depth comes
// purely from motion, lighting and perspective. Reduced-motion safe.
import { useEffect, useRef } from 'react'
import Button from '../ui/Button'
import RealMap from '../maps/RealMap'
import { STATS, CITY_DOTS } from '../../config/stats'
import { TESTIMONIALS, AWARDS } from '../../config/testimonials'
import { EVENTS } from '../../config/events'
import { useCountUp } from '../../hooks/useCountUp'
import { useDragScroll } from '../../hooks/useDragScroll'
import { useCardTilt } from '../../hooks/useCardTilt'
import { track } from '../../lib/analytics'
import { openApp } from '../../lib/app'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion, isCoarsePointer } from '../../lib/capabilities'
import './trustedby.css'

function Stat({ s }) {
  const [ref, value] = useCountUp(s.value, { duration: 2000, format: s.format })
  return (
    <div className="stat" ref={ref}>
      <div className="stat-inner">
        <div className="stat-num">{value}<span className="stat-suffix">{s.suffix}</span></div>
        <div className="stat-label">{s.label}</div>
      </div>
    </div>
  )
}

function IndiaMap() {
  const markers = CITY_DOTS.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    label: `${c.city} · ${c.events} events`,
  }))
  return (
    <div className="map7">
      <RealMap center={[22.4, 80]} zoom={4} markers={markers} />
    </div>
  )
}

function CommCard({ className, delay, children }) {
  const tilt = useCardTilt({ maxRX: 4, maxRY: 8, lift: 60, magnet: 10, breathe: false })
  return <div className={`comm-card ${className}`} ref={tilt}>{children}</div>
}

function CommunityCards() {
  const popular = EVENTS[0]
  return (
    <div className="comm-wrap">
      <div className="comm">
        <CommCard className="comm-card--att">
          <div className="comm-avatars">
            {[1, 2, 3, 4, 5].map((n) => (
              <img key={n} src={`/events/avatar${n}.jpg`} alt="" />
            ))}
          </div>
          <div>
            <strong>2.4k going this week</strong>
            <span>Happy attendees</span>
          </div>
        </CommCard>

        <CommCard className="comm-card--org">
          <img className="comm-org-photo" src="/events/avatar2.jpg" alt="" />
          <div>
            <span className="comm-tag">Top organizer</span>
            <strong>Rhythm Collective</strong>
            <span>320 events · 4.9★ rating</span>
          </div>
        </CommCard>

        <CommCard className="comm-card--pop">
          <span className="comm-pop-img" style={{ backgroundImage: `url(${popular.img})` }} aria-hidden="true" />
          <span className="comm-veil" aria-hidden="true" />
          <div className="comm-pop-body">
            <span className="comm-tag comm-tag--light">Most popular</span>
            <strong>{popular.title}</strong>
            <span>8,420 attending</span>
          </div>
        </CommCard>
      </div>
    </div>
  )
}

export default function TrustedBy() {
  const sliderRef = useDragScroll()
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const statsRef = useRef(null)
  const mapWrapRef = useRef(null)
  const commWrapRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const gctx = gsap.context(() => {
      const q = (sel, root = section) => gsap.utils.toArray(root.querySelectorAll(sel))

      /* ---- cinematic entrances ---- */
      const reveal = (targets, vars, trigger, stagger = 0) => {
        if (!targets.length) return
        gsap.set(targets, { opacity: 0, ...vars.from })
        ScrollTrigger.create({
          trigger, start: 'top 82%', once: true,
          onEnter: () => gsap.to(targets, {
            opacity: 1, ...vars.to, duration: 1.2, ease: 'power4.out', stagger,
          }),
        })
      }
      reveal(q('.sec-head > *'), { from: { y: 40, z: 80, scale: 0.96, filter: 'blur(10px)' }, to: { y: 0, z: 0, scale: 1, filter: 'blur(0px)' } }, headRef.current, 0.12)
      reveal(q('.stat'), { from: { y: 40, rotationX: -18, scale: 0.9, filter: 'blur(8px)' }, to: { y: 0, rotationX: 0, scale: 1, filter: 'blur(0px)' } }, statsRef.current, 0.1)
      reveal([mapWrapRef.current], { from: { y: 80, rotationX: -15, filter: 'blur(10px)' }, to: { y: 0, rotationX: 0, filter: 'blur(0px)' } }, mapWrapRef.current)
      reveal(q('.comm-card'), { from: { y: 60, scale: 0.94, filter: 'blur(8px)' }, to: { y: 0, scale: 1, filter: 'blur(0px)' } }, commWrapRef.current, 0.12)

      /* the emerald "+" suffix arrives just after each number */
      const suffixes = q('.stat-suffix')
      gsap.set(suffixes, { opacity: 0, x: -6 })
      ScrollTrigger.create({
        trigger: statsRef.current, start: 'top 82%', once: true,
        onEnter: () => gsap.to(suffixes, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.12, stagger: 0.1 }),
      })

      /* ---- continuous, un-synced motion ---- */
      gsap.to('.map7', { y: 4, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.comm', { y: 3, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to(q('.stat-num'), { scale: 1.01, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.6, from: 'random' } })

      /* ---- scroll-depth parallax (different speeds) ---- */
      const depth = (el, speed) => el && gsap.to(el, {
        yPercent: (speed - 1) * 20, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })
      depth(headRef.current, 0.95)
      depth(statsRef.current, 1.0)
      depth(mapWrapRef.current, 1.15)
      depth(commWrapRef.current, 1.08)

      /* ---- slow cursor parallax: deeper layers move more ---- */
      if (!isCoarsePointer()) {
        const mk = (el, amp) => el && ({
          x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power2.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power2.out' }),
          amp,
        })
        const layers = [
          mk(headRef.current, 3),
          mk(statsRef.current, 6),
          mk(mapWrapRef.current, 8),
          mk(commWrapRef.current, 10),
        ].filter(Boolean)
        const onMove = (e) => {
          const r = section.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          layers.forEach((L) => { L.x(px * L.amp); L.y(py * L.amp) })
        }
        section.addEventListener('pointermove', onMove)
        return () => section.removeEventListener('pointermove', onMove)
      }
    }, section)

    return () => gctx.revert()
  }, [])

  return (
    <section className="section trusted" id="trusted" ref={sectionRef}>
      <div className="container">
        <header className="sec-head" ref={headRef}>
          <p className="eyebrow">Trusted by thousands</p>
          <h2 className="section-title">Trusted by thousands.</h2>
          <p className="section-sub">
            Creating unforgettable memories across every city.
          </p>
        </header>

        <div className="stats" ref={statsRef}>
          {STATS.map((s) => <Stat key={s.id} s={s} />)}
        </div>

        <div className="trusted-mid">
          <div className="map7-wrap" ref={mapWrapRef}>
            <IndiaMap />
          </div>
          <div ref={commWrapRef}>
            <CommunityCards />
          </div>
        </div>
      </div>

      {/* testimonials */}
      <div className="tst" ref={sliderRef}>
        <div className="tst-rail container">
          {TESTIMONIALS.map((t, i) => (
            <figure className="tst-card" key={t.id} data-reveal data-reveal-delay={(i % 3) + 1}>
              <div className="tst-stars" aria-label={`${t.rating} out of 5`}>{'★'.repeat(t.rating)}</div>
              <blockquote>{t.text}</blockquote>
              <figcaption>
                <img src={t.photo} alt="" />
                <span>
                  <strong>{t.name}</strong>
                  <em>{t.event}</em>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="container">
        {/* awards */}
        <div className="awards" data-reveal>
          <span className="awards-label">Recognized by</span>
          <div className="awards-list">
            {AWARDS.map((a) => <span key={a}>{a}</span>)}
          </div>
        </div>

        {/* CTA */}
        <div className="trusted-cta" data-reveal>
          <h3>Join thousands of event lovers.</h3>
          <div className="trusted-cta-btns">
            <Button variant="primary" onClick={() => { track('start_exploring'); }}>Start exploring</Button>
            <Button variant="ghost" onClick={() => openApp('trusted')}>Download app</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
