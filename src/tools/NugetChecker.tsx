import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, ExternalLink, Download, Package, ChevronLeft, Star } from 'lucide-react'

interface NugetResult {
  id: string
  version: string
  description: string
  summary?: string
  authors: string[]
  totalDownloads: number
  verified: boolean
  tags?: string[]
  projectUrl?: string
  licenseUrl?: string
  iconUrl?: string
  versions?: { version: string; downloads: number }[]
}

interface NugetDetail extends NugetResult {
  allVersions: string[]
  latestStable: string
}

function fmtDownloads(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function DownloadBadge({ n }: { n: number }) {
  const color = n >= 50_000_000 ? 'text-green-600 dark:text-green-400' : n >= 1_000_000 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
  return <span className={`text-xs font-mono font-medium ${color}`}>{fmtDownloads(n)}</span>
}

export default function NugetChecker() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NugetResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalHits, setTotalHits] = useState(0)
  const [detail, setDetail] = useState<NugetDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const searchPackages = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setTotalHits(0); return }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    setError('')
    try {
      const url = `https://azuresearch-usnc.nuget.org/query?q=${encodeURIComponent(q)}&take=15&prerelease=false`
      const res = await fetch(url, { signal: abortRef.current.signal })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setSearchResults(data.data ?? [])
      setTotalHits(data.totalHits ?? 0)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError('Failed to search NuGet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPackages(query), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const loadDetail = async (pkg: NugetResult) => {
    setLoadingDetail(true)
    setDetail({ ...pkg, allVersions: [], latestStable: pkg.version })
    try {
      const res = await fetch(
        `https://api.nuget.org/v3-flatcontainer/${pkg.id.toLowerCase()}/index.json`
      )
      if (res.ok) {
        const data = await res.json()
        const versions: string[] = data.versions ?? []
        const stable = [...versions].reverse().find(v => !v.includes('-')) ?? versions[versions.length - 1] ?? pkg.version
        setDetail({ ...pkg, allVersions: versions.slice(-10).reverse(), latestStable: stable })
      }
    } catch { /* keep partial detail */ }
    finally { setLoadingDetail(false) }
  }

  const installCmd = detail ? `dotnet add package ${detail.id} --version ${detail.latestStable}` : ''
  const packageRef = detail ? `<PackageReference Include="${detail.id}" Version="${detail.latestStable}" />` : ''

  if (detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ChevronLeft size={14} /> Back to results
        </button>

        {/* Package header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Package size={22} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{detail.id}</h2>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-mono">
                  v{detail.latestStable}
                </span>
                {detail.verified && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-current" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{detail.authors?.join(', ')}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400 mb-0.5">Total Downloads</p>
              <DownloadBadge n={detail.totalDownloads} />
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {detail.description || detail.summary || 'No description.'}
          </p>

          {/* Tags */}
          {detail.tags && detail.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {detail.tags.slice(0, 12).map(tag => (
                <span key={tag} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <a href={`https://www.nuget.org/packages/${detail.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              <ExternalLink size={12} /> NuGet.org
            </a>
            {detail.projectUrl && (
              <a href={detail.projectUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                <ExternalLink size={12} /> Project
              </a>
            )}
            {detail.licenseUrl && (
              <a href={detail.licenseUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:underline">
                License
              </a>
            )}
          </div>
        </div>

        {/* Install commands */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CodeSnippet label=".NET CLI" code={installCmd} />
          <CodeSnippet label=".csproj / PackageReference" code={packageRef} />
        </div>

        {/* Versions */}
        {detail.allVersions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Recent Versions
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.allVersions.map(v => (
                <span
                  key={v}
                  className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                    v === detail.latestStable
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300'
                      : v.includes('-')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-400'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {loadingDetail && (
          <p className="text-xs text-gray-400 animate-pulse">Loading version history...</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search NuGet packages (e.g. Newtonsoft.Json, Serilog, EF Core...)"
          className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
          autoFocus
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!query && !loading && (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Search for any NuGet package</p>
          <p className="text-xs mt-1">Try: Newtonsoft.Json, Serilog, AutoMapper, MediatR...</p>
        </div>
      )}

      {totalHits > 0 && !loading && (
        <p className="text-xs text-gray-400">{totalHits.toLocaleString()} packages found</p>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => loadDetail(pkg)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {pkg.id}
                    </span>
                    <span className="text-xs font-mono text-gray-400">v{pkg.version}</span>
                    {pkg.verified && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {pkg.description || pkg.summary || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(pkg.tags ?? []).slice(0, 4).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <div className="flex items-center gap-1 justify-end text-gray-400">
                    <Download size={11} />
                    <DownloadBadge n={pkg.totalDownloads} />
                  </div>
                  <p className="text-[10px] text-gray-400">{pkg.authors?.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CodeSnippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <button onClick={copy} className="btn-ghost text-xs px-2 py-0.5 flex items-center gap-1">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  )
}
