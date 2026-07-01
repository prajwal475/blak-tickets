// Minimal History-API router (no dependency). Tracks window.location.pathname,
// exposes navigate() + <Link>, scrolls to top on a fresh page and to a hash
// target (e.g. a homepage section) when one is requested.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getLenis } from './lenis'
import { scrollTo as smoothScrollTo } from './lenis'

const RouterContext = createContext(null)

// hash to scroll to once the next route has rendered (set by navigate)
let pendingHash = null

function resetScroll() {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(0, { immediate: true })
  window.scrollTo(0, 0)
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => window.location.pathname || '/')

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, opts = {}) => {
    // pure hash on the current page → just scroll
    if (typeof to === 'string' && to.startsWith('#')) {
      smoothScrollTo(to)
      return
    }
    const url = new URL(to, window.location.origin)
    const nextPath = url.pathname
    pendingHash = opts.hash || (url.hash || null)

    if (nextPath !== window.location.pathname) {
      window.history.pushState({}, '', url.pathname + (url.hash || ''))
      setPath(nextPath)
      // scroll handled by the path effect below once the page renders
    } else if (pendingHash) {
      const h = pendingHash
      pendingHash = null
      smoothScrollTo(h)
    } else {
      resetScroll()
    }
  }, [])

  // when the route changes, jump to top (or to the requested hash)
  useEffect(() => {
    if (pendingHash) {
      const h = pendingHash
      pendingHash = null
      requestAnimationFrame(() => requestAnimationFrame(() => smoothScrollTo(h)))
    } else {
      resetScroll()
    }
  }, [path])

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  return useContext(RouterContext)
}

export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRouter()
  const handle = (e) => {
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onClick?.(e)
    navigate(to)
  }
  return (
    <a href={to} className={className} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
