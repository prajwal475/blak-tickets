// Section 3 — Find Events Near You.
// 40/60 split: a search panel + a stylized (no-API) city map with pulsing
// emerald pins that reveal a floating preview card on hover / tap / focus.
import { useState } from 'react'
import Button from '../ui/Button'
import { EVENTS } from '../../config/events'
import { CATEGORIES } from '../../config/categories'
import { track } from '../../lib/analytics'
import { openApp } from '../../lib/app'
import './findnearyou.css'

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Goa', 'Kolkata']

// pins = a handful of events placed on the stylized map (x%, y%)
const PINS = [
  { ...EVENTS[0], x: 30, y: 30 },
  { ...EVENTS[3], x: 64, y: 22 },
  { ...EVENTS[6], x: 78, y: 54 },
  { ...EVENTS[4], x: 22, y: 64 },
  { ...EVENTS[9], x: 52, y: 70 },
  { ...EVENTS[2], x: 46, y: 44 },
]

const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

function Field({ label, children }) {
  return (
    <label className="find-field">
      <span className="find-field-label">{label}</span>
      {children}
    </label>
  )
}

export default function FindNearYou() {
  const [active, setActive] = useState(null)

  const onSearch = (e) => {
    e.preventDefault()
    track('search_events')
  }

  return (
    <section className="section find" id="near-you">
      <div className="container find-grid">
        {/* ---- Search panel ---- */}
        <form className="find-panel" data-reveal onSubmit={onSearch}>
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
              <select defaultValue="any">
                <option value="any">Any date</option>
                <option value="today">Today</option>
                <option value="weekend">This weekend</option>
                <option value="week">This week</option>
              </select>
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

        {/* ---- Stylized map ---- */}
        <div className="find-map" data-reveal data-reveal-delay="1">
          <div className="find-map-inner">
            <svg className="find-map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              {/* parks / water */}
              <rect x="0" y="0" width="100" height="100" fill="var(--surface)" />
              <circle cx="20" cy="78" r="16" fill="var(--mint)" opacity="0.6" />
              <rect x="60" y="6" width="34" height="22" rx="3" fill="var(--mint)" opacity="0.45" />
              {/* blocks */}
              <g opacity="0.7">
                <rect x="8" y="10" width="18" height="14" rx="2" fill="#ededeb" />
                <rect x="40" y="14" width="14" height="12" rx="2" fill="#ededeb" />
                <rect x="74" y="40" width="18" height="16" rx="2" fill="#ededeb" />
                <rect x="34" y="56" width="16" height="14" rx="2" fill="#ededeb" />
                <rect x="56" y="74" width="20" height="16" rx="2" fill="#ededeb" />
              </g>
              {/* roads */}
              <g stroke="var(--emerald)" strokeWidth="0.7" opacity="0.32" strokeLinecap="round">
                <line x1="0" y1="36" x2="100" y2="30" />
                <line x1="0" y1="64" x2="100" y2="70" />
                <line x1="32" y1="0" x2="38" y2="100" />
                <line x1="68" y1="0" x2="62" y2="100" />
                <line x1="0" y1="0" x2="100" y2="100" opacity="0.5" />
              </g>
            </svg>

            {PINS.map((p) => (
              <div
                key={p.id}
                className={`map-pin${active === p.id ? ' is-active' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <button
                  className="map-dot"
                  aria-label={`${p.title} in ${p.city}`}
                  onClick={() => { setActive(active === p.id ? null : p.id); track('map_pin', { id: p.id }) }}
                >
                  <span className="map-dot-ping" aria-hidden="true" />
                </button>

                <div className="map-card" role="dialog" aria-label={p.title}>
                  <div className="map-card-img" style={{ backgroundImage: `url(${p.img})` }} />
                  <div className="map-card-body">
                    <span className="map-card-cat">{p.category}</span>
                    <strong className="map-card-title">{p.title}</strong>
                    <span className="map-card-meta">{p.date} · {p.venue}</span>
                    <div className="map-card-foot">
                      <span className="map-card-price">{inr(p.price)}</span>
                      <button className="map-card-book" onClick={() => openApp(`map-${p.id}`)}>Book</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
