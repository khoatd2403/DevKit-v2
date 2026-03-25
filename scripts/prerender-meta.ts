import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import process from 'node:process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tools, categories } from '../src/tools-registry'
import { SITE_URL as BASE_URL } from '../site.config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

for (const tool of tools) {
  const pageTitle = tool.seoTitle || `${tool.name} | DevTools Online`
  const pageDesc = tool.seoDescription || tool.description
  const pageUrl = `${BASE_URL}/tool/${tool.id}`
  const ogImage = `${BASE_URL}/og/${tool.id}.png`
  const cat = categories.find(c => c.id === tool.category)
  const catName = cat?.name || tool.category

  const softwareSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': tool.name,
    'url': pageUrl,
    'description': pageDesc,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Any',
    'softwareVersion': '1.0',
    'applicationSubCategory': 'Developer Tools',
    'isAccessibleForFree': true,
    'inLanguage': 'en',
    'author': {
      '@type': 'Organization',
      'name': 'DevTools Online',
      'url': BASE_URL
    },
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
  })

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': catName,
        'item': `${BASE_URL}/${tool.category}-tools`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': tool.name,
        'item': pageUrl
      }
    ]
  })

  const metaTags = `
    <title data-rh="true">${pageTitle}</title>
    <meta data-rh="true" name="description" content="${pageDesc}" />
    <meta data-rh="true" name="keywords" content="${tool.tags.join(', ')}" />
    <link data-rh="true" rel="canonical" href="${pageUrl}" />
    <meta data-rh="true" property="og:title" content="${pageTitle}" />
    <meta data-rh="true" property="og:description" content="${pageDesc}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:image" content="${ogImage}" />
    <meta data-rh="true" property="og:type" content="website" />
    <meta data-rh="true" property="og:site_name" content="DevTools Online" />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <meta data-rh="true" name="twitter:title" content="${pageTitle}" />
    <meta data-rh="true" name="twitter:description" content="${pageDesc}" />
    <meta data-rh="true" name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${softwareSchema}</script>
    <script type="application/ld+json">${breadcrumbSchema}</script>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)

  const outDir = join(distDir, 'tool', tool.id)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('.')
}

console.log(`\nPre-rendered ${tools.length} tool pages.`)
