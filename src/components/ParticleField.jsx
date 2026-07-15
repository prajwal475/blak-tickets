// Lightweight drifting particle field (canvas). Sunlit motes float upward with
// gentle mouse parallax — the "solar / suspended in space" atmosphere. Honours
// reduced-motion (renders a static field) and pauses when off-screen.
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/capabilities'

const COLORS = ['rgba(15,143,115,', 'rgba(150,150,150,', 'rgba(120,120,120,']

export default function ParticleField({ count = 90, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    const rand = (a, b) => a + Math.random() * (b - a)

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true
    const parts = []
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const init = () => {
      parts.length = 0
      const n = Math.round(count * Math.min(1, w / 900))
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: rand(0.35, 1),
          r: rand(0.9, 3.4),
          vx: rand(-0.12, 0.12),
          vy: rand(-0.26, -0.05),
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: rand(0.22, 0.72),
          glow: Math.random() < 0.25,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      for (const p of parts) {
        if (!reduced) {
          p.x += p.vx * p.z
          p.y += p.vy * p.z
          if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w }
          if (p.x < -6) p.x = w + 6
          else if (p.x > w + 6) p.x = -6
        }
        const px = p.x + mouse.x * 34 * p.z
        const py = p.y + mouse.y * 34 * p.z
        ctx.beginPath()
        ctx.arc(px, py, p.r * p.z, 0, Math.PI * 2)
        ctx.fillStyle = p.c + (p.a * p.z).toFixed(2) + ')'
        ctx.fill()
      }
      if (visible && !reduced) raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width - 0.5
      mouse.ty = (e.clientY - r.top) / r.height - 0.5
    }
    const onResize = () => { resize(); init() }
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      if (visible && !reduced) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) }
      else cancelAnimationFrame(raf)
    }, { threshold: 0 })

    resize(); init(); draw()
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
    }
  }, [count])

  return <canvas ref={canvasRef} className={`particles ${className}`.trim()} aria-hidden="true" />
}
