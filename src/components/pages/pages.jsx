// Route registry for the static content pages. Each entry maps a pathname to a
// rendered page element backed by the JSON extracted from the source PDFs.
import ContentPage from './ContentPage'
import { AllCategoriesPage, CategoryEventsPage } from './CategoryPages'
import { Link } from '../../lib/router'
import about from '../../content/about.json'
import privacy from '../../content/privacy.json'
import terms from '../../content/terms.json'
import safety from '../../content/safety.json'
import press from '../../content/press.json'
import blog1 from '../../content/blog-1.json'
import blog2 from '../../content/blog-2.json'

const UPDATED = 'Last updated June 2026'
const BLOG_POST = '/blog/the-experience-economy'

function BlogIndex() {
  return (
    <ContentPage data={blog1} eyebrow="The BLAK Blog">
      <Link to={BLOG_POST} className="blog-featured">
        <span className="bf-tag">Featured story</span>
        <h3>{blog2.title}</h3>
        <p>Why people are choosing memories over material things — and what it means for the future of live events.</p>
        <span className="bf-go">Read the story →</span>
      </Link>
    </ContentPage>
  )
}

export const ROUTES = {
  '/about':   () => <ContentPage data={about} eyebrow="About us" />,
  '/privacy': () => <ContentPage data={privacy} eyebrow="Legal" meta={UPDATED} />,
  '/terms':   () => <ContentPage data={terms} eyebrow="Legal" meta={UPDATED} />,
  '/safety':  () => <ContentPage data={safety} eyebrow="Trust & safety" meta={UPDATED} />,
  '/press':   () => <ContentPage data={press} eyebrow="Newsroom" />,
  '/explore': () => <AllCategoriesPage />,
  '/blog':    () => <BlogIndex />,
  [BLOG_POST]: () => <ContentPage data={blog2} eyebrow="The BLAK Blog" meta="Published by BLAK Tickets" />,
}

export function resolveRoute(path) {
  const make = ROUTES[path]
  if (make) return make()
  // dynamic: /category/:slug
  const m = path.match(/^\/category\/([^/]+)\/?$/)
  if (m) return <CategoryEventsPage slug={decodeURIComponent(m[1])} />
  return null
}
