// Section 4 — Featured Events. Horizontal carousel: arrows + drag + wheel +
// native touch swipe, scroll-snap, staggered entrance.
import { useRef, useState, useEffect, useCallback } from 'react'
import Button from '../ui/Button'
import { FEATURED } from '../../config/events'
import { openApp } from '../../lib/app'
import { track } from '../../lib/analytics'
import './featured.css'

const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

function EventCard({ e, i }) {
  return (
    <article className="ev-card" data-reveal style={{ transitionDelay: `${(i % 5) * 80}ms` }}>
      <div className="ev-media">
        <img src={e.img} alt={e.title} loading="lazy" />
        <span className="ev-overlay" aria-hidden="true" />
        <span className={`ev-badge ev-badge--${e.tag.replace(/[^a-z]/gi, '').toLowerCase()}`}>{e.tag}</span>
      </div>
      <div className="ev-body">
        <span className="ev-cat">{e.category}</span>
        <h3 className="ev-title">{e.title}</h3>
        <p className="ev-where">{e.venue}, {e.city}</p>
        <div className="ev-foot">
          <span className="ev-date">{e.date} · {e.time}</span>
          <span className="ev-price">{inr(e.price)}</span>
        </div>
        <div className="ev-book">
          <Button variant="primary" className="btn--sm" onClick={() => openApp(`featured-${e.id}`)}>
            Book Now
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function Featured() {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  const step = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.ev-card')
    const w = card ? card.offsetWidth + 24 : 364
    el.scrollBy({ left: dir * w * 1.5, behavior: 'smooth' })
    track('featured_nav', { dir })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  // vertical wheel -> horizontal scroll (when not already a horizontal trackpad swipe)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onWheel = (ev) => {
      if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return
      el.scrollLeft += ev.deltaY
      ev.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // pointer drag-to-scroll
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let down = false, startX = 0, startLeft = 0, moved = false
    const onDown = (ev) => {
      down = true; moved = false
      startX = ev.clientX; startLeft = el.scrollLeft
      el.classList.add('is-dragging')
    }
    const onMove = (ev) => {
      if (!down) return
      const dx = ev.clientX - startX
      if (Math.abs(dx) > 4) moved = true
      el.scrollLeft = startLeft - dx
    }
    const onUp = () => { down = false; el.classList.remove('is-dragging') }
    const onClickCapture = (ev) => { if (moved) { ev.preventDefault(); ev.stopPropagation() } }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('click', onClickCapture, true)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return (
    <section className="section featured" id="featured">
      <div className="container">
        <header className="feat-head">
          <div>
            <p className="eyebrow" data-reveal>Featured this week</p>
            <h2 className="section-title" data-reveal data-reveal-delay="1">
              Handpicked experiences you shouldn't miss.
            </h2>
          </div>
          <div className="feat-nav" data-reveal data-reveal-delay="2">
            <button className="feat-arrow" onClick={() => step(-1)} disabled={atStart} aria-label="Previous">←</button>
            <button className="feat-arrow" onClick={() => step(1)} disabled={atEnd} aria-label="Next">→</button>
          </div>
        </header>
      </div>

      <div className="feat-track" ref={trackRef}>
        <div className="feat-rail">
          {FEATURED.map((e, i) => (
            <EventCard key={e.id} e={e} i={i} />
          ))}
        </div>
      </div>

      <div className="container feat-cta">
        <Button variant="ghost" onClick={() => track('view_all_events')}>View all events</Button>
      </div>
    </section>
  )
}
