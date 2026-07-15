// Premium glass calendar date picker.
// A frosted popover with quick filters, sliding month transitions, keyboard
// navigation (arrows / Enter / Esc) and GSAP open/close motion. Emerald accent
// matches the brand. Past dates are disabled; weekends are subtly tinted.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './datepicker.css'

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const fmt = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6

function buildGrid(viewMonth) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7 // Monday-start
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export default function DatePicker({ value = null, onChange, placeholder = 'Any date' }) {
  const today = startOfDay(new Date())
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)
  const [viewMonth, setViewMonth] = useState(startOfDay(value || today))
  const [focused, setFocused] = useState(startOfDay(value || today))

  const rootRef = useRef(null)
  const popRef = useRef(null)
  const gridRef = useRef(null)
  const cells = useRef({})
  const reduced = prefersReducedMotion()

  const prevDisabled = viewMonth.getFullYear() < today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() <= today.getMonth())

  /* ---- open / close motion ---- */
  useLayoutEffect(() => {
    if (!open || !popRef.current) return
    if (reduced) { gsap.set(popRef.current, { opacity: 1, y: 0, scale: 1 }); return }
    gsap.fromTo(popRef.current,
      { opacity: 0, y: 20, scale: 0.96, filter: 'blur(8px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }
    )
  }, [open, reduced])

  const close = () => {
    const pop = popRef.current
    if (!pop || reduced) { setOpen(false); return }
    gsap.to(pop, {
      opacity: 0, y: 10, scale: 0.98, duration: 0.22, ease: 'power2.in',
      onComplete: () => setOpen(false),
    })
  }

  /* ---- outside click + focus trap-ish ---- */
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) close() }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* ---- keep DOM focus on the focused day ---- */
  useEffect(() => {
    if (!open) return
    const el = cells.current[focused.getTime()]
    if (el) el.focus({ preventScroll: true })
  }, [focused, open, viewMonth])

  const slideTo = (nextMonth, dir) => {
    setViewMonth(nextMonth)
    if (reduced || !gridRef.current) return
    gsap.fromTo(gridRef.current,
      { xPercent: dir * 12, opacity: 0.3 },
      { xPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
    )
  }

  const pick = (d) => {
    if (startOfDay(d) < today) return
    const day = startOfDay(d)
    setSelected(day)
    setFocused(day)
    onChange?.(day)
    // pulse the chosen cell, then close
    const el = cells.current[day.getTime()]
    if (el && !reduced) {
      gsap.fromTo(el.querySelector('.dp-day-in'),
        { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
    }
    setTimeout(close, reduced ? 0 : 160)
  }

  const onGridKey = (e) => {
    let next = null
    if (e.key === 'ArrowLeft') next = addDays(focused, -1)
    else if (e.key === 'ArrowRight') next = addDays(focused, 1)
    else if (e.key === 'ArrowUp') next = addDays(focused, -7)
    else if (e.key === 'ArrowDown') next = addDays(focused, 7)
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(focused); return }
    else if (e.key === 'Escape') { e.preventDefault(); close(); return }
    else return
    e.preventDefault()
    if (startOfDay(next) < today) return
    setFocused(next)
    if (!sameMonth(next, viewMonth)) {
      const dir = next > viewMonth ? 1 : -1
      slideTo(new Date(next.getFullYear(), next.getMonth(), 1), dir)
    }
  }

  const QUICK = [
    { k: 'today', label: 'Today', get: () => today },
    { k: 'tomorrow', label: 'Tomorrow', get: () => addDays(today, 1) },
    { k: 'weekend', label: 'This Weekend', get: () => addDays(today, (6 - today.getDay() + 7) % 7 || 6) },
    { k: 'week', label: 'This Week', get: () => addDays(today, (7 - today.getDay()) % 7) },
    { k: 'nextweek', label: 'Next Week', get: () => addDays(today, ((8 - today.getDay()) % 7) || 7) },
    { k: 'nextmonth', label: 'Next Month', get: () => addMonths(today, 1) },
  ]

  const chooseQuick = (q) => {
    const d = startOfDay(q.get())
    setSelected(d); setFocused(d); onChange?.(d)
    if (!sameMonth(d, viewMonth)) slideTo(new Date(d.getFullYear(), d.getMonth(), 1), d > viewMonth ? 1 : -1)
    setTimeout(close, reduced ? 0 : 180)
  }

  const grid = buildGrid(viewMonth)

  return (
    <div className={`dp ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="dp-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className={selected ? 'dp-value' : 'dp-value dp-value--placeholder'}>
          {selected ? fmt(selected) : placeholder}
        </span>
        <svg className="dp-caret" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="dp-pop" role="dialog" aria-label="Choose a date" ref={popRef}>
          <div className="dp-quick">
            {QUICK.map((q) => {
              const active = selected && sameDay(selected, startOfDay(q.get()))
              return (
                <button key={q.k} type="button" className={`dp-chip ${active ? 'is-active' : ''}`} onClick={() => chooseQuick(q)}>
                  {q.label}
                </button>
              )
            })}
          </div>

          <div className="dp-head">
            <button type="button" className="dp-nav" onClick={() => !prevDisabled && slideTo(addMonths(viewMonth, -1), -1)}
              disabled={prevDisabled} aria-label="Previous month">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="dp-title">{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
            <button type="button" className="dp-nav" onClick={() => slideTo(addMonths(viewMonth, 1), 1)} aria-label="Next month">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="dp-weekdays">
            {WEEK.map((w) => <span key={w}>{w}</span>)}
          </div>

          <div className="dp-grid" ref={gridRef} role="grid" onKeyDown={onGridKey}>
            {grid.map((d) => {
              const key = d.getTime()
              const out = !sameMonth(d, viewMonth)
              const disabled = startOfDay(d) < today
              const isToday = sameDay(d, today)
              const isSel = sameDay(d, selected)
              const isFoc = sameDay(d, focused)
              return (
                <button
                  key={key}
                  ref={(el) => { if (el) cells.current[key] = el }}
                  type="button"
                  role="gridcell"
                  tabIndex={isFoc ? 0 : -1}
                  className={[
                    'dp-day',
                    out ? 'dp-out' : '',
                    disabled ? 'dp-disabled' : '',
                    isWeekend(d) ? 'dp-weekend' : '',
                    isToday ? 'dp-today' : '',
                    isSel ? 'dp-selected' : '',
                  ].join(' ').trim()}
                  aria-label={fmt(d)}
                  aria-selected={isSel || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  disabled={disabled}
                  onClick={() => pick(d)}
                >
                  <span className="dp-day-in">{d.getDate()}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
