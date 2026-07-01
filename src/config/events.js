// Mock event catalogue used across Featured / Upcoming / search. Swap for a real
// CMS/API at launch. Images are license-free placeholders under /public/events.
export const EVENTS = [
  { id: 'e1', title: 'Neon Nights Live', category: 'Concerts', city: 'Mumbai', venue: 'NSCI Dome', date: 'Sat, 28 Jun', time: '8:00 PM', price: 1499, day: 6, tag: 'Trending', img: '/events/poster1.jpg', free: false },
  { id: 'e2', title: 'City Marathon 2026', category: 'Marathons', city: 'Bengaluru', venue: 'MG Road', date: 'Sun, 29 Jun', time: '5:30 AM', price: 0, day: 0, tag: 'New', img: '/events/poster2.jpg', free: true },
  { id: 'e3', title: 'Standup Riot', category: 'Comedy', city: 'Delhi', venue: 'The Comedy Den', date: 'Fri, 27 Jun', time: '9:00 PM', price: 799, day: 5, tag: 'Almost Sold Out', img: '/events/poster3.jpg', free: false },
  { id: 'e4', title: 'GameStorm Arena', category: 'Gaming', city: 'Hyderabad', venue: 'HITEX', date: 'Sat, 28 Jun', time: '11:00 AM', price: 599, day: 6, tag: "Editor's Pick", img: '/events/poster4.jpg', free: false },
  { id: 'e5', title: 'Street Food Carnival', category: 'Food Festivals', city: 'Pune', venue: 'Riverside Grounds', date: 'Sun, 29 Jun', time: '4:00 PM', price: 0, day: 0, tag: 'Popular', img: '/events/poster5.jpg', free: true },
  { id: 'e6', title: 'Torque Auto Expo', category: 'Automobile', city: 'Chennai', venue: 'Trade Centre', date: 'Thu, 26 Jun', time: '10:00 AM', price: 999, day: 4, tag: 'Trending', img: '/events/poster6.jpg', free: false },
  { id: 'e7', title: 'Synthwave Festival', category: 'Concerts', city: 'Goa', venue: 'Vagator Beach', date: 'Sat, 28 Jun', time: '6:00 PM', price: 2499, day: 6, tag: 'Almost Sold Out', img: '/events/poster7.jpg', free: false },
  { id: 'e8', title: 'Founders Workshop', category: 'Workshops', city: 'Bengaluru', venue: 'WeWork Galaxy', date: 'Wed, 25 Jun', time: '2:00 PM', price: 1299, day: 3, tag: 'New', img: '/events/poster8.jpg', free: false },
  { id: 'e9', title: 'Campus Fest Finale', category: 'College Events', city: 'Manipal', venue: 'Open Air Theatre', date: 'Fri, 27 Jun', time: '7:00 PM', price: 0, day: 5, tag: 'Popular', img: '/events/poster9.jpg', free: true },
  { id: 'e10', title: 'Premier League Night', category: 'Sports', city: 'Kolkata', venue: 'Salt Lake Stadium', date: 'Sun, 29 Jun', time: '7:30 PM', price: 899, day: 0, tag: 'Trending', img: '/events/poster10.jpg', free: false },
]

export const FEATURED = EVENTS.slice(0, 7)
