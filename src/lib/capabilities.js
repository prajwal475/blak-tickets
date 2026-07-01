// Runtime capability checks: decide whether to render the rich (3D/animated)
// experience or the static accessible fallback.

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function supportsWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

// Rich experience = capable GPU AND the user hasn't asked for reduced motion.
export function shouldRenderRich() {
  return supportsWebGL() && !prefersReducedMotion()
}

export function isCoarsePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}
