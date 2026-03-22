import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { CssHighlight } from '../lib/codeHighlight'

const COMMON_PX = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112, 128]

function px2rem(px: number, base: number) { return +(px / base).toFixed(4) }
function rem2px(rem: number, base: number) { return +(rem * base).toFixed(4) }

export default function PxToRem() {
  const [base, setBase] = useState(16)
  const [pxVal, setPxVal] = useState('16')
  const [remVal, setRemVal] = useState('1')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const handlePxChange = (v: string) => {
    setPxVal(v)
    const n = parseFloat(v)
    if (!isNaN(n)) setRemVal(String(px2rem(n, base)))
  }

  const handleRemChange = (v: string) => {
    setRemVal(v)
    const n = parseFloat(v)
    if (!isNaN(n)) setPxVal(String(rem2px(n, base)))
  }

  return (
    <div className="space-y-5">
      {/* Base font size */}
      <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-xl">
        <label className="text-sm font-medium text-primary-700 dark:text-primary-300 whitespace-nowrap">Base font size</label>
        <input
          type="range" min={10} max={24} value={base}
          onChange={e => { setBase(+e.target.value); setPxVal(v => { const n = parseFloat(v); return isNaN(n) ? v : v; }); setRemVal(v => { const n = parseFloat(v); if (!isNaN(n)) setPxVal(String(rem2px(n, +e.target.value))); return v; }) }}
          className="flex-1 accent-primary-600"
        />
        <div className="flex items-center gap-1">
          <input
            type="number" value={base} min={8} max={32}
            onChange={e => setBase(+e.target.value)}
            className="w-16 text-sm font-mono bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-700 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">px</span>
        </div>
      </div>

      {/* Converter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pixels (px)</label>
          <div className="flex gap-2">
            <input
              type="number" value={pxVal}
              onChange={e => handlePxChange(e.target.value)}
              className="flex-1 text-lg font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="16"
            />
            <span className="flex items-center text-sm font-medium text-gray-400 px-2">px</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Root Em (rem)</label>
          <div className="flex gap-2">
            <input
              type="number" value={remVal}
              onChange={e => handleRemChange(e.target.value)}
              className="flex-1 text-lg font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="1"
            />
            <span className="flex items-center text-sm font-medium text-gray-400 px-2">rem</span>
          </div>
        </div>
      </div>

      {/* Quick ref table */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Reference Table (base: {base}px)
        </h3>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2">
            <span>px</span><span>rem</span><span>em</span><span></span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {COMMON_PX.map(px => {
              const rem = px2rem(px, base)
              const key = `${px}`
              return (
                <div key={px} className="grid grid-cols-4 items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{px}px</span>
                  <span className="text-sm font-mono text-primary-600 dark:text-primary-400">{rem}rem</span>
                  <span className="text-sm font-mono text-gray-500">{rem}em</span>
                  <button onClick={() => copy(`${rem}rem`, key)} className="btn-ghost text-xs px-2 py-0.5 w-fit flex items-center gap-1">
                    {copied === key ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                    Copy
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CSS hint */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Set base font size in CSS</p>
        <pre className="bg-[#1e1e1e] rounded-lg p-3 text-xs font-mono overflow-x-auto"><CssHighlight code={`html { font-size: ${base}px; }\n/* or */\nhtml { font-size: ${Math.round(base / 16 * 100)}%; }`} /></pre>
      </div>
    </div>
  )
}
