import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Download } from 'lucide-react'

type PathRule = { type: 'Allow' | 'Disallow'; path: string }

type RuleBlock = {
  id: number
  userAgent: string
  rules: PathRule[]
  crawlDelay: string
}

const COMMON_AGENTS = ['*', 'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'facebot', 'ia_archiver']

let nextId = 1

function makeBlock(): RuleBlock {
  return { id: nextId++, userAgent: '*', rules: [{ type: 'Disallow', path: '' }], crawlDelay: '' }
}

function generateRobotsTxt(blocks: RuleBlock[], sitemap: string): string {
  const lines: string[] = []
  blocks.forEach((block, i) => {
    if (i > 0) lines.push('')
    lines.push(`User-agent: ${block.userAgent || '*'}`)
    block.rules.forEach(r => lines.push(`${r.type}: ${r.path}`))
    if (block.crawlDelay.trim()) lines.push(`Crawl-delay: ${block.crawlDelay}`)
  })
  if (sitemap.trim()) {
    lines.push('')
    lines.push(`Sitemap: ${sitemap.trim()}`)
  }
  return lines.join('\n')
}

export default function RobotsTxt() {
  const [blocks, setBlocks] = useState<RuleBlock[]>([makeBlock()])
  const [sitemap, setSitemap] = useState('')
  const [copied, setCopied] = useState(false)

  const robotsTxt = generateRobotsTxt(blocks, sitemap)

  function addBlock() {
    setBlocks(prev => [...prev, makeBlock()])
  }

  function removeBlock(id: number) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  function updateBlock<K extends keyof RuleBlock>(id: number, key: K, value: RuleBlock[K]) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [key]: value } : b))
  }

  function addRule(id: number) {
    setBlocks(prev => prev.map(b =>
      b.id === id
        ? { ...b, rules: [...b.rules, { type: 'Disallow', path: '' }] }
        : b
    ))
  }

  function removeRule(id: number, idx: number) {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, rules: b.rules.filter((_, i) => i !== idx) } : b
    ))
  }

  function updateRule(id: number, idx: number, field: keyof PathRule, value: string) {
    setBlocks(prev => prev.map(b =>
      b.id === id
        ? {
            ...b,
            rules: b.rules.map((r, i) =>
              i === idx ? { ...r, [field]: value } : r
            ),
          }
        : b
    ))
  }

  function handleCopy() {
    navigator.clipboard.writeText(robotsTxt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([robotsTxt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'robots.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Rule blocks */}
      <div className="space-y-4">
        {blocks.map((block, bi) => (
          <div key={block.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rule Block {bi + 1}</span>
              {blocks.length > 1 && (
                <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* User-agent */}
            <div>
              <label className="label-text block mb-1">User-agent</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={block.userAgent}
                  onChange={e => updateBlock(block.id, 'userAgent', e.target.value)}
                  placeholder="*"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {COMMON_AGENTS.map(a => (
                  <button
                    key={a}
                    onClick={() => updateBlock(block.id, 'userAgent', a)}
                    className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                      block.userAgent === a
                        ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="label-text block mb-2">Allow / Disallow Paths</label>
              <div className="space-y-2">
                {block.rules.map((rule, ri) => (
                  <div key={ri} className="flex gap-2 items-center">
                    <select
                      value={rule.type}
                      onChange={e => updateRule(block.id, ri, 'type', e.target.value)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      <option value="Allow">Allow</option>
                      <option value="Disallow">Disallow</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      value={rule.path}
                      onChange={e => updateRule(block.id, ri, 'path', e.target.value)}
                      placeholder="/path/"
                    />
                    {block.rules.length > 1 && (
                      <button onClick={() => removeRule(block.id, ri)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addRule(block.id)} className="btn-ghost text-xs mt-2 flex items-center gap-1">
                <Plus size={12} /> Add Path
              </button>
            </div>

            {/* Crawl-delay */}
            <div>
              <label className="label-text block mb-1">Crawl-delay (optional, seconds)</label>
              <input
                type="number"
                min={0}
                className="w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={block.crawlDelay}
                onChange={e => updateBlock(block.id, 'crawlDelay', e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={addBlock} className="btn-secondary flex items-center gap-2">
        <Plus size={14} /> Add Rule Block
      </button>

      {/* Sitemap */}
      <div>
        <label className="label-text block mb-1">Sitemap URL (optional)</label>
        <input
          type="url"
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          value={sitemap}
          onChange={e => setSitemap(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
        />
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-text">Preview</label>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-ghost text-xs flex items-center gap-1">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="btn-secondary text-xs flex items-center gap-1">
              <Download size={12} /> Download
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={robotsTxt}
          className="tool-textarea h-64 select-all"
        />
      </div>

      {/* Quick reference */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quick Reference</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          {[
            ['User-agent: *', 'Applies to all bots'],
            ['Disallow: /', 'Block entire site'],
            ['Disallow:', 'Allow everything (empty path)'],
            ['Allow: /public/', 'Explicitly permit a path'],
            ['Crawl-delay: 10', 'Wait 10s between requests'],
            ['Sitemap:', 'Location of XML sitemap'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <code className="font-mono text-primary-600 dark:text-primary-400 shrink-0">{k}</code>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
