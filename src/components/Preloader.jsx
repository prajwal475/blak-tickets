// Brand intro splash: the BLAK Tickets logo animation fades in over a black
// screen, plays, then fades out to reveal the site — all within ~3 seconds.
// Shown once per tab session (sessionStorage); skipped for reduced-motion users.
// Click or "Skip" to dismiss, and append ?intro to the URL to replay it.
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/capabilities'
import './preloader.css'

const KEY = 'blak-intro-seen'
const HOLD = 2500   // hold before fading out (clip is ~2.5s) → ~3s total
const FADE = 450    // fade-out duration

export default function Preloader() {
  const forced = typeof window !== 'undefined' && window.location.search.includes('intro')

  // decide synchronously so the overlay covers the page on the very first paint
  const [phase, setPhase] = useState(() => {
    if (typeof window === 'undefined') return 'gone'
    try {
      if (!forced && (prefersReducedMotion() || sessionStorage.getItem(KEY))) return 'gone'
    } catch { /* ignore */ }
    return 'playing'
  })
  const [shown, setShown] = useState(false) // drives the fade-in
  const videoRef = useRef(null)

  useEffect(() => {
    if (phase !== 'playing') return
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => setShown(true)) // fade in
    const t = setTimeout(finish, HOLD)
    videoRef.current?.play?.().catch(() => {})
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = () => {
    try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
    document.body.style.overflow = ''
    setShown(false)                       // fade out
    setTimeout(() => setPhase('gone'), FADE)
  }

  if (phase === 'gone') return null

  return (
    <div
      className={`intro${shown ? ' is-shown' : ''}`}
      role="dialog"
      aria-label="BLAK Tickets intro"
      onClick={finish}
    >
      <video
        ref={videoRef}
        className="intro-video"
        src="/intro/intro.mp4"
        autoPlay
        muted
        playsInline
      />
      <button className="intro-skip" onClick={finish}>Skip ›</button>
    </div>
  )
}
