import { useState } from 'react'
import CopyButton from '../components/CopyButton'

const MODELS = [
  { name: 'GPT-4o', ctx: 128_000 },
  { name: 'GPT-4o mini', ctx: 128_000 },
  { name: 'o1', ctx: 200_000 },
  { name: 'Claude 3.5 Sonnet', ctx: 200_000 },
  { name: 'Claude 3.5 Haiku', ctx: 200_000 },
  { name: 'Claude 3 Opus', ctx: 200_000 },
  { name: 'Gemini 1.5 Pro', ctx: 1_000_000 },
  { name: 'Gemini 1.5 Flash', ctx: 1_000_000 },
  { name: 'Gemini 2.0 Flash', ctx: 1_000_000 },
]

function estimateTokens(text: string): number {
  if (!text.trim()) return 0
  const words = text.trim().split(/\s+/).length
  return Math.round(words * 1.35)
}

function fmtNum(n: number) {
  return n.toLocaleString()
}

export default function AiTokenCounter() {
  const [text, setText] = useState('')

  const tokens = estimateTokens(text)
  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Input Text</label>
          <button onClick={() => setText('')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Clear</button>
        </div>
        <textarea
          className="tool-textarea h-48"
          placeholder="Paste your prompt or text here to estimate token count..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tokens (est.)', value: fmtNum(tokens), color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Characters', value: fmtNum(chars), color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Words', value: fmtNum(words), color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Sentences', value: fmtNum(sentences), color: 'text-gray-700 dark:text-gray-300' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Model context usage */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Context window usage</p>
        <div className="space-y-2">
          {MODELS.map(m => {
            const pct = Math.min((tokens / m.ctx) * 100, 100)
            const used = pct < 1 && tokens > 0 ? '<1' : pct.toFixed(1)
            return (
              <div key={m.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{fmtNum(tokens)} / {fmtNum(m.ctx)}</span>
                    <span className={`text-xs font-semibold w-12 text-right ${pct > 80 ? 'text-red-500' : pct > 50 ? 'text-yellow-500' : 'text-green-500'}`}>{used}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        * Token count is an estimate using ~1.35 tokens/word. Actual count may vary slightly by model.
      </p>
    </div>
  )
}
