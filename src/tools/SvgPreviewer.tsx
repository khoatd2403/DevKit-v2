import { useState, useRef, useCallback } from 'react'
import { Upload, Copy, Check, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react'

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)" />
  <polygon points="50,20 80,70 20,70" fill="white" opacity="0.9" />
  <circle cx="50" cy="60" r="12" fill="white" opacity="0.9" />
</svg>`

const BACKGROUNDS = [
  { label: 'White', value: '#ffffff', dark: false },
  { label: 'Black', value: '#000000', dark: true },
  { label: 'Gray', value: '#f3f4f6', dark: false },
  { label: 'Dark', value: '#1f2937', dark: true },
  { label: 'Transparent', value: 'transparent', dark: false },
  { label: 'Grid', value: 'grid', dark: false },
]

const SAMPLES = [
  {
    label: 'Gradient Circle',
    code: SAMPLE_SVG,
  },
  {
    label: 'Animated',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" stroke-width="4" stroke-dasharray="251" stroke-dashoffset="251">
    <animate attributeName="stroke-dashoffset" from="251" to="0" dur="2s" fill="freeze" />
  </circle>
  <text x="50" y="55" text-anchor="middle" font-size="14" fill="#6366f1" font-family="sans-serif">Loading</text>
</svg>`,
  },
  {
    label: 'Bar Chart',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
  <rect x="10" y="60" width="20" height="30" fill="#6366f1" rx="2"/>
  <rect x="40" y="30" width="20" height="60" fill="#8b5cf6" rx="2"/>
  <rect x="70" y="45" width="20" height="45" fill="#a78bfa" rx="2"/>
  <rect x="100" y="15" width="20" height="75" fill="#c4b5fd" rx="2"/>
  <line x1="5" y1="90" x2="125" y2="90" stroke="#e5e7eb" stroke-width="1"/>
</svg>`,
  },
  {
    label: 'Star',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
    fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
</svg>`,
  },
]

export default function SvgPreviewer() {
  const [code, setCode] = useState(SAMPLE_SVG)
  const [zoom, setZoom] = useState(1)
  const [bg, setBg] = useState('white')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const isValidSvg = useCallback(() => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(code, 'image/svg+xml')
      const err = doc.querySelector('parsererror')
      if (err) { setError(err.textContent?.split('\n')[0] ?? 'Invalid SVG'); return false }
      setError('')
      return true
    } catch { setError('Parse error'); return false }
  }, [code])

  const safeCode = (() => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(code, 'image/svg+xml')
      if (doc.querySelector('parsererror')) return null
      return code
    } catch { return null }
  })()

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    if (!safeCode) return
    const blob = new Blob([safeCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'image.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = () => {
    if (!safeCode) return
    const scale = 4
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale || 400 * scale
      canvas.height = img.height * scale || 400 * scale
      const ctx = canvas.getContext('2d')!
      if (bg !== 'transparent' && bg !== 'grid') {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url; a.download = 'image.png'; a.click()
    }
    const blob = new Blob([safeCode], { type: 'image/svg+xml' })
    img.src = URL.createObjectURL(blob)
  }

  const bgStyle = bg === 'grid'
    ? { backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }
    : { backgroundColor: bg }

  return (
    <div className="space-y-4">
      {/* Samples */}
      <div className="flex flex-wrap gap-1.5">
        {SAMPLES.map(s => (
          <button key={s.label} onClick={() => { setCode(s.code); setError('') }}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors">
            {s.label}
          </button>
        ))}
        <label className="text-xs px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 cursor-pointer hover:bg-primary-100 transition-colors flex items-center gap-1">
          <Upload size={11} /> Upload SVG
          <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={e => {
            const file = e.target.files?.[0]; if (!file) return
            file.text().then(t => { setCode(t); setError('') })
          }} />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">SVG Code</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{code.length} chars</span>
              <button onClick={copy} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary-600">
                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                Copy
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={e => { setCode(e.target.value); isValidSvg() }}
            rows={20}
            className="tool-textarea font-mono text-xs"
            spellCheck={false}
          />
          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">{error}</p>}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
                <ZoomOut size={13} />
              </button>
              <span className="text-xs font-mono w-12 text-center text-gray-600 dark:text-gray-400">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
                <ZoomIn size={13} />
              </button>
              <button onClick={() => setZoom(1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors ml-1">
                <RotateCcw size={11} />
              </button>
            </div>

            <div className="flex gap-1">
              {BACKGROUNDS.map(b => (
                <button key={b.label} onClick={() => setBg(b.value)}
                  title={b.label}
                  className={`w-6 h-6 rounded border-2 transition-all ${bg === b.value ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-gray-700'} ${b.value === 'grid' ? '' : ''}`}
                  style={b.value === 'grid'
                    ? { backgroundImage: 'repeating-conic-gradient(#9ca3af 0% 25%, white 0% 50%)', backgroundSize: '8px 8px' }
                    : b.value === 'transparent'
                    ? { backgroundImage: 'repeating-conic-gradient(#d1d5db 0% 25%, white 0% 50%)', backgroundSize: '8px 8px' }
                    : { backgroundColor: b.value }}
                />
              ))}
            </div>

            <div className="flex gap-1 ml-auto">
              <button onClick={download} disabled={!safeCode} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
                <Download size={11} /> SVG
              </button>
              <button onClick={downloadPng} disabled={!safeCode} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
                <Download size={11} /> PNG
              </button>
            </div>
          </div>

          {/* Preview box */}
          <div ref={previewRef}
            className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-auto"
            style={{ minHeight: 300, ...bgStyle }}>
            {safeCode ? (
              <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
                  dangerouslySetInnerHTML={{ __html: safeCode }} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Invalid SVG — check your code
              </div>
            )}
          </div>

          {/* Info */}
          {safeCode && (() => {
            const parser = new DOMParser()
            const doc = parser.parseFromString(safeCode, 'image/svg+xml')
            const svg = doc.querySelector('svg')
            const vb = svg?.getAttribute('viewBox')
            const w = svg?.getAttribute('width')
            const h = svg?.getAttribute('height')
            return (
              <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
                {(w || h) && <span>Size: {w ?? '?'} × {h ?? '?'}</span>}
                {vb && <span>ViewBox: {vb}</span>}
                <span>Elements: {doc.querySelectorAll('*').length}</span>
                <span>Size: {(new TextEncoder().encode(safeCode).length / 1024).toFixed(1)} KB</span>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
