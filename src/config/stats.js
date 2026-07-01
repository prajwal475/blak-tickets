// Trust statistics (Section 7).
export const STATS = [
  { id: 'events', label: 'Events Hosted', value: 25000, suffix: '+', format: (v) => Math.round(v).toLocaleString() },
  { id: 'tickets', label: 'Tickets Sold', value: 2, suffix: 'M+', format: (v) => v.toFixed(1).replace(/\.0$/, '') },
  { id: 'cities', label: 'Cities', value: 120, suffix: '+', format: (v) => Math.round(v).toLocaleString() },
  { id: 'rating', label: 'Average Rating', value: 4.9, suffix: '★', format: (v) => v.toFixed(1) },
]

// Active-city dots placed over the stylized India map (x%, y% of the square map stage).
export const CITY_DOTS = [
  { city: 'Delhi', x: 39, y: 27, events: 540, users: '210k' },
  { city: 'Mumbai', x: 37, y: 55, events: 480, users: '198k' },
  { city: 'Bengaluru', x: 48, y: 73, events: 360, users: '150k' },
  { city: 'Chennai', x: 54, y: 72, events: 300, users: '120k' },
  { city: 'Kolkata', x: 67, y: 41, events: 280, users: '110k' },
  { city: 'Hyderabad', x: 50, y: 60, events: 240, users: '96k' },
  { city: 'Pune', x: 42, y: 57, events: 190, users: '78k' },
  { city: 'Ahmedabad', x: 28, y: 45, events: 170, users: '64k' },
  { city: 'Jaipur', x: 32, y: 33, events: 150, users: '58k' },
  { city: 'Goa', x: 41, y: 64, events: 120, users: '40k' },
]
