import { useState, useCallback } from 'react'
import { Search, Clock, RefreshCw } from 'lucide-react'

type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'PTR' | 'SRV' | 'CAA'

interface DnsRecord { name: string; type: string; TTL: number; data: string }
interface DnsResult { type: RecordType; records: DnsRecord[]; error?: string; ms: number }

const RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR', 'SRV', 'CAA']

const TYPE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  AAAA: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  CNAME: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  MX: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  TXT: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  NS: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  SOA: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

const DOH_TYPE_NUM: Record<RecordType, number> = {
  A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6, PTR: 12, SRV: 33, CAA: 257,
}

async function queryDns(domain: string, type: RecordType): Promise<DnsResult> {
  const start = Date.now()
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${DOH_TYPE_NUM[type]}`
    const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const ms = Date.now() - start

    if (data.Status !== 0) {
      const statusMsg: Record<number, string> = { 1: 'Format error', 2: 'Server failure', 3: 'NXDOMAIN (not found)', 4: 'Not implemented', 5: 'Refused' }
      return { type, records: [], error: statusMsg[data.Status] ?? `DNS error ${data.Status}`, ms }
    }

    const records: DnsRecord[] = (data.Answer ?? []).map((ans: { name: string; type: number; TTL: number; data: string }) => ({
      name: ans.name,
      type: Object.entries(DOH_TYPE_NUM).find(([, v]) => v === ans.type)?.[0] ?? String(ans.type),
      TTL: ans.TTL,
      data: ans.data,
    }))

    return { type, records, ms }
  } catch (e) {
    return { type, records: [], error: (e as Error).message, ms: Date.now() - start }
  }
}

const SAMPLES = ['google.com', 'github.com', 'cloudflare.com', 'stackoverflow.com', 'microsoft.com']

export default function DnsLookup() {
  const [domain, setDomain] = useState('github.com')
  const [selectedTypes, setSelectedTypes] = useState<Set<RecordType>>(new Set(['A', 'AAAA', 'MX', 'TXT', 'NS']))
  const [results, setResults] = useState<DnsResult[]>([])
  const [loading, setLoading] = useState(false)

  const lookup = useCallback(async (d = domain) => {
    if (!d.trim()) return
    setLoading(true)
    setResults([])
    const types = [...selectedTypes]
    const all = await Promise.all(types.map(t => queryDns(d.trim(), t)))
    setResults(all)
    setLoading(false)
  }, [domain, selectedTypes])

  const toggleType = (t: RecordType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(t)) { if (next.size > 1) next.delete(t) } else next.add(t)
      return next
    })
  }

  const hasResults = results.some(r => r.records.length > 0)

  return (
    <div className="space-y-4">
      {/* Domain input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="Enter domain (e.g. google.com)"
            className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
          />
        </div>
        <button onClick={() => lookup()} disabled={loading} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
          Lookup
        </button>
      </div>

      {/* Record types */}
      <div className="flex flex-wrap gap-1.5">
        {RECORD_TYPES.map(t => (
          <button key={t} onClick={() => toggleType(t)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition-colors ${
              selectedTypes.has(t) ? (TYPE_COLORS[t] ?? TYPE_COLORS.default) + ' ring-1 ring-inset ring-current' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Quick samples */}
      <div className="flex flex-wrap gap-1.5">
        {SAMPLES.map(s => (
          <button key={s} onClick={() => { setDomain(s); lookup(s) }}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-2">
          {[...selectedTypes].map(t => (
            <div key={t} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map(result => (
            <div key={result.type} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${TYPE_COLORS[result.type] ?? TYPE_COLORS.default}`}>
                  {result.type}
                </span>
                {result.error ? (
                  <span className="text-xs text-red-500">{result.error}</span>
                ) : (
                  <span className="text-xs text-gray-400">{result.records.length} record{result.records.length !== 1 ? 's' : ''}</span>
                )}
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={10} />{result.ms}ms
                </span>
              </div>
              {result.records.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {result.records.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <span className="text-xs font-mono text-gray-400 w-16 shrink-0 mt-0.5">TTL {r.TTL}</span>
                      <span className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all flex-1">{r.data}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && !hasResults && (
        <p className="text-sm text-gray-400 text-center py-4">No DNS records found for the selected types</p>
      )}

      <p className="text-[11px] text-gray-400">Powered by Cloudflare DNS-over-HTTPS (1.1.1.1)</p>
    </div>
  )
}
