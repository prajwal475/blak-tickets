// Full-bleed, scroll-scrubbed booking sequence. The clip is preloaded as JPG
// frames and painted to a canvas that fills the whole section; a sticky stage
// pins it while a long (220vh) scroll distance scrubs the frames slowly.
// Reduced-motion users get a single static frame in a normal-height section.
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './sequence.css'

const FRAME_COUNT = 120
const framePath = (i) => `/hero/seq/frame-${String(i + 1).padStart(3, '0')}.jpg`

export default function HeroSequence() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
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

    const obj = { f: 0 }
    const tween = gsap.to(obj, {
      f: FRAME_COUNT - 1,
      ease: 'none',
      onUpdate: () => draw(Math.round(obj.f)),
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
      },
    })

    ScrollTrigger.refresh()
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reduced])

  return (
    <section
      className={`seq${reduced ? ' seq--static' : ''}`}
      ref={sectionRef}
      aria-label="Booking an event on the BLAK Tickets app"
    >
      <div className="seq-stage">
        <div
          className="seq-bg"
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
        <p className="seq-cap">Scroll to book — every experience, one tap away.</p>
      </div>
    </section>
  )
}
