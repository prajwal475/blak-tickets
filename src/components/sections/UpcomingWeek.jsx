// Section 6 — Upcoming This Week.
// Rolling day-pill timeline (today → +6 days) + a functional month calendar
// popover + filter chips + 3-column event cards.
import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import { EVENTS } from '../../config/events'
import { track } from '../../lib/tracking'
import { openApp } from '../../lib/app'
import './upcomingweek.css'

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DOW_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'free', label: 'Free' },
  { key: 'popular', label: 'Popular' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'newest', label: 'Newest' },
]

// ---- date helpers ----
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const addDays = (d, n) => { const x = startOfDay(d); x.setDate(x.getDate() + n); return x }
const firstOfMonth = (d) => startOfDay(new Date(d.getFullYear(), d.getMonth(), 1))
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
// stable pseudo "events on this day" count so the strip feels alive
const dayCount = (d) => 24 + ((d.getDate() * 7 + d.getMonth() * 5) % 44)

const inr = (p) => (p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`)

function applyFilter(key, todayDow) {
  switch (key) {
    case 'today': return EVENTS.filter((e) => e.day === todayDow)
    case 'tomorrow': return EVENTS.filter((e) => e.day === (todayDow + 1) % 7)
    case 'weekend': return EVENTS.filter((e) => e.day === 0 || e.day === 6)
    case 'free': return EVENTS.filter((e) => e.free)
    case 'popular': return EVENTS.filter((e) => ['Popular', 'Trending'].includes(e.tag))
    case 'newest': return EVENTS.filter((e) => e.tag === 'New')
    case 'nearby': return EVENTS
    default: return EVENTS
  }
}

function monthCells(monthStart) {
  const lead = monthStart.getDay()
  const days = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= days; d++) cells.push(startOfDay(new Date(monthStart.getFullYear(), monthStart.getMonth(), d)))
  return cells
}

function EventCard({ e, i }) {
  return (
    <article className="up-card" data-reveal data-reveal-delay={(i % 3) + 1}>
      <div className="up-media">
        <img src={e.img} alt={e.title} loading="lazy" />
        <span className="up-cat">{e.category}</span>
      </div>
      <div className="up-body">
        <h3 className="up-title">{e.title}</h3>
        <p className="up-loc">{e.venue}, {e.city}</p>
        <div className="up-meta">
          <span>{e.date} · {e.time}</span>
          <span className="up-price">{inr(e.price)}</span>
        </div>
        <button className="up-book" onClick={() => openApp(`upcoming-${e.id}`)}>Book ticket</button>
      </div>
    </article>
  )
}

export default function UpcomingWeek() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

  const [sel, setSel] = useState(today)            // selected date
  const [filter, setFilter] = useState(null)
  const [calOpen, setCalOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(() => firstOfMonth(today))

  const todayDow = today.getDay()
  const selDow = sel.getDay()

  const list = useMemo(() => {
    const base = filter ? applyFilter(filter, todayDow) : EVENTS.filter((e) => e.day === selDow)
    return base.length ? base : EVENTS.slice(0, 6)
  }, [selDow, filter, todayDow])

  // close the calendar on Escape
  useEffect(() => {
    if (!calOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setCalOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [calOpen])

  const pickDate = (d) => {
    setSel(d)
    setFilter(null)
    setCalOpen(false)
    track('day_select', { date: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` })
  }

  const atCurrentMonth = sameMonth(calMonth, today)

  return (
    <section className="section section--gray upcoming" id="upcoming">
      <div className="container">
        <header className="up-head">
          <div>
            <p className="eyebrow" data-reveal>Upcoming this week</p>
            <h2 className="section-title" data-reveal data-reveal-delay="1">
              Find what's happening in the next few days.
            </h2>
          </div>

          <div className="up-cal-wrap">
            <Button
              variant="ghost"
              className="up-cal"
              aria-expanded={calOpen}
              onClick={() => { setCalOpen((o) => !o); track('explore_calendar') }}
            >
              Explore calendar
            </Button>

            {calOpen && (
              <>
                <div className="up-cal-scrim" onClick={() => setCalOpen(false)} aria-hidden="true" />
                <div className="up-cal-pop" role="dialog" aria-label="Pick a date">
                  <div className="up-cal-bar">
                    <button
                      className="up-cal-nav"
                      onClick={() => setCalMonth((m) => firstOfMonth(new Date(m.getFullYear(), m.getMonth() - 1, 1)))}
                      disabled={atCurrentMonth}
                      aria-label="Previous month"
                    >‹</button>
                    <strong>{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</strong>
                    <button
                      className="up-cal-nav"
                      onClick={() => setCalMonth((m) => firstOfMonth(new Date(m.getFullYear(), m.getMonth() + 1, 1)))}
                      aria-label="Next month"
                    >›</button>
                  </div>

                  <div className="up-cal-grid up-cal-dows">
                    {DOW_MIN.map((d, i) => <span key={i}>{d}</span>)}
                  </div>

                  <div className="up-cal-grid">
                    {monthCells(calMonth).map((d, i) =>
                      d ? (
                        <button
                          key={i}
                          className={`up-cal-day${sameDay(d, sel) ? ' is-sel' : ''}${sameDay(d, today) ? ' is-today' : ''}`}
                          disabled={d < today}
                          onClick={() => pickDate(d)}
                        >
                          {d.getDate()}
                        </button>
                      ) : (
                        <span key={i} className="up-cal-empty" />
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* timeline — today → next 6 days */}
        <div className="up-timeline" data-reveal>
          {week.map((d) => {
            const active = !filter && sameDay(d, sel)
            return (
              <button
                key={d.toISOString()}
                className={`up-pill${active ? ' is-active' : ''}`}
                onClick={() => pickDate(d)}
              >
                <span className="up-pill-dow">{sameDay(d, today) ? 'TODAY' : DOW[d.getDay()]}</span>
                <span className="up-pill-date">{d.getDate()}</span>
                <span className="up-pill-count">{dayCount(d)} events</span>
              </button>
            )
          })}
        </div>

        {/* filters */}
        <div className="up-filters" data-reveal>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip${filter === f.key ? ' is-active' : ''}`}
              onClick={() => { setFilter(filter === f.key ? null : f.key); track('filter', { key: f.key }) }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* cards */}
        <div className="up-grid">
          {list.slice(0, 6).map((e, i) => <EventCard key={e.id} e={e} i={i} />)}
        </div>
      </div>
    </section>
  )
}
