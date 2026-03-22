import { useState } from 'react'
import { Copy, Check, Monitor, Smartphone, Tablet, Server } from 'lucide-react'

interface ParsedUA {
  browser: { name: string; version: string; engine: string }
  os: { name: string; version: string; platform: string }
  device: { type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'; brand?: string; model?: string }
  raw: string
}

function parseUA(ua: string): ParsedUA {
  const s = ua
  // Browser
  let browser = { name: 'Unknown', version: '', engine: '' }
  let os = { name: 'Unknown', version: '', platform: '' }
  let device: ParsedUA['device'] = { type: 'unknown' }

  // Engine
  if (/Trident\//.test(s)) browser.engine = 'Trident'
  else if (/EdgeHTML\//.test(s)) browser.engine = 'EdgeHTML'
  else if (/Blink/.test(s) || /Chrome\//.test(s)) browser.engine = 'Blink'
  else if (/Gecko\//.test(s)) browser.engine = 'Gecko'
  else if (/WebKit\//.test(s)) browser.engine = 'WebKit'

  // Browser detection (order matters)
  let m: RegExpMatchArray | null
  if ((m = s.match(/Edg\/([^\s]+)/))) { browser = { name: 'Edge (Chromium)', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/Edge\/([^\s]+)/))) { browser = { name: 'Edge (Legacy)', version: m[1], engine: 'EdgeHTML' } }
  else if ((m = s.match(/OPR\/([^\s]+)/)) || (m = s.match(/Opera\/([^\s;)]+)/))) { browser = { name: 'Opera', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/SamsungBrowser\/([^\s]+)/))) { browser = { name: 'Samsung Browser', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/UCBrowser\/([^\s]+)/))) { browser = { name: 'UC Browser', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/YaBrowser\/([^\s]+)/))) { browser = { name: 'Yandex Browser', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/Brave\/([^\s]+)/))) { browser = { name: 'Brave', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/Vivaldi\/([^\s]+)/))) { browser = { name: 'Vivaldi', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/CriOS\/([^\s]+)/))) { browser = { name: 'Chrome (iOS)', version: m[1], engine: 'WebKit' } }
  else if ((m = s.match(/FxiOS\/([^\s]+)/))) { browser = { name: 'Firefox (iOS)', version: m[1], engine: 'WebKit' } }
  else if ((m = s.match(/Chrome\/([^\s]+)/))) { browser = { name: 'Chrome', version: m[1], engine: 'Blink' } }
  else if ((m = s.match(/Firefox\/([^\s]+)/))) { browser = { name: 'Firefox', version: m[1], engine: 'Gecko' } }
  else if ((m = s.match(/Version\/([^\s]+).*Safari/))) { browser = { name: 'Safari', version: m[1], engine: 'WebKit' } }
  else if ((m = s.match(/MSIE ([^;)]+)/))) { browser = { name: 'Internet Explorer', version: m[1], engine: 'Trident' } }
  else if (/Trident\/.*rv:([^)]+)/.test(s)) { browser = { name: 'Internet Explorer 11', version: (s.match(/rv:([^)]+)/) ?? [])[1] ?? '', engine: 'Trident' } }
  else if ((m = s.match(/HeadlessChrome\/([^\s]+)/))) { browser = { name: 'Headless Chrome', version: m[1], engine: 'Blink' } }

  // OS detection
  if ((m = s.match(/Windows NT ([^\s;)]+)/))) {
    const ver: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' }
    os = { name: 'Windows', version: ver[m[1]] ?? m[1], platform: 'desktop' }
  } else if ((m = s.match(/Mac OS X ([^\s;)]+)/))) {
    os = { name: 'macOS', version: m[1].replace(/_/g, '.'), platform: 'desktop' }
  } else if ((m = s.match(/iPhone OS ([^\s;)]+)/))) {
    os = { name: 'iOS', version: m[1].replace(/_/g, '.'), platform: 'mobile' }
  } else if ((m = s.match(/iPad.*OS ([^\s;)]+)/))) {
    os = { name: 'iPadOS', version: m[1].replace(/_/g, '.'), platform: 'tablet' }
  } else if ((m = s.match(/Android ([^\s;)]+)/))) {
    os = { name: 'Android', version: m[1], platform: /Mobile/.test(s) ? 'mobile' : 'tablet' }
  } else if (/Linux/.test(s)) {
    os = { name: 'Linux', version: '', platform: 'desktop' }
  } else if (/CrOS/.test(s)) {
    os = { name: 'ChromeOS', version: '', platform: 'desktop' }
  }

  // Device type
  const isBot = /bot|crawler|spider|scraper|curl|wget|python|java\/|httpclient/i.test(s)
  if (isBot) {
    device = { type: 'bot' }
  } else if (/iPad/.test(s) || os.platform === 'tablet') {
    device = { type: 'tablet' }
    if ((m = s.match(/iPad/))) device.model = 'iPad'
  } else if (/Mobile|iPhone|Android.*Mobile|BlackBerry|Windows Phone/i.test(s)) {
    device = { type: 'mobile' }
    if ((m = s.match(/; ([^;)]+) Build/))) device.model = m[1]
    else if (/iPhone/.test(s)) device.model = 'iPhone'
    if (/Samsung/.test(s)) device.brand = 'Samsung'
    else if (/Xiaomi|MIUI/.test(s)) device.brand = 'Xiaomi'
    else if (/Huawei|HUAWEI/.test(s)) device.brand = 'Huawei'
    else if (/iPhone|iPad/.test(s)) device.brand = 'Apple'
    else if (/OnePlus/.test(s)) device.brand = 'OnePlus'
    else if (/Google/.test(s)) device.brand = 'Google'
  } else if (os.platform === 'desktop' || os.name === 'Windows' || os.name === 'macOS' || os.name === 'Linux') {
    device = { type: 'desktop' }
  }

  return { browser, os, device, raw: ua }
}

