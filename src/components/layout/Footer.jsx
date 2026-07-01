import Logo from './Logo'
import Button from '../ui/Button'
import { openApp } from '../../lib/app'
import { Link } from '../../lib/router'
import './footer.css'

// each link: { label, to } where `to` is a route, an on-page hash, or a mailto
const COLS = [
  {
    title: 'Discover',
    links: [
      { label: 'Concerts', to: '/#explore' },
      { label: 'Sports', to: '/#explore' },
      { label: 'Comedy', to: '/#explore' },
      { label: 'Festivals', to: '/#explore' },
      { label: 'Gaming', to: '/#explore' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Press', to: '/press' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: 'mailto:careers@blaktickets.com', external: true },
      { label: 'Contact', to: 'mailto:hello@blaktickets.com', external: true },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Safety', to: '/safety' },
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Refunds', to: '/terms' },
      { label: 'Help Centre', to: 'mailto:support@blaktickets.com', external: true },
    ],
  },
]

function FooterLink({ link }) {
  if (link.external) {
    return <a href={link.to}>{link.label}</a>
  }
  return <Link to={link.to}>{link.label}</Link>
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo variant="wordmark" className="footer-word" />
          <p>One platform for every experience. Discover, book and walk right in.</p>
          <div className="footer-apps">
            <Button variant="ghost" className="btn--sm" onClick={() => openApp('footer-ios')}>App Store</Button>
            <Button variant="ghost" className="btn--sm" onClick={() => openApp('footer-android')}>Google Play</Button>
          </div>
        </div>

        <div className="footer-cols">
          {COLS.map((c) => (
            <div key={c.title} className="footer-col">
              <h4>{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}><FooterLink link={l} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container footer-base">
        <span>© {new Date().getFullYear()} BLAK Tickets. All rights reserved.</span>
        <span className="footer-mono">BLAK-{new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
