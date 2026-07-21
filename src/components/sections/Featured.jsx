// Section 4 — Featured Events.
// Swiss editorial "floating canvas": varied slides (dark / light / flame) drift
// on a light studio backdrop in a tilted 3D plane, each an editorial layout with
// an oversized index number, hairline rules and a small metric dashboard row.
// GSAP smooth marquee drift + mouse parallax; fully reduced-motion aware.
import { useEffect, useRef } from 'react'
import { FEATURED } from '../../config/events'
import { openApp } from '../../lib/app'
import { track } from '../../lib/tracking'
import { useRouter } from '../../lib/router'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './featured.css'

const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

// per-card scatter + slide colour treatment (mixed like the reference deck)
const RZ = [-2.5, 2, -1.5, 2.5, -2, 1.5, -1]
const TY = [10, -12, 5, -9, 12, -6, 3]
const TZ = [0, -26, 18, -12, 16, -30, 8]
const VARIANT = ['dark', 'light', 'flame', 'dark', 'light', 'dark', 'flame']

const baseTilt = () => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440
  if (w <= 640) return { rx: 0, ry: 0, k: 0 }
  if (w <= 900) return { rx: 4, ry: -9, k: 9 }
  return { rx: 6, ry: -13, k: 12 }
}

function Metric({ label, value }) {
  return (
    <div className="ev-metric">
      <span className="ev-m-label">{label}</span>
      <span className="ev-m-val">{value}</span>
    </div>
  )
}

function EventCard({ e, i, dup }) {
  const n = String(i + 1).padStart(2, '0')
  const [date, mon] = e.date.split(', ')
  const style = {
    '--rz': `${RZ[i]}deg`,
    '--ty': `${TY[i]}px`,
    '--tz': `${TZ[i]}px`,
    '--fd': `${-(i * 1.05).toFixed(2)}s`,
  }
  return (
    <article className={`ev-card ev-card--${VARIANT[i]}`} style={style} aria-hidden={dup || undefined}>
      <div className="ev-face">
        <div className="ev-top">
          <span className="ev-num">{n}</span>
          <span className="ev-tag">{e.tag}</span>
        </div>
        <div className="ev-rule" aria-hidden="true" />
        <div className="ev-media">
          <img src={e.img} alt={e.title} loading="lazy" />
        </div>
        <div className="ev-body">
          <span className="ev-cat">{e.category}</span>
          <h3 className="ev-title">{e.title}</h3>
          <p className="ev-where">{e.venue}, {e.city}</p>
        </div>
        <div className="ev-rule" aria-hidden="true" />
        <div className="ev-metrics">
          <Metric label="Day" value={date} />
          <Metric label="Date" value={mon || '—'} />
          <Metric label="From" value={inr(e.price)} />
        </div>
        <button className="ev-book" tabIndex={dup ? -1 : 0} onClick={() => openApp(`featured-${e.id}`)}>
          Book now <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}

export default function Featured() {
  const { navigate } = useRouter()
  const sceneRef = useRef(null)
  const stageRef = useRef(null)
  const marqueeRef = useRef(null)
  const loop = [...FEATURED, ...FEATURED]

  useEffect(() => {
    if (prefersReducedMotion()) return
    const scene = sceneRef.current
    const stage = stageRef.current
    const marquee = marqueeRef.current
    if (!scene || !stage || !marquee) return

    const b = baseTilt()
    const ctx = gsap.context(() => {
      gsap.set(stage, { rotateX: b.rx, rotateY: b.ry })
      const drift = gsap.to(marquee, { xPercent: -50, duration: 48, ease: 'none', repeat: -1 })

      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      if (!canHover) return

      const onMove = (ev) => {
        const r = scene.getBoundingClientRect()
        const px = (ev.clientX - r.left) / r.width - 0.5
        const py = (ev.clientY - r.top) / r.height - 0.5
        gsap.to(stage, { rotateY: b.ry + px * b.k, rotateX: b.rx - py * b.k * 0.7, duration: 0.9, ease: 'power2.out' })
      }
      const reset = () => gsap.to(stage, { rotateY: b.ry, rotateX: b.rx, duration: 1.1, ease: 'power2.out' })
      const pause = () => drift.pause()
      const play = () => { drift.play(); reset() }

      scene.addEventListener('pointermove', onMove)
      scene.addEventListener('pointerenter', pause)
      scene.addEventListener('pointerleave', play)
      return () => {
        scene.removeEventListener('pointermove', onMove)
        scene.removeEventListener('pointerenter', pause)
        scene.removeEventListener('pointerleave', play)
      }
    }, scene)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section featured" id="featured">
      <div className="container">
        <header className="feat-head">
          <p className="feat-kicker" data-reveal>Featured — 4.1</p>
          <h2 className="feat-title" data-reveal data-reveal-delay="1">
            Handpicked experiences<br />you shouldn't miss.
          </h2>
        </header>
      </div>

      <div className="feat-scene" ref={sceneRef} aria-label="Featured events">
        <div className="feat-stage" ref={stageRef}>
          <div className="feat-marquee" ref={marqueeRef}>
            {loop.map((e, i) => (
              <EventCard key={i} e={e} i={i % FEATURED.length} dup={i >= FEATURED.length} />
            ))}
          </div>
        </div>
      </div>

      <div className="container feat-cta">
        <button className="feat-viewall" onClick={() => { track('view_all_events'); navigate('/events') }}>
          View all events <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
