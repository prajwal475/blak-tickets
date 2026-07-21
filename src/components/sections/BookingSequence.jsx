import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './booking-sequence.css'

const FRAME_COUNT = 300
const PRELOAD_RADIUS = 5
const CACHE_RADIUS = 9
const MOBILE_PRELOAD_RADIUS = 10
const MOBILE_CACHE_RADIUS = 14
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
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const preloadRadius = mobile ? MOBILE_PRELOAD_RADIUS : PRELOAD_RADIUS
    const cacheRadius = mobile ? MOBILE_CACHE_RADIUS : CACHE_RADIUS
    const images = new Map()
    let current = -1
    let requested = 0
    let alive = true
    let warming = false
    const warmController = new AbortController()

    const isReady = (img) => !!img?.complete && img.naturalWidth > 0

    const draw = (i) => {
      const img = images.get(i)
      if (!img || !img.complete || img.naturalWidth === 0) return
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      current = i
      canvas.dataset.frame = String(i + 1)
    }

    const load = (i) => {
      if (i < 0 || i >= FRAME_COUNT || images.has(i)) return
      const img = new Image()
      img.decoding = 'async'
      img.fetchPriority = Math.abs(i - requested) <= 2 ? 'high' : 'low'
      img.onload = () => {
        if (requested === i) {
          draw(i)
          return
        }

        const exact = images.get(requested)
        if (!isReady(exact) && (current < 0 || Math.abs(i - requested) < Math.abs(current - requested))) {
          draw(i)
        }
      }
      img.src = framePath(i)
      images.set(i, img)
    }

    const drawNearest = (target) => {
      const exact = images.get(target)
      if (isReady(exact)) {
        draw(target)
        return
      }

      for (let offset = 1; offset <= cacheRadius; offset++) {
        const before = images.get(target - offset)
        if (isReady(before)) {
          draw(target - offset)
          return
        }
        const after = images.get(target + offset)
        if (isReady(after)) {
          draw(target + offset)
          return
        }
      }
    }

    const requestFrame = (i) => {
      const next = Math.max(0, Math.min(FRAME_COUNT - 1, i))
      if (next === requested && current === next) return
      requested = next
      load(requested)
      drawNearest(requested)

      for (let offset = 1; offset <= preloadRadius; offset++) {
        load(requested + offset)
        load(requested - offset)
      }

      if (images.size > cacheRadius * 2 + 1) {
        for (const [index, img] of images) {
          if (Math.abs(index - requested) > cacheRadius) {
            img.onload = null
            images.delete(index)
          }
        }
      }
    }

    // Warm the browser's compressed HTTP cache before this lower-page sequence
    // reaches the viewport. Nearby Image objects remain bounded to protect
    // mobile memory while subsequent frame decodes become local and immediate.
    const warmFrames = async () => {
      if (!mobile || warming) return
      warming = true
      const keyframes = Array.from({ length: FRAME_COUNT }, (_, i) => i)
        .filter((i) => i % 10 === 0 || i === FRAME_COUNT - 1)
      const keyframeSet = new Set(keyframes)
      const warmOrder = [
        ...keyframes,
        ...Array.from({ length: FRAME_COUNT }, (_, i) => i).filter((i) => !keyframeSet.has(i)),
      ]
      let cursor = 0
      const workers = Array.from({ length: 4 }, async () => {
        while (alive && cursor < warmOrder.length) {
          const index = warmOrder[cursor++]
          try {
            const response = await fetch(framePath(index), {
              cache: 'force-cache',
              signal: warmController.signal,
            })
            await response.blob()
          } catch {
            if (warmController.signal.aborted) return
          }
        }
      })
      await Promise.all(workers)
    }

    let warmObserver = null
    if (mobile && 'IntersectionObserver' in window) {
      warmObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        warmObserver?.disconnect()
        warmFrames()
      }, { rootMargin: '500% 0px' })
      warmObserver.observe(section)
    } else if (mobile) {
      warmFrames()
    }

    if (reduced) {
      requested = Math.floor(FRAME_COUNT * 0.55)
      load(requested)
      draw(requested)
      return () => {
        alive = false
        warmObserver?.disconnect()
        warmController.abort()
      }
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
          scrub: mobile ? 1.15 : 0.7,
          invalidateOnRefresh: true,
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
    return () => {
      alive = false
      warmObserver?.disconnect()
      warmController.abort()
      gctx.revert()
    }
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
