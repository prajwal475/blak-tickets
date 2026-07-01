import { useEffect, useState } from 'react'
import Nav from './components/layout/Nav'
import Footer from './components/layout/Footer'
import Preloader from './components/Preloader'
import Home from './components/Home'
import StaticPage from './components/fallback/StaticPage'
import ErrorBoundary from './components/fallback/ErrorBoundary'
import NotFound from './components/pages/NotFound'
import { resolveRoute } from './components/pages/pages'
import { useReveal } from './hooks/useReveal'
import { initLenis, destroyLenis } from './lib/lenis'
import { initScrollDepth } from './lib/analytics'
import { shouldRenderRich } from './lib/capabilities'
import { useRouter } from './lib/router'

export default function App() {
  const [rich] = useState(() => shouldRenderRich())
  const { path } = useRouter()

  // re-run reveal setup on route change so new page content fades in
  useReveal([rich, path])

  useEffect(() => {
    if (rich) initLenis()
    const cleanup = initScrollDepth()
    return () => {
      cleanup?.()
      destroyLenis()
    }
  }, [rich])

  const routed = path === '/' ? null : resolveRoute(path)

  return (
    <ErrorBoundary fallback={<StaticPage />}>
      <Preloader />
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        {path === '/' ? <Home /> : (routed || <NotFound />)}
      </main>
      <Footer />
    </ErrorBoundary>
  )
}
