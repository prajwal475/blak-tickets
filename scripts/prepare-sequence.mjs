// Break the portrait "smartphone booking" clip into a numbered JPG frame
// sequence for the scroll-scrubbed hero phone. ~12fps over the 10s clip = 120
// frames at phone-screen resolution.
//
//   node scripts/prepare-sequence.mjs "C:/path/to/clip.mp4"
//
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src =
  process.argv[2] ||
  'C:/Users/PRAJWAL/Downloads/Smartphone_booking_event_tickets_202606171235.mp4'
const out = path.join(root, 'public', 'hero', 'seq')

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

console.log('Extracting frames ->', out)
execFileSync(
  ffmpeg,
  [
    '-y', '-i', src,
    '-vf', 'fps=12,scale=800:-2',
    '-q:v', '5',
    path.join(out, 'frame-%03d.jpg'),
  ],
  { stdio: 'inherit' },
)
console.log('Done — 120 frames written to public/hero/seq/')
