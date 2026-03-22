import { useState, useEffect, useRef } from 'react'
import { Search, Copy, Check, ExternalLink, Package, Download, GitBranch, Calendar, ArrowLeft, AlertTriangle, Shield } from 'lucide-react'

// ── Search result from npm search API ──────────────────────────────────────
interface SearchResult {
  name: string
  description: string
  version: string
  date: string
  keywords?: string[]
  links: { npm?: string; homepage?: string; repository?: string }
  publisher?: { username: string }
  score?: { quality: number; popularity: number; maintenance: number }
}

// ── Full package from registry ──────────────────────────────────────────────
interface NpmPackage {
  name: string
  description: string
  'dist-tags': Record<string, string>
  versions: Record<string, NpmVersion>
  time: Record<string, string>
  maintainers: { name: string; email?: string }[]
  readme?: string
  license?: string
  homepage?: string
  repository?: { url?: string }
  keywords?: string[]
  deprecated?: string
}

interface NpmVersion {
  version: string
  description: string
  license?: string
  homepage?: string
  repository?: { url?: string; type?: string }
  author?: { name?: string } | string
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  dist?: { unpackedSize?: number; tarball?: string }
  types?: string
  typings?: string
  engines?: Record<string, string>
  deprecated?: string
  funding?: { type: string; url: string } | { type: string; url: string }[]
}

interface DownloadStats {
  downloads: number
  package: string
}

