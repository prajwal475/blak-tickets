// Attach to a horizontally-scrolling element for pointer drag-to-scroll +
// vertical-wheel -> horizontal scroll. Suppresses the click that ends a drag.
import { useEffect, useRef } from 'react'

export function useDragScroll() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let down = false, startX = 0, startLeft = 0, moved = false
    const onDown = (e) => { down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft; el.classList.add('is-dragging') }
    const onMove = (e) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = startLeft - dx }
    const onUp = () => { down = false; el.classList.remove('is-dragging') }
    const onClick = (e) => { if (moved) { e.preventDefault(); e.stopPropagation() } }
    const onWheel = (e) => { if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; el.scrollLeft += e.deltaY; e.preventDefault() }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('click', onClick, true)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('click', onClick, true)
      el.removeEventListener('wheel', onWheel)
    }
  }, [])
  return ref
}
