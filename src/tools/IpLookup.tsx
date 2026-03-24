import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, MapPin, Globe, Wifi, Building } from 'lucide-react'
import CopyButton from '../components/CopyButton'

interface IpInfo {
  ip: string
  type: string
  continent: string
  continent_code: string
  country: string
  country_code: string
  region: string
  region_code: string
  city: string
  latitude: number
  longitude: number
  is_eu: boolean
  postal: string
  calling_code: string
  capital: string
  flag: { img: string; emoji: string }
  connection: { asn: number; org: string; isp: string; domain: string }
  timezone: { id: string; abbr: string; utc: string; current_time: string; is_dst: boolean }
}

const SAMPLE_IPS = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9', '76.76.2.0']

function countryEmoji(code?: string): string {
  if (!code || code.length !== 2) return '🌐'
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

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
      // Provider 1: freeipapi.com
      const r1 = await fetch(ip ? `https://freeipapi.com/api/json/${ip}` : 'https://freeipapi.com/api/json/').catch(() => null)
      if (r1?.ok) {
        const d = await r1.json()
        if (d.ipAddress) {
          setInfo({
            ip: d.ipAddress,
            type: `IPv${d.ipVersion}`,
            continent: d.continent ?? '',
            continent_code: d.continentCode ?? '',
            country: d.countryName,
            country_code: d.countryCode,
            region: d.regionName,
            region_code: d.regionCode ?? '',
            city: d.cityName,
            latitude: d.latitude,
            longitude: d.longitude,
            is_eu: false,
            postal: d.zipCode ?? '',
            calling_code: '',
            capital: '',
            flag: { img: '', emoji: countryEmoji(d.countryCode) },
            connection: { asn: 0, org: d.isp ?? '', isp: d.isp ?? '', domain: '' },
            timezone: { id: d.timeZone ?? '', abbr: '', utc: d.timeZone ?? '', current_time: '', is_dst: false },
          })
          return
        }
      }

      // Provider 2: ipapi.is
      const r2 = await fetch(ip ? `https://api.ipapi.is/?q=${ip}` : 'https://api.ipapi.is/').catch(() => null)
      if (r2?.ok) {
        const d = await r2.json()
        if (d.ip) {
          setInfo({
            ip: d.ip,
            type: d.ip?.includes(':') ? 'IPv6' : 'IPv4',
            continent: d.location?.continent ?? '',
            continent_code: d.location?.continent ?? '',
            country: d.location?.country ?? '',
            country_code: d.location?.country_code ?? '',
            region: d.location?.state ?? '',
            region_code: d.location?.state ?? '',
            city: d.location?.city ?? '',
            latitude: d.location?.latitude ?? 0,
            longitude: d.location?.longitude ?? 0,
            is_eu: false,
            postal: d.location?.zip ?? '',
            calling_code: '',
            capital: '',
            flag: { img: '', emoji: countryEmoji(d.location?.country_code) },
            connection: { asn: d.asn?.asn ?? 0, org: d.asn?.org ?? '', isp: d.company?.name ?? '', domain: d.company?.domain ?? '' },
            timezone: { id: d.location?.timezone ?? '', abbr: '', utc: '', current_time: d.location?.local_time ?? '', is_dst: d.location?.is_dst ?? false },
          })
          return
        }
      }

      throw new Error('All providers failed. Try again later.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input])

  useEffect(() => { lookup('') }, [])

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
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* IP row — dark bg */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-900 dark:bg-gray-950">
              <span className="text-4xl leading-none select-none">{info.flag?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white break-all">
                    {info.ip}
                  </span>
                  <CopyButton text={info.ip} toast="IP copied" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/20">
                    {info.type}
                  </span>
                  {info.is_eu && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">🇪🇺 EU</span>
                  )}
                </div>
              </div>
            </div>
            {/* Location summary row */}
            <div className="flex items-center gap-6 px-5 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 flex-wrap border-t border-gray-200 dark:border-gray-800">
              {info.city && <span>📍 {[info.city, info.region, info.country].filter(Boolean).join(', ')}</span>}
              {info.connection?.isp && <span>🏢 {info.connection.isp}</span>}
              {info.timezone?.id && <span>🕐 {info.timezone.id}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoBlock icon={<MapPin size={14} />} title="Location">
              <Row label="City" value={info.city} />
              <Row label="Region" value={`${info.region} (${info.region_code})`} />
              <Row label="Country" value={`${info.country} (${info.country_code})`} />
              <Row label="Continent" value={`${info.continent} (${info.continent_code})`} />
              <Row label="Capital" value={info.capital} />
              <Row label="Postal" value={info.postal} />
              <Row label="Latitude" value={info.latitude} />
              <Row label="Longitude" value={info.longitude} />
            </InfoBlock>

            <InfoBlock icon={<Globe size={14} />} title="Timezone & Locale">
              <Row label="Timezone" value={info.timezone?.id} />
              <Row label="Abbreviation" value={`${info.timezone?.abbr}${info.timezone?.is_dst ? ' (DST)' : ''}`} />
              <Row label="UTC Offset" value={info.timezone?.utc} />
              <Row label="Current Time" value={info.timezone?.current_time?.slice(0, 19).replace('T', ' ')} />
              <Row label="Calling Code" value={`+${info.calling_code}`} />
            </InfoBlock>

            <InfoBlock icon={<Building size={14} />} title="Network">
              <Row label="ASN" value={`AS${info.connection?.asn}`} />
              <Row label="Organization" value={info.connection?.org} />
              <Row label="ISP" value={info.connection?.isp} />
              <Row label="Domain" value={info.connection?.domain} />
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

      <p className="text-[11px] text-gray-400">Powered by freeipapi.com / ipapi.is — free, no API key required</p>
    </div>
  )
}
