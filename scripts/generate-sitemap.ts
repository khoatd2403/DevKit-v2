import { writeFileSync } from 'fs'
import { tools } from '../src/tools-registry'
import { SITE_URL as BASE_URL } from '../site.config'
const today = new Date().toISOString().split('T')[0]

const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${BASE_URL}/tools`, priority: '0.8', changefreq: 'weekly' },
  ...tools.map(t => ({
    loc: `${BASE_URL}/tool/${t.id}`,
    priority: t.popular ? '0.9' : '0.7',
    changefreq: 'monthly',
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

writeFileSync('public/sitemap.xml', xml)
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`)
console.log(`Generated sitemap with ${urls.length} URLs`)
