// Accessible, animation-free fallback for no-WebGL / reduced-motion users.
// Reuses the same content config so it stays in sync with the rich page.
import Logo from '../layout/Logo'
import Button from '../ui/Button'
import { CATEGORIES } from '../../config/categories'
import { STATS } from '../../config/stats'
import { openApp } from '../../lib/app'

export default function StaticPage() {
  return (
    <main className="static-page" id="main">
      <section className="section container" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-8))' }}>
        <p className="eyebrow">One platform for every experience</p>
        <h1 className="hero-title" style={{ margin: '16px auto', textAlign: 'center' }}>
          The journey to <span style={{ color: 'var(--emerald)' }}>every experience</span> starts with one ticket.
        </h1>
        <p className="section-sub" style={{ margin: '0 auto 32px', textAlign: 'center' }}>
          Discover concerts, sports, comedy, festivals, gaming and more — booked securely, instantly and effortlessly.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => openApp('static-hero')}>Get the app</Button>
          <Button variant="ghost" href="#categories">Browse categories</Button>
        </div>
      </section>

      <section className="section section--alt" id="categories">
        <div className="container">
          <h2 className="section-title">Every experience. One platform.</h2>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginTop: 32 }}>
            {CATEGORIES.map((c) => (
              <li key={c.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: 24, background: 'var(--card)' }}>
                <strong style={{ color: 'var(--ink)', display: 'block' }}>{c.label}</strong>
                <span style={{ color: 'var(--muted)' }}>{c.count} events</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 24 }}>
          {STATS.map((s) => (
            <div key={s.id}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink)', fontWeight: 700 }}>
                {s.format(s.value)}{s.suffix}
              </div>
              <div style={{ color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
