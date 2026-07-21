import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import './booking-sequence.css'

const FRAME_COUNT = 300
const PRELOAD_RADIUS = 14
const CACHE_RADIUS = 24
const desktopFramePath = (i) => `/hero/seq/booking-frame-${String(i + 1).padStart(3, '0')}.webp`
const mobileFramePath = (i) => `/hero/seq-mobile/booking-frame-${String(i + 1).padStart(3, '0')}.webp`

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
    const framePath = window.matchMedia('(max-width: 760px)').matches
      ? mobileFramePath
      : desktopFramePath
    const images = new Map()
    let current = -1
    let target = 0
    let rendering = false
    let alive = true
    let warming = false
    let paintFrame = 0
    const warmController = new AbortController()

    const draw = (i) => {
      const entry = images.get(i)
      const img = entry?.img
      if (!img || !img.complete || img.naturalWidth === 0) return false
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      current = i
      canvas.dataset.frame = String(i + 1)
      return true
    }

    const load = (i) => {
      if (i < 0 || i >= FRAME_COUNT) return Promise.resolve(false)
      const cached = images.get(i)
      if (cached) return cached.ready

      const img = new Image()
      img.decoding = 'async'
      img.fetchPriority = Math.abs(i - current) <= 3 ? 'high' : 'low'
      const ready = new Promise((resolve) => {
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
      })
      img.src = framePath(i)
      images.set(i, { img, ready })
      return ready
    }

    const preloadAroundCurrent = () => {
      const center = Math.max(0, current)
      const direction = Math.sign(target - center) || 1
      for (let offset = 1; offset <= PRELOAD_RADIUS; offset++) {
        load(center + direction * offset)
      }
      for (let offset = 1; offset <= 3; offset++) load(center - direction * offset)
    }

    const trimCache = () => {
      if (images.size <= CACHE_RADIUS * 2 + 1) return
      for (const [index, entry] of images) {
        if (Math.abs(index - current) > CACHE_RADIUS) {
          entry.img.onload = null
          entry.img.onerror = null
          images.delete(index)
        }
      }
    }

    const nextPaint = () => new Promise((resolve) => {
      paintFrame = window.requestAnimationFrame(resolve)
    })

    const renderToTarget = async () => {
      if (rendering || !alive) return
      rendering = true

      while (alive && current !== target) {
        const next = current < 0 ? 0 : current + Math.sign(target - current)
        const loaded = await load(next)
        if (!alive) break
        if (loaded) draw(next)
        else current = next
        preloadAroundCurrent()
        trimCache()
        await nextPaint()
      }

      rendering = false
      if (alive && current !== target) renderToTarget()
    }

    const requestFrame = (i) => {
      target = Math.max(0, Math.min(FRAME_COUNT - 1, i))
      preloadAroundCurrent()
      renderToTarget()
    }

    // Warm the compressed browser cache in exact frame order before this
    // lower-page sequence enters view. Decoded images stay in a bounded window.
    const warmFrames = async () => {
      if (warming) return
      warming = true
      let cursor = 0
      const workers = Array.from({ length: 4 }, async () => {
        while (alive && cursor < FRAME_COUNT) {
          const index = cursor++
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
    if ('IntersectionObserver' in window) {
      warmObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        warmObserver?.disconnect()
        warmFrames()
      }, { rootMargin: '500% 0px' })
      warmObserver.observe(section)
    } else {
      warmFrames()
    }

    if (reduced) {
      target = Math.floor(FRAME_COUNT * 0.55)
      load(target).then(() => draw(target))
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
          scrub: 0.35,
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
      window.cancelAnimationFrame(paintFrame)
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
