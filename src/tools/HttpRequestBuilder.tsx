import { useState, useCallback } from 'react'
import { Plus, Trash2, Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
type BodyType = 'none' | 'json' | 'form' | 'text'
type CodeLang = 'fetch' | 'axios' | 'curl' | 'python'

interface KV { key: string; value: string; enabled: boolean }

const METHOD_COLORS: Record<Method, string> = {
  GET:     'text-green-600 dark:text-green-400',
  POST:    'text-blue-600 dark:text-blue-400',
  PUT:     'text-yellow-600 dark:text-yellow-400',
  PATCH:   'text-orange-600 dark:text-orange-400',
  DELETE:  'text-red-600 dark:text-red-400',
  HEAD:    'text-purple-600 dark:text-purple-400',
  OPTIONS: 'text-gray-600 dark:text-gray-400',
}

const SAMPLES = [
  { label: 'GET JSONPlaceholder', method: 'GET' as Method, url: 'https://jsonplaceholder.typicode.com/posts/1', headers: [], body: '', bodyType: 'none' as BodyType },
  { label: 'POST create', method: 'POST' as Method, url: 'https://jsonplaceholder.typicode.com/posts', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }], body: JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2), bodyType: 'json' as BodyType },
  { label: 'GET with params', method: 'GET' as Method, url: 'https://jsonplaceholder.typicode.com/posts', headers: [], body: '', bodyType: 'none' as BodyType },
]

