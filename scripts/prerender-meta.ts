import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import process from 'node:process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tools } from '../src/tools-registry'
import { SITE_URL as BASE_URL } from '../site.config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

for (const tool of tools) {
  const pageTitle = `${tool.name} — DevKit`
  const rawDesc = `${tool.description}. Free DevKit tool — no account needed, no data sent to servers, works instantly in any browser.`
  const pageDesc = rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc
  const pageUrl = `${BASE_URL}/tool/${tool.id}`
  const ogImage = `${BASE_URL}/og/${tool.id}.png`

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: pageUrl,
    description: pageDesc,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  })

  const metaTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDesc}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${jsonLd}</script>`

  const html = baseHtml
    .replace(/<title>[^<]*<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/g, '')
    .replace(/<meta property="og:[^>]*>/g, '')
    .replace(/<meta name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)

  const outDir = join(distDir, 'tool', tool.id)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('.')
}

console.log(`\nPre-rendered ${tools.length} tool pages.`)
