import { useState, useRef, useCallback } from 'react'
import { Upload, Download, FileCode } from 'lucide-react'

type OutputFormat = 'png' | 'jpg'
type ScaleFactor = 1 | 2 | 3 | 4

interface SvgDimensions {
  width: number
  height: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function parseSvgDimensions(svgCode: string): SvgDimensions | null {
  // Try to parse a DOM element for accuracy
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgCode, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return null

    const wAttr = svgEl.getAttribute('width')
    const hAttr = svgEl.getAttribute('height')
    const vb = svgEl.getAttribute('viewBox')

    if (wAttr && hAttr) {
      const w = parseFloat(wAttr)
      const h = parseFloat(hAttr)
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return { width: w, height: h }
    }

    if (vb) {
      const parts = vb.trim().split(/[\s,]+/)
      if (parts.length >= 4) {
        const w = parseFloat(parts[2])
        const h = parseFloat(parts[3])
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return { width: w, height: h }
      }
    }

    return null
  } catch {
    return null
  }
}

export default function SvgToPng() {
  const [svgCode, setSvgCode] = useState('')
  const [format, setFormat] = useState<OutputFormat>('png')
  const [scale, setScale] = useState<ScaleFactor>(2)
  const [customWidth, setCustomWidth] = useState('')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [resultUrl, setResultUrl] = useState('')
  const [resultSize, setResultSize] = useState(0)
  const [resultDims, setResultDims] = useState<{ w: number; h: number } | null>(null)
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevResultUrl = useRef('')

  const loadSvgFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setSvgCode(text)
      setError('')
      setResultUrl('')
    }
    reader.onerror = () => setError('Failed to read SVG file.')
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadSvgFile(file)
  }, [loadSvgFile])

  const svgDataUrl = svgCode
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`
    : ''

  const handleConvert = () => {
    if (!svgCode.trim()) { setError('Please enter or upload an SVG.'); return }

    const dims = parseSvgDimensions(svgCode)
    if (!dims) { setError('Could not determine SVG dimensions. Make sure the SVG has width/height attributes or a viewBox.'); return }

    const customW = customWidth ? parseInt(customWidth, 10) : 0
    let canvasW: number
    let canvasH: number

    if (customW > 0) {
      canvasW = customW
      canvasH = Math.round((dims.height / dims.width) * customW)
    } else {
      canvasW = Math.round(dims.width * scale)
      canvasH = Math.round(dims.height * scale)
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d')!

      if (format === 'jpg') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvasW, canvasH)
      }
      ctx.drawImage(img, 0, 0, canvasW, canvasH)

      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png'
      canvas.toBlob(
        (blob) => {
          if (!blob) { setError('Conversion failed.'); return }
          if (prevResultUrl.current) URL.revokeObjectURL(prevResultUrl.current)
          const url = URL.createObjectURL(blob)
          prevResultUrl.current = url
          setResultUrl(url)
          setResultSize(blob.size)
          setResultDims({ w: canvasW, h: canvasH })
          setError('')
        },
        mime,
        format === 'jpg' ? 0.92 : undefined
      )
    }
    img.onerror = () => setError('Failed to render SVG. The SVG may contain external resources or be invalid.')
    img.src = svgDataUrl
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `image.${format}`
    a.click()
  }

  const scales: ScaleFactor[] = [1, 2, 3, 4]

  return (
    <div className="space-y-4">
      {/* SVG Input */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">SVG Code</label>
        <textarea
          className="tool-textarea h-40"
          placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">…</svg>'
          value={svgCode}
          onChange={e => { setSvgCode(e.target.value); setResultUrl(''); setError('') }}
          spellCheck={false}
        />
      </div>

      {/* File upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Upload size={18} />
          <span className="text-sm">Drop an SVG file here or click to upload</span>
          <FileCode size={18} />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadSvgFile(f); e.target.value = '' }}
        />
      </div>

      {/* SVG preview */}
      {svgDataUrl && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">SVG Preview</label>
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <img
              src={svgDataUrl}
              alt="SVG preview"
              className="max-h-48 max-w-full object-contain"
            />
          </div>
          {(() => {
            const dims = parseSvgDimensions(svgCode)
            if (dims) return (
              <p className="text-xs text-gray-400 text-center mt-2">
                Natural size: {dims.width} × {dims.height}px
              </p>
            )
            return null
          })()}
        </div>
      )}

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Output format */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Output Format</label>
        <div className="flex gap-2">
          {(['png', 'jpg'] as OutputFormat[]).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                format === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Scale factor */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Scale Factor</label>
        <div className="flex gap-2">
          {scales.map(s => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                scale === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s}x{s === 2 ? ' (retina)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Custom width override */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Custom Width Override (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            placeholder={`e.g. 1200`}
            value={customWidth}
            onChange={e => setCustomWidth(e.target.value)}
            className="w-36 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
          <span className="text-xs text-gray-400">px — overrides scale factor, preserves aspect ratio</span>
          {customWidth && (
            <button onClick={() => setCustomWidth('')} className="btn-ghost text-xs py-1 px-2">Clear</button>
          )}
        </div>
      </div>

      {/* Background color (JPG only) */}
      {format === 'jpg' && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            Background Color (JPG has no transparency)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-900"
            />
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{bgColor}</span>
            <button onClick={() => setBgColor('#ffffff')} className="btn-ghost text-xs py-1 px-2">White</button>
            <button onClick={() => setBgColor('#000000')} className="btn-ghost text-xs py-1 px-2">Black</button>
          </div>
        </div>
      )}

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={!svgCode.trim()}
        className="btn-primary flex items-center gap-2"
      >
        <FileCode size={16} />
        Convert to {format.toUpperCase()}
      </button>

      {/* Result */}
      {resultUrl && resultDims && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">Result</label>
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <img
              src={resultUrl}
              alt="Converted"
              className="max-h-64 max-w-full object-contain rounded"
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resultDims.w} × {resultDims.h}px · {formatBytes(resultSize)} · {format.toUpperCase()}
            </p>
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download size={16} />
              Download {format === 'jpg' ? 'image.jpg' : 'image.png'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
