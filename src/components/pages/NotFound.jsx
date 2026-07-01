import { Link } from '../../lib/router'
import './content.css'

export default function NotFound() {
  return (
    <article className="doc">
      <header className="doc-head">
        <div className="container doc-head-inner">
          <Link to="/" className="doc-back">← Back to home</Link>
          <p className="eyebrow doc-eyebrow">Error 404</p>
          <h1 className="doc-title">This page doesn't exist.</h1>
          <p className="doc-lead">The link may be broken or the page may have moved. Let's get you back to discovering experiences.</p>
        </div>
      </header>
      <div className="container doc-body">
        <p className="doc-p"><Link to="/" className="bf-go">← Return to BLAK Tickets home</Link></p>
      </div>
    </article>
  )
}
