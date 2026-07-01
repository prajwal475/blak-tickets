// Generic legal / informational page: a hero header + an article rendered from
// structured content blocks ({type:'heading'|'para'|'list'}). Used by About,
// Privacy, Terms, Safety, Press and the blog post pages.
import { useEffect } from 'react'
import { Link } from '../../lib/router'
import './content.css'

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === 'heading') return <h2 key={i} className="doc-h2" data-reveal>{b.text}</h2>
    if (b.type === 'list') {
      return (
        <ul key={i} className="doc-list" data-reveal>
          {b.items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      )
    }
    return <p key={i} className="doc-p" data-reveal>{b.text}</p>
  })
}

export default function ContentPage({ data, eyebrow, meta, children }) {
  useEffect(() => {
    document.title = `${data.title} — BLAK Tickets`
    return () => { document.title = 'BLAK Tickets — One platform for every experience' }
  }, [data.title])

  return (
    <article className="doc">
      <header className="doc-head">
        <div className="container doc-head-inner">
          <Link to="/" className="doc-back">← Back to home</Link>
          {eyebrow && <p className="eyebrow doc-eyebrow">{eyebrow}</p>}
          <h1 className="doc-title">{data.title}</h1>
          {data.lead && <p className="doc-lead">{data.lead}</p>}
          {meta && <p className="doc-meta">{meta}</p>}
        </div>
      </header>

      <div className="container doc-body">
        {children}
        <Blocks blocks={data.blocks} />
      </div>
    </article>
  )
}
