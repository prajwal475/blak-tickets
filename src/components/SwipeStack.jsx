// A draggable card "stack" for touch: the top card peels left/right to reveal
// the next; a quiet tap (no drag) selects it. Used for the Explore categories
// on mobile. Keyboard + buttons keep it accessible.
import { useRef, useState } from 'react'

const THROW = 90  // px past which a drag advances the stack
const TAP = 8      // px under which a release counts as a tap

export default function SwipeStack({ items, renderCard, onSelect, getKey }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [dx, setDx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const start = useRef(null)

  const advance = (dir = 1) => {
    setAnimating(true)
    setDx(dir * window.innerWidth) // throw it off-screen
    window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]])
      setDx(0)
      setAnimating(false)
    }, 260)
  }

  const onPointerDown = (e) => {
    if (animating) return
    start.current = { x: e.clientX, y: e.clientY }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  const onPointerMove = (e) => {
    if (!start.current) return
    setDx(e.clientX - start.current.x)
  }
  const onPointerUp = (e) => {
    if (!start.current) return
    const ddx = e.clientX - start.current.x
    const ddy = e.clientY - start.current.y
    start.current = null
    if (Math.abs(ddx) + Math.abs(ddy) < TAP) {
      setDx(0)
      onSelect(items[order[0]])
    } else if (Math.abs(ddx) > THROW) {
      advance(ddx > 0 ? 1 : -1)
    } else {
      setDx(0) // snap back
    }
  }

  // render the top 3 cards for depth
  const visible = order.slice(0, 3)

  return (
    <div className="swipe">
      <div className="swipe-deck">
        {visible.map((itemIdx, pos) => {
          const isTop = pos === 0
          const rot = isTop ? dx / 22 : 0
          const style = isTop
            ? {
                transform: `translateX(${dx}px) rotate(${rot}deg)`,
                transition: animating || start.current === null ? 'transform 260ms cubic-bezier(0.22,0.61,0.36,1)' : 'none',
                zIndex: 3,
              }
            : {
                transform: `translateY(${pos * 14}px) scale(${1 - pos * 0.05})`,
                zIndex: 3 - pos,
                opacity: 1 - pos * 0.15,
              }
          return (
            <div
              key={getKey(items[itemIdx])}
              className={`swipe-card${isTop ? ' is-top' : ''}`}
              style={style}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? () => { start.current = null; setDx(0) } : undefined}
              role={isTop ? 'button' : undefined}
              tabIndex={isTop ? 0 : undefined}
              onKeyDown={isTop ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(items[itemIdx]) } } : undefined}
            >
              {renderCard(items[itemIdx])}
            </div>
          )
        })}
      </div>

      <div className="swipe-controls">
        <button className="swipe-btn" aria-label="Previous" onClick={() => advance(-1)}>‹</button>
        <span className="swipe-hint">Swipe · tap to open</span>
        <button className="swipe-btn" aria-label="Next" onClick={() => advance(1)}>›</button>
      </div>
    </div>
  )
}
