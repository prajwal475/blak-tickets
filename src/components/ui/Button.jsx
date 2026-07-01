// Button / link with three variants: primary (emerald fill), ghost (outlined),
// and link. Renders an <a> when `href` is given, otherwise a <button>.
import './button.css'

export default function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  ...rest
}) {
  const cls = `btn btn--${variant} ${className}`.trim()
  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick} {...rest}>
        <span>{children}</span>
      </a>
    )
  }
  return (
    <button className={cls} onClick={onClick} {...rest}>
      <span>{children}</span>
    </button>
  )
}
