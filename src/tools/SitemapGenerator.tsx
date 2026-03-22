import { useState, useMemo } from 'react'
import { Copy, Check, Download, AlertTriangle } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

type UrlOverride = {
  priority: string
  changefreq: Changefreq
  lastmod: string
}

const CHANGEFREQS: Changefreq[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
const TODAY = new Date().toISOString().split('T')[0]!

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function generateSitemap(urls: string[], globalDefaults: UrlOverride, overrides: Record<string, UrlOverride>): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  const footer = '</urlset>'

  const entries = urls.filter(u => u.trim()).map(url => {
    const trimmed = url.trim()
    const o = overrides[trimmed] ?? globalDefaults
    const lines = ['  <url>', `    <loc>${trimmed}</loc>`]
    if (o.lastmod) lines.push(`    <lastmod>${o.lastmod}</lastmod>`)
    if (o.changefreq) lines.push(`    <changefreq>${o.changefreq}</changefreq>`)
    if (o.priority) lines.push(`    <priority>${o.priority}</priority>`)
    lines.push('  </url>')
    return lines.join('\n')
  })

  return [header, ...entries, footer].join('\n')
}

export default function SitemapGenerator() {
  const [input, setInput] = useState('https://example.com\nhttps://example.com/about\nhttps://example.com/blog\nhttps://example.com/contact')
  const [globalDefaults, setGlobalDefaults] = useState<UrlOverride>({
    priority: '0.5',
    changefreq: 'weekly',
    lastmod: TODAY,
  })
  const [overrides, setOverrides] = useState<Record<string, UrlOverride>>({})
  const [showPerUrl, setShowPerUrl] = useState(false)
  const [copied, setCopied] = useState(false)

  const urls = useMemo(
    () => input.split('\n').map(l => l.trim()).filter(Boolean),
    [input]
  )

  const invalidUrls = useMemo(() => urls.filter(u => !isValidUrl(u)), [urls])
  const validUrls = useMemo(() => urls.filter(isValidUrl), [urls])

  const sitemap = useMemo(
    () => generateSitemap(validUrls, globalDefaults, overrides),
    [validUrls, globalDefaults, overrides]
  )

  function updateGlobal<K extends keyof UrlOverride>(key: K, value: UrlOverride[K]) {
    setGlobalDefaults(prev => ({ ...prev, [key]: value }))
  }

  function setOverride(url: string, key: keyof UrlOverride, value: string) {
    setOverrides(prev => ({
      ...prev,
      [url]: { ...(prev[url] ?? globalDefaults), [key]: value },
    }))
  }

  function handleCopy() {
    navigator.clipboard.writeText(sitemap)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([sitemap], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">URL List (one per line)</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder={'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog'}
          className="h-36"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{validUrls.length} valid URL{validUrls.length !== 1 ? 's' : ''}</span>
          {urls.length > 0 && urls.length !== validUrls.length && (
            <span className="text-xs text-amber-600 dark:text-amber-400">{urls.length - validUrls.length} invalid</span>
          )}
        </div>
      </div>

      {/* Invalid URL warnings */}
      {invalidUrls.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <AlertTriangle size={13} /> Invalid URLs (will be excluded):
          </div>
          {invalidUrls.map(u => (
            <div key={u} className="font-mono text-xs text-amber-600 dark:text-amber-300 pl-5">{u}</div>
          ))}
        </div>
      )}

      {/* Global defaults */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Global Defaults</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label-text block mb-1">Change Frequency</label>
            <select
              value={globalDefaults.changefreq}
              onChange={e => updateGlobal('changefreq', e.target.value as Changefreq)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {CHANGEFREQS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text block mb-1">Priority (0.0–1.0)</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min={0} max={1} step={0.1}
                value={globalDefaults.priority}
                onChange={e => updateGlobal('priority', e.target.value)}
                className="flex-1"
              />
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300 w-8">{globalDefaults.priority}</span>
            </div>
          </div>
          <div>
            <label className="label-text block mb-1">Last Modified</label>
            <input
              type="date"
              value={globalDefaults.lastmod}
              onChange={e => updateGlobal('lastmod', e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>
      </div>

      {/* Per-URL overrides */}
      {validUrls.length > 0 && (
        <div>
          <button
            onClick={() => setShowPerUrl(v => !v)}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            {showPerUrl ? '▾' : '▸'} Per-URL overrides ({validUrls.length} URLs)
          </button>
          {showPerUrl && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
              {validUrls.map(url => {
                const o = overrides[url] ?? globalDefaults
                return (
                  <div key={url} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                    <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{url}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Freq</label>
                        <select
                          value={o.changefreq}
                          onChange={e => setOverride(url, 'changefreq', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {CHANGEFREQS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Priority</label>
                        <input
                          type="number" min={0} max={1} step={0.1}
                          value={o.priority}
                          onChange={e => setOverride(url, 'priority', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Lastmod</label>
                        <input
                          type="date"
                          value={o.lastmod}
                          onChange={e => setOverride(url, 'lastmod', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="label-text">Generated sitemap.xml</label>
            {validUrls.length > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {validUrls.length} URLs
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} disabled={validUrls.length === 0} className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-40">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownload} disabled={validUrls.length === 0} className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-40">
              <Download size={12} /> Download
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={validUrls.length > 0 ? sitemap : ''}
          placeholder="Enter URLs above to generate sitemap…"
          className="tool-textarea h-64"
        />
      </div>
    </div>
  )
}
