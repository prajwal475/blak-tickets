import { Component } from 'react'

// Catches render errors (e.g. WebGL/Canvas failures) and shows a fallback so the
// page never goes blank.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
