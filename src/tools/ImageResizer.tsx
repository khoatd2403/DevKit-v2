import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download, Lock, Unlock } from 'lucide-react'

type ResizeMode = 'pixels' | 'percentage' | 'maxdim'
type OutputFormat = 'same' | 'png' | 'jpg' | 'webp'

interface OriginalInfo {
  file: File
  objectUrl: string
  width: number
  height: number
}

interface ResultInfo {
  url: string
  width: number
  height: number
  size: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getMime(format: OutputFormat, originalType: string): string {
  if (format === 'same') return originalType
  const map: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
  return map[format] || 'image/png'
}

function getExt(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  }
  return map[mime] || 'png'
}

export default function ImageResizer() {
  const [original, setOriginal] = useState<OriginalInfo | null>(null)
  const [mode, setMode] = useState<ResizeMode>('pixels')
  const [pixelW, setPixelW] = useState('')
  const [pixelH, setPixelH] = useState('')
  const [percentage, setPercentage] = useState('100')
  const [maxDim, setMaxDim] = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [fitWithin, setFitWithin] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same')
  const [quality, setQuality] = useState(85)
  const [result, setResult] = useState<ResultInfo | null>(null)
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const aspectRef = useRef(1)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file.'); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      if (original?.objectUrl) URL.revokeObjectURL(original.objectUrl)
      if (result?.url) URL.revokeObjectURL(result.url)
      aspectRef.current = img.naturalWidth / img.naturalHeight
      setOriginal({ file, objectUrl: url, width: img.naturalWidth, height: img.naturalHeight })
      setPixelW(String(img.naturalWidth))
      setPixelH(String(img.naturalHeight))
      setMaxDim(String(Math.max(img.naturalWidth, img.naturalHeight)))
      setResult(null)
      setError('')
    }
    img.onerror = () => setError('Failed to load image.')
    img.src = url
  }, [original, result])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  // Sync aspect ratio when width changes in pixel mode
  const handleWidthChange = (val: string) => {
    setPixelW(val)
    if (lockAspect && val) {
      const w = parseInt(val, 10)
      if (!isNaN(w)) setPixelH(String(Math.round(w / aspectRef.current)))
    }
  }

  const handleHeightChange = (val: string) => {
    setPixelH(val)
    if (lockAspect && val) {
      const h = parseInt(val, 10)
      if (!isNaN(h)) setPixelW(String(Math.round(h * aspectRef.current)))
    }
  }

  // Keep pixel fields in sync when lock is re-enabled
  useEffect(() => {
    if (lockAspect && pixelW && original) {
      const w = parseInt(pixelW, 10)
      if (!isNaN(w)) setPixelH(String(Math.round(w / aspectRef.current)))
    }
  }, [lockAspect])

  const computeDimensions = (): { w: number; h: number } | null => {
    if (!original) return null
    const { width: origW, height: origH } = original

    if (mode === 'pixels') {
      const w = parseInt(pixelW, 10)
      const h = parseInt(pixelH, 10)
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null
      if (fitWithin && w >= origW && h >= origH) return { w: origW, h: origH }
      return { w, h }
    }

    if (mode === 'percentage') {
      const pct = parseFloat(percentage)
      if (isNaN(pct) || pct <= 0) return null
      const w = Math.round(origW * pct / 100)
      const h = Math.round(origH * pct / 100)
      return { w, h }
    }

    if (mode === 'maxdim') {
      const max = parseInt(maxDim, 10)
      if (isNaN(max) || max <= 0) return null
      const longestSide = Math.max(origW, origH)
      if (fitWithin && longestSide <= max) return { w: origW, h: origH }
      const scale = max / longestSide
      return { w: Math.round(origW * scale), h: Math.round(origH * scale) }
    }

    return null
  }

  const handleResize = () => {
    if (!original) return
    const dims = computeDimensions()
    if (!dims) { setError('Invalid dimensions.'); return }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = dims.w
      canvas.height = dims.h
      const ctx = canvas.getContext('2d')!
      const mime = getMime(outputFormat, original.file.type)

      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, dims.w, dims.h)
      }
      ctx.drawImage(img, 0, 0, dims.w, dims.h)

      const q = (mime === 'image/jpeg' || mime === 'image/webp') ? quality / 100 : undefined
      canvas.toBlob(
        (blob) => {
          if (!blob) { setError('Resize failed.'); return }
          if (result?.url) URL.revokeObjectURL(result.url)
          const url = URL.createObjectURL(blob)
          setResult({ url, width: dims.w, height: dims.h, size: blob.size })
          setError('')
        },
        mime,
        q
      )
    }
    img.onerror = () => setError('Failed to process image.')
    img.src = original.objectUrl
  }

  const handleDownload = () => {
    if (!result || !original) return
    const mime = getMime(outputFormat, original.file.type)
    const ext = getExt(mime)
    const a = document.createElement('a')
    a.href = result.url
    const base = original.file.name.replace(/\.[^.]+$/, '')
    a.download = `${base}_resized.${ext}`
    a.click()
  }

  const modes: { value: ResizeMode; label: string }[] = [
    { value: 'pixels', label: 'By Pixels' },
    { value: 'percentage', label: 'By Percentage' },
    { value: 'maxdim', label: 'Max Dimension' },
  ]

  const formats: { value: OutputFormat; label: string }[] = [
    { value: 'same', label: 'Same as Input' },
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'webp', label: 'WebP' },
  ]

  const effectiveMime = original ? getMime(outputFormat, original.file.type) : ''
  const showQuality = effectiveMime === 'image/jpeg' || effectiveMime === 'image/webp'

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop an image here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP and more supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = '' }}
        />
      </div>

      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}

      {original && (
        <>
          {/* Original preview + info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <label className="tool-label block mb-2">Original</label>
            <div className="flex gap-4 items-start">
              <img
                src={original.objectUrl}
                alt="Original"
                className="w-24 h-24 object-contain rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">{original.file.name}</p>
                <p>{original.width} × {original.height}px</p>
                <p>{formatBytes(original.file.size)}</p>
                <p>{original.file.type}</p>
              </div>
            </div>
          </div>

          {/* Resize mode */}
          <div>
            <label className="tool-label block mb-1">Resize Mode</label>
            <div className="flex gap-2 flex-wrap">
              {modes.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    mode === m.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode-specific inputs */}
          {mode === 'pixels' && (
            <div className="flex gap-3 items-end flex-wrap">
              <div>
                <label className="tool-label block mb-1">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  value={pixelW}
                  onChange={e => handleWidthChange(e.target.value)}
                  className="w-28 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                />
              </div>
              <button
                onClick={() => setLockAspect(v => !v)}
                className="mb-0.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
                title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {lockAspect ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
              <div>
                <label className="tool-label block mb-1">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  value={pixelH}
                  onChange={e => handleHeightChange(e.target.value)}
                  className="w-28 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          )}

          {mode === 'percentage' && (
            <div>
              <label className="tool-label block mb-1">
                Scale: {percentage}%
                {original && (() => {
                  const pct = parseFloat(percentage)
                  if (!isNaN(pct)) return ` → ${Math.round(original.width * pct / 100)} × ${Math.round(original.height * pct / 100)}px`
                  return ''
                })()}
              </label>
              <input
                type="range"
                min={10}
                max={200}
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>10%</span>
                <span>200%</span>
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                className="mt-2 w-24 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
              />
            </div>
          )}

          {mode === 'maxdim' && (
            <div>
              <label className="tool-label block mb-1">Max dimension (px) — longest side</label>
              <input
                type="number"
                min={1}
                value={maxDim}
                onChange={e => setMaxDim(e.target.value)}
                className="w-32 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
              />
            </div>
          )}

          {/* Fit Within toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fitWithin}
              onChange={e => setFitWithin(e.target.checked)}
              className="accent-primary-600 w-4 h-4"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Fit within (only resize if larger than specified dimensions)
            </span>
          </label>

          {/* Output format */}
          <div>
            <label className="tool-label block mb-1">Output Format</label>
            <div className="flex gap-2 flex-wrap">
              {formats.map(f => (
                <button
                  key={f.value}
                  onClick={() => setOutputFormat(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    outputFormat === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {showQuality && (
            <div>
              <label className="tool-label block mb-1">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1 (smallest)</span>
                <span>100 (best)</span>
              </div>
            </div>
          )}

          {/* Resize button */}
          <button onClick={handleResize} className="btn-primary">
            Resize Image
          </button>

          {/* Result */}
          {result && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <label className="tool-label block">Result Preview</label>
              <img
                src={result.url}
                alt="Resized"
                className="max-h-64 max-w-full mx-auto rounded-lg object-contain bg-gray-100 dark:bg-gray-800"
              />
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.width} × {result.height}px · {formatBytes(result.size)}
                </p>
                <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
