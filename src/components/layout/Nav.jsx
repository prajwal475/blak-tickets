import { useEffect, useState } from 'react'
import Logo from './Logo'
import Button from '../ui/Button'
import { scrollTo } from '../../lib/lenis'
import { openApp } from '../../lib/app'
import { useRouter } from '../../lib/router'
import './nav.css'

const LINKS = [
  { label: 'Explore', target: '#explore' },
  { label: 'Near You', target: '#near-you' },
  { label: 'Featured', target: '#featured' },
  { label: 'Why BLAK', target: '#why' },
  { label: 'This Week', target: '#upcoming' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { path, navigate } = useRouter()
  const isHome = path === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // section links scroll on the homepage, or route home + scroll from elsewhere
  const go = (e, target) => {
    e.preventDefault()
    setOpen(false)
    if (isHome) scrollTo(target)
    else navigate('/', { hash: target })
  }

  const goHome = (e) => {
    e.preventDefault()
    setOpen(false)
    if (isHome) scrollTo('#top')
    else navigate('/')
  }

  // keep the bar solid/readable on inner pages (no hero behind it)
  const solid = scrolled || !isHome

  return (
    <header className={`nav ${solid ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container">
        <a className="nav-brand" href="/" onClick={goHome} aria-label="BLAK Tickets home">
          <Logo variant="mark" className="nav-mark" />
          <Logo variant="wordmark" className="nav-word" />
        </a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.target} href={l.target} onClick={(e) => go(e, l.target)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <Button variant="primary" className="btn--sm" onClick={() => openApp('nav')}>
            Get the app
          </Button>
          <button
            className={`nav-burger ${open ? 'is-open' : ''}`}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`nav-mobile ${open ? 'is-open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l.target} href={l.target} onClick={(e) => go(e, l.target)}>
            {l.label}
          </a>
        ))}
        <Button variant="primary" onClick={() => openApp('nav-mobile')}>Get the app</Button>
      </div>
    </header>
  )
}
