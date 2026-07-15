// /explore — a grid of every category, and /category/:slug — the events within
// one category. Both reuse the .doc page header from content.css.
import { useEffect, useMemo, useState } from 'react'
import { Link } from '../../lib/router'
import { CATEGORIES } from '../../config/categories'
import { EVENTS } from '../../config/events'
import { openApp } from '../../lib/app'
import './content.css'
import './category.css'

const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

function useTitle(title) {
  useEffect(() => {
    document.title = `${title} — BLAK Tickets`
    return () => { document.title = 'BLAK Tickets — One platform for every experience' }
  }, [title])
}

function PageHead({ eyebrow, title, lead }) {
  return (
    <header className="doc-head">
      <div className="container doc-head-inner">
        <Link to="/" className="doc-back">← Back to home</Link>
        <p className="eyebrow doc-eyebrow">{eyebrow}</p>
        <h1 className="doc-title">{title}</h1>
        {lead && <p className="doc-lead">{lead}</p>}
      </div>
    </header>
  )
}

export function AllEventsPage() {
  useTitle('All events')
  const cats = useMemo(
    () => ['All', ...CATEGORIES.map((c) => c.label).filter((l) => EVENTS.some((e) => e.category === l))],
    []
  )
  const [active, setActive] = useState('All')
  const list = active === 'All' ? EVENTS : EVENTS.filter((e) => e.category === active)

  return (
    <article className="doc">
      <PageHead
        eyebrow="Events"
        title="All events."
        lead="Every experience on BLAK Tickets — concerts, sports, comedy, festivals and more."
      />
      <div className="container cat-page">
        <div className="ev-filters" role="tablist" aria-label="Filter by category">
          {cats.map((c) => (
            <button
              key={c}
              className={`ev-filter${active === c ? ' is-active' : ''}`}
              aria-pressed={active === c}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="ev-grid">
          {list.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      </div>
    </article>
  )
}

export function AllCategoriesPage() {
  useTitle('Explore categories')
  return (
    <article className="doc">
      <PageHead
        eyebrow="Explore"
        title="Every category, one place."
        lead="Browse all the experiences on BLAK Tickets — tap a category to see what's on."
      />
      <div className="container cat-page">
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} className="cat-tile" data-reveal>
              <span className="cat-tile-photo" style={{ backgroundImage: `url(${c.img})` }} aria-hidden="true" />
              <span className="cat-tile-veil" aria-hidden="true" />
              <span className="cat-tile-meta">
                <span className="cat-tile-name">{c.label}</span>
                <span className="cat-tile-count">{c.count} events</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function EventCard({ e }) {
  return (
    <article className="ev-tile" data-reveal>
      <div className="ev-tile-media">
        <img src={e.img} alt={e.title} loading="lazy" />
        {e.tag && <span className="ev-tile-tag">{e.tag}</span>}
      </div>
      <div className="ev-tile-body">
        <h3 className="ev-tile-title">{e.title}</h3>
        <p className="ev-tile-loc">{e.venue}, {e.city}</p>
        <div className="ev-tile-foot">
          <span>{e.date} · {e.time}</span>
          <span className="ev-tile-price">{inr(e.price)}</span>
        </div>
        <button className="ev-tile-book" onClick={() => openApp(`category-${e.id}`)}>Book ticket</button>
      </div>
    </article>
  )
}

export function CategoryEventsPage({ slug }) {
  const category = CATEGORIES.find((c) => c.id === slug)
  const events = category ? EVENTS.filter((e) => e.category === category.label) : []
  useTitle(category ? category.label : 'Category')

  if (!category) {
    return (
      <article className="doc">
        <PageHead eyebrow="Explore" title="Category not found." lead="That category doesn't exist." />
        <div className="container cat-page">
          <Link to="/explore" className="cat-back-link">← Browse all categories</Link>
        </div>
      </article>
    )
  }

  return (
    <article className="doc">
      <PageHead
        eyebrow="Category"
        title={category.label}
        lead={`${category.count} events · discover ${category.label.toLowerCase()} near you.`}
      />
      <div className="container cat-page">
        <Link to="/explore" className="cat-back-link">← All categories</Link>
        {events.length ? (
          <div className="ev-grid">
            {events.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        ) : (
          <div className="cat-empty" data-reveal>
            <p className="cat-empty-title">No {category.label.toLowerCase()} events listed just yet.</p>
            <p className="cat-empty-sub">New experiences are added every week — get the app to be the first to know.</p>
            <button className="ev-tile-book cat-empty-cta" onClick={() => openApp('category-empty')}>Get the app</button>
          </div>
        )}
      </div>
    </article>
  )
}
