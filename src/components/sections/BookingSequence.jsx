import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './booking-sequence.css'

const FRAME_COUNT = 300
const PRELOAD_RADIUS = 5
const CACHE_RADIUS = 9
const framePath = (i) => `/hero/seq/booking-frame-${String(i + 1).padStart(3, '0')}.webp`

export default function BookingSequence() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!section || !stage || !canvas) return

    const ctx = canvas.getContext('2d')
    const images = new Map()
    let current = -1
    let requested = 0

    const draw = (i) => {
      const img = images.get(i)
      if (!img || !img.complete || img.naturalWidth === 0) return
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      current = i
    }

    const load = (i) => {
      if (i < 0 || i >= FRAME_COUNT || images.has(i)) return
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => { if (requested === i) draw(i) }
      img.src = framePath(i)
      images.set(i, img)
    }

    const requestFrame = (i) => {
      const next = Math.max(0, Math.min(FRAME_COUNT - 1, i))
      if (next === requested && current === next) return
      requested = next
      load(requested)
      draw(requested)

      for (let offset = 1; offset <= PRELOAD_RADIUS; offset++) {
        load(requested + offset)
        load(requested - offset)
      }

      if (images.size > CACHE_RADIUS * 2 + 1) {
        for (const [index, img] of images) {
          if (Math.abs(index - requested) > CACHE_RADIUS) {
            img.onload = null
            images.delete(index)
          }
        }
      }
    }

    if (reduced) {
      requested = Math.floor(FRAME_COUNT * 0.55)
      load(requested)
      draw(requested)
      return
    }

    requestFrame(0)

    const gctx = gsap.context(() => {
      const frame = { value: 0 }
      gsap.to(frame, {
        value: FRAME_COUNT - 1,
        ease: 'none',
        onUpdate: () => requestFrame(Math.round(frame.value)),
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
        },
      })

      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const onMove = (event) => {
        const rect = stage.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        gsap.to(canvas, {
          xPercent: px * 3,
          yPercent: py * 2,
          rotateY: px * 3,
          rotateX: -py * 2,
          duration: 0.9,
          ease: 'power2.out',
        })
      }
      const reset = () => gsap.to(canvas, {
        xPercent: 0,
        yPercent: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 1,
        ease: 'power2.out',
      })

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
      className={`booking-seq${reduced ? ' booking-seq--static' : ''}`}
      ref={sectionRef}
      aria-label="Booking a ticket with BLAK Tickets"
    >
      <div className="booking-seq-stage" ref={stageRef}>
        <canvas
          className="booking-seq-canvas"
          ref={canvasRef}
          width="1920"
          height="1080"
          role="img"
          aria-label="A ticket booking flow changing as you scroll."
        />
      </div>
    </section>
  )
}
