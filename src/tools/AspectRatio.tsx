import { useState, useMemo } from 'react'
import { ArrowRightLeft } from 'lucide-react'

type Mode = 'calculate' | 'scale'

type Preset = { label: string; w: number; h: number }

const PRESETS: Preset[] = [
  { label: '16:9',  w: 16, h: 9  },
  { label: '4:3',   w: 4,  h: 3  },
  { label: '1:1',   w: 1,  h: 1  },
  { label: '21:9',  w: 21, h: 9  },
  { label: '9:16',  w: 9,  h: 16 },
  { label: '3:2',   w: 3,  h: 2  },
  { label: '5:4',   w: 5,  h: 4  },
  { label: '2:1',   w: 2,  h: 1  },
]

/* Common equivalent resolutions per simplified ratio */
const RESOLUTION_MAP: Record<string, [number, number][]> = {
  '16:9':  [[3840,2160],[2560,1440],[1920,1080],[1280,720],[854,480],[640,360]],
  '4:3':   [[1600,1200],[1280,960],[1024,768],[800,600],[640,480]],
  '1:1':   [[1080,1080],[720,720],[512,512],[256,256]],
  '21:9':  [[3440,1440],[2560,1080],[2560,1080]],
  '9:16':  [[1080,1920],[720,1280],[480,854]],
  '3:2':   [[3000,2000],[1500,1000],[900,600],[600,400]],
  '5:4':   [[1280,1024],[640,512]],
  '2:1':   [[2560,1280],[1920,960],[1280,640]],
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function simplifyRatio(w: number, h: number): [number, number] {
  if (!w || !h) return [0, 0]
  const d = gcd(Math.round(w), Math.round(h))
  return [Math.round(w) / d, Math.round(h) / d]
}

function diagonal(w: number, h: number): string {
  if (!w || !h) return '—'
  return Math.sqrt(w * w + h * h).toFixed(1)
}

export default function AspectRatio() {
  const [mode, setMode] = useState<Mode>('calculate')

  /* Calculate mode */
  const [calcW, setCalcW] = useState('1920')
  const [calcH, setCalcH] = useState('1080')

  /* Scale mode */
  const [scaleRatioW, setScaleRatioW] = useState('16')
  const [scaleRatioH, setScaleRatioH] = useState('9')
  const [scaleKnownDim, setScaleKnownDim] = useState<'width' | 'height'>('width')
  const [scaleKnownVal, setScaleKnownVal] = useState('1920')

  /* ── Calculate mode results ── */
  const calcResult = useMemo(() => {
    const w = parseFloat(calcW)
    const h = parseFloat(calcH)
    if (!w || !h || w <= 0 || h <= 0) return null
    const [rw, rh] = simplifyRatio(w, h)
    const ratioKey = `${rw}:${rh}`
    const resolutions = RESOLUTION_MAP[ratioKey] ?? []
    return { rw, rh, ratioKey, resolutions, w, h }
  }, [calcW, calcH])

  /* ── Scale mode results ── */
  const scaleResult = useMemo(() => {
    const rw = parseFloat(scaleRatioW)
    const rh = parseFloat(scaleRatioH)
    const known = parseFloat(scaleKnownVal)
    if (!rw || !rh || !known || rw <= 0 || rh <= 0 || known <= 0) return null
    if (scaleKnownDim === 'width') {
      const height = (known * rh) / rw
      return { width: known, height: Math.round(height * 100) / 100 }
    } else {
      const width = (known * rw) / rh
      return { width: Math.round(width * 100) / 100, height: known }
    }
  }, [scaleRatioW, scaleRatioH, scaleKnownDim, scaleKnownVal])

  function loadPreset(p: Preset) {
    if (mode === 'calculate') {
      setCalcW(String(p.w * 160))
      setCalcH(String(p.h * 160))
    } else {
      setScaleRatioW(String(p.w))
      setScaleRatioH(String(p.h))
    }
  }

  /* Visualizer dimensions (max 300×200 preview box) */
  function previewSize(w: number, h: number): { pw: number; ph: number } {
    const maxW = 280
    const maxH = 160
    const scaleW = maxW / w
    const scaleH = maxH / h
    const scale = Math.min(scaleW, scaleH, 1)
    return { pw: Math.round(w * scale), ph: Math.round(h * scale) }
  }

  const visualW = mode === 'calculate' ? parseFloat(calcW) || 16 : scaleResult?.width ?? 16
  const visualH = mode === 'calculate' ? parseFloat(calcH) || 9 : scaleResult?.height ?? 9
  const { pw, ph } = previewSize(visualW, visualH)

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['calculate', 'scale'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              mode === m
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {m === 'calculate' ? 'Calculate Ratio' : 'Scale Dimensions'}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div>
        <label className="label-text block mb-2">Common Presets</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PRESETS.map(p => {
            const active = mode === 'calculate'
              ? calcW === String(p.w * 160) && calcH === String(p.h * 160)
              : scaleRatioW === String(p.w) && scaleRatioH === String(p.h)
            return (
              <button
                key={p.label}
                onClick={() => loadPreset(p)}
                className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Calculate mode */}
      {mode === 'calculate' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text block mb-1">Width (px)</label>
              <input
                type="number" min={1}
                value={calcW} onChange={e => setCalcW(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="label-text block mb-1">Height (px)</label>
              <input
                type="number" min={1}
                value={calcH} onChange={e => setCalcH(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {calcResult && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 font-mono">
                    {calcResult.rw}:{calcResult.rh}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Simplified Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {(calcResult.w / calcResult.h).toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Decimal Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {diagonal(calcResult.w, calcResult.h)}px
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Diagonal</div>
                </div>
              </div>

              {calcResult.resolutions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Common resolutions for {calcResult.ratioKey}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {calcResult.resolutions.map(([rw, rh]) => (
                      <button
                        key={`${rw}x${rh}`}
                        onClick={() => { setCalcW(String(rw)); setCalcH(String(rh)) }}
                        className="text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 rounded-lg px-3 py-1 text-gray-600 dark:text-gray-400 transition-colors"
                      >
                        {rw}×{rh}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scale mode */}
      {mode === 'scale' && (
        <div className="space-y-4">
          <div>
            <label className="label-text block mb-2">Ratio</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1}
                value={scaleRatioW} onChange={e => setScaleRatioW(e.target.value)}
                className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <span className="text-gray-400 font-bold text-lg">:</span>
              <input
                type="number" min={1}
                value={scaleRatioH} onChange={e => setScaleRatioH(e.target.value)}
                className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text block mb-1">Known Dimension</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScaleKnownDim('width')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${scaleKnownDim === 'width' ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  Width
                </button>
                <button
                  onClick={() => setScaleKnownDim('height')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${scaleKnownDim === 'height' ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  Height
                </button>
              </div>
            </div>
            <div>
              <label className="label-text block mb-1">{scaleKnownDim === 'width' ? 'Width' : 'Height'} value (px)</label>
              <input
                type="number" min={1}
                value={scaleKnownVal} onChange={e => setScaleKnownVal(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {scaleResult && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono">{scaleResult.width}</div>
                  <div className="text-xs text-gray-400 mt-1">Width (px)</div>
                </div>
                <ArrowRightLeft size={18} className="text-gray-400" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono">{scaleResult.height}</div>
                  <div className="text-xs text-gray-400 mt-1">Height (px)</div>
                </div>
                <div className="text-center border-l border-gray-200 dark:border-gray-700 pl-6">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 font-mono">
                    {diagonal(scaleResult.width, scaleResult.height)}px
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Diagonal</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proportional preview */}
      <div>
        <label className="label-text block mb-2">Proportional Preview</label>
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl py-6">
          <div
            className="relative bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-400 dark:border-primary-600 rounded flex items-center justify-center"
            style={{ width: pw, height: ph }}
          >
            <span className="text-xs font-mono text-primary-600 dark:text-primary-400 font-semibold">
              {Math.round(visualW)}×{Math.round(visualH)}
            </span>
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-500 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary-500 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary-500 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-500 rounded-br" />
          </div>
        </div>
        <p className="text-xs text-center text-gray-400 mt-1">Preview scaled proportionally (not actual pixel size)</p>
      </div>
    </div>
  )
}