function buildCodeSnippet(method: Method, url: string, headers: KV[], body: string, bodyType: BodyType, lang: CodeLang): string {
  const activeHeaders = headers.filter(h => h.enabled && h.key)
  const headersObj = Object.fromEntries(activeHeaders.map(h => [h.key, h.value]))
  const hasBody = bodyType !== 'none' && body.trim()

  if (lang === 'fetch') {
    const opts: string[] = [`method: '${method}'`]
    if (Object.keys(headersObj).length) opts.push(`headers: ${JSON.stringify(headersObj, null, 2)}`)
    if (hasBody) opts.push(`body: ${bodyType === 'json' ? 'JSON.stringify(data)' : `\`${body.replace(/`/g, '\\`')}\``}`)
    return `const response = await fetch('${url}', {\n  ${opts.join(',\n  ')}\n});\nconst data = await response.json();\nconsole.log(data);`
  }

  if (lang === 'axios') {
    const config: string[] = []
    if (Object.keys(headersObj).length) config.push(`  headers: ${JSON.stringify(headersObj, null, 2)}`)
    if (hasBody && bodyType !== 'json') config.push(`  data: \`${body.replace(/`/g, '\\`')}\``)
    const dataArg = hasBody && bodyType === 'json' ? `, ${body}` : ''
    const configStr = config.length ? `, {\n${config.join(',\n')}\n}` : ''
    const methodLower = method.toLowerCase()
    if (method === 'GET' || method === 'DELETE' || method === 'HEAD') {
      return `const { data } = await axios.${methodLower}('${url}'${configStr});\nconsole.log(data);`
    }
    return `const { data } = await axios.${methodLower}('${url}'${dataArg}${configStr});\nconsole.log(data);`
  }

  if (lang === 'curl') {
    const parts = [`curl -X ${method} '${url}'`]
    for (const [k, v] of Object.entries(headersObj)) parts.push(`  -H '${k}: ${v}'`)
    if (hasBody) parts.push(`  -d '${body.replace(/'/g, "\\'")}'`)
    return parts.join(' \\\n')
  }

  if (lang === 'python') {
    const lines = ['import requests', '']
    if (Object.keys(headersObj).length) lines.push(`headers = ${JSON.stringify(headersObj, null, 4)}`, '')
    if (hasBody) lines.push(`data = ${body}`, '')
    const args = [`'${url}'`]
    if (Object.keys(headersObj).length) args.push('headers=headers')
    if (hasBody) args.push(bodyType === 'json' ? 'json=data' : 'data=data')
    lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`)
    lines.push('print(response.json())')
    return lines.join('\n')
  }

  return ''
}

function KVEditor({ rows, onChange, placeholder = 'Key' }: { rows: KV[]; onChange: (rows: KV[]) => void; placeholder?: string }) {
  const add = () => onChange([...rows, { key: '', value: '', enabled: true }])
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i))
  const update = (i: number, field: keyof KV, val: string | boolean) =>
    onChange(rows.map((r, j) => j === i ? { ...r, [field]: val } : r))

  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input type="checkbox" checked={r.enabled} onChange={e => update(i, 'enabled', e.target.checked)}
            className="flex-shrink-0" />
          <input value={r.key} onChange={e => update(i, 'key', e.target.value)} placeholder={placeholder}
            className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          <input value={r.value} onChange={e => update(i, 'value', e.target.value)} placeholder="Value"
            className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
        <Plus size={12} /> Add
      </button>
    </div>
  )
}

export default function HttpRequestBuilder() {
  const [method, setMethod] = useState<Method>('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [headers, setHeaders] = useState<KV[]>([{ key: 'Accept', value: 'application/json', enabled: true }])
  const [params, setParams] = useState<KV[]>([])
  const [bodyType, setBodyType] = useState<BodyType>('none')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<{ status: number; statusText: string; headers: Record<string,string>; body: string; ms: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeLang, setCodeLang] = useState<CodeLang>('fetch')
  const [copied, setCopied] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [showRespHeaders, setShowRespHeaders] = useState(false)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const loadSample = (s: typeof SAMPLES[0]) => {
    setMethod(s.method); setUrl(s.url)
    setHeaders(s.headers.length ? s.headers : [{ key: 'Accept', value: 'application/json', enabled: true }])
    setBody(s.body); setBodyType(s.bodyType)
    setResponse(null); setError('')
  }

  const buildUrl = useCallback(() => {
    const active = params.filter(p => p.enabled && p.key)
    if (!active.length) return url
    const qs = active.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
    return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
  }, [url, params])

  const send = async () => {
    setLoading(true); setError(''); setResponse(null)
    const start = Date.now()
    try {
      const activeHeaders = headers.filter(h => h.enabled && h.key)
      const hdrs: Record<string, string> = Object.fromEntries(activeHeaders.map(h => [h.key, h.value]))
      const opts: RequestInit = { method, headers: hdrs }
      if (bodyType !== 'none' && body.trim()) opts.body = body

      const res = await fetch(buildUrl(), opts)
      const ms = Date.now() - start
      const text = await res.text()
      const respHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { respHeaders[k] = v })

      setResponse({ status: res.status, statusText: res.statusText, headers: respHeaders, body: text, ms })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const prettyBody = (() => {
    if (!response) return ''
    try { return JSON.stringify(JSON.parse(response.body), null, 2) } catch { return response.body }
  })()

  const statusColor = response
    ? response.status < 300 ? 'text-green-600 dark:text-green-400'
    : response.status < 400 ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'
    : ''

  const codeSnippet = buildCodeSnippet(method, buildUrl(), headers, body, bodyType, codeLang)

  return (
    <div className="space-y-4">
      {/* Samples */}
      <div className="flex flex-wrap gap-1.5">
        {SAMPLES.map(s => (
          <button key={s.label} onClick={() => loadSample(s)}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
            {s.label}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div className="flex gap-2">
        <select value={method} onChange={e => setMethod(e.target.value as Method)}
          className={`text-xs font-bold font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 focus:outline-none ${METHOD_COLORS[method]}`}>
          {(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'] as Method[]).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="https://..."
          className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-800 dark:text-gray-200" />
        <button onClick={send} disabled={loading}
          className="btn-primary px-4 flex items-center gap-2 disabled:opacity-60">
          <Send size={13} />
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs: Headers / Params / Body */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {(['Headers', 'Params', 'Body'] as const).map(tab => {
            const count = tab === 'Headers' ? headers.filter(h=>h.enabled&&h.key).length
                        : tab === 'Params' ? params.filter(p=>p.enabled&&p.key).length
                        : (bodyType !== 'none' && body.trim() ? 1 : 0)
            return (
              <button key={tab} onClick={() => {}}
                className="px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 border-b-2 border-transparent transition-colors">
                {tab} {count > 0 && <span className="ml-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full px-1.5 text-[10px]">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Headers</p>
            <KVEditor rows={headers} onChange={setHeaders} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Query Params</p>
            <KVEditor rows={params} onChange={setParams} placeholder="Param" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Body</p>
            <div className="flex gap-2 mb-2">
              {(['none','json','form','text'] as BodyType[]).map(bt => (
                <button key={bt} onClick={() => setBodyType(bt)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${bodyType === bt ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {bt}
                </button>
              ))}
            </div>
            {bodyType !== 'none' && (
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
                placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
                className="tool-textarea font-mono text-xs" />
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">{error}</p>}

      {/* Response */}
      {response && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <span className={`text-sm font-bold ${statusColor}`}>{response.status} {response.statusText}</span>
            <span className="text-xs text-gray-400">{response.ms}ms</span>
            <span className="text-xs text-gray-400">{(response.body.length / 1024).toFixed(1)} KB</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setShowRespHeaders(v => !v)} className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1">
                Headers {showRespHeaders ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
              </button>
              <button onClick={() => copy(prettyBody, 'resp')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
                {copied === 'resp' ? <Check size={11} className="text-green-500"/> : <Copy size={11}/>}
                Copy
              </button>
            </div>
          </div>
          {showRespHeaders && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-1">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-gray-400 font-mono w-48 shrink-0 truncate">{k}</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono truncate">{v}</span>
                </div>
              ))}
            </div>
          )}
          <pre className="p-4 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-72 whitespace-pre-wrap break-all">
            {prettyBody}
          </pre>
        </div>
      )}

      {/* Code snippet */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button onClick={() => setShowCode(v => !v)}
          className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-left">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Code Snippet</span>
          {showCode ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
        </button>
        {showCode && (
          <div>
            <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              {(['fetch','axios','curl','python'] as CodeLang[]).map(l => (
                <button key={l} onClick={() => setCodeLang(l)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${codeLang === l ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {l}
                </button>
              ))}
              <button onClick={() => copy(codeSnippet, 'code')} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
                {copied === 'code' ? <Check size={11} className="text-green-500"/> : <Copy size={11}/>}
                Copy
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-green-400 bg-gray-900 dark:bg-gray-950 overflow-auto whitespace-pre-wrap">
              {codeSnippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
