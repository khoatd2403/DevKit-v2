import { writeFileSync } from 'fs'
import { tools, categories } from '../src/tools-registry'
import { SITE_URL as BASE_URL } from '../site.config'
const today = new Date().toISOString().split('T')[0]

const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${BASE_URL}/tools/`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/about/`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${BASE_URL}/contact/`, priority: '0.4', changefreq: 'yearly' },
  { loc: `${BASE_URL}/privacy/`, priority: '0.3', changefreq: 'yearly' },
  { loc: `${BASE_URL}/terms/`, priority: '0.3', changefreq: 'yearly' },
  // Category landing pages
  ...categories.filter(c => c.id !== 'all').map(c => ({
    loc: `${BASE_URL}/${c.id}-tools/`,
    priority: '0.8',
    changefreq: 'weekly',
  })),
  // Tool pages
  ...tools.map(t => ({
    loc: `${BASE_URL}/${t.category}-tools/${t.id}/`,
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
