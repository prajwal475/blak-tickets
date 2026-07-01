// Transcode the cinematic "Initial Scene" clip into a web-optimized, muted,
// fast-start MP4 + a poster frame for the hero centerpiece.
//
//   node scripts/prepare-hero.mjs "C:/path/to/Initial_Scene.mp4"
//
// Default source is the 2026-06-28 download. Outputs to public/hero/.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src =
  process.argv[2] ||
  'C:/Users/PRAJWAL/Downloads/Initial_Scene_-_2026-06-28_202606280911.mp4'
const out = path.join(root, 'public', 'hero')
mkdirSync(out, { recursive: true })

const run = (args) => execFileSync(ffmpeg, args, { stdio: 'inherit' })

console.log('Transcoding hero video ->', out)
run([
  '-y', '-i', src,
  '-an',
  '-vf', 'scale=1280:-2',
  '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast',
  '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
  path.join(out, 'initial-scene.mp4'),
])

console.log('Writing poster frame')
run([
  '-y', '-ss', '0', '-i', src,
  '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '3',
  path.join(out, 'poster.jpg'),
])

console.log('Done.')
