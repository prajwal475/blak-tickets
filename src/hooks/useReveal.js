// Scroll reveal: adds `.is-in` to any [data-reveal] element once it enters the
// viewport. Honours reduced-motion (base.css forces visible). Combines an
// IntersectionObserver (handles items scrolled into view, incl. horizontal
// rails) with a scroll/resize "sweep" safety net — the observer alone can skip
// the intersecting sample for tall elements crossed in one smooth-scroll step
// (e.g. the Explore hub), leaving them stuck invisible. A MutationObserver
// picks up nodes added later (responsive swaps). Call once near the app root.
import { useEffect } from 'react'

export function useReveal(deps = []) {
  useEffect(() => {
    const reveal = (el) => el.classList.add('is-in')

    // ---- 1) IntersectionObserver: primary trigger ----
    let io = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              reveal(e.target)
              io.unobserve(e.target)
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0 }
      )
    }

    const observe = (el) => (io ? io.observe(el) : reveal(el))
    const observeWithin = (root) => {
      if (root.nodeType !== 1) return
      if (root.matches?.('[data-reveal]:not(.is-in)')) observe(root)
      root.querySelectorAll?.('[data-reveal]:not(.is-in)').forEach(observe)
    }
    observeWithin(document.body)

    // ---- 2) Scroll/resize sweep: safety net for anything IO skipped ----
    const sweep = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      const vw = window.innerWidth || document.documentElement.clientWidth
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        const onScreen =
          r.width > 0 && r.height > 0 &&
          r.top < vh * 0.92 && r.bottom > 0 &&
          r.left < vw && r.right > 0
        if (onScreen) reveal(el)
      })
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { ticking = false; sweep() })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    // ---- 3) MutationObserver: pick up data-reveal nodes added after mount ----
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach(observeWithin)
      sweep()
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // initial + delayed sweeps (above-the-fold, post-font/layout settle)
    sweep()
    const t = setTimeout(sweep, 300)

    return () => {
      io?.disconnect()
      mo.disconnect()
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
