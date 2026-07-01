// Brand logo. Renders extracted transparent PNGs from /public/brand.
// variant: 'mark' (hand+tickets), 'wordmark' (BLAK Tickets), 'lockup' (both).
export default function Logo({ variant = 'mark', className = '', alt = 'BLAK Tickets' }) {
  return (
    <img
      src={`/brand/${variant}.png`}
      alt={alt}
      className={`logo logo--${variant} ${className}`.trim()}
      draggable="false"
      decoding="async"
    />
  )
}
