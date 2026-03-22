import { useState } from 'react'
import { Copy, Check, RotateCcw } from 'lucide-react'
import { CssHighlight } from '../lib/codeHighlight'

interface FilterState {
  blur: number
  brightness: number
  contrast: number
  grayscale: number
  hueRotate: number
  invert: number
  opacity: number
  saturate: number
  sepia: number
}

const DEFAULTS: FilterState = {
  blur: 0, brightness: 100, contrast: 100, grayscale: 0,
  hueRotate: 0, invert: 0, opacity: 100, saturate: 100, sepia: 0,
}

const PRESETS: { label: string; state: Partial<FilterState> }[] = [
  { label: 'Original', state: {} },
  { label: 'Grayscale', state: { grayscale: 100 } },
  { label: 'Sepia', state: { sepia: 80 } },
  { label: 'Warm', state: { sepia: 30, saturate: 130, brightness: 105 } },
  { label: 'Cool', state: { hueRotate: 180, saturate: 80 } },
  { label: 'Vintage', state: { sepia: 50, contrast: 90, brightness: 95, saturate: 70 } },
  { label: 'Faded', state: { brightness: 120, contrast: 80, saturate: 70, sepia: 10 } },
  { label: 'Vivid', state: { saturate: 200, contrast: 120 } },
  { label: 'Noir', state: { grayscale: 100, contrast: 150, brightness: 90 } },
  { label: 'Blur', state: { blur: 4 } },
  { label: 'Invert', state: { invert: 100 } },
]

const SLIDERS: { key: keyof FilterState; label: string; min: number; max: number; step: number; unit: string; def: number }[] = [
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px', def: 0 },
  { key: 'brightness', label: 'Brightness', min: 0, max: 300, step: 1, unit: '%', def: 100 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 300, step: 1, unit: '%', def: 100 },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, unit: '%', def: 0 },
  { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, step: 1, unit: 'deg', def: 0 },
  { key: 'invert', label: 'Invert', min: 0, max: 100, step: 1, unit: '%', def: 0 },
  { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, unit: '%', def: 100 },
  { key: 'saturate', label: 'Saturate', min: 0, max: 300, step: 1, unit: '%', def: 100 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1, unit: '%', def: 0 },
]

function buildFilter(s: FilterState): string {
  const parts: string[] = []
  if (s.blur !== 0) parts.push(`blur(${s.blur}px)`)
  if (s.brightness !== 100) parts.push(`brightness(${s.brightness}%)`)
  if (s.contrast !== 100) parts.push(`contrast(${s.contrast}%)`)
  if (s.grayscale !== 0) parts.push(`grayscale(${s.grayscale}%)`)
  if (s.hueRotate !== 0) parts.push(`hue-rotate(${s.hueRotate}deg)`)
  if (s.invert !== 0) parts.push(`invert(${s.invert}%)`)
  if (s.opacity !== 100) parts.push(`opacity(${s.opacity}%)`)
  if (s.saturate !== 100) parts.push(`saturate(${s.saturate}%)`)
  if (s.sepia !== 0) parts.push(`sepia(${s.sepia}%)`)
  return parts.length ? parts.join(' ') : 'none'
}

const SAMPLE_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'

export default function CssFilterGenerator() {
  const [f, setF] = useState<FilterState>({ ...DEFAULTS })
  const [copied, setCopied] = useState(false)
  const [img, setImg] = useState(SAMPLE_IMG)
  const [customImg, setCustomImg] = useState('')

  const filterStr = buildFilter(f)
  const cssCode = `filter: ${filterStr};`

  const set = (key: keyof FilterState, val: number) => setF(p => ({ ...p, [key]: val }))
  const reset = () => setF({ ...DEFAULTS })
  const apply = (preset: Partial<FilterState>) => setF({ ...DEFAULTS, ...preset })

  const copy = async () => {
    await navigator.clipboard.writeText(cssCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => apply(p.state)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="space-y-3">
          {SLIDERS.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <label className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">{s.label}</label>
              <input type="range" min={s.min} max={s.max} step={s.step} value={f[s.key]}
                onChange={e => set(s.key, +e.target.value)}
                className="flex-1 accent-primary-600 h-1"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 w-16 text-right">
                {f[s.key]}{s.unit}
              </span>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button onClick={reset} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* CSS output */}
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
              <span className="text-xs text-gray-400">CSS</span>
              <button onClick={copy} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono p-3 whitespace-pre-wrap bg-[#1e1e1e]"><CssHighlight code={cssCode} /></pre>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={customImg}
              onChange={e => setCustomImg(e.target.value)}
              placeholder="Custom image URL..."
              className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
            />
            <button onClick={() => customImg && setImg(customImg)} className="btn-secondary text-xs px-3 py-1.5">Apply</button>
            <button onClick={() => { setImg(SAMPLE_IMG); setCustomImg('') }} className="btn-ghost text-xs px-2 py-1.5">Reset</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[11px] text-gray-400 text-center">Original</p>
              <img src={img} alt="original" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-gray-400 text-center">Filtered</p>
              <img src={img} alt="filtered" className="w-full rounded-xl object-cover" style={{ maxHeight: 200, filter: filterStr }} />
            </div>
          </div>

          {/* Apply to text preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 p-4" style={{ filter: filterStr }}>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Text preview with filter applied</p>
            <div className="flex gap-2 mt-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg" />
              <div className="w-8 h-8 bg-green-500 rounded-lg" />
              <div className="w-8 h-8 bg-red-500 rounded-lg" />
              <div className="w-8 h-8 bg-yellow-500 rounded-lg" />
              <div className="w-8 h-8 bg-purple-500 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
