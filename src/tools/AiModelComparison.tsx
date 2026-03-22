import { useState } from 'react'

interface ModelInfo {
  provider: string
  name: string
  ctx: string
  inputPer1M: number
  outputPer1M: number
  strengths: string
  released: string
}

const MODELS: ModelInfo[] = [
  { provider: 'OpenAI', name: 'GPT-4o', ctx: '128K', inputPer1M: 2.5, outputPer1M: 10, strengths: 'Multimodal, fast, coding, reasoning', released: '2024-05' },
  { provider: 'OpenAI', name: 'GPT-4o mini', ctx: '128K', inputPer1M: 0.15, outputPer1M: 0.6, strengths: 'Fast, cheap, everyday tasks', released: '2024-07' },
  { provider: 'OpenAI', name: 'GPT-4 Turbo', ctx: '128K', inputPer1M: 10, outputPer1M: 30, strengths: 'Complex reasoning, long context', released: '2023-11' },
  { provider: 'OpenAI', name: 'o1', ctx: '200K', inputPer1M: 15, outputPer1M: 60, strengths: 'Advanced reasoning, math, science', released: '2024-09' },
  { provider: 'OpenAI', name: 'o1-mini', ctx: '128K', inputPer1M: 3, outputPer1M: 12, strengths: 'Reasoning at lower cost', released: '2024-09' },
  { provider: 'OpenAI', name: 'o3-mini', ctx: '200K', inputPer1M: 1.1, outputPer1M: 4.4, strengths: 'Fast reasoning, coding', released: '2025-01' },
  { provider: 'Anthropic', name: 'Claude 3.5 Sonnet', ctx: '200K', inputPer1M: 3, outputPer1M: 15, strengths: 'Coding, analysis, nuanced writing', released: '2024-10' },
  { provider: 'Anthropic', name: 'Claude 3.5 Haiku', ctx: '200K', inputPer1M: 0.8, outputPer1M: 4, strengths: 'Fast, cheap, great for agents', released: '2024-11' },
  { provider: 'Anthropic', name: 'Claude 3 Opus', ctx: '200K', inputPer1M: 15, outputPer1M: 75, strengths: 'Complex tasks, research', released: '2024-03' },
  { provider: 'Google', name: 'Gemini 1.5 Pro', ctx: '1M', inputPer1M: 1.25, outputPer1M: 5, strengths: 'Long context, multimodal', released: '2024-02' },
  { provider: 'Google', name: 'Gemini 1.5 Flash', ctx: '1M', inputPer1M: 0.075, outputPer1M: 0.3, strengths: 'Fast, cheap, 1M context', released: '2024-05' },
  { provider: 'Google', name: 'Gemini 2.0 Flash', ctx: '1M', inputPer1M: 0.1, outputPer1M: 0.4, strengths: 'Latest Google, multimodal', released: '2025-01' },
  { provider: 'Meta', name: 'Llama 3.1 405B', ctx: '128K', inputPer1M: 1.79, outputPer1M: 1.79, strengths: 'Open-source, on-premise, powerful', released: '2024-07' },
  { provider: 'Meta', name: 'Llama 3.1 70B', ctx: '128K', inputPer1M: 0.59, outputPer1M: 0.79, strengths: 'Open-source, balanced', released: '2024-07' },
  { provider: 'Mistral', name: 'Mistral Large', ctx: '128K', inputPer1M: 2, outputPer1M: 6, strengths: 'European, multilingual, efficient', released: '2024-11' },
  { provider: 'Mistral', name: 'Mistral Small', ctx: '128K', inputPer1M: 0.1, outputPer1M: 0.3, strengths: 'Lightweight, fast, cheap', released: '2024-09' },
]

const PROVIDERS = ['All', ...Array.from(new Set(MODELS.map(m => m.provider)))]

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Anthropic: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  Google: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Meta: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  Mistral: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

export default function AiModelComparison() {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'name' | 'inputPer1M' | 'outputPer1M' | 'ctx'>('name')

  const filtered = MODELS
    .filter(m => filter === 'All' || m.provider === filter)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'ctx') return parseFloat(a.ctx) - parseFloat(b.ctx)
      return a[sortBy] - b[sortBy]
    })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map(p => (
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
          <option value="name">Sort: Name</option>
          <option value="inputPer1M">Sort: Input price</option>
          <option value="outputPer1M">Sort: Output price</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Model</th>
              <th className="text-right px-4 py-3 font-medium">Context</th>
              <th className="text-right px-4 py-3 font-medium">Input /1M</th>
              <th className="text-right px-4 py-3 font-medium">Output /1M</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Best for</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(m => (
              <tr key={m.name} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PROVIDER_COLORS[m.provider] ?? ''}`}>
                      {m.provider}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-400">{m.ctx}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-200">${m.inputPer1M}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-200">${m.outputPer1M}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{m.strengths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        * Prices per 1M tokens. Data may be outdated — verify with official provider pricing.
      </p>
    </div>
  )
}
