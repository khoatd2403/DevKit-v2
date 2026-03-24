import { useState } from 'react'
import { Check, X } from 'lucide-react'

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return [r, g, b]
  }
  if (clean.length !== 6) return null
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function relativeLuminance(r: number, g: number, b: number): number {
  const chan = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2]
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return null
  const L1 = relativeLuminance(...rgb1)
  const L2 = relativeLuminance(...rgb2)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return +((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

const PRESETS = [
  { fg: '#FFFFFF', bg: '#000000', label: 'White on Black' },
  { fg: '#000000', bg: '#FFFFFF', label: 'Black on White' },
  { fg: '#FFFFFF', bg: '#1D4ED8', label: 'White on Blue' },
  { fg: '#FFFFFF', bg: '#DC2626', label: 'White on Red' },
  { fg: '#111827', bg: '#F9FAFB', label: 'Dark on Light' },
  { fg: '#FCD34D', bg: '#1F2937', label: 'Yellow on Dark' },
]

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
      pass ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    }`}>
      {pass ? <Check size={12} /> : <X size={12} />}
      {label}
    </div>
  )
}

export default function ColorContrastChecker() {
  const [fg, setFg] = useState('#1D4ED8')
  const [bg, setBg] = useState('#EFF6FF')

  const ratio = contrastRatio(fg, bg)
  const aaLarge  = (ratio ?? 0) >= 3.0
  const aaNormal = (ratio ?? 0) >= 4.5
  const aaaLarge  = (ratio ?? 0) >= 4.5
  const aaaNormal = (ratio ?? 0) >= 7.0

  const grade = !ratio ? '—'
    : ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail'

  const gradeColor = !ratio ? 'text-gray-400'
    : ratio >= 4.5 ? 'text-green-600 dark:text-green-400' : ratio >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setFg(p.fg); setBg(p.bg) }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
            style={{ background: p.bg, color: p.fg }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Color pickers */}
        <div className="space-y-3">
          {[
            { label: 'Foreground (Text)', value: fg, set: setFg },
            { label: 'Background', value: bg, set: setBg },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="tool-label mb-1.5 block">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={value.length === 7 ? value : '#000000'}
                  onChange={e => set(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent"
                />
                <input type="text" value={value} onChange={e => set(e.target.value)}
                  className="flex-1 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                  maxLength={7} placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Ratio result */}
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Contrast Ratio</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{ratio ?? '—'}<span className="text-xl text-gray-400">:1</span></p>
            <p className={`text-lg font-bold mt-1 ${gradeColor}`}>{grade}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PassBadge pass={aaNormal} label="AA Normal text" />
            <PassBadge pass={aaLarge} label="AA Large text" />
            <PassBadge pass={aaaNormal} label="AAA Normal text" />
            <PassBadge pass={aaaLarge} label="AAA Large text" />
          </div>
          <p className="text-[11px] text-gray-400">WCAG 2.1 — AA requires 4.5:1 normal, 3:1 large text (18pt+ or bold 14pt+)</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Live Preview</p>
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="p-6" style={{ backgroundColor: bg }}>
            <p style={{ color: fg }} className="text-2xl font-bold mb-1">The quick brown fox jumps over the lazy dog</p>
            <p style={{ color: fg }} className="text-base">Normal body text at 16px — WCAG AA compliance check</p>
            <p style={{ color: fg }} className="text-sm mt-1">Small text at 14px — requires higher contrast ratio</p>
            <div className="mt-3 flex gap-3">
              <button style={{ backgroundColor: fg, color: bg }} className="px-4 py-2 rounded-lg text-sm font-medium">Primary Button</button>
              <button style={{ color: fg, border: `2px solid ${fg}`, background: 'transparent' }} className="px-4 py-2 rounded-lg text-sm font-medium">Outlined</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
