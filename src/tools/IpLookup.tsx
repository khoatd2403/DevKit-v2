import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, MapPin, Globe, Wifi, Building } from 'lucide-react'

interface IpInfo {
  ip: string; version: string; city: string; region: string; region_code: string
  country_name: string; country_code: string; continent_code: string
  latitude: number; longitude: number; timezone: string; utc_offset: string
  org: string; asn: string; hostname?: string; postal?: string; currency?: string
  in_eu?: boolean; languages?: string; country_calling_code?: string
}

const SAMPLE_IPS = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9', '76.76.2.0']

function InfoBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary-500">{icon}</span>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | number | boolean }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{String(value)}</span>
    </div>
  )
}

export default function IpLookup() {
  const [input, setInput] = useState('')
  const [info, setInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = useCallback(async (ip = input.trim()) => {
    setLoading(true)
    setError('')
    setInfo(null)
    try {
      const endpoint = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.reason ?? data.error)
      setInfo(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input])

  // Auto-lookup own IP on mount
  useEffect(() => { lookup('') }, [])

  const flag = info?.country_code ? `https://flagcdn.com/24x18/${info.country_code.toLowerCase()}.png` : ''

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="IP address (leave empty for your own IP)"
            className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
          />
        </div>
        <button onClick={() => lookup()} disabled={loading} className="btn-primary px-4 flex items-center gap-2 disabled:opacity-60">
          {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Lookup'}
        </button>
        <button onClick={() => { setInput(''); lookup('') }} className="btn-secondary px-3 text-xs">My IP</button>
      </div>

      {/* Quick IPs */}
      <div className="flex flex-wrap gap-1.5">
        {SAMPLE_IPS.map(ip => (
          <button key={ip} onClick={() => { setInput(ip); lookup(ip) }}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors font-mono">
            {ip}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">{error}</p>}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      )}

      {info && !loading && (
        <>
          {/* IP header */}
          <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-xl">
            {flag && <img src={flag} alt={info.country_code} className="h-6 rounded shadow-sm" />}
            <div>
              <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">{info.ip}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{info.city}, {info.region}, {info.country_name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">IPv{info.version}</p>
              {info.in_eu && <span className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">EU</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoBlock icon={<MapPin size={14} />} title="Location">
              <Row label="City" value={info.city} />
              <Row label="Region" value={`${info.region} (${info.region_code})`} />
              <Row label="Country" value={`${info.country_name} (${info.country_code})`} />
              <Row label="Continent" value={info.continent_code} />
              <Row label="Postal" value={info.postal} />
              <Row label="Latitude" value={info.latitude} />
              <Row label="Longitude" value={info.longitude} />
            </InfoBlock>

            <InfoBlock icon={<Globe size={14} />} title="Timezone & Locale">
              <Row label="Timezone" value={info.timezone} />
              <Row label="UTC Offset" value={info.utc_offset} />
              <Row label="Currency" value={info.currency} />
              <Row label="Languages" value={info.languages} />
              <Row label="Calling Code" value={info.country_calling_code} />
            </InfoBlock>

            <InfoBlock icon={<Building size={14} />} title="Network">
              <Row label="ASN" value={info.asn} />
              <Row label="Organization" value={info.org} />
              {info.hostname && <Row label="Hostname" value={info.hostname} />}
            </InfoBlock>

            <InfoBlock icon={<Wifi size={14} />} title="Map">
              <a
                href={`https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}&zoom=10`}
                target="_blank" rel="noopener noreferrer"
                className="block text-xs text-primary-600 dark:text-primary-400 hover:underline mb-2"
              >
                📍 View on OpenStreetMap →
              </a>
              <p className="text-xs font-mono text-gray-500">{info.latitude?.toFixed(4)}, {info.longitude?.toFixed(4)}</p>
            </InfoBlock>
          </div>
        </>
      )}

      <p className="text-[11px] text-gray-400">Powered by ipapi.co — rate limited to 1000 requests/day for free use</p>
    </div>
  )
}
