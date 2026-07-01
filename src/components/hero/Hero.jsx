// Cinematic hero: copy + CTAs over a scroll-scrubbed phone sequence centerpiece.
import Button from '../ui/Button'
import HeroSequence from './HeroSequence'
import { scrollTo } from '../../lib/lenis'
import { openApp } from '../../lib/app'
import './hero.css'

export default function Hero() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-inner">
          <p className="eyebrow" data-reveal>One platform for every experience</p>

          <h1 className="hero-title" data-reveal data-reveal-delay="1">
            The journey to <em>every experience</em><br />
            starts with one ticket.
          </h1>

          <p className="hero-lead" data-reveal data-reveal-delay="2">
            Discover concerts, sports, comedy, festivals, gaming and more —
            booked securely, instantly and effortlessly.
          </p>

          <div className="hero-cta" data-reveal data-reveal-delay="3">
            <Button variant="primary" onClick={() => scrollTo('#explore')}>
              Explore events
            </Button>
            <Button variant="ghost" onClick={() => openApp('hero')}>
              Get the app
            </Button>
          </div>
        </div>
      </section>

      <HeroSequence />
    </>
  )
}
