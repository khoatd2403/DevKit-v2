import { useState, useCallback } from 'react'
import CopyButton from '../components/CopyButton'

function hexToRgb(hex: string): [number, number, number] | null {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!r) return null
  return [parseInt(r[1]!, 16), parseInt(r[2]!, 16), parseInt(r[3]!, 16)]
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState<[number, number, number]>([59, 130, 246])
  const [hsl, setHsl] = useState<[number, number, number]>([217, 91, 60])
  const [error, setError] = useState('')

  const fromHex = useCallback((h: string) => {
    setHex(h)
    const r = hexToRgb(h)
    if (r) { setRgb(r); setHsl(rgbToHsl(...r)); setError('') }
    else if (h.length > 3) setError('Invalid hex color')
  }, [])

  const fromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb([r, g, b])
    setHex(rgbToHex(r, g, b))
    setHsl(rgbToHsl(r, g, b))
  }, [])

  const fromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl([h, s, l])
    const r = hslToRgb(h, s, l)
    setRgb(r)
    setHex(rgbToHex(...r))
  }, [])

  return (
    <div className="space-y-6">
      {/* Color preview */}
      <div className="h-24 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors" style={{ backgroundColor: hex }} />

      {/* HEX */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">HEX</h3>
          <CopyButton text={hex} toast="HEX copied" />
        </div>
        <div className="flex gap-3 items-center">
          <input type="color" value={hex} onChange={e => fromHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
          <input type="text" className="tool-textarea h-auto py-2 font-mono flex-1" value={hex} onChange={e => fromHex(e.target.value)} placeholder="#3b82f6" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* RGB */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">RGB</h3>
          <CopyButton text={`rgb(${rgb.join(', ')})`} toast="RGB copied" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['R', 'G', 'B'].map((c, i) => (
            <div key={c}>
              <label className="text-xs text-gray-400 block mb-1">{c} (0-255)</label>
              <input type="number" min={0} max={255} className="tool-textarea h-auto py-2 font-mono text-center"
                value={rgb[i]} onChange={e => { const v = [...rgb] as [number,number,number]; v[i] = Math.min(255, Math.max(0, +e.target.value)); fromRgb(...v) }} />
            </div>
          ))}
        </div>
        <p className="text-sm font-mono text-gray-600 dark:text-gray-400">rgb({rgb.join(', ')})</p>
      </div>

      {/* HSL */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">HSL</h3>
          <CopyButton text={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} toast="HSL copied" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['H', 360], ['S', 100], ['L', 100]].map(([label, max], i) => (
            <div key={label}>
              <label className="text-xs text-gray-400 block mb-1">{label} (0-{max})</label>
              <input type="number" min={0} max={max} className="tool-textarea h-auto py-2 font-mono text-center"
                value={hsl[i]} onChange={e => { const v = [...hsl] as [number,number,number]; v[i] = Math.min(max as number, Math.max(0, +e.target.value)); fromHsl(...v) }} />
            </div>
          ))}
        </div>
        <p className="text-sm font-mono text-gray-600 dark:text-gray-400">hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)</p>
      </div>
    </div>
  )
}