interface BundleSize {
  size: number
  gzip: number
  name: string
  version: string
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function formatBytes(b: number): string {
  if (b >= 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB'
  if (b >= 1024) return (b / 1024).toFixed(1) + ' kB'
  return b + ' B'
}

function cleanRepoUrl(url?: string): string | undefined {
  if (!url) return undefined
  return url.replace(/^git\+/, '').replace(/\.git$/, '').replace('git://', 'https://')
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function maintainedLabel(days: number): { label: string; color: string } {
  if (days <= 90) return { label: 'Active', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' }
  if (days <= 365) return { label: `${Math.floor(days / 30)}mo ago`, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' }
  return { label: `${Math.floor(days / 365)}yr ago`, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500 w-8 text-right shrink-0">{pct}</span>
    </div>
  )
}

type Tab = 'overview' | 'deps' | 'versions'
type PkgManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

const installCmd: Record<PkgManager, (n: string) => string> = {
  npm: n => `npm install ${n}`,
  yarn: n => `yarn add ${n}`,
  pnpm: n => `pnpm add ${n}`,
  bun: n => `bun add ${n}`,
}

const POPULAR = ['react', 'vue', 'typescript', 'vite', 'axios', 'lodash', 'express', 'next']

export default function NpmChecker() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Detail view state
  const [pkg, setPkg] = useState<NpmPackage | null>(null)
  const [downloads, setDownloads] = useState<DownloadStats | null>(null)
  const [bundle, setBundle] = useState<BundleSize | null>(null)
  const [hasTypes, setHasTypes] = useState<'builtin' | 'definitelytyped' | 'none' | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [pkgMgr, setPkgMgr] = useState<PkgManager>('npm')
  const [copiedCmd, setCopiedCmd] = useState(false)
  // Store scores from search for the selected package
  const [scores, setScores] = useState<{ quality: number; popularity: number; maintenance: number } | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search after 3 chars
  useEffect(() => {
    const q = searchInput.trim()
    if (q.length < 3) {
      setSearchResults([])
      setSearchError('')
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSearchResults(q), 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const fetchSearchResults = async (q: string) => {
    setLoadingSearch(true)
    setSearchError('')
    try {
      const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=15`)
      if (!res.ok) throw new Error(`Search failed (${res.status})`)
      const data = await res.json()
      const results: SearchResult[] = (data.objects ?? []).map((obj: {
        package: { name: string; description: string; version: string; date: string; keywords?: string[]; links: { npm?: string; homepage?: string; repository?: string }; publisher?: { username: string } }
        score?: { detail: { quality: number; popularity: number; maintenance: number } }
      }) => ({
        name: obj.package.name,
        description: obj.package.description,
        version: obj.package.version,
        date: obj.package.date,
        keywords: obj.package.keywords,
        links: obj.package.links,
        publisher: obj.package.publisher,
        score: obj.score ? {
          quality: obj.score.detail.quality,
          popularity: obj.score.detail.popularity,
          maintenance: obj.score.detail.maintenance,
        } : undefined,
      }))
      setSearchResults(results)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoadingSearch(false)
    }
  }

  const loadPackage = async (name: string, resultScores?: SearchResult['score']) => {
    setLoadingDetail(true)
    setDetailError('')
    setPkg(null)
    setDownloads(null)
    setBundle(null)
    setHasTypes(null)
    setScores(resultScores ?? null)
    setTab('overview')

    try {
      const [pkgRes, dlRes] = await Promise.all([
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`),
      ])

      if (!pkgRes.ok) {
        setDetailError(pkgRes.status === 404 ? `Package "${name}" not found.` : `Failed to fetch (${pkgRes.status}).`)
        setLoadingDetail(false)
        return
      }

      const pkgData: NpmPackage = await pkgRes.json()
      setPkg(pkgData)

      if (dlRes.ok) {
        const dlData: DownloadStats = await dlRes.json()
        setDownloads(dlData)
      }

      const latest = pkgData['dist-tags']?.latest
      const latestVer = latest ? pkgData.versions[latest] : null

      // Check TypeScript support
      if (latestVer?.types || latestVer?.typings) {
        setHasTypes('builtin')
      } else {
        // Check @types package
        fetch(`https://registry.npmjs.org/@types/${encodeURIComponent(name.replace(/^@[^/]+\//, ''))}`)
          .then(r => { setHasTypes(r.ok ? 'definitelytyped' : 'none') })
          .catch(() => setHasTypes('none'))
      }

      // Bundle size (non-blocking)
      if (latest) {
        fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(name)}@${latest}`)
          .then(r => r.ok ? r.json() : null)
          .then((d: BundleSize | null) => { if (d?.gzip) setBundle(d) })
          .catch(() => {})
      }
    } catch {
      setDetailError('Network error. Please check your connection.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleBack = () => {
    setPkg(null)
    setDetailError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) fetchSearchResults(q)
  }

  const copyCmd = async () => {
    if (!pkg) return
    await navigator.clipboard.writeText(installCmd[pkgMgr](pkg.name))
    setCopiedCmd(true)
    setTimeout(() => setCopiedCmd(false), 2000)
  }

  // Derived data for detail view
  const latest = pkg ? pkg['dist-tags']?.latest : ''
  const latestVer = pkg && latest ? pkg.versions[latest] : null
  const license = latestVer?.license ?? pkg?.license ?? '—'
  const homepage = latestVer?.homepage ?? pkg?.homepage
  const repoUrl = cleanRepoUrl(latestVer?.repository?.url ?? pkg?.repository?.url)
  const deps = latestVer?.dependencies ?? {}
  const devDeps = latestVer?.devDependencies ?? {}
  const peerDeps = latestVer?.peerDependencies ?? {}
  const keywords = latestVer?.keywords ?? pkg?.keywords ?? []
  const unpackedSize = latestVer?.dist?.unpackedSize
  const engines = latestVer?.engines ?? {}
  const isDeprecated = !!(latestVer?.deprecated ?? pkg?.deprecated)
  const deprecatedMsg = latestVer?.deprecated ?? pkg?.deprecated ?? ''
  const lastPublish = latest && pkg?.time[latest] ? pkg.time[latest] : ''
  const versions = pkg ? Object.entries(pkg.time)
    .filter(([v]) => !['created', 'modified'].includes(v))
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .slice(0, 50)
    : []

  const showSearchResults = !pkg && !loadingDetail && searchResults.length > 0
  const showEmpty = !pkg && !loadingDetail && !loadingSearch && searchInput.trim().length >= 3 && searchResults.length === 0 && !searchError

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value)
              if (pkg) handleBack()
            }}
            placeholder="Search npm packages (e.g. react, lodash, axios)"
            className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
            autoFocus
          />
          {loadingSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <button type="submit" disabled={loadingSearch || !searchInput.trim()} className="btn-primary px-5">
          Search
        </button>
      </form>

      {/* Popular suggestions */}
      {!pkg && !loadingDetail && searchInput.trim().length === 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 self-center">Popular:</span>
          {POPULAR.map(p => (
            <button
              key={p}
              onClick={() => { setSearchInput(p); fetchSearchResults(p) }}
              className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Search error */}
      {searchError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {searchError}
        </div>
      )}

      {/* Detail error */}
      {detailError && (
        <div className="space-y-3">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft size={14} /> Back to results
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {detailError}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loadingDetail && (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      )}

      {/* ── Search results list ─────────────────────────────────────────────── */}
      {showSearchResults && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{searchResults.length} packages found</p>
          {searchResults.map(result => {
            const days = daysSince(result.date)
            const maintained = maintainedLabel(days)
            return (
              <button
                key={result.name}
                onClick={() => loadPackage(result.name, result.score)}
                className="w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Package size={14} className="text-red-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {result.name}
                        </span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          v{result.version}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${maintained.color}`}>
                          {maintained.label}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{result.description}</p>
                      )}
                      {result.score && (
                        <div className="flex items-center gap-2 mt-1.5">
                          {[
                            { label: 'Q', title: 'Quality', val: result.score.quality },
                            { label: 'P', title: 'Popularity', val: result.score.popularity },
                            { label: 'M', title: 'Maintenance', val: result.score.maintenance },
                          ].map(s => {
                            const pct = Math.round(s.val * 100)
                            const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                            return (
                              <div key={s.label} title={`${s.title}: ${pct}/100`} className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
                                <span className="text-[10px] text-gray-400 font-mono">{s.label} {pct}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* No results */}
      {showEmpty && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No packages found for "{searchInput.trim()}"
        </div>
      )}

      {/* ── Package detail view ─────────────────────────────────────────────── */}
      {pkg && !loadingDetail && (
        <div className="space-y-4">
          {/* Back button */}
          {searchResults.length > 0 && (
            <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft size={14} /> Back to results
            </button>
          )}

          {/* Deprecated warning */}
          {isDeprecated && (
            <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Deprecated</p>
                {deprecatedMsg && <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">{deprecatedMsg}</p>}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={20} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h2>
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-mono border border-primary-200 dark:border-primary-800">
                      v{latest}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                      {license}
                    </span>
                    {/* TypeScript badge */}
                    {hasTypes === 'builtin' && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Shield size={10} /> TS built-in
                      </span>
                    )}
                    {hasTypes === 'definitelytyped' && (
                      <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                        <Shield size={10} /> @types available
                      </span>
                    )}
                    {hasTypes === 'none' && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                        No types
                      </span>
                    )}
                    {/* Last publish health */}
                    {lastPublish && (() => {
                      const m = maintainedLabel(daysSince(lastPublish))
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${m.color}`}>
                          {m.label}
                        </span>
                      )
                    })()}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{pkg.description}</p>
                  {/* Engines */}
                  {engines.node && (
                    <p className="text-xs text-gray-400 mt-1">Node {engines.node}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {homepage && (
                  <a href={homepage} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-xs flex items-center gap-1 py-1.5">
                    <ExternalLink size={12} /> Docs
                  </a>
                )}
                {repoUrl && (
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-xs flex items-center gap-1 py-1.5">
                    <GitBranch size={12} /> Repo
                  </a>
                )}
                <a href={`https://www.npmjs.com/package/${pkg.name}`} target="_blank" rel="noopener noreferrer"
                  className="btn-ghost text-xs flex items-center gap-1 py-1.5">
                  <ExternalLink size={12} /> npm
                </a>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Weekly downloads', value: downloads ? formatNum(downloads.downloads) : '—', icon: <Download size={14} className="text-blue-500" /> },
              { label: 'Gzip size', value: bundle ? formatBytes(bundle.gzip) : unpackedSize ? formatBytes(unpackedSize) + '*' : '—', icon: <Package size={14} className="text-green-500" /> },
              { label: 'Dependencies', value: Object.keys(deps).length.toString(), icon: <GitBranch size={14} className="text-purple-500" /> },
              { label: 'Published', value: lastPublish ? new Date(lastPublish).toLocaleDateString() : '—', icon: <Calendar size={14} className="text-orange-500" /> },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.value}</p>
                  <p className="text-xs text-gray-400 truncate">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* npm scores (if available from search) */}
          {scores && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">npm Score</p>
              <div className="space-y-2">
                <ScoreBar value={scores.quality} label="Quality" />
                <ScoreBar value={scores.popularity} label="Popularity" />
                <ScoreBar value={scores.maintenance} label="Maintenance" />
              </div>
            </div>
          )}

          {/* Install command */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(['npm', 'yarn', 'pnpm', 'bun'] as PkgManager[]).map(pm => (
                <button
                  key={pm}
                  onClick={() => setPkgMgr(pm)}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${pkgMgr === pm ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 -mb-px' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1 truncate">
                {installCmd[pkgMgr](pkg.name)}
              </code>
              <button onClick={copyCmd} className="btn-ghost text-xs flex items-center gap-1 shrink-0 py-1.5">
                {copiedCmd ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copiedCmd ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-1">
              {(['overview', 'deps', 'versions'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 -mb-px' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {t === 'deps' ? `Dependencies (${Object.keys(deps).length + Object.keys(devDeps).length})` : t === 'versions' ? `Versions (${Object.keys(pkg.versions).length})` : 'Overview'}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Overview tab */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  {keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map(k => (
                          <span key={k} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkg.maintainers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Maintainers</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.maintainers.slice(0, 10).map(m => (
                          <a
                            key={m.name}
                            href={`https://www.npmjs.com/~${m.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={`https://www.gravatar.com/avatar/${m.email}?s=20&d=identicon`}
                              alt=""
                              className="w-4 h-4 rounded-full bg-gray-200"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            {m.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(pkg['dist-tags']).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Dist Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(pkg['dist-tags']).map(([tag, ver]) => (
                          <span key={tag} className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${tag === 'latest' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="font-medium">{tag}</span>
                            <span className="font-mono text-gray-400">{ver}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {unpackedSize && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Unpacked size</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatBytes(unpackedSize)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Dependencies tab */}
              {tab === 'deps' && (
                <div className="space-y-4">
                  {Object.keys(deps).length === 0 && Object.keys(devDeps).length === 0 && Object.keys(peerDeps).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No dependencies</p>
                  ) : (
                    <>
                      {Object.keys(deps).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Dependencies ({Object.keys(deps).length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(deps).map(([name, ver]) => (
                              <button
                                key={name}
                                onClick={() => { setSearchInput(name); loadPackage(name) }}
                                className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                title={`${name}@${ver}`}
                              >
                                {name}
                                <span className="text-blue-400 dark:text-blue-500 font-mono">{ver}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {Object.keys(devDeps).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Dev Dependencies ({Object.keys(devDeps).length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(devDeps).map(([name, ver]) => (
                              <button
                                key={name}
                                onClick={() => { setSearchInput(name); loadPackage(name) }}
                                className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title={`${name}@${ver}`}
                              >
                                {name}
                                <span className="text-gray-400 font-mono">{ver}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {Object.keys(peerDeps).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Peer Dependencies ({Object.keys(peerDeps).length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(peerDeps).map(([name, ver]) => (
                              <button
                                key={name}
                                onClick={() => { setSearchInput(name); loadPackage(name) }}
                                className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 transition-colors"
                                title={`${name}@${ver}`}
                              >
                                {name}
                                <span className="text-yellow-500 font-mono">{ver}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Versions tab */}
              {tab === 'versions' && (
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {versions.map(([ver, date]) => (
                    <div key={ver} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ver === latest ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200">{ver}</span>
                        {ver === latest && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                            latest
                          </span>
                        )}
                        {Object.entries(pkg['dist-tags']).find(([, v]) => v === ver && ['beta', 'next', 'canary', 'rc', 'alpha'].some(t => Object.keys(pkg['dist-tags']).includes(t) && pkg['dist-tags'][t] === ver)) && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                            {Object.entries(pkg['dist-tags']).find(([, v]) => v === ver)?.[0]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                  {Object.keys(pkg.versions).length > 50 && (
                    <p className="text-xs text-center text-gray-400 pt-2">Showing latest 50 of {Object.keys(pkg.versions).length} versions</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
