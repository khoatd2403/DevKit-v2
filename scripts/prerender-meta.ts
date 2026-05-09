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
  const pageUrl = `${BASE_URL}/${tool.category}-tools/${tool.id}/`
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
        'item': `${BASE_URL}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': catName,
        'item': `${BASE_URL}/${tool.category}-tools/`
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
    .replace(/<meta\s[^<]*name="keywords"[^<]*\/?>/g, '')
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
    const pageUrl = `${BASE_URL}/${cat.id}-tools/`;
    
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

// 3. Prerender Legal / About / Contact pages
console.log('\nPre-rendering legal pages...')
const legalPages = [
  {
    slug: 'privacy',
    title: 'Privacy Policy | DevTools Online',
    description: 'DevTools Online privacy policy. Learn what data we collect, how we use cookies, and your rights as a user.',
  },
  {
    slug: 'terms',
    title: 'Terms of Service | DevTools Online',
    description: 'Terms and conditions for using DevTools Online — a free collection of browser-based developer tools.',
  },
  {
    slug: 'about',
    title: 'About DevTools Online',
    description: 'DevTools Online is a free, privacy-first collection of 120+ developer utilities. Every tool runs entirely in your browser — no sign-up, no tracking, no data sent to a server.',
  },
  {
    slug: 'contact',
    title: 'Contact Us | DevTools Online',
    description: 'Get in touch with the DevTools Online team — report a bug, request a feature, or ask a question.',
  },
]

for (const page of legalPages) {
  const pageUrl = `${BASE_URL}/${page.slug}/`
  const ogImage = `${BASE_URL}/og-image.svg`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': page.title.split(' | ')[0], 'item': pageUrl },
    ],
  }

  const metaTags = `
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta data-rh="true" property="og:title" content="${page.title}" />
    <meta data-rh="true" property="og:description" content="${page.description}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:image" content="${ogImage}" />
    <meta data-rh="true" property="og:type" content="website" />
    <meta data-rh="true" name="twitter:card" content="summary" />
    <meta data-rh="true" name="twitter:title" content="${page.title}" />
    <meta data-rh="true" name="twitter:description" content="${page.description}" />
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)

  const outDir = join(distDir, page.slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('=')
}

// 4. Prerender Blog index, posts, and tag pages
console.log('\nPre-rendering blog pages...')
const { loadAllPosts, getAllTags, tagSlug } = await import('./blog-fs.ts')
const { parse: parseMd } = await import('marked')
const blogPosts = loadAllPosts()
const blogTags = getAllTags(blogPosts)

function escapeHtmlAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Blog index
{
  const pageUrl = `${BASE_URL}/blog/`
  const title = 'Blog | DevTools Online'
  const description = 'Tutorials, guides, and deep dives on JSON, SQL, JWT, encoding, security, and the developer tools we build.'
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'DevTools Online Blog',
    'url': pageUrl,
    'description': description,
    'publisher': { '@type': 'Organization', 'name': 'DevTools Online', 'url': BASE_URL },
    'blogPost': blogPosts.map(p => ({
      '@type': 'BlogPosting',
      'headline': p.title,
      'url': `${BASE_URL}/blog/${p.slug}/`,
      'datePublished': p.date,
      'description': p.description,
    })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': pageUrl },
    ],
  }
  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${escapeHtmlAttr(description)}" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" type="application/rss+xml" title="DevTools Online Blog RSS" href="${BASE_URL}/feed.xml" />
    <meta data-rh="true" property="og:title" content="${title}" />
    <meta data-rh="true" property="og:description" content="${escapeHtmlAttr(description)}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:type" content="website" />
    <meta data-rh="true" name="twitter:card" content="summary" />
    <script type="application/ld+json">${JSON.stringify(blogSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)
  const outDir = join(distDir, 'blog')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('B')
}

// Blog posts
for (const post of blogPosts) {
  const pageUrl = `${BASE_URL}/blog/${post.slug}/`
  const title = `${post.title} | DevTools Online`
  const ogImage = post.cover ? `${BASE_URL}${post.cover}` : `${BASE_URL}/og-image.svg`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.description,
    'datePublished': post.date,
    'dateModified': post.date,
    'author': { '@type': 'Organization', 'name': post.author, 'url': BASE_URL },
    'publisher': {
      '@type': 'Organization',
      'name': 'DevTools Online',
      'url': BASE_URL,
      'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/icons/icon-192.png` },
    },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': pageUrl },
    'image': ogImage,
    'keywords': post.keywords.join(', '),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${BASE_URL}/blog/` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': pageUrl },
    ],
  }
  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${escapeHtmlAttr(post.description)}" />
    <meta name="keywords" content="${escapeHtmlAttr(post.keywords.join(', '))}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta data-rh="true" property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta data-rh="true" property="og:description" content="${escapeHtmlAttr(post.description)}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:image" content="${ogImage}" />
    <meta data-rh="true" property="og:type" content="article" />
    <meta data-rh="true" property="article:published_time" content="${post.date}" />
    <meta data-rh="true" property="article:author" content="${escapeHtmlAttr(post.author)}" />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <meta data-rh="true" name="twitter:title" content="${escapeHtmlAttr(title)}" />
    <meta data-rh="true" name="twitter:description" content="${escapeHtmlAttr(post.description)}" />
    <meta data-rh="true" name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

  // Render markdown body once for crawlers (hidden, replaced by React on hydration)
  const bodyHtml = parseMd(post.body, { async: false }) as string
  const fallback = `<article aria-hidden="true" style="position:absolute;left:-9999px;font-family:Inter,sans-serif;max-width:900px;color:#374151"><h1>${escapeHtmlAttr(post.title)}</h1>${bodyHtml}</article>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<meta[^>]*name="keywords"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*property="article:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)
    .replace('<div id="root">', `<div id="root">${fallback}`)

  const outDir = join(distDir, 'blog', post.slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('b')
}

// Blog tag pages
for (const tag of blogTags) {
  const slug = tagSlug(tag)
  const pageUrl = `${BASE_URL}/blog/tag/${slug}/`
  const title = `Posts tagged "${tag}" | DevTools Online`
  const description = `Browse all DevTools Online blog posts tagged with ${tag}.`
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${BASE_URL}/blog/` },
      { '@type': 'ListItem', 'position': 3, 'name': `Tag: ${tag}`, 'item': pageUrl },
    ],
  }
  const metaTags = `
    <title>${escapeHtmlAttr(title)}</title>
    <meta name="description" content="${escapeHtmlAttr(description)}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta data-rh="true" property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta data-rh="true" property="og:description" content="${escapeHtmlAttr(description)}" />
    <meta data-rh="true" property="og:url" content="${pageUrl}" />
    <meta data-rh="true" property="og:type" content="website" />
    <meta data-rh="true" name="twitter:card" content="summary" />
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

  const html = baseHtml
    .replace(/<title[^>]*>[^<]*<\/title>/, '')
    .replace(/<meta[^>]*name="description"[^>]*>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta[^>]*property="og:[^>]*>/g, '')
    .replace(/<meta[^>]*name="twitter:[^>]*>/g, '')
    .replace('<head>', `<head>${metaTags}`)
  const outDir = join(distDir, 'blog', 'tag', slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  process.stdout.write('t')
}

console.log(`\nPre-rendered all pages successfully.`)
