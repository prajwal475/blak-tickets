// A real, interactive map (Leaflet + OpenStreetMap — no API key needed).
// Draws vector city/event markers and, when `locate` is set, asks for the
// visitor's location and re-centres on it with a "You are here" marker.
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './realmap.css'

const EMERALD = '#0f8f73'
const BRICK = '#9d2b22'

export default function RealMap({
  center = [22.6, 80],
  zoom = 4,
  markers = [],
  locate = false,
  interactive = true,
  pulse = false,
  className = '',
}) {
  const elRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el || mapRef.current) return
    let alive = true

    const map = L.map(el, {
      center,
      zoom,
      attributionControl: false,
      zoomControl: interactive,
      scrollWheelZoom: false,
      dragging: interactive,
      doubleClickZoom: interactive,
      tap: interactive,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    const pts = []
    markers.forEach((m) => {
      let marker
      if (pulse) {
        const icon = L.divIcon({
          className: 'map-glow',
          html: '<span class="map-glow-ring"></span><span class="map-glow-dot"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })
        marker = L.marker([m.lat, m.lng], { icon }).addTo(map)
      } else {
        marker = L.circleMarker([m.lat, m.lng], {
          radius: m.radius || 7,
          weight: 2,
          color: '#ffffff',
          fillColor: m.color || EMERALD,
          fillOpacity: 1,
        }).addTo(map)
      }
      if (m.label) marker.bindTooltip(m.label, { direction: 'top', offset: [0, -8] })
      if (m.popup) marker.bindPopup(m.popup)
      pts.push([m.lat, m.lng])
    })

    if (pts.length > 1 && !locate) {
      map.fitBounds(pts, { padding: [34, 34] })
    }

    if (locate && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!alive) return
          const { latitude, longitude } = pos.coords
          const you = L.circleMarker([latitude, longitude], {
            radius: 9,
            weight: 3,
            color: '#ffffff',
            fillColor: BRICK,
            fillOpacity: 1,
          }).addTo(map)
          you.bindTooltip('You are here', { direction: 'top', offset: [0, -8] })
          map.setView([latitude, longitude], 11, { animate: true })
        },
        () => { if (alive && pts.length > 1) map.fitBounds(pts, { padding: [34, 34] }) },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      )
    }

    // ensure correct sizing once the container has settled
    const t = setTimeout(() => { if (alive && mapRef.current) mapRef.current.invalidateSize() }, 250)
    const onResize = () => { if (alive && mapRef.current) mapRef.current.invalidateSize() }
    window.addEventListener('resize', onResize)

    return () => {
      alive = false
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={elRef} className={`realmap ${className}`.trim()} aria-label="Map" role="img" />
}
