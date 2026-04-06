import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import process from 'node:process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tools, categories } from '../src/tools-registry'
import { SITE_URL as BASE_URL } from '../site.config'

import { categoryAboutTranslations } from '../src/i18n/categoryContent'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

// 1. Prerender Tool Pages
for (const tool of tools) {
  const pageTitle = tool.seoTitle || `${tool.name} | DevTools Online`
  const pageDesc = tool.seoDescription || tool.description
  const pageUrl = `${BASE_URL}/${tool.category}-tools/${tool.id}`
  const ogImage = `${BASE_URL}/og/${tool.id}.png`
  const cat = categories.find(c => c.id === tool.category)
  const catName = cat?.name || tool.category

  const softwareSchema = {
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
    'author': {
      '@type': 'Organization',
      'name': 'DevTools Online',
      'url': BASE_URL
    },
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
  }

  const breadcrumbSchema = {
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
  }

  const metaTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <meta data-rh="true" name="keywords" content="${tool.tags.join(', ')}" />
    <link rel="canonical" href="${pageUrl}" />
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
    <script type="application/ld+json">${JSON.stringify(softwareSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)

  const outDir = join(distDir, `${tool.category}-tools`, tool.id)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('.')
}

// 2. Prerender Category Pages
console.log('\nPre-rendering category pages...')
for (const cat of categories) {
    if (cat.id === 'all') continue;

    const catName = cat.name;
    const catContent = categoryAboutTranslations['en']?.[cat.id];
    const pageTitle = catContent?.seoTitle || `${catName} Tools | DevTools Online`;
    const pageDesc = catContent?.seoDescription || `Complete collection of powerful and secure ${catName} tools. 100% private client-side processing.`;
    const pageUrl = `${BASE_URL}/${cat.id}-tools`;
    
    // Pick first tool for the image
    const firstToolInCat = tools.find(t => t.category === cat.id);
    const ogImage = catContent?.seoImage || (firstToolInCat ? `${BASE_URL}/og/${firstToolInCat.id}.png` : `${BASE_URL}/og-image.svg`);

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": catName,
        "url": pageUrl,
        "description": pageDesc,
        "isPartOf": {
          "@type": "WebSite",
          "name": "DevTools Online",
          "url": BASE_URL
        }
      };
  
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": catName,
            "item": pageUrl
          }
        ]
      };

    const metaTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta data-rh="true" property="og:title" content="${pageTitle}" />
    <meta data-rh="true" property="og:description" content="${pageDesc}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:image" content="${ogImage}" />
    <meta data-rh="true" property="og:type" content="website" />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(collectionSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

    const html = baseHtml
        .replace(/<title[^>]*>[^<]*<\/title>/, '')
        .replace(/<meta[^>]*name="description"[^>]*>/g, '')
        .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
        .replace(/<meta[^>]*property="og:[^>]*>/g, '')
        .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
        .replace('<head>', `<head>${metaTags}`)

    const outDir = join(distDir, `${cat.id}-tools`)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html)
    process.stdout.write('+')
}

console.log(`\nPre-rendered all pages successfully.`)
