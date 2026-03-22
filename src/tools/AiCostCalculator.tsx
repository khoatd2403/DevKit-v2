import { useState } from 'react'

interface Model {
  provider: string
  name: string
  inputPer1M: number
  outputPer1M: number
}

const MODELS: Model[] = [
  { provider: 'OpenAI', name: 'GPT-4o', inputPer1M: 2.5, outputPer1M: 10 },
  { provider: 'OpenAI', name: 'GPT-4o mini', inputPer1M: 0.15, outputPer1M: 0.6 },
  { provider: 'OpenAI', name: 'GPT-4 Turbo', inputPer1M: 10, outputPer1M: 30 },
  { provider: 'OpenAI', name: 'o1', inputPer1M: 15, outputPer1M: 60 },
  { provider: 'OpenAI', name: 'o1-mini', inputPer1M: 3, outputPer1M: 12 },
  { provider: 'OpenAI', name: 'o3-mini', inputPer1M: 1.1, outputPer1M: 4.4 },
  { provider: 'Anthropic', name: 'Claude 3.5 Sonnet', inputPer1M: 3, outputPer1M: 15 },
  { provider: 'Anthropic', name: 'Claude 3.5 Haiku', inputPer1M: 0.8, outputPer1M: 4 },
  { provider: 'Anthropic', name: 'Claude 3 Opus', inputPer1M: 15, outputPer1M: 75 },
  { provider: 'Anthropic', name: 'Claude 3 Haiku', inputPer1M: 0.25, outputPer1M: 1.25 },
  { provider: 'Google', name: 'Gemini 1.5 Pro', inputPer1M: 1.25, outputPer1M: 5 },
  { provider: 'Google', name: 'Gemini 1.5 Flash', inputPer1M: 0.075, outputPer1M: 0.3 },
  { provider: 'Google', name: 'Gemini 2.0 Flash', inputPer1M: 0.1, outputPer1M: 0.4 },
  { provider: 'Meta', name: 'Llama 3.1 70B', inputPer1M: 0.59, outputPer1M: 0.79 },
  { provider: 'Meta', name: 'Llama 3.1 8B', inputPer1M: 0.1, outputPer1M: 0.1 },
]

const PROVIDERS = ['All', ...Array.from(new Set(MODELS.map(m => m.provider)))]

function fmt(n: number): string {
  if (n === 0) return '$0.000000'
  if (n < 0.000001) return `$${n.toFixed(8)}`
  if (n < 0.001) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  return `$${n.toFixed(4)}`
}

export default function AiCostCalculator() {
  const [modelIdx, setModelIdx] = useState(0)
  const [inputTokens, setInputTokens] = useState('1000')
  const [outputTokens, setOutputTokens] = useState('500')
  const [calls, setCalls] = useState('1')
  const [provider, setProvider] = useState('All')

  const filtered = provider === 'All' ? MODELS : MODELS.filter(m => m.provider === provider)
  const model = filtered[Math.min(modelIdx, filtered.length - 1)]

  const inp = parseInt(inputTokens) || 0
  const out = parseInt(outputTokens) || 0
  const n = parseInt(calls) || 1

  const inputCost = (inp / 1_000_000) * model.inputPer1M
  const outputCost = (out / 1_000_000) * model.outputPer1M
  const perCall = inputCost + outputCost
  const total = perCall * n

  return (
    <div className="space-y-5">
      {/* Provider filter */}
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map(p => (
          <button
            key={p}
            onClick={() => { setProvider(p); setModelIdx(0) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${provider === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Model select */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Model</label>
        <select
          className="tool-select w-full"
          value={modelIdx}
          onChange={e => setModelIdx(Number(e.target.value))}
        >
          {filtered.map((m, i) => (
            <option key={m.name} value={i}>{m.provider} — {m.name} (${m.inputPer1M} / ${m.outputPer1M} per 1M)</option>
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
              type="number"
              min="0"
              className="tool-input w-full"
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

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Pricing for {model.name}</p>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Input: <span className="font-semibold text-gray-800 dark:text-gray-200">${model.inputPer1M}/1M tokens</span></span>
          <span className="text-gray-600 dark:text-gray-400">Output: <span className="font-semibold text-gray-800 dark:text-gray-200">${model.outputPer1M}/1M tokens</span></span>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        * Prices are approximate and may change. Always verify with the provider's official pricing page.
      </p>
    </div>
  )
}
