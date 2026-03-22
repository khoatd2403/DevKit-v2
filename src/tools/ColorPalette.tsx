import { useState } from 'react'
import CopyButton from '../components/CopyButton'

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
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

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => Math.round((l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255)
  return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('')
}

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState('#3b82f6')

  const [h, s, l] = hexToHsl(baseColor)

  const palettes = {
    Shades: Array.from({ length: 9 }, (_, i) => hslToHex(h, s, 10 + i * 10)),
    Tints: Array.from({ length: 9 }, (_, i) => hslToHex(h, s, 90 - i * 10)),
    Analogous: [hslToHex((h - 30 + 360) % 360, s, l), baseColor, hslToHex((h + 30) % 360, s, l)],
    Complementary: [baseColor, hslToHex((h + 180) % 360, s, l)],
    Triadic: [baseColor, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
    'Split-Complementary': [baseColor, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)],
    Tetradic: [baseColor, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700" />
        <div>
          <label className="text-xs text-gray-400 block mb-1">Base Color</label>
          <input type="text" className="tool-textarea h-auto py-1.5 font-mono w-32" value={baseColor} onChange={e => setBaseColor(e.target.value)} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          HSL({h}°, {s}%, {l}%)
        </div>
      </div>

      {Object.entries(palettes).map(([name, colors]) => (
        <div key={name}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{name}</h3>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color, i) => (
              <div key={i} className="group relative">
                <div className="w-16 h-16 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-700 transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {color}
                </div>
                <CopyButton text={color} className="!text-xs mt-1 w-full justify-center" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
