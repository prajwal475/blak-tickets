// Animate a number from 0 -> target when the element scrolls into view.
// Returns a ref to attach and the formatted display string.
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/capabilities'

export function useCountUp(target, { duration = 2000, format } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const run = () => {
      if (started.current) return
      started.current = true
      if (prefersReducedMotion()) {
        setValue(target)
        return
      }
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
        setValue(target * eased)
        if (t < 1) requestAnimationFrame(tick)
        else setValue(target)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  const display = format ? format(value) : Math.round(value).toLocaleString()
  return [ref, display]
}
