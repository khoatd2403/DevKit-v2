import { useState, useCallback } from 'react'
import { Search, RefreshCw, Shield, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react'

interface CrtEntry {
  issuer_ca_id: number; issuer_name: string; common_name: string
  name_value: string; id: number; entry_timestamp: string
  not_before: string; not_after: string; serial_number: string
}

interface SslResult {
  domain: string
  certs: CrtEntry[]
  activeCert?: CrtEntry
  status: 'valid' | 'expiring' | 'expired' | 'unknown'
  daysLeft?: number
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

const SAMPLES = ['github.com', 'google.com', 'cloudflare.com', 'letsencrypt.org']

export default function SslChecker() {
  const [domain, setDomain] = useState('github.com')
  const [result, setResult] = useState<SslResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const check = useCallback(async (d = domain.trim()) => {
    if (!d) return
    // Strip protocol if pasted
    const clean = d.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const url = `https://crt.sh/?q=${encodeURIComponent(clean)}&output=json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const certs: CrtEntry[] = await res.json()

      // Get unique certs by serial, filter to exact domain
      const unique = certs
        .filter(c => c.name_value.split('\n').some(n => n === clean || n === `*.${clean.split('.').slice(1).join('.')}`) && new Date(c.not_after) > new Date())
        .sort((a, b) => new Date(b.not_after).getTime() - new Date(a.not_after).getTime())

      const active = unique[0]
      const days = active ? daysUntil(active.not_after) : undefined

      setResult({
        domain: clean,
        certs: unique.slice(0, 5),
        activeCert: active,
        status: !active ? 'unknown' : days! < 0 ? 'expired' : days! < 30 ? 'expiring' : 'valid',
        daysLeft: days,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [domain])

  const statusConfig = {
    valid:    { icon: <ShieldCheck size={24} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800', label: 'Valid' },
    expiring: { icon: <ShieldAlert size={24} />, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', label: 'Expiring Soon' },
    expired:  { icon: <Shield size={24} />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', label: 'Expired' },
    unknown:  { icon: <Shield size={24} />, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800', label: 'Unknown' },
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="Enter domain (e.g. github.com)"
            className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
          />
        </div>
        <button 
          onClick={() => check()} 
          disabled={loading} 
          className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60"
          aria-label={loading ? "Checking SSL status" : "Check SSL status"}
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SAMPLES.map(s => (
          <button key={s} onClick={() => { setDomain(s); check(s) }}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Status banner */}
          {result.activeCert ? (
            <div className={`flex items-center gap-4 p-4 border rounded-xl ${statusConfig[result.status].bg}`}>
              <span className={statusConfig[result.status].color}>{statusConfig[result.status].icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${statusConfig[result.status].color}`}>{statusConfig[result.status].label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {result.daysLeft !== undefined && result.daysLeft > 0
                    ? `Expires in ${result.daysLeft} days`
                    : result.daysLeft === 0 ? 'Expires today!'
                    : `Expired ${Math.abs(result.daysLeft ?? 0)} days ago`}
                </p>
              </div>
              <a href={`https://crt.sh/?q=${result.domain}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                crt.sh <ExternalLink size={10} />
              </a>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500 text-center">
              No active certificates found for {result.domain}
            </div>
          )}

          {/* Active cert details */}
          {result.activeCert && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Certificate Details</h3>
              {[
                { label: 'Common Name', value: result.activeCert.common_name },
                { label: 'Issued By', value: result.activeCert.issuer_name },
                { label: 'Valid From', value: new Date(result.activeCert.not_before).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                { label: 'Valid To', value: new Date(result.activeCert.not_after).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                { label: 'Serial Number', value: result.activeCert.serial_number },
                { label: 'SANs', value: result.activeCert.name_value },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
                  <span className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent certs */}
          {result.certs.length > 1 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Certificates</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.certs.map((c, i) => {
                  const days = daysUntil(c.not_after)
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="font-mono text-gray-600 dark:text-gray-400 truncate flex-1">{c.issuer_name.match(/CN=([^,]+)/)?.[1] ?? c.issuer_name}</span>
                      <span className="text-gray-400 whitespace-nowrap">{new Date(c.not_after).toLocaleDateString()}</span>
                      <span className={`whitespace-nowrap ${days < 30 ? 'text-orange-500' : 'text-gray-400'}`}>{days}d</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-[11px] text-gray-400">Data from crt.sh (Certificate Transparency logs) — shows public certificate issuance records</p>
    </div>
  )
}
