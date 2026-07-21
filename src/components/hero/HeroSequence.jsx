// Full-bleed, scroll-scrubbed event carousel. Nearby frames are cached and
// painted to a canvas while a sticky stage pins the scene during the scroll.
// Reduced-motion users get a single static frame in a normal-height section.
import { useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/capabilities'
import { scrollTo } from '../../lib/lenis'
import { openApp } from '../../lib/app'
import './sequence.css'

const FRAME_COUNT = 239
const PRELOAD_RADIUS = 14
const CACHE_RADIUS = 24
const desktopFramePath = (i) => `/landing-seq/frame-${String(i + 1).padStart(3, '0')}.jpg`
const mobileFramePath = (i) => `/landing-seq-mobile/frame-${String(i + 1).padStart(3, '0')}.webp`

export default function HeroSequence() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const copyRef = useRef(null)
  const ctaRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')

    const framePath = window.matchMedia('(max-width: 760px)').matches
      ? mobileFramePath
      : desktopFramePath
    const images = new Map()
    let current = -1
    let target = 0
    let rendering = false
    let alive = true
    let paintFrame = 0

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

    if (reduced) {
      const mid = Math.floor(FRAME_COUNT * 0.55)
      target = mid
      load(mid).then(() => draw(mid))
      return () => { alive = false }
    }

    requestFrame(0)

    let warming = false
    let warmHandle = null
    let warmUsesIdleCallback = false
    const warmController = new AbortController()

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

    if ('requestIdleCallback' in window) {
      warmUsesIdleCallback = true
      warmHandle = window.requestIdleCallback(warmFrames, { timeout: 1200 })
    } else {
      warmHandle = window.setTimeout(warmFrames, 250)
    }

    const stage = stageRef.current
    const copy = copyRef.current
    const cta = ctaRef.current
    const copyRows = copy ? gsap.utils.toArray('.seq-copy-row', copy) : []
    const copyMasks = copy ? gsap.utils.toArray('.seq-copy-mask', copy) : []
    const accentWords = copy ? gsap.utils.toArray('.seq-accent-word', copy) : []
    const ctaButtons = cta ? gsap.utils.toArray('.btn', cta) : []

    const gctx = gsap.context(() => {
      const frame = { value: 0 }
      const maskDrop = 14
      const copyScale = () => {
        if (window.innerWidth > 760) return 0.54
        return window.innerWidth <= 380 ? 0.3 : 0.5
      }
      const copyX = () => {
        if (!copy) return 0
        const scale = copyScale()
        const left = window.innerWidth > 760 ? Math.max(22, window.innerWidth * 0.025) : 8
        return left + (copy.offsetWidth * scale) / 2 - window.innerWidth / 2
      }
      const copyY = () => {
        if (!copy) return 0
        const scale = copyScale()
        const bottom = window.innerWidth > 760
          ? 320
          : window.innerWidth <= 380
            ? Math.min(300, window.innerHeight * 0.45)
            : 300
        const downwardOffset = window.innerHeight * (window.innerWidth > 760 ? 0.22 : 0.045)
        const compactOffset = window.innerWidth <= 380 ? 105 : 0
        return window.innerHeight - bottom - (copy.offsetHeight * scale) / 2 - window.innerHeight / 2 + downwardOffset + compactOffset
      }
      const canvasBaseX = () => 0
      const canvasBaseY = () => {
        if (window.innerWidth > 760) return 0
        return window.innerWidth > 320 && window.innerWidth <= 380 ? -45 : -32
      }
      const finalCanvasScale = () => {
        if (window.innerWidth <= 760) return 0.9
        const renderedHeight = Math.min(window.innerHeight, window.innerWidth * 9 / 16)
        const availableHeight = window.innerHeight - 172
        return Math.max(0.68, Math.min(0.84, availableHeight / renderedHeight))
      }
      const finalCanvasY = () => {
        if (window.innerWidth <= 760 || !cta) return canvasBaseY()
        const renderedHeight = Math.min(window.innerHeight, window.innerWidth * 9 / 16)
        const finalHeight = renderedHeight * finalCanvasScale()
        const naturalBottom = (window.innerHeight + finalHeight) / 2
        const targetBottom = cta.getBoundingClientRect().top - 30
        const gapOffset = -((naturalBottom - targetBottom) / renderedHeight) * 100
        return Math.max(-1.5, gapOffset)
      }

      gsap.set(canvas, { autoAlpha: 1, scale: 1, xPercent: canvasBaseX, yPercent: canvasBaseY })
      gsap.set(copyRows, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)' })
      gsap.set(copy, {
        autoAlpha: 0,
        x: copyX,
        y: () => copyY() + 34 - maskDrop * copyScale(),
        scale: () => copyScale() * 0.72,
        transformOrigin: 'center center',
      })
      gsap.set(cta, { autoAlpha: 0, pointerEvents: 'none' })
      gsap.set(ctaButtons, { autoAlpha: 0, y: 24, scale: 0.94 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to(copy, {
          autoAlpha: 1,
          x: copyX,
          y: () => copyY() - maskDrop * copyScale(),
          scale: copyScale,
          transformOrigin: 'center center',
          duration: 2.25,
          ease: 'power3.out',
        }, 0.12)
        .to(copyMasks, {
          y: maskDrop,
          duration: 0.72,
          stagger: 0.18,
          ease: 'power2.inOut',
        }, 0.42)
        .to(accentWords, {
          scale: 1.045,
          textShadow: '0 10px 28px rgba(15, 143, 115, 0.22)',
          duration: 0.42,
          stagger: 0.16,
          repeat: 1,
          yoyo: true,
          ease: 'power2.inOut',
        }, 1.28)
        .to(frame, {
          value: FRAME_COUNT - 1,
          duration: 5,
          ease: 'none',
          onUpdate: () => requestFrame(Math.round(frame.value)),
        }, 0.25)
        .to(copyRows, {
          yPercent: 125,
          autoAlpha: 0,
          filter: 'blur(5px)',
          duration: 0.62,
          stagger: 0.11,
          ease: 'power3.in',
        }, 3.68)
        .to(copy, {
          autoAlpha: 0,
          y: () => copyY() + 30 - maskDrop * copyScale(),
          duration: 0.3,
          ease: 'power2.in',
        }, 4.7)
        .to(canvas, {
          scale: finalCanvasScale,
          yPercent: finalCanvasY,
          duration: 0.55,
          ease: 'power2.inOut',
        }, 4.82)
        .to(cta, {
          autoAlpha: 1,
          pointerEvents: 'auto',
          duration: 0.12,
        }, 5.12)
        .to(ctaButtons, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.72,
          stagger: 0.12,
          ease: 'back.out(1.7)',
        }, 5.14)
        .to(cta, { autoAlpha: 1, duration: 1 })

      // Pointer parallax gives the foreground scene a restrained 3D response.
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      if (!canHover || !stage) return
      const restingCanvasY = () => timeline.progress() >= 0.82 ? finalCanvasY() : canvasBaseY()
      const onMove = (ev) => {
        const r = stage.getBoundingClientRect()
        const px = (ev.clientX - r.left) / r.width - 0.5
        const py = (ev.clientY - r.top) / r.height - 0.5
        gsap.to(canvas, { xPercent: canvasBaseX() + px * 4, yPercent: restingCanvasY() + py * 3, rotateY: px * 4, rotateX: -py * 3, duration: 0.9, ease: 'power2.out' })
      }
      const reset = () => {
        gsap.to(canvas, { xPercent: canvasBaseX(), yPercent: restingCanvasY(), rotateY: 0, rotateX: 0, duration: 1.1, ease: 'power2.out' })
      }
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
      if (warmHandle !== null) {
        if (warmUsesIdleCallback) window.cancelIdleCallback(warmHandle)
        else window.clearTimeout(warmHandle)
      }
      warmController.abort()
      gctx.revert()
    }
  }, [reduced])

  return (
    <section
      id="top"
      className={`seq${reduced ? ' seq--static' : ''}`}
      ref={sectionRef}
      aria-label="Explore events with BLAK Tickets"
    >
      <div className="seq-stage" ref={stageRef}>
        <div className="hero-inner seq-copy" ref={copyRef}>
          <p className="eyebrow seq-copy-mask">
            <span className="seq-copy-row">One platform for every experience</span>
          </p>
          <h1 className="hero-title">
            <span className="seq-title-line seq-copy-mask">
              <span className="seq-copy-row">The journey to <em className="seq-accent-word">every</em></span>
            </span>
            <span className="seq-title-line seq-copy-mask">
              <span className="seq-copy-row"><em className="seq-accent-word">experience</em></span>
            </span>
            <span className="seq-title-line seq-copy-mask">
              <span className="seq-copy-row">starts with one ticket.</span>
            </span>
          </h1>
          <p className="hero-lead">
            <span className="seq-lead-line seq-copy-mask">
              <span className="seq-copy-row">Discover concerts, sports, comedy, festivals, gaming and more —</span>
            </span>
            <span className="seq-lead-line seq-copy-mask">
              <span className="seq-copy-row">booked securely, instantly and effortlessly.</span>
            </span>
          </p>
        </div>
        <canvas
          ref={canvasRef}
          className="seq-canvas"
          width="1920"
          height="1080"
          role="img"
          aria-label="An animated event carousel changing as you scroll."
        />
        <div className="hero-cta seq-cta" ref={ctaRef}>
          <Button variant="primary" onClick={() => scrollTo('#explore')}>
            Explore events
          </Button>
          <Button variant="ghost" onClick={() => openApp('hero')}>
            Get the app
          </Button>
        </div>
      </div>
    </section>
  )
}
