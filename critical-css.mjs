// critical-css.mjs
// Run after `npm run build` to inline critical CSS into all HTML files.
// Usage: node critical-css.mjs
// Install once: npm install -D critters

import Critters from 'critters'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = './dist'

const critters = new Critters({
  path: distDir,
  publicPath: '/',
  preload: 'swap',       // load remaining CSS with font-display:swap behaviour
  inlineFonts: false,    // keep Google Fonts loading as-is
  pruneSource: false,    // keep the full CSS file for non-critical styles
})

// Find all HTML files in dist/
const htmlFiles = readdirSync(distDir).filter(f => f.endsWith('.html'))

for (const file of htmlFiles) {
  const filePath = join(distDir, file)
  const html = readFileSync(filePath, 'utf-8')
  const inlined = await critters.process(html)
  writeFileSync(filePath, inlined)
  console.log(`✓ Critical CSS inlined: ${file}`)
}

console.log('Done. Critical CSS inlined into all HTML files.')
