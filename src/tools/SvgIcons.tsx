import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Download, Copy, Check, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface IconData {
  body: string
  width: number
  height: number
}

interface IconItem {
  prefix: string
  name: string
  id: string
  data?: IconData
}

const COLLECTIONS = [
  { id: '',                label: 'All' },
  // Popular UI
  { id: 'lucide',          label: 'Lucide' },
  { id: 'heroicons',       label: 'Heroicons' },
  { id: 'tabler',          label: 'Tabler' },
  { id: 'ph',              label: 'Phosphor' },
  { id: 'mdi',             label: 'Material' },
  { id: 'material-symbols',label: 'Material Symbols' },
  { id: 'ri',              label: 'Remix' },
  { id: 'feather',         label: 'Feather' },
  { id: 'bi',              label: 'Bootstrap' },
  // Font Awesome
  { id: 'fa-solid',        label: 'FA Solid' },
  { id: 'fa-regular',      label: 'FA Regular' },
  { id: 'fa-brands',       label: 'FA Brands' },
  // Specialized
  { id: 'simple-icons',    label: 'Simple Icons' },
  { id: 'devicon',         label: 'Devicons' },
  { id: 'vscode-icons',    label: 'VS Code' },
  { id: 'logos',           label: 'Logos' },
  { id: 'ion',             label: 'Ionicons' },
  { id: 'ant-design',      label: 'Ant Design' },
  { id: 'carbon',          label: 'Carbon' },
  { id: 'octicon',         label: 'Octicons' },
  { id: 'codicon',         label: 'Codicons' },
  { id: 'fluent',          label: 'Fluent UI' },
  { id: 'solar',           label: 'Solar' },
  { id: 'iconoir',         label: 'Iconoir' },
  { id: 'mingcute',        label: 'MingCute' },
  { id: 'uil',             label: 'Unicons' },
  { id: 'bx',              label: 'Boxicons' },
  { id: 'gg',              label: 'CSS.gg' },
  { id: 'radix-icons',     label: 'Radix' },
  { id: 'cil',             label: 'CoreUI' },
  { id: 'cryptocurrency-color', label: 'Crypto' },
  { id: 'flag',            label: 'Flags' },
  { id: 'emojione',        label: 'Emoji' },
]

const PRESET_COLORS = [
  '#111827', '#6B7280', '#3B82F6', '#8B5CF6',
  '#10B981', '#F97316', '#EF4444', '#EC4899',
]
const SIZES = [16, 20, 24, 32, 48, 64]
const PAGE_SIZE = 60

