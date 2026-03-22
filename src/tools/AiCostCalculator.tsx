import { useEffect, useState } from 'react'

const LITELLM_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json'

const PROVIDER_MAP: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'vertex_ai-language-models': 'Google',
  gemini: 'Google',
  cohere_chat: 'Cohere',
  mistral: 'Mistral',
  together_ai: 'Together AI',
}

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'Together AI']

interface ModelInfo {
  key: string
  provider: string
  displayName: string
  inputPer1M: number
  outputPer1M: number
  maxInputTokens: number
}

function toDisplayName(key: string): string {
  return key
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')
    .replace(/-\d{8}$/, '')
    .replace(/^(anthropic|openai|google)\//, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/\bO(\d)/g, 'o$1')
}

function fmt(n: number): string {
  if (n === 0) return '$0.000000'
  if (n < 0.0001) return `$${n.toFixed(6)}`
  if (n < 0.01) return `$${n.toFixed(4)}`
  return `$${n.toFixed(4)}`
}

const PROVIDERS_ALL = ['All', ...PROVIDER_ORDER]

export default function AiCostCalculator() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modelIdx, setModelIdx] = useState(0)
  const [inputTokens, setInputTokens] = useState('1000')
  const [outputTokens, setOutputTokens] = useState('500')
  const [calls, setCalls] = useState('1')
  const [provider, setProvider] = useState('All')

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
            displayName: toDisplayName(key),
            inputPer1M: (val.input_cost_per_token as number) * 1_000_000,
            outputPer1M: (val.output_cost_per_token as number) * 1_000_000,
            maxInputTokens: (val.max_input_tokens as number) ?? 0,
          })
        }
        list.sort((a, b) => {
          const pi = PROVIDER_ORDER.indexOf(a.provider) - PROVIDER_ORDER.indexOf(b.provider)
          return pi !== 0 ? pi : a.inputPer1M - b.inputPer1M
        })
        setModels(list)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load pricing data'); setLoading(false) })
  }, [])

  const filtered = provider === 'All' ? models : models.filter(m => m.provider === provider)
  const model = filtered[Math.min(modelIdx, filtered.length - 1)]

  const inp = parseInt(inputTokens) || 0
  const out = parseInt(outputTokens) || 0
  const n = parseInt(calls) || 1

  const inputCost = model ? (inp / 1_000_000) * model.inputPer1M : 0
  const outputCost = model ? (out / 1_000_000) * model.outputPer1M : 0
  const perCall = inputCost + outputCost
  const total = perCall * n

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading latest pricing…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
  )

  return (
    <div className="space-y-5">
      {/* Provider filter */}
      <div className="flex flex-wrap gap-2">
        {PROVIDERS_ALL.map(p => (
          <button
            key={p}
            onClick={() => { setProvider(p); setModelIdx(0) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${provider === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {p}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-600 self-center">{filtered.length} models</span>
      </div>

      {/* Model select */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Model</label>
        <select
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          value={modelIdx}
          onChange={e => setModelIdx(Number(e.target.value))}
        >
          {filtered.map((m, i) => (
            <option key={m.key} value={i}>{m.provider} — {m.key} (${m.inputPer1M.toFixed(3)} / ${m.outputPer1M.toFixed(3)} per 1M)</option>
          ))}
        </select>
      </div>

      {/* Token inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Input tokens', value: inputTokens, set: setInputTokens, hint: 'prompt + context' },
          { label: 'Output tokens', value: outputTokens, set: setOutputTokens, hint: 'completion' },
          { label: 'API calls', value: calls, set: setCalls, hint: 'number of requests' },
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{f.label}</label>
            <input
              type="number" min="0"
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{f.hint}</p>
          </div>
        ))}
      </div>

      {/* Result */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Input cost', value: fmt(inputCost * n), sub: `${fmt(inputCost)}/call` },
          { label: 'Output cost', value: fmt(outputCost * n), sub: `${fmt(outputCost)}/call` },
          { label: 'Total cost', value: fmt(total), sub: `${fmt(perCall)}/call`, highlight: true },
        ].map(r => (
          <div key={r.label} className={`rounded-xl border p-4 text-center ${r.highlight ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
            <p className={`text-xl font-bold font-mono ${r.highlight ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>{r.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.label}</p>
            {n > 1 && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{r.sub}</p>}
          </div>
        ))}
      </div>

      {model && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Pricing for {model.key}</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Input: <span className="font-semibold text-gray-800 dark:text-gray-200">${model.inputPer1M.toFixed(4)}/1M tokens</span></span>
            <span className="text-gray-600 dark:text-gray-400">Output: <span className="font-semibold text-gray-800 dark:text-gray-200">${model.outputPer1M.toFixed(4)}/1M tokens</span></span>
            {model.maxInputTokens > 0 && <span className="text-gray-600 dark:text-gray-400">Context: <span className="font-semibold text-gray-800 dark:text-gray-200">{model.maxInputTokens.toLocaleString()} tokens</span></span>}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        * Pricing data from <a href="https://github.com/BerriAI/litellm" target="_blank" rel="noopener noreferrer" className="underline">LiteLLM</a> — fetched live from GitHub.
      </p>
    </div>
  )
}
