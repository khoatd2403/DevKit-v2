import { useState } from 'react'
import { Copy, Check, Info } from 'lucide-react'

type Tab = 'cors' | 'csp' | 'hsts' | 'xheaders' | 'permissions'

/* ── tiny copy hook ── */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }
  return { copied, copy }
}

/* ── CopyBtn ── */
function CopyBtn({ text, id, copied, copy }: { text: string; id: string; copied: string | null; copy: (t: string, k: string) => void }) {
  return (
    <button
      onClick={() => copy(text, id)}
      className="btn-ghost text-xs flex items-center gap-1"
    >
      {copied === id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied === id ? 'Copied!' : 'Copy'}
    </button>
  )
}

/* ── Header display row ── */
function HeaderRow({ label, value, id, copied, copy, explanation }: {
  label: string; value: string; id: string
  copied: string | null; copy: (t: string, k: string) => void
  explanation: string
}) {
  const full = `${label}: ${value}`
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
        <CopyBtn text={full} id={id} copied={copied} copy={copy} />
      </div>
      <code className="block font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 break-all whitespace-pre-wrap">
        {value || <span className="text-gray-400 italic">not configured</span>}
      </code>
      <div className="flex gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-lg px-3 py-2">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>{explanation}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   CORS TAB
══════════════════════════════════════════════ */
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
const COMMON_HEADERS = ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-API-Key']

function CorsTab() {
  const { copied, copy } = useCopy()
  const [origin, setOrigin] = useState('*')
  const [methods, setMethods] = useState<string[]>(['GET', 'POST'])
  const [allowHeaders, setAllowHeaders] = useState(true)
  const [customHeaders, setCustomHeaders] = useState('Content-Type, Authorization')
  const [credentials, setCredentials] = useState(false)
  const [maxAge, setMaxAge] = useState(86400)
  const [exposeHeaders, setExposeHeaders] = useState('')

  const toggleMethod = (m: string) =>
    setMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const headers = [
    {
      id: 'acao', label: 'Access-Control-Allow-Origin',
      value: origin || '*',
      explanation: 'Specifies which origins can access the resource. Use * for all origins or a specific origin for credentialed requests.',
    },
    {
      id: 'acam', label: 'Access-Control-Allow-Methods',
      value: methods.join(', '),
      explanation: 'Lists the HTTP methods allowed when accessing the resource in a cross-origin request.',
    },
    ...(allowHeaders ? [{
      id: 'acah', label: 'Access-Control-Allow-Headers',
      value: customHeaders,
      explanation: 'Indicates which headers can be used during the actual request. Required when request uses custom headers.',
    }] : []),
    ...(credentials ? [{
      id: 'acac', label: 'Access-Control-Allow-Credentials',
      value: 'true',
      explanation: 'Allows cookies and authorization headers to be sent with cross-origin requests. Origin must not be * when this is true.',
    }] : []),
    {
      id: 'acma', label: 'Access-Control-Max-Age',
      value: String(maxAge),
      explanation: 'How long (in seconds) the browser should cache preflight request results, avoiding repeated OPTIONS requests.',
    },
    ...(exposeHeaders ? [{
      id: 'aceh', label: 'Access-Control-Expose-Headers',
      value: exposeHeaders,
      explanation: 'Headers that browsers are allowed to access from JavaScript beyond the safe headers.',
    }] : []),
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text block mb-1">Allowed Origin</label>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            placeholder="* or https://example.com"
          />
          <p className="text-xs text-gray-400 mt-1">Use * for all, or specific URL. Cannot use * with credentials.</p>
        </div>
        <div>
          <label className="label-text block mb-1">Max Age (seconds)</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={86400} step={300}
              value={maxAge} onChange={e => setMaxAge(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300 w-16 text-right">{maxAge}s</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Preflight cache duration. 86400 = 24 hours.</p>
        </div>
      </div>

      <div>
        <label className="label-text block mb-2">Allowed Methods</label>
        <div className="flex flex-wrap gap-2">
          {HTTP_METHODS.map(m => (
            <button
              key={m}
              onClick={() => toggleMethod(m)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                methods.includes(m)
                  ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={allowHeaders} onChange={e => setAllowHeaders(e.target.checked)} className="rounded" />
            <span className="label-text">Allow Custom Headers</span>
          </label>
          {allowHeaders && (
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              value={customHeaders}
              onChange={e => setCustomHeaders(e.target.value)}
              placeholder="Content-Type, Authorization"
            />
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {COMMON_HEADERS.map(h => (
              <button key={h} onClick={() => {
                const current = customHeaders.split(',').map(s => s.trim()).filter(Boolean)
                if (!current.includes(h)) setCustomHeaders([...current, h].join(', '))
              }} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                +{h}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={credentials} onChange={e => setCredentials(e.target.checked)} className="rounded" />
            <span className="label-text">Allow Credentials</span>
          </label>
          <div>
            <label className="label-text block mb-1">Expose Headers (optional)</label>
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              value={exposeHeaders}
              onChange={e => setExposeHeaders(e.target.value)}
              placeholder="X-Custom-Header"
            />
          </div>
        </div>
      </div>

      {credentials && origin === '*' && (
        <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          Warning: Allow-Credentials cannot be used with Access-Control-Allow-Origin: *. Specify an exact origin.
        </div>
      )}

      <div className="space-y-3">
        {headers.map(h => (
          <HeaderRow key={h.id} {...h} copied={copied} copy={copy} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   CSP TAB
══════════════════════════════════════════════ */
type CSPDirective = {
  name: string
  values: string[]
  custom: string
}

const CSP_DIRECTIVES = [
  'default-src', 'script-src', 'style-src', 'img-src',
  'font-src', 'connect-src', 'media-src', 'object-src',
  'frame-src', 'worker-src', 'manifest-src', 'form-action',
]
const CSP_VALUES = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", 'https:', 'data:', 'blob:']

function CspTab() {
  const { copied, copy } = useCopy()
  const [directives, setDirectives] = useState<CSPDirective[]>([
    { name: 'default-src', values: ["'self'"], custom: '' },
    { name: 'script-src', values: ["'self'"], custom: '' },
    { name: 'style-src', values: ["'self'", "'unsafe-inline'"], custom: '' },
    { name: 'img-src', values: ["'self'", 'data:'], custom: '' },
  ])

  const addDirective = (name: string) => {
    if (directives.some(d => d.name === name)) return
    setDirectives(prev => [...prev, { name, values: [], custom: '' }])
  }

  const removeDirective = (name: string) =>
    setDirectives(prev => prev.filter(d => d.name !== name))

  const toggleValue = (dName: string, val: string) =>
    setDirectives(prev => prev.map(d =>
      d.name === dName
        ? { ...d, values: d.values.includes(val) ? d.values.filter(v => v !== val) : [...d.values, val] }
        : d
    ))

  const updateCustom = (dName: string, custom: string) =>
    setDirectives(prev => prev.map(d => d.name === dName ? { ...d, custom } : d))

  const cspValue = directives
    .filter(d => d.values.length > 0 || d.custom.trim())
    .map(d => {
      const vals = [...d.values, ...(d.custom.trim() ? d.custom.trim().split(/\s+/) : [])]
      return `${d.name} ${vals.join(' ')}`
    })
    .join('; ')

  const unusedDirectives = CSP_DIRECTIVES.filter(n => !directives.some(d => d.name === n))

  return (
    <div className="space-y-4">
      {/* Add directive */}
      <div>
        <label className="label-text block mb-2">Add Directive</label>
        <div className="flex flex-wrap gap-2">
          {unusedDirectives.map(n => (
            <button key={n} onClick={() => addDirective(n)}
              className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-400 rounded-lg px-3 py-1 text-gray-600 dark:text-gray-400 font-mono transition-colors">
              + {n}
            </button>
          ))}
        </div>
      </div>

      {/* Directive builders */}
      <div className="space-y-3">
        {directives.map(d => (
          <div key={d.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">{d.name}</span>
              <button onClick={() => removeDirective(d.name)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400">Remove</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {CSP_VALUES.map(val => (
                <button
                  key={val}
                  onClick={() => toggleValue(d.name, val)}
                  className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                    d.values.includes(val)
                      ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Custom values (space-separated)…"
              value={d.custom}
              onChange={e => updateCustom(d.name, e.target.value)}
            />
          </div>
        ))}
      </div>

      <HeaderRow
        id="csp" label="Content-Security-Policy"
        value={cspValue || "default-src 'self'"}
        copied={copied} copy={copy}
        explanation="Restricts the sources of content that browsers are allowed to load. Prevents XSS, clickjacking and data injection attacks."
      />
    </div>
  )
}

/* ══════════════════════════════════════════════
   HSTS TAB
══════════════════════════════════════════════ */
function HstsTab() {
  const { copied, copy } = useCopy()
  const [maxAge, setMaxAge] = useState(31536000)
  const [subDomains, setSubDomains] = useState(true)
  const [preload, setPreload] = useState(false)

  const PRESETS = [
    { label: '5 min', val: 300 },
    { label: '1 hour', val: 3600 },
    { label: '1 day', val: 86400 },
    { label: '1 week', val: 604800 },
    { label: '1 month', val: 2592000 },
    { label: '1 year', val: 31536000 },
  ]

  const parts = [`max-age=${maxAge}`]
  if (subDomains) parts.push('includeSubDomains')
  if (preload) parts.push('preload')
  const value = parts.join('; ')

  return (
    <div className="space-y-4">
      <div>
        <label className="label-text block mb-2">Max Age: {maxAge.toLocaleString()}s</label>
        <input type="range" min={0} max={63072000} step={86400} value={maxAge}
          onChange={e => setMaxAge(Number(e.target.value))} className="w-full" />
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setMaxAge(p.val)}
              className={`btn-secondary text-xs px-2 py-1 ${maxAge === p.val ? 'ring-2 ring-primary-400' : ''}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={subDomains} onChange={e => setSubDomains(e.target.checked)} className="rounded" />
          <div>
            <span className="label-text">includeSubDomains</span>
            <p className="text-xs text-gray-400">Apply HSTS to all subdomains too</p>
          </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={preload} onChange={e => setPreload(e.target.checked)} className="rounded" />
          <div>
            <span className="label-text">preload</span>
            <p className="text-xs text-gray-400">Submit to browser preload lists (requires max-age ≥ 31536000 and includeSubDomains)</p>
          </div>
        </label>
      </div>

      {preload && (maxAge < 31536000 || !subDomains) && (
        <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          Preload requires max-age ≥ 31536000 (1 year) and includeSubDomains enabled.
        </div>
      )}

      <HeaderRow
        id="hsts" label="Strict-Transport-Security"
        value={value} copied={copied} copy={copy}
        explanation="Forces browsers to use HTTPS for all future connections. Protects against protocol downgrade attacks and cookie hijacking."
      />
    </div>
  )
}

/* ══════════════════════════════════════════════
   X-HEADERS TAB
══════════════════════════════════════════════ */
function XHeadersTab() {
  const { copied, copy } = useCopy()
  const [frameOptions, setFrameOptions] = useState('SAMEORIGIN')
  const [contentTypeOptions, setContentTypeOptions] = useState('nosniff')
  const [xssProtection, setXssProtection] = useState('1; mode=block')
  const [referrerPolicy, setReferrerPolicy] = useState('strict-origin-when-cross-origin')
  const [permittedPolicies, setPermittedPolicies] = useState('none')

  const headers = [
    {
      id: 'xfo', label: 'X-Frame-Options',
      value: frameOptions,
      explanation: 'Controls whether the page can be embedded in iframes. Prevents clickjacking attacks.',
      options: ['DENY', 'SAMEORIGIN'],
    },
    {
      id: 'xcto', label: 'X-Content-Type-Options',
      value: contentTypeOptions,
      explanation: 'Prevents browsers from MIME-sniffing a response away from the declared Content-Type. Always use nosniff.',
      options: ['nosniff'],
    },
    {
      id: 'xxp', label: 'X-XSS-Protection',
      value: xssProtection,
      explanation: 'Legacy XSS filter directive (deprecated in modern browsers). Use CSP instead. The value 1; mode=block blocks the page on XSS detection.',
      options: ['0', '1', '1; mode=block'],
    },
    {
      id: 'rp', label: 'Referrer-Policy',
      value: referrerPolicy,
      explanation: 'Controls how much referrer information is sent with requests. strict-origin-when-cross-origin is the modern recommended default.',
      options: ['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url'],
    },
    {
      id: 'xpp', label: 'X-Permitted-Cross-Domain-Policies',
      value: permittedPolicies,
      explanation: 'Controls whether Adobe Flash/Reader can access data from your domain. Use none unless specifically needed.',
      options: ['none', 'master-only', 'by-content-type', 'all'],
    },
  ]

  const setters: Record<string, (v: string) => void> = {
    xfo: setFrameOptions,
    xcto: setContentTypeOptions,
    xxp: setXssProtection,
    rp: setReferrerPolicy,
    xpp: setPermittedPolicies,
  }
  const values: Record<string, string> = {
    xfo: frameOptions, xcto: contentTypeOptions, xxp: xssProtection,
    rp: referrerPolicy, xpp: permittedPolicies,
  }

  return (
    <div className="space-y-4">
      {headers.map(h => (
        <div key={h.id} className="space-y-2">
          <div>
            <label className="label-text block mb-1">{h.label}</label>
            <select
              value={values[h.id]}
              onChange={e => setters[h.id]?.(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {h.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <HeaderRow id={h.id} label={h.label} value={values[h.id] ?? ''} copied={copied} copy={copy} explanation={h.explanation} />
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PERMISSIONS POLICY TAB
══════════════════════════════════════════════ */
type PermValue = 'none' | 'self' | 'all'
type PermFeature = { name: string; value: PermValue }

const PERM_FEATURES = [
  'camera', 'microphone', 'geolocation', 'payment', 'usb',
  'fullscreen', 'display-capture', 'autoplay', 'accelerometer',
  'ambient-light-sensor', 'battery', 'bluetooth', 'gyroscope',
  'magnetometer', 'midi', 'screen-wake-lock', 'serial', 'xr-spatial-tracking',
]

function PermissionsTab() {
  const { copied, copy } = useCopy()
  const [features, setFeatures] = useState<PermFeature[]>(
    PERM_FEATURES.map(name => ({ name, value: 'none' }))
  )

  const setFeatureValue = (name: string, value: PermValue) =>
    setFeatures(prev => prev.map(f => f.name === name ? { ...f, value } : f))

  const toPermString = (val: PermValue) => {
    if (val === 'none') return '()'
    if (val === 'self') return '(self)'
    return '*'
  }

  const policyValue = features
    .filter(f => f.value !== 'all')
    .map(f => `${f.name}=${toPermString(f.value)}`)
    .join(', ')

  const colours: Record<PermValue, string> = {
    none: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    self: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
    all: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map(f => (
          <div key={f.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{f.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colours[f.value]}`}>
                {f.value === 'none' ? 'Blocked' : f.value === 'self' ? 'Same-origin' : 'All'}
              </span>
            </div>
            <div className="flex gap-1">
              {(['none', 'self', 'all'] as PermValue[]).map(v => (
                <button
                  key={v}
                  onClick={() => setFeatureValue(f.name, v)}
                  className={`flex-1 py-1 text-xs rounded border transition-colors ${
                    f.value === v
                      ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <HeaderRow
        id="pp" label="Permissions-Policy"
        value={policyValue || 'camera=(), microphone=(), geolocation=()'}
        copied={copied} copy={copy}
        explanation="Controls browser features and APIs available to the page and embedded content. Formerly Feature-Policy. Use () to block a feature entirely."
      />
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const TABS: { id: Tab; label: string }[] = [
  { id: 'cors', label: 'CORS' },
  { id: 'csp', label: 'CSP' },
  { id: 'hsts', label: 'HSTS' },
  { id: 'xheaders', label: 'X-Headers' },
  { id: 'permissions', label: 'Permissions Policy' },
]

export default function HttpHeadersBuilder() {
  const [tab, setTab] = useState<Tab>('cors')

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-max px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cors' && <CorsTab />}
      {tab === 'csp' && <CspTab />}
      {tab === 'hsts' && <HstsTab />}
      {tab === 'xheaders' && <XHeadersTab />}
      {tab === 'permissions' && <PermissionsTab />}
    </div>
  )
}
