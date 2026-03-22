import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'

const LITELLM_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json'

const PROVIDER_MAP: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'vertex_ai-language-models': 'Google',
  gemini: 'Google',
  mistral: 'Mistral',
  cohere_chat: 'Cohere',
  together_ai: 'Together AI',
}

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'Together AI']

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Anthropic: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  Google: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Mistral: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  Cohere: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  'Together AI': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
}

interface ModelInfo {
  key: string
  provider: string
  inputPer1M: number
  outputPer1M: number
  maxInputTokens: number
  maxOutputTokens: number
  supportsVision: boolean
  supportsFunctions: boolean
  supportsReasoning: boolean
}

function fmtCtx(n: number): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function fmtPrice(n: number): string {
  return `$${n.toFixed(n < 0.1 ? 4 : 2)}`
}

const COMPARE_ROWS = [
  { label: 'Provider', render: (m: ModelInfo) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROVIDER_COLORS[m.provider] ?? ''}`}>{m.provider}</span> },
  { label: 'Input /1M', render: (m: ModelInfo) => <span className="font-mono font-semibold">{fmtPrice(m.inputPer1M)}</span> },
  { label: 'Output /1M', render: (m: ModelInfo) => <span className="font-mono font-semibold">{fmtPrice(m.outputPer1M)}</span> },
  { label: 'Context', render: (m: ModelInfo) => fmtCtx(m.maxInputTokens) },
  { label: 'Max output', render: (m: ModelInfo) => fmtCtx(m.maxOutputTokens) },
  { label: 'Vision', render: (m: ModelInfo) => m.supportsVision ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300 dark:text-gray-700">—</span> },
  { label: 'Functions', render: (m: ModelInfo) => m.supportsFunctions ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300 dark:text-gray-700">—</span> },
  { label: 'Reasoning', render: (m: ModelInfo) => m.supportsReasoning ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300 dark:text-gray-700">—</span> },
]

export default function AiModelComparison() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'key' | 'inputPer1M' | 'outputPer1M' | 'maxInputTokens'>('inputPer1M')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'compare' | 'browse'>('browse')

  useEffect(() => {
    fetch(LITELLM_URL)
      .then(r => r.json())
      .then((data: Record<string, Record<string, unknown>>) => {
        const list: ModelInfo[] = []
        for (const [key, val] of Object.entries(data)) {
          const p = PROVIDER_MAP[val.litellm_provider as string]
          if (!p) continue
          if (val.mode !== 'chat') continue
          if (!val.input_cost_per_token || !val.output_cost_per_token) continue
          if (key.includes('/')) continue
          list.push({
            key,
            provider: p,
            inputPer1M: (val.input_cost_per_token as number) * 1_000_000,
            outputPer1M: (val.output_cost_per_token as number) * 1_000_000,
            maxInputTokens: (val.max_input_tokens as number) ?? 0,
            maxOutputTokens: (val.max_output_tokens as number) ?? 0,
            supportsVision: !!(val.supports_vision),
            supportsFunctions: !!(val.supports_function_calling),
            supportsReasoning: !!(val.supports_reasoning),
          })
        }
        setModels(list)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load model data'); setLoading(false) })
  }, [])

  const PROVIDERS_ALL = ['All', ...PROVIDER_ORDER.filter(p => models.some(m => m.provider === p))]

  const toggleSelect = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 4 ? [...prev, key] : prev
    )
  }

  const selectedModels = selected.map(k => models.find(m => m.key === k)!).filter(Boolean)

  const filtered = models
    .filter(m => filter === 'All' || m.provider === filter)
    .filter(m => !search || m.key.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'key' ? a.key.localeCompare(b.key) : a[sortBy] - b[sortBy])

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading model data…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
  )

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          {([{ v: 'browse', label: 'Browse All' }, { v: 'compare', label: `Compare${selected.length ? ` (${selected.length})` : ''}` }] as const).map(t => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`px-3 py-1.5 font-medium transition-colors ${tab === t.v ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'browse' && selected.length > 0 && (
          <button onClick={() => setTab('compare')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-1">
            View comparison →
          </button>
        )}
      </div>

      {/* Compare view */}
      {tab === 'compare' && (
        <div>
          {selectedModels.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <p className="text-sm">No models selected.</p>
              <button onClick={() => setTab('browse')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1">
                Go to Browse to select models
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 w-28">Feature</th>
                    {selectedModels.map(m => (
                      <th key={m.key} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROVIDER_COLORS[m.provider] ?? ''}`}>{m.provider}</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate" title={m.key}>{m.key}</span>
                          <button onClick={() => toggleSelect(m.key)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {COMPARE_ROWS.map(row => (
                    <tr key={row.label} className="bg-white dark:bg-gray-900">
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">{row.label}</td>
                      {selectedModels.map(m => (
                        <td key={m.key} className="px-4 py-3 text-center text-sm text-gray-800 dark:text-gray-200">
                          {row.render(m)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Browse view */}
      {tab === 'browse' && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-40 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Search model…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {PROVIDERS_ALL.map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {p}
              </button>
            ))}
            <select
              className="ml-auto text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="key">Sort: Name</option>
              <option value="inputPer1M">Sort: Input price ↑</option>
              <option value="outputPer1M">Sort: Output price ↑</option>
              <option value="maxInputTokens">Sort: Context ↑</option>
            </select>
            <span className="text-xs text-gray-400 dark:text-gray-600">{filtered.length} models</span>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">Comparing:</span>
              {selected.map(k => (
                <span key={k} className="flex items-center gap-1 text-xs bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-700 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-300">
                  {k}
                  <button onClick={() => toggleSelect(k)}><X size={10} /></button>
                </span>
              ))}
              <button onClick={() => setTab('compare')} className="ml-auto text-xs btn-primary py-1 px-3">Compare →</button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">Model</th>
                  <th className="text-right px-4 py-3 font-medium">Context</th>
                  <th className="text-right px-4 py-3 font-medium">Input /1M</th>
                  <th className="text-right px-4 py-3 font-medium">Output /1M</th>
                  <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Vision</th>
                  <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Fn</th>
                  <th className="text-center px-4 py-3 font-medium">Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(m => {
                  const isSelected = selected.includes(m.key)
                  return (
                    <tr key={m.key} className={`transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PROVIDER_COLORS[m.provider] ?? ''}`}>{m.provider}</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{m.key}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">{fmtCtx(m.maxInputTokens)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-800 dark:text-gray-200">{fmtPrice(m.inputPer1M)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-800 dark:text-gray-200">{fmtPrice(m.outputPer1M)}</td>
                      <td className="px-4 py-2.5 text-center hidden sm:table-cell">{m.supportsVision ? <span className="text-green-500">✓</span> : <span className="text-gray-300 dark:text-gray-700">—</span>}</td>
                      <td className="px-4 py-2.5 text-center hidden sm:table-cell">{m.supportsFunctions ? <span className="text-green-500">✓</span> : <span className="text-gray-300 dark:text-gray-700">—</span>}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggleSelect(m.key)}
                          disabled={!isSelected && selected.length >= 4}
                          className={`p-1 rounded-full transition-colors ${isSelected ? 'bg-primary-600 text-white' : selected.length >= 4 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
                        >
                          {isSelected ? <X size={13} /> : <Plus size={13} />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        * Live data from <a href="https://github.com/BerriAI/litellm" target="_blank" rel="noopener noreferrer" className="underline">LiteLLM</a>. Max 4 models for comparison.
      </p>
    </div>
  )
}
