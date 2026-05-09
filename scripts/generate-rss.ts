import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SITE_URL as BASE_URL, SITE_NAME } from '../site.config'
import { loadAllPosts } from './blog-fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const posts = loadAllPosts()
const buildDate = new Date().toUTCString()

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function pubDate(iso: string): string {
  if (!iso) return buildDate
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return buildDate
  return d.toUTCString()
}

const items = posts
  .map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}/</guid>
      <pubDate>${pubDate(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt || post.description)}</description>
      <author>noreply@devtoolsonline.dev (${escapeXml(post.author)})</author>
      ${post.tags.map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`)
  .join('')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${BASE_URL}/blog/</link>
    <description>Tutorials, guides, and deep dives on JSON, SQL, JWT, encoding, security, and the developer tools we build.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

const outPath = join(__dirname, '../public/feed.xml')
writeFileSync(outPath, rss)
console.log(`Generated RSS feed with ${posts.length} posts`)