function svgToJsx(svg: string): string {
  return svg
    .replace(/class=/g, 'className=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/xmlns:xlink="[^"]*"\s*/g, '')
}

function buildSvgString(data: IconData, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${data.width} ${data.height}">\n  ${data.body}\n</svg>`
}

export default function SvgIcons() {
  const [query, setQuery] = useState('arrow')
  const [collection, setCollection] = useState('')
  const [results, setResults] = useState<IconItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  const [selected, setSelected] = useState<IconItem | null>(null)
  const [color, setColor] = useState('#3B82F6')
  const [size, setSize] = useState(48)
  const [copied, setCopied] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchSearch = useCallback(async (q: string, col: string, p: number) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    setLoading(true)
    try {
      // 1. Search for icon IDs
      const params = new URLSearchParams({
        query: q || 'icon',
        limit: String(PAGE_SIZE),
        start: String(p * PAGE_SIZE),
      })
      if (col) params.set('prefixes', col)
      const res = await fetch(`https://api.iconify.design/search?${params}`, { signal })
      if (!res.ok) return
      const data = await res.json()
      const iconIds: string[] = data.icons ?? []
      setTotal(data.total ?? iconIds.length)

      if (iconIds.length === 0) {
        setResults([])
        return
      }

      // 2. Group by prefix for batch fetching
      const byPrefix: Record<string, string[]> = {}
      for (const id of iconIds) {
        const colon = id.indexOf(':')
        const prefix = id.slice(0, colon)
        const name = id.slice(colon + 1)
        if (!byPrefix[prefix]) byPrefix[prefix] = []
        byPrefix[prefix].push(name)
      }

      // 3. Batch fetch SVG data (1 request per prefix, not 1 per icon)
      const svgMap: Record<string, IconData> = {}
      await Promise.all(
        Object.entries(byPrefix).map(async ([prefix, names]) => {
          try {
            const r = await fetch(
              `https://api.iconify.design/${prefix}.json?icons=${names.join(',')}`,
              { signal }
            )
            if (!r.ok) return
            const json = await r.json()
            const defW = json.width ?? 24
            const defH = json.height ?? 24
            for (const name of names) {
              const icon = json.icons?.[name]
              if (icon?.body) {
                svgMap[`${prefix}:${name}`] = {
                  body: icon.body,
                  width: icon.width ?? defW,
                  height: icon.height ?? defH,
                }
              }
            }
          } catch { /* ignore per-prefix errors */ }
        })
      )

      // 4. Build result items with embedded SVG data
      const icons: IconItem[] = iconIds.map(id => {
        const colon = id.indexOf(':')
        return {
          prefix: id.slice(0, colon),
          name: id.slice(colon + 1),
          id,
          data: svgMap[id],
        }
      })
      setResults(icons)
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSearch('arrow', '', 0) }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      fetchSearch(query, collection, 0)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, collection])

  useEffect(() => { fetchSearch(query, collection, page) }, [page])

  const copyWith = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadSvg = () => {
    if (!selected?.data) return
    const svg = buildSvgString(selected.data, size)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selected.name}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const svgCode = selected?.data ? buildSvgString(selected.data, size) : ''
  const jsxCode = svgCode ? svgToJsx(svgCode) : ''
  const npmCode = selected
    ? `import { Icon } from '@iconify/react'\n\n<Icon icon="${selected.id}" width="${size}" height="${size}" />`
    : ''
  const cdnCode = selected
    ? `<img src="https://api.iconify.design/${selected.prefix}/${selected.name}.svg" width="${size}" height="${size}" />`
    : ''

  const totalLabel = total >= 999 ? '999+' : total.toLocaleString()

  return (
    <div className="flex gap-4" style={{ minHeight: 520 }}>
      {/* ── Left: search + grid ── */}
      <div className={`flex flex-col gap-3 ${selected ? 'flex-1 min-w-0' : 'w-full'}`}>

        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 200,000+ icons (e.g. arrow, home, user...)"
            className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
            autoFocus
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Collection tabs */}
        <div className="flex gap-1 flex-wrap">
          {COLLECTIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setCollection(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                collection === c.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Count */}
        {!loading && total > 0 && (
          <p className="text-xs text-gray-400">
            {totalLabel} icons found
            {collection && (
              <span className="ml-1">in <span className="font-medium text-gray-500 dark:text-gray-300">{COLLECTIONS.find(c => c.id === collection)?.label}</span></span>
            )}
            <span className="ml-1 text-gray-300 dark:text-gray-600">· showing {results.length}</span>
          </p>
        )}

        {/* Icon grid */}
        {loading ? (
          <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-1">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No icons found for "{query}"</div>
        ) : (
          <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-1">
            {results.map(icon => (
              <button
                key={icon.id}
                onClick={() => setSelected(icon)}
                title={icon.id}
                aria-label={`Select icon ${icon.name}`}
                className={`aspect-square flex items-center justify-center p-1.5 rounded-lg transition-all hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:scale-110 ${
                  selected?.id === icon.id
                    ? 'bg-primary-100 dark:bg-primary-900/50 ring-1 ring-primary-500'
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {icon.data ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    viewBox={`0 0 ${icon.data.width} ${icon.data.height}`}
                    fill="currentColor"
                    className="text-gray-600 dark:text-gray-400 shrink-0"
                    dangerouslySetInnerHTML={{ __html: icon.data.body }}
                  />
                ) : (
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="text-xs text-gray-400">
              {(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, total).toLocaleString()} of {totalLabel}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total || loading}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── Right: detail panel ── */}
      {selected && (
        <div className="shrink-0 flex flex-col gap-3" style={{ width: 264 }}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selected.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{selected.prefix}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1 shrink-0 ml-2" aria-label="Close details">
                <X size={14} />
              </button>
            </div>

            {/* Preview */}
            <div
              className="flex items-center justify-center rounded-xl p-8 bg-gray-50 dark:bg-gray-800"
              style={{
                backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            >
              {selected.data ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={size}
                  height={size}
                  viewBox={`0 0 ${selected.data.width} ${selected.data.height}`}
                  fill="currentColor"
                  style={{ color }}
                  dangerouslySetInnerHTML={{ __html: selected.data.body }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              )}
            </div>

            {/* Color */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Color</p>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    title={c}
                    aria-label={`Pick color ${c}`}
                    className={`w-5 h-5 rounded-full transition-all hover:scale-110 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ${color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-gray-700 dark:ring-gray-300 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700 shrink-0" style={{ backgroundColor: color }} />
                <input
                  type="text"
                  value={color}
                  onChange={e => {
                    const v = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v)
                  }}
                  className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#3B82F6"
                  maxLength={7}
                />
                <input
                  type="color"
                  value={color.length === 7 ? color : '#3B82F6'}
                  onChange={e => setColor(e.target.value.toUpperCase())}
                  className="w-7 h-7 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 bg-transparent"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Size — {size}px</p>
              <div className="flex gap-1">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-1 text-xs rounded-lg transition-colors font-medium ${
                      size === s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => copyWith(svgCode, 'svg')}
                disabled={!svgCode}
                className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-2"
              >
                {copied === 'svg' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'svg' ? 'Copied!' : 'Copy SVG'}
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => copyWith(jsxCode, 'jsx')}
                  disabled={!jsxCode}
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
                >
                  {copied === 'jsx' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                  {copied === 'jsx' ? 'Copied!' : 'Copy JSX'}
                </button>
                <button
                  onClick={() => copyWith(npmCode, 'npm')}
                  disabled={!selected}
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
                >
                  {copied === 'npm' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                  {copied === 'npm' ? 'Copied!' : 'Copy npm'}
                </button>
                <button
                  onClick={() => copyWith(cdnCode, 'cdn')}
                  disabled={!selected}
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
                >
                  {copied === 'cdn' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                  {copied === 'cdn' ? 'Copied!' : 'Copy CDN'}
                </button>
                <button
                  onClick={downloadSvg}
                  disabled={!svgCode}
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
                >
                  <Download size={11} /> .svg
                </button>
              </div>
              <a
                href={`https://icon-sets.iconify.design/${selected.prefix}/${selected.name}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs py-1.5 w-full flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={11} /> View on Iconify
              </a>
            </div>
          </div>

          {/* SVG code preview */}
          {svgCode && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">SVG</span>
                <button
                  onClick={() => copyWith(svgCode, 'code')}
                  className="btn-ghost text-xs px-2 py-0.5 flex items-center gap-1"
                >
                  {copied === 'code' ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-[10px] text-gray-500 dark:text-gray-500 p-3 overflow-x-auto max-h-28 font-mono leading-relaxed whitespace-pre-wrap break-all">
                {svgCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
