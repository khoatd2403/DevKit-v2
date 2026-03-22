import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import { X } from 'lucide-react'

const PLACEHOLDER = 'https://example.com:8080/path/to/page?foo=bar&baz=qux#section'

interface ParsedUrl {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  href: string
  params: [string, string][]
}

function parseUrl(raw: string): ParsedUrl | null {
  try {
    const url = new URL(raw.trim())
    const params: [string, string][] = []
    url.searchParams.forEach((val, key) => {
      params.push([key, val])
    })
    return {
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      href: url.href,
      params,
    }
  } catch {
    return null
  }
}

const FIELDS: { key: keyof Omit<ParsedUrl, 'params'>; label: string; description: string }[] = [
  { key: 'protocol', label: 'Protocol', description: 'Scheme including colon' },
  { key: 'host', label: 'Host', description: 'Hostname + port' },
  { key: 'hostname', label: 'Hostname', description: 'Domain without port' },
  { key: 'port', label: 'Port', description: 'Explicit port number' },
  { key: 'pathname', label: 'Pathname', description: 'Path component' },
  { key: 'search', label: 'Search', description: 'Raw query string' },
  { key: 'hash', label: 'Hash', description: 'Fragment identifier' },
  { key: 'origin', label: 'Origin', description: 'Protocol + host' },
  { key: 'href', label: 'Full URL', description: 'Normalized full URL' },
]

export default function UrlParser() {
  const [input, setInput] = usePersistentState('tool-url-parser-input', 'https://api.example.com:8080/v1/users?page=1&limit=10&sort=name#results')

  const isNonEmpty = input.trim().length > 0
  const parsed = isNonEmpty ? parseUrl(input) : null
  const hasError = isNonEmpty && !parsed

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">URL</label>
          {input && (
            <button
              onClick={() => setInput('')}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <input
          type="text"
          className="tool-textarea h-auto py-2 w-full font-mono text-sm"
          placeholder={PLACEHOLDER}
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {hasError && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          Invalid URL. Make sure to include the protocol (e.g. <code className="font-mono">https://</code>).
        </div>
      )}

      {parsed && (
        <>
          {/* URL Components */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">URL Components</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {FIELDS.map(({ key, label, description }) => {
                const value = parsed[key]
                return (
                  <div key={key} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-24 shrink-0">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</div>
                      <div className="text-xs text-gray-400 leading-tight">{description}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {value ? (
                        <span className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{value}</span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600 italic">empty</span>
                      )}
                    </div>
                    {value && <CopyButton text={value} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Query Parameters */}
          {parsed.params.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Query Parameters
                </span>
                <span className="text-xs text-gray-400">{parsed.params.length} param{parsed.params.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {parsed.params.map(([key, value], i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-1/3 min-w-0">
                      <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400 break-all">{key}</span>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 text-xs select-none">→</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{value}</span>
                    </div>
                    <CopyButton text={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.params.length === 0 && parsed.search === '' && (
            <div className="text-xs text-gray-400 text-center py-2">No query parameters</div>
          )}
        </>
      )}

      {!isNonEmpty && (
        <div className="text-xs text-gray-400 text-center py-4">
          Enter a URL above to parse its components
        </div>
      )}
    </div>
  )
}
