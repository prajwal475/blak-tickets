// Trust statistics (Section 7).
export const STATS = [
  { id: 'events', label: 'Events Hosted', value: 25000, suffix: '+', format: (v) => Math.round(v).toLocaleString() },
  { id: 'tickets', label: 'Tickets Sold', value: 2, suffix: 'M+', format: (v) => v.toFixed(1).replace(/\.0$/, '') },
  { id: 'cities', label: 'Cities', value: 120, suffix: '+', format: (v) => Math.round(v).toLocaleString() },
  { id: 'rating', label: 'Average Rating', value: 4.9, suffix: '★', format: (v) => v.toFixed(1) },
]

// Active cities with real coordinates for the live map.
export const CITY_DOTS = [
  { city: 'Delhi', lat: 28.6139, lng: 77.2090, events: 540, users: '210k' },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777, events: 480, users: '198k' },
  { city: 'Bengaluru', lat: 12.9716, lng: 77.5946, events: 360, users: '150k' },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, events: 300, users: '120k' },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, events: 280, users: '110k' },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, events: 240, users: '96k' },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, events: 190, users: '78k' },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, events: 170, users: '64k' },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873, events: 150, users: '58k' },
  { city: 'Goa', lat: 15.2993, lng: 74.1240, events: 120, users: '40k' },
]

// City -> coordinates lookup for placing events on the live map.
export const CITY_COORDS = {
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.3850, 78.4867],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Goa: [15.2993, 74.1240],
  Manipal: [13.3525, 74.7854],
}
