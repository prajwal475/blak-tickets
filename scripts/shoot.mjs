// Capture screenshots of the running site (desktop + mobile) with system Chrome
// via puppeteer-core, then write a manifest the PDF step reads.
//   node scripts/shoot.mjs
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:5173'
const OUT = 'C:/Users/PRAJWAL/AppData/Local/Temp/claude/C--Users-PRAJWAL-Desktop-Eventx-blaktickets/20da4caa-bc35-45bb-be16-1c2d05780bfb/scratchpad/shots'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const D = { width: 1440, height: 900, deviceScaleFactor: 1 }
const M = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

// title = caption shown on the PDF page
const shots = [
  { n: '01-intro',        url: '/?intro=1', vp: D, intro: true,  title: 'Intro splash — logo animation' },
  { n: '02-hero',         url: '/', vp: D, to: '#top',        title: 'Hero — one ticket, every experience' },
  { n: '03-booking',      url: '/', vp: D, booking: true,     title: 'Booking flow — scroll-scrubbed' },
  { n: '04-explore',      url: '/', vp: D, to: '#explore',    title: 'Explore — orbiting category hub' },
  { n: '05-near-you',     url: '/', vp: D, to: '#near-you',   title: 'Find events near you' },
  { n: '06-featured',     url: '/', vp: D, to: '#featured',   title: 'Featured events' },
  { n: '07-why',          url: '/', vp: D, to: '#why',        title: 'Why BLAK' },
  { n: '08-this-week',    url: '/', vp: D, to: '#upcoming',   title: 'This week — day strip + calendar' },
  { n: '09-trusted',      url: '/', vp: D, to: '#trusted',    title: 'Trusted by thousands — India map' },
  { n: '10-footer',       url: '/', vp: D, bottom: true,      title: 'Footer — links to every page' },
  { n: '11-explore-page', url: '/explore', vp: D, to: 'top',  title: 'All categories — /explore' },
  { n: '12-category',     url: '/category/concerts', vp: D, to: 'top', title: 'Category events — /category/concerts' },
  { n: '13-about',        url: '/about', vp: D, to: 'top',    title: 'About — /about' },
  { n: '14-blog',         url: '/blog', vp: D, to: 'top',     title: 'Blog — /blog' },
  { n: '15-m-hero',       url: '/', vp: M, to: '#top',        title: 'Mobile — hero' },
  { n: '16-m-explore',    url: '/', vp: M, to: '#explore', extra: 300, title: 'Mobile — swipe-stack categories' },
  { n: '17-m-this-week',  url: '/', vp: M, to: '#upcoming',   title: 'Mobile — swipeable event cards' },
  { n: '18-m-explore-pg', url: '/explore', vp: M, to: 'top', extra: 360, title: 'Mobile — all categories' },
]

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  })
  const manifest = []

  for (const s of shots) {
    const page = await browser.newPage()
    await page.setViewport(s.vp)
    if (!s.intro) {
      // skip the intro + disable Lenis/animations for precise scrolling & instant reveals
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.evaluateOnNewDocument(() => {
        try { sessionStorage.setItem('blak-intro-seen', '1') } catch (e) {}
      })
    }
    await page.goto(BASE + s.url, { waitUntil: s.intro ? 'domcontentloaded' : 'networkidle2', timeout: 45000 })
    await sleep(s.intro ? 200 : 700)

    if (s.intro) {
      try { await page.waitForSelector('.intro', { timeout: 4000 }) } catch (e) {}
      await sleep(750) // let it fade in + animate before auto-dismiss
    } else if (s.booking) {
      // full-bleed sequence needs the real (non-reduced) experience: re-enable + wheel
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
      await page.reload({ waitUntil: 'networkidle2' })
      await sleep(900)
      await page.mouse.move(720, 450)
      for (let i = 0; i < 7; i++) { await page.mouse.wheel({ deltaY: 280 }); await sleep(130) }
      await sleep(1700)
    } else {
      await page.evaluate((sel, extra) => {
        if (sel === 'bottom') { window.scrollTo(0, document.body.scrollHeight); return }
        if (sel === 'top') { window.scrollTo(0, extra || 0); return }
        const el = document.querySelector(sel)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY
          window.scrollTo(0, Math.max(0, top - 6 + (extra || 0)))
        }
      }, s.bottom ? 'bottom' : s.to, s.extra || 0)
      await sleep(500)
      await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
      await sleep(500)
    }

    const file = path.join(OUT, s.n + '.png')
    await page.screenshot({ path: file })
    manifest.push({ file, title: s.title, mobile: !!s.vp.isMobile })
    console.log('shot', s.n)
    await page.close()
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  await browser.close()
  console.log('done ->', OUT)
}

run().catch((e) => { console.error(e); process.exit(1) })
