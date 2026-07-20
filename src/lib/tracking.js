// Lightweight event tracking shim: pushes events to a dataLayer and logs in dev.
export function track(event, payload = {}) {
  const data = { event, ...payload, ts: Date.now() }
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(data)
  }
  if (import.meta.env?.DEV) console.debug('[track]', event, payload)
}

export function initScrollDepth() {
  if (typeof window === 'undefined') return
  const marks = [25, 50, 75, 100]
  const seen = new Set()
  const onScroll = () => {
    const h = document.documentElement
    const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100)
    for (const m of marks) {
      if (pct >= m && !seen.has(m)) {
        seen.add(m)
        track('scroll_depth', { percent: m })
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
