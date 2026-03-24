import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'

interface ColorStop {
  id: number
  color: string
  position: number
}

interface Preset {
  name: string
  type: 'linear' | 'radial' | 'conic'
  angle: number
  stops: Omit<ColorStop, 'id'>[]
}

const PRESETS: Preset[] = [
  { name: 'Sunset', type: 'linear', angle: 135, stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 50 }, { color: '#ff9ff3', position: 100 }] },
  { name: 'Ocean', type: 'linear', angle: 135, stops: [{ color: '#0652DD', position: 0 }, { color: '#1289A7', position: 50 }, { color: '#c4e538', position: 100 }] },
  { name: 'Forest', type: 'linear', angle: 160, stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
  { name: 'Fire', type: 'linear', angle: 90, stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'Cosmic', type: 'radial', angle: 0, stops: [{ color: '#9b59b6', position: 0 }, { color: '#2c3e50', position: 100 }] },
  { name: 'Aurora', type: 'linear', angle: 45, stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 50 }, { color: '#6a0dad', position: 100 }] },
  { name: 'Candy', type: 'linear', angle: 90, stops: [{ color: '#f953c6', position: 0 }, { color: '#b91d73', position: 100 }] },
  { name: 'Peach', type: 'linear', angle: 135, stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { name: 'Mint', type: 'linear', angle: 120, stops: [{ color: '#84fab0', position: 0 }, { color: '#8fd3f4', position: 100 }] },
  { name: 'Rainbow', type: 'conic', angle: 0, stops: [{ color: '#ff0000', position: 0 }, { color: '#ffff00', position: 17 }, { color: '#00ff00', position: 33 }, { color: '#00ffff', position: 50 }, { color: '#0000ff', position: 67 }, { color: '#ff00ff', position: 83 }, { color: '#ff0000', position: 100 }] },
]

let idCounter = 10

function buildCss(type: string, angle: number, stops: ColorStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ')
  if (type === 'linear') return `background: linear-gradient(${angle}deg, ${stopStr});`
  if (type === 'radial') return `background: radial-gradient(circle, ${stopStr});`
  return `background: conic-gradient(from ${angle}deg, ${stopStr});`
}

function buildPreviewStyle(type: string, angle: number, stops: ColorStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ')
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stopStr})`
  if (type === 'radial') return `radial-gradient(circle, ${stopStr})`
  return `conic-gradient(from ${angle}deg, ${stopStr})`
}

export default function CssGradient() {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: '#6366f1', position: 0 },
    { id: 2, color: '#ec4899', position: 100 },
  ])
  const [copied, setCopied] = useState(false)

  const css = buildCss(type, angle, stops)
  const previewBg = buildPreviewStyle(type, angle, stops)

  const addStop = useCallback(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position)
    const midPos = sorted.length >= 2
      ? Math.round((sorted[Math.floor(sorted.length / 2) - 1]!.position + sorted[Math.floor(sorted.length / 2)]!.position) / 2)
      : 50
    setStops(prev => [...prev, { id: ++idCounter, color: '#ffffff', position: midPos }])
  }, [stops])

  const removeStop = useCallback((id: number) => {
    setStops(prev => prev.length > 2 ? prev.filter(s => s.id !== id) : prev)
  }, [])

  const updateStop = useCallback((id: number, field: 'color' | 'position', value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }, [])

  const applyPreset = (preset: Preset) => {
    setType(preset.type)
    setAngle(preset.angle)
    setStops(preset.stops.map((s, i) => ({ ...s, id: ++idCounter + i })))
  }

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
        style={{ height: 150, background: previewBg }}
      />

      {/* Presets */}
      <div>
        <label className="label-text block mb-2">Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)} className="btn-secondary text-xs py-1 px-3">
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Type + Angle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text block mb-2">Gradient Type</label>
          <div className="tool-tabs">
            {(['linear', 'radial', 'conic'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`tool-tab flex-1 capitalize ${type === t ? 'active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {(type === 'linear' || type === 'conic') && (
          <div>
            <label className="label-text block mb-2">Angle: {angle}°</label>
            <input
              type="range" min={0} max={360} value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="w-full accent-primary-600 mt-1"
            />
          </div>
        )}
      </div>

      {/* Color Stops */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-text">Color Stops</label>
          <button onClick={addStop} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
            <Plus size={13} /> Add Stop
          </button>
        </div>
        <div className="space-y-2">
          {[...stops].sort((a, b) => a.position - b.position).map(stop => (
            <div key={stop.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <input
                type="color"
                value={stop.color}
                onChange={e => updateStop(stop.id, 'color', e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700 flex-shrink-0"
              />
              <span className="font-mono text-sm text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{stop.color}</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="range" min={0} max={100} value={stop.position}
                  onChange={e => updateStop(stop.id, 'position', Number(e.target.value))}
                  className="flex-1 accent-primary-600"
                />
                <input
                  type="number" min={0} max={100} value={stop.position}
                  onChange={e => updateStop(stop.id, 'position', Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="tool-textarea h-auto py-1 w-16 text-center text-sm"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
              <button
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= 2}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-text">Generated CSS</label>
          <button onClick={copy} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <textarea readOnly value={css} className="tool-textarea-output font-mono text-sm h-20" />
      </div>
    </div>
  )
}
