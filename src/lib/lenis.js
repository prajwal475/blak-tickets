// Single shared Lenis smooth-scroll instance, driven by one rAF loop and
// synced to GSAP ScrollTrigger. Disabled when the user prefers reduced motion.
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './capabilities'

let lenis = null

export function initLenis() {
  if (lenis || prefersReducedMotion()) return lenis

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -76, duration: 1.1, ...opts })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

export function destroyLenis() {
  lenis?.destroy()
  lenis = null
}
