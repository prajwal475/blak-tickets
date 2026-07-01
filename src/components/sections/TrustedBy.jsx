// Section 7 — Trusted By Thousands.
// Count-up stats, stylized world map, community cards, testimonials slider,
// awards strip, dual CTA.
import Button from '../ui/Button'
import { STATS, CITY_DOTS } from '../../config/stats'
import { TESTIMONIALS, AWARDS } from '../../config/testimonials'
import { EVENTS } from '../../config/events'
import { useCountUp } from '../../hooks/useCountUp'
import { useDragScroll } from '../../hooks/useDragScroll'
import { track } from '../../lib/analytics'
import { openApp } from '../../lib/app'
import './trustedby.css'

function Stat({ s }) {
  const [ref, value] = useCountUp(s.value, { duration: 2000, format: s.format })
  return (
    <div className="stat" ref={ref} data-reveal>
      <div className="stat-num">{value}<span className="stat-suffix">{s.suffix}</span></div>
      <div className="stat-label">{s.label}</div>
    </div>
  )
}

// Stylized India silhouette in a 0..100 square viewBox, shared with CITY_DOTS.
const INDIA =
  '40,6 47,9 53,15 61,17 67,21 73,22 77,19 83,18 91,23 88,28 90,33 84,33 ' +
  '80,30 76,34 72,36 70,44 65,54 59,66 54,77 49,94 44,80 41,67 37,58 33,52 ' +
  '29,49 23,46 16,47 12,42 17,37 16,32 22,29 27,23 32,17 36,11'
const LANKA = '55,88 58,89 59,95 56,97 53,93'

function IndiaMap() {
  return (
    <div className="map7" data-reveal>
      <div className="map7-stage">
        <svg className="map7-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <polygon points={INDIA} className="map7-land" />
          <polygon points={LANKA} className="map7-land map7-land--alt" />
        </svg>
        {CITY_DOTS.map((c) => (
          <div key={c.city} className="map7-pin" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
            <button className="map7-dot" aria-label={`${c.city}: ${c.events} events`}>
              <span className="map7-ping" aria-hidden="true" />
            </button>
            <div className="map7-tip">
              <strong>{c.city}</strong>
              <span>{c.events} events · {c.users} users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommunityCards() {
  const popular = EVENTS[0]
  return (
    <div className="comm">
      <div className="comm-card comm-card--att" data-reveal>
        <div className="comm-avatars">
          {[1, 2, 3, 4, 5].map((n) => (
            <img key={n} src={`/events/avatar${n}.jpg`} alt="" />
          ))}
        </div>
        <div>
          <strong>2.4k going this week</strong>
          <span>Happy attendees</span>
        </div>
      </div>

      <div className="comm-card comm-card--org" data-reveal data-reveal-delay="1">
        <img className="comm-org-photo" src="/events/avatar2.jpg" alt="" />
        <div>
          <span className="comm-tag">Top organizer</span>
          <strong>Rhythm Collective</strong>
          <span>320 events · 4.9★ rating</span>
        </div>
      </div>

      <div className="comm-card comm-card--pop" data-reveal data-reveal-delay="2"
        style={{ backgroundImage: `url(${popular.img})` }}>
        <span className="comm-veil" aria-hidden="true" />
        <div className="comm-pop-body">
          <span className="comm-tag comm-tag--light">Most popular</span>
          <strong>{popular.title}</strong>
          <span>8,420 attending</span>
        </div>
      </div>
    </div>
  )
}

export default function TrustedBy() {
  const sliderRef = useDragScroll()
  return (
    <section className="section trusted" id="trusted">
      <div className="container">
        <header className="sec-head">
          <p className="eyebrow" data-reveal>Trusted by thousands</p>
          <h2 className="section-title" data-reveal data-reveal-delay="1">Trusted by thousands.</h2>
          <p className="section-sub" data-reveal data-reveal-delay="2">
            Creating unforgettable memories across every city.
          </p>
        </header>

        <div className="stats">
          {STATS.map((s) => <Stat key={s.id} s={s} />)}
        </div>

        <div className="trusted-mid">
          <IndiaMap />
          <CommunityCards />
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