const SAMPLES = [
  { label: 'Chrome Win', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { label: 'Firefox Mac', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { label: 'Safari iOS', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' },
  { label: 'Chrome Android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36' },
  { label: 'Edge', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
  { label: 'Bot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
]

function DeviceIcon({ type }: { type: ParsedUA['device']['type'] }) {
  const cls = 'text-primary-500'
  if (type === 'mobile') return <Smartphone size={32} className={cls} />
  if (type === 'tablet') return <Tablet size={32} className={cls} />
  if (type === 'bot') return <Server size={32} className={cls} />
  return <Monitor size={32} className={cls} />
}

export default function UserAgentParser() {
  const [ua, setUa] = useState(SAMPLES[0].ua)
  const [copied, setCopied] = useState(false)

  const useCurrentUA = () => setUa(navigator.userAgent)
  const parsed = parseUA(ua)

  const copy = async () => {
    await navigator.clipboard.writeText(ua)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) =>
    value ? (
      <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
      </div>
    ) : null

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={useCurrentUA} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white">
          📍 Your Browser
        </button>
        {SAMPLES.map(s => (
          <button key={s.label} onClick={() => setUa(s.ua)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400 transition-colors">
            {s.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <textarea
          value={ua}
          onChange={e => setUa(e.target.value)}
          rows={3}
          spellCheck={false}
          className="tool-textarea font-mono text-xs resize-none"
          placeholder="Paste a User-Agent string..."
        />
        <button onClick={copy} className="absolute top-2 right-2 btn-ghost text-xs px-2 py-1 flex items-center gap-1">
          {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Device icon */}
        <div className="flex flex-col items-center justify-center bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 rounded-xl p-5 gap-2">
          <DeviceIcon type={parsed.device.type} />
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 capitalize">{parsed.device.type}</p>
          {parsed.device.brand && <p className="text-xs text-gray-400">{parsed.device.brand}</p>}
          {parsed.device.model && <p className="text-xs text-gray-400">{parsed.device.model}</p>}
        </div>

        {/* Details */}
        <div className="sm:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Browser</p>
              <InfoRow label="Name" value={parsed.browser.name} />
              <InfoRow label="Version" value={parsed.browser.version} />
              <InfoRow label="Engine" value={parsed.browser.engine} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Operating System</p>
              <InfoRow label="Name" value={parsed.os.name} />
              <InfoRow label="Version" value={parsed.os.version} />
              <InfoRow label="Platform" value={parsed.os.platform} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
