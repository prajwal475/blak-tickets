// Premium 3D card tilt with magnetic drift + idle "breathing".
// Wires pointer-driven rotateX/rotateY/translateZ/x/y onto an element using
// GSAP quickTo (spring-like smoothing). The element must live inside a
// `perspective` ancestor and be `transform-style: preserve-3d`.
// Bails out entirely on reduced-motion / coarse-pointer devices (returns a ref
// you still attach — it simply stays flat).
import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion, isCoarsePointer } from '../lib/capabilities'

export function useCardTilt({
  maxRX = 10,     // deg tilt on X (from vertical cursor)
  maxRY = 12,     // deg tilt on Y (from horizontal cursor)
  lift = 70,      // translateZ px while hovered
  magnet = 16,    // px magnetic drift toward cursor
  breathe = true, // subtle idle scale
  breatheScale = 1.01,
  breatheDur = 7.5,
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || isCoarsePointer()) return

    const gctx = gsap.context(() => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
      const tz = gsap.quickTo(el, 'z', { duration: 0.55, ease: 'power3.out' })
      const tx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
      const ty = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })

      if (breathe) {
        gsap.to(el, { scale: breatheScale, duration: breatheDur, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      }

      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        rx(-py * maxRX)
        ry(px * maxRY)
        tz(lift)
        tx(px * magnet)
        ty(py * magnet)
      }
      const onLeave = () => { rx(0); ry(0); tz(0); tx(0); ty(0) }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    }, el)

    return () => gctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
