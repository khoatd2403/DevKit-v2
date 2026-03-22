import { useState, useRef } from 'react'
import { Upload, Copy, Check } from 'lucide-react'

interface ColorInfo { hex: string; rgb: string; hsl: string; pct: number }

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number): string {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function extractColors(canvas: HTMLCanvasElement, count = 10): ColorInfo[] {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas
  const data = ctx.getImageData(0, 0, width, height).data

  // Sample pixels
  const buckets: Record<string, number> = {}
  const step = Math.max(1, Math.floor((width * height) / 4000))

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = Math.round(data[i] / 32) * 32
    const g = Math.round(data[i + 1] / 32) * 32
    const b = Math.round(data[i + 2] / 32) * 32
    if (data[i + 3] < 128) continue
    const key = `${r},${g},${b}`
    buckets[key] = (buckets[key] ?? 0) + 1
  }

  const total = Object.values(buckets).reduce((a, b) => a + b, 0)
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key, cnt]) => {
      const [r, g, b] = key.split(',').map(Number)
      return {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: rgbToHsl(r, g, b),
        pct: Math.round((cnt / total) * 100),
      }
    })
}

const SAMPLE_URLS = [
  { label: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { label: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80' },
  { label: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&q=80' },
  { label: 'Ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80' },
]

export default function ColorExtractor() {
  const [colors, setColors] = useState<ColorInfo[]>([])
  const [imgSrc, setImgSrc] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [count, setCount] = useState(10)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processImage = (src: string) => {
    setLoading(true)
    setColors([])
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current!
      const max = 200
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setColors(extractColors(canvas, count))
      setLoading(false)
    }
    img.onerror = () => setLoading(false)
    img.src = src
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const src = ev.target?.result as string
      setImgSrc(src)
      processImage(src)
    }
    reader.readAsDataURL(file)
  }

  const loadSample = (url: string) => {
    setImgSrc(url)
    processImage(url)
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(colors.map(c => c.hex).join('\n'))
    setCopied('all')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={() => fileRef.current?.click()}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
          <Upload size={13} /> Upload Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {SAMPLE_URLS.map(s => (
          <button key={s.label} onClick={() => loadSample(s.url)}
            className="btn-ghost text-xs px-3 py-2">{s.label}</button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500">Colors:</label>
          <select value={count} onChange={e => setCount(+e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
            {[5, 8, 10, 12, 16].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image preview */}
        <div className="space-y-2">
          {imgSrc ? (
            <img src={imgSrc} alt="source" crossOrigin="anonymous"
              className="w-full rounded-xl object-cover max-h-64 border border-gray-200 dark:border-gray-800" />
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors text-gray-400">
              <Upload size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Upload or choose a sample</p>
            </div>
          )}
          {loading && <p className="text-xs text-gray-400 animate-pulse text-center">Extracting colors...</p>}
        </div>

        {/* Palette */}
        <div className="space-y-2">
          {colors.length > 0 && (
            <>
              {/* Palette strip */}
              <div className="flex h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {colors.map(c => (
                  <div key={c.hex} style={{ backgroundColor: c.hex, flex: c.pct }} title={`${c.hex} (${c.pct}%)`} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{colors.length} dominant colors</p>
                <button onClick={copyAll} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                  {copied === 'all' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                  Copy all HEX
                </button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                    <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200">{c.hex}</p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{c.rgb} · {c.hsl}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{c.pct}%</span>
                    <button onClick={() => copy(c.hex, c.hex)} className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copied === c.hex ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {!loading && !colors.length && !imgSrc && (
            <p className="text-sm text-gray-400 text-center py-8">Load an image to extract its color palette</p>
          )}
        </div>
      </div>
    </div>
  )
}
