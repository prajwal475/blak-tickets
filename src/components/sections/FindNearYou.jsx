// Section 3 — Find Events Near You.
// A "solar" spatial scene: a drifting particle field + soft solar glow behind a
// floating frosted-glass search panel and a tilted glass map plane with glowing,
// pulsing markers. Layers parallax with the cursor. Reduced-motion friendly.
import { useEffect, useRef } from 'react'
import Button from '../ui/Button'
import DatePicker from '../ui/DatePicker'
import RealMap from '../maps/RealMap'
import ParticleField from '../ParticleField'
import { EVENTS } from '../../config/events'
import { CATEGORIES } from '../../config/categories'
import { CITY_COORDS } from '../../config/stats'
import { track } from '../../lib/tracking'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './findnearyou.css'

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Goa', 'Kolkata']
const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

// plot every event at its city, nudged apart so same-city pins don't stack
const EVENT_MARKERS = EVENTS.filter((e) => CITY_COORDS[e.city]).map((e, i) => {
  const [lat, lng] = CITY_COORDS[e.city]
  const nudge = (((i * 53) % 16) - 8) / 200
  return {
    lat: lat + nudge,
    lng: lng - nudge,
    label: e.title,
    popup: `<strong>${e.title}</strong><br>${e.venue}, ${e.city}<br>${e.date} · ${inr(e.price)}`,
  }
})

function Field({ label, children }) {
  return (
    <label className="find-field">
      <span className="find-field-label">{label}</span>
      {children}
    </label>
  )
}

export default function FindNearYou() {
  const sceneRef = useRef(null)
  const panelRef = useRef(null)
  const mapRef = useRef(null)

  const onSearch = (e) => {
    e.preventDefault()
    track('search_events')
  }

  useEffect(() => {
    if (prefersReducedMotion()) return
    const scene = sceneRef.current
    if (!scene || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const gctx = gsap.context(() => {
      const onMove = (ev) => {
        const r = scene.getBoundingClientRect()
        const px = (ev.clientX - r.left) / r.width - 0.5
        const py = (ev.clientY - r.top) / r.height - 0.5
        gsap.to(panelRef.current, { x: px * -20, y: py * -14, duration: 0.9, ease: 'power2.out' })
        gsap.to(mapRef.current, { rotateY: -8 + px * 6, rotateX: 5 - py * 5, x: px * 12, duration: 0.9, ease: 'power2.out' })
      }
      const reset = () => {
        gsap.to(panelRef.current, { x: 0, y: 0, duration: 1.1, ease: 'power2.out' })
        gsap.to(mapRef.current, { rotateY: -8, rotateX: 5, x: 0, duration: 1.1, ease: 'power2.out' })
      }
      scene.addEventListener('pointermove', onMove)
      scene.addEventListener('pointerleave', reset)
      return () => {
        scene.removeEventListener('pointermove', onMove)
        scene.removeEventListener('pointerleave', reset)
      }
    }, scene)

    return () => gctx.revert()
  }, [])

  return (
    <section className="section find" id="near-you" ref={sceneRef}>
      <ParticleField count={110} />
      <div className="find-sun" aria-hidden="true" />
      <div className="find-sun find-sun--2" aria-hidden="true" />
      <div className="container find-grid">
        {/* ---- Search panel ---- */}
        <form className="find-panel" ref={panelRef} data-reveal onSubmit={onSearch}>
          <p className="eyebrow">Find events near you</p>
          <h2 className="section-title">Find your next experience.</h2>
          <p className="section-sub">Search by city, category, venue or date.</p>

          <div className="find-search">
            <svg viewBox="0 0 24 24" className="find-search-ic" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search concerts, workshops, marathons..."
              aria-label="Search events"
            />
          </div>

          <div className="find-filters">
            <Field label="Category">
              <select defaultValue="">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="City">
              <select defaultValue="">
                <option value="">All cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <DatePicker placeholder="Any date" />
            </Field>
            <Field label="Price">
              <select defaultValue="any">
                <option value="any">Any price</option>
                <option value="free">Free</option>
                <option value="under1000">Under ₹1,000</option>
                <option value="premium">Premium</option>
              </select>
            </Field>
            <Field label="Distance">
              <select defaultValue="any">
                <option value="any">Any distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </Field>
          </div>

          <Button variant="primary" type="submit" className="find-go">Search events</Button>
        </form>

        {/* ---- Tilted glass map ---- */}
        <div className="find-map-wrap" data-reveal data-reveal-delay="1">
          <div className="find-map" ref={mapRef}>
            <RealMap locate pulse interactive={false} center={[20.5, 78.9]} zoom={4.4} markers={EVENT_MARKERS} />
          </div>
        </div>
      </div>
    </section>
  )
}
