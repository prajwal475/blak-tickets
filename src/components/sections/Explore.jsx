// Section 2 — Explore Every Experience.
// A floating ecosystem: the BLAK mark at the centre, 10 category bubbles orbiting
// slowly (40s) — on every breakpoint, resized down for phones. Tapping any
// category opens its events page; "Explore all" opens /explore.
import { useMemo } from 'react'
import Logo from '../layout/Logo'
import Button from '../ui/Button'
import { CATEGORIES } from '../../config/categories'
import { track } from '../../lib/analytics'
import { useRouter } from '../../lib/router'
import './explore.css'

function CatCard({ c, bubble = false, onOpen }) {
  return (
    <button
      type="button"
      className={`cat-card${bubble ? ' cat-card--bubble' : ''}`}
      onClick={() => onOpen(c)}
      aria-label={`${c.label}, ${c.count} events`}
    >
      <span className="cat-photo" style={{ backgroundImage: `url(${c.img})` }} aria-hidden="true" />
      <span className="cat-veil" aria-hidden="true" />
      <span className="cat-meta">
        <span className="cat-name">{c.label}</span>
        <span className="cat-count">{c.count} events</span>
      </span>
    </button>
  )
}

export default function Explore() {
  const { navigate } = useRouter()
  const n = CATEGORIES.length

  const openCategory = (c) => {
    track('category_click', { id: c.id })
    navigate(`/category/${c.id}`)
  }

  const pos = useMemo(
    () =>
      CATEGORIES.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        return { x: +Math.cos(a).toFixed(4), y: +Math.sin(a).toFixed(4) }
      }),
    [n]
  )

  return (
    <section className="section section--alt explore" id="explore">
      <div className="explore-glow" aria-hidden="true" />
      <div className="container">
        <header className="sec-head">
          <p className="eyebrow" data-reveal>Explore</p>
          <h2 className="section-title" data-reveal data-reveal-delay="1">
            Every experience. One platform.
          </h2>
          <p className="section-sub" data-reveal data-reveal-delay="2">
            Discover concerts, parties, sports, workshops, festivals, college events,
            automotive shows, food festivals, gaming tournaments and more.
          </p>
        </header>

        <div className="hub" data-reveal>
          <div className="hub-core">
            <span className="hub-ring" aria-hidden="true" />
            <span className="hub-pulse" aria-hidden="true" />
            <Logo variant="mark" className="hub-mark" />
          </div>
          <div className="hub-spin">
            {CATEGORIES.map((c, i) => (
              <div
                key={c.id}
                className="bubble"
                style={{ '--x': pos[i].x, '--y': pos[i].y }}
              >
                <div className="bubble-rev">
                  <div className="bubble-float" style={{ '--d': `${(i % 5) * 0.6}s` }}>
                    <CatCard c={c} bubble onOpen={openCategory} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="explore-cta" data-reveal>
          <Button
            variant="primary"
            onClick={() => { track('explore_all'); navigate('/explore') }}
          >
            Explore all categories
          </Button>
        </div>
      </div>
    </section>
  )
}
