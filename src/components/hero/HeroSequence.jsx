// Full-bleed, scroll-scrubbed booking sequence. The clip is preloaded as JPG
// frames and painted to a canvas that fills the whole section; a sticky stage
// pins it while a long (340vh) scroll distance scrubs the frames slowly.
// Layered parallax: the blurred backdrop drifts + zooms on scroll, while the
// phone tilts/shifts and the logo + caption glide with the cursor.
// Reduced-motion users get a single static frame in a normal-height section.
import { useEffect, useRef } from 'react'
import Logo from '../layout/Logo'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './sequence.css'

const FRAME_COUNT = 120
const framePath = (i) => `/hero/seq/frame-${String(i + 1).padStart(3, '0')}.jpg`

export default function HeroSequence() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const bgRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')

    const images = new Array(FRAME_COUNT)
    let current = -1

    const draw = (i) => {
      const img = images[i]
      if (!img || !img.complete || img.naturalWidth === 0) return
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      current = i
    }

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = framePath(i)
      if (i === 0) img.onload = () => { if (current < 0) draw(0) }
      images[i] = img
    }

    if (reduced) {
      const mid = Math.floor(FRAME_COUNT * 0.55)
      images[mid].complete ? draw(mid) : (images[mid].onload = () => draw(mid))
      return
    }

    const bg = bgRef.current
    const stage = stageRef.current
    const logo = stage && stage.querySelector('.seq-logo')
    const cap = stage && stage.querySelector('.seq-cap')

    const gctx = gsap.context(() => {
      const obj = { f: 0 }
      gsap.to(obj, {
        f: FRAME_COUNT - 1,
        ease: 'none',
        onUpdate: () => draw(Math.round(obj.f)),
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
      })

      // scroll parallax — the far backdrop drifts + zooms behind the phone
      if (bg) {
        gsap.fromTo(
          bg,
          { yPercent: -5, scale: 1.08 },
          { yPercent: 5, scale: 1.2, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1.2 } }
        )
      }

      // mouse parallax — phone (near) tilts/shifts, logo + caption glide
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      if (!canHover || !stage) return
      const onMove = (ev) => {
        const r = stage.getBoundingClientRect()
        const px = (ev.clientX - r.left) / r.width - 0.5
        const py = (ev.clientY - r.top) / r.height - 0.5
        gsap.to(canvas, { xPercent: px * 4, yPercent: py * 3, rotateY: px * 4, rotateX: -py * 3, duration: 0.9, ease: 'power2.out' })
        if (logo) gsap.to(logo, { x: px * -14, y: py * -10, duration: 1, ease: 'power2.out' })
        if (cap) gsap.to(cap, { x: px * -10, y: py * -7, duration: 1, ease: 'power2.out' })
      }
      const reset = () => {
        gsap.to(canvas, { xPercent: 0, yPercent: 0, rotateY: 0, rotateX: 0, duration: 1.1, ease: 'power2.out' })
        gsap.to([logo, cap].filter(Boolean), { x: 0, y: 0, duration: 1.1, ease: 'power2.out' })
      }
      stage.addEventListener('pointermove', onMove)
      stage.addEventListener('pointerleave', reset)
      return () => {
        stage.removeEventListener('pointermove', onMove)
        stage.removeEventListener('pointerleave', reset)
      }
    }, section)

    ScrollTrigger.refresh()
    return () => gctx.revert()
  }, [reduced])

  return (
    <section
      className={`seq${reduced ? ' seq--static' : ''}`}
      ref={sectionRef}
      aria-label="Booking an event on the BLAK Tickets app"
    >
      <div className="seq-stage" ref={stageRef}>
        <div
          className="seq-bg"
          ref={bgRef}
          aria-hidden="true"
          style={{ backgroundImage: `url(${framePath(Math.floor(FRAME_COUNT * 0.5))})` }}
        />
        <canvas
          ref={canvasRef}
          className="seq-canvas"
          width="800"
          height="1422"
          role="img"
          aria-label="Booking an event ticket on the BLAK Tickets app, step by step."
        />
        <Logo variant="lockup" className="seq-logo" />
        <p className="seq-cap">Scroll to book — every experience, one tap away.</p>
      </div>
    </section>
  )
}
