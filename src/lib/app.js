// App-store handoff. URLs are PLACEHOLDERS — replace at launch.
import { track } from './analytics'

export const STORE = {
  ios: 'https://apps.apple.com/app/idPLACEHOLDER',
  android: 'https://play.google.com/store/apps/details?id=com.blaktickets.app',
}

export function openApp(source = 'cta') {
  track('app_handoff', { source })
  const ua = navigator.userAgent || ''
  const url = /android/i.test(ua) ? STORE.android : STORE.ios
  window.open(url, '_blank', 'noopener')
}
