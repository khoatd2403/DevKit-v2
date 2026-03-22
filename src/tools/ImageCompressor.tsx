import { useState, useRef, useCallback } from 'react'
import { Upload, Download, X, ArrowRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputFormat = 'same' | 'jpg' | 'png' | 'webp'

interface CompressedEntry {
  id: string
  file: File
  originalUrl: string
  origWidth: number
  origHeight: number
  compressedUrl?: string
  compressedSize?: number
  compWidth?: number
  compHeight?: number
  compressing?: boolean
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function savings(orig: number, comp: number): string {
  const pct = ((orig - comp) / orig) * 100
  return pct > 0 ? `-${pct.toFixed(1)}%` : `+${Math.abs(pct).toFixed(1)}%`
}

function savingsColor(orig: number, comp: number): string {
  const pct = ((orig - comp) / orig) * 100
  if (pct > 10) return 'text-green-600 dark:text-green-400'
  if (pct > 0)  return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getMime(format: OutputFormat, file: File): string {
  if (format === 'same') return file.type || 'image/png'
  const map: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  return map[format]
}

function getExt(format: OutputFormat, file: File): string {
  if (format === 'same') return file.name.split('.').pop() ?? 'png'
  return format === 'jpg' ? 'jpg' : format
}

async function compressImage(
  file: File,
  quality: number,
  maxW: number | null,
  maxH: number | null,
  format: OutputFormat,
): Promise<{ url: string; size: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const srcUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(srcUrl)
      let w = img.naturalWidth
      let h = img.naturalHeight

      // Resize logic — scale proportionally to fit within maxW / maxH
      if (maxW && maxH) {
        const rw = maxW / w
        const rh = maxH / h
        const ratio = Math.min(rw, rh, 1)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      } else if (maxW && w > maxW) {
        h = Math.round(h * (maxW / w))
        w = maxW
      } else if (maxH && h > maxH) {
        w = Math.round(w * (maxH / h))
        h = maxH
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!

      const mime = getMime(format, file)
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      }

      ctx.drawImage(img, 0, 0, w, h)

      const q = (mime === 'image/jpeg' || mime === 'image/webp') ? quality / 100 : undefined

      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Compression failed')); return }
          const url = URL.createObjectURL(blob)
          resolve({ url, size: blob.size, width: w, height: h })
        },
        mime,
        q,
      )
    }

    img.onerror = () => { URL.revokeObjectURL(srcUrl); reject(new Error('Failed to load image')) }
    img.src = srcUrl
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageCompressor() {
  const [entries, setEntries] = useState<CompressedEntry[]>([])
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same')
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => /^image\/(png|jpe?g|webp|gif)$/i.test(f.type))
    arr.forEach(file => {
      const srcUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const entry: CompressedEntry = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          originalUrl: URL.createObjectURL(file),
          origWidth: img.naturalWidth,
          origHeight: img.naturalHeight,
        }
        URL.revokeObjectURL(srcUrl)
        setEntries(prev => [...prev, entry])
      }
      img.src = srcUrl
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files)
  }, [loadFiles])

  const removeEntry = (id: string) => {
    setEntries(prev => {
      const e = prev.find(x => x.id === id)
      if (e) {
        URL.revokeObjectURL(e.originalUrl)
        if (e.compressedUrl) URL.revokeObjectURL(e.compressedUrl)
      }
      return prev.filter(x => x.id !== id)
    })
    if (previewId === id) setPreviewId(null)
  }

  const compressOne = async (entry: CompressedEntry) => {
    setEntries(prev => prev.map(e =>
      e.id === entry.id ? { ...e, compressing: true, error: undefined } : e
    ))

    const mw = maxWidth ? parseInt(maxWidth) : null
    const mh = maxHeight ? parseInt(maxHeight) : null

    try {
      const { url, size, width, height } = await compressImage(entry.file, quality, mw, mh, outputFormat)
      setEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, compressing: false, compressedUrl: url, compressedSize: size, compWidth: width, compHeight: height } : e
      ))
      setPreviewId(entry.id)
    } catch (err) {
      setEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, compressing: false, error: String(err) } : e
      ))
    }
  }

  const compressAll = async () => {
    for (const entry of entries) {
      if (!entry.compressing) await compressOne(entry)
    }
  }

  const downloadOne = (entry: CompressedEntry) => {
    if (!entry.compressedUrl) return
    const a = document.createElement('a')
    a.href = entry.compressedUrl
    const baseName = entry.file.name.replace(/\.[^.]+$/, '')
    a.download = `${baseName}_compressed.${getExt(outputFormat, entry.file)}`
    a.click()
  }

  const downloadAll = () => {
    entries.forEach((e, i) => {
      if (!e.compressedUrl) return
      setTimeout(() => downloadOne(e), i * 150)
    })
  }

  const formats: OutputFormat[] = ['same', 'jpg', 'png', 'webp']
  const previewEntry = previewId ? entries.find(e => e.id === previewId) : null
  const allCompressed = entries.length > 0 && entries.every(e => e.compressedUrl)

  return (
    <div className="space-y-5">
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
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, GIF — multiple files allowed</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) loadFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {entries.length > 0 && (
        <>
          {/* Options */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Compression Options</p>

            {/* Quality */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Quality: <strong className="text-gray-700 dark:text-gray-300">{quality}%</strong>
                <span className="ml-1 opacity-60">(applies to JPG/WebP)</span>
              </label>
              <input type="range" min={1} max={100} value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full max-w-xs accent-primary-600" />
              <div className="flex gap-4 text-xs text-gray-400 mt-0.5 max-w-xs justify-between">
                <span>Smallest</span>
                <span>Best quality</span>
              </div>
            </div>

            {/* Max dimensions */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Max width (px)</label>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={e => setMaxWidth(e.target.value)}
                  placeholder="e.g. 1920"
                  min={1}
                  className="tool-textarea py-1.5 w-36"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Max height (px)</label>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={e => setMaxHeight(e.target.value)}
                  placeholder="e.g. 1080"
                  min={1}
                  className="tool-textarea py-1.5 w-36"
                />
              </div>
            </div>

            {/* Output format */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Output Format</label>
              <div className="flex flex-wrap gap-1.5">
                {formats.map(f => (
                  <button
                    key={f}
                    onClick={() => setOutputFormat(f)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      outputFormat === f
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                    }`}
                  >
                    {f === 'same' ? 'Same as input' : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File list */}
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={entry.originalUrl}
                    alt={entry.file.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    onClick={() => setPreviewId(prev => prev === entry.id ? null : entry.id)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{entry.file.name}</p>
                      <button onClick={() => removeEntry(entry.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Original info */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {entry.origWidth} × {entry.origHeight}px · {formatBytes(entry.file.size)}
                    </p>

                    {/* Compressed info */}
                    {entry.compressedUrl && entry.compressedSize !== undefined && (
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatBytes(entry.file.size)}</span>
                          <ArrowRight size={11} />
                          <span className="text-gray-700 dark:text-gray-200 font-medium">{formatBytes(entry.compressedSize)}</span>
                        </div>
                        <span className={`text-xs font-semibold ${savingsColor(entry.file.size, entry.compressedSize)}`}>
                          {savings(entry.file.size, entry.compressedSize)}
                        </span>
                        {entry.compWidth && entry.compHeight && (
                          <span className="text-xs text-gray-400">{entry.compWidth}×{entry.compHeight}px</span>
                        )}
                        <button onClick={() => downloadOne(entry)} className="btn-ghost text-xs py-0.5 px-2 flex items-center gap-1">
                          <Download size={12} /> Download
                        </button>
                      </div>
                    )}

                    {entry.compressing && (
                      <p className="text-xs text-primary-500 mt-1 animate-pulse">Compressing…</p>
                    )}
                    {entry.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{entry.error}</p>
                    )}
                  </div>

                  {/* Compress single */}
                  {!entry.compressedUrl && !entry.compressing && (
                    <button onClick={() => compressOne(entry)} className="btn-secondary text-xs px-3 flex-shrink-0 self-center">
                      Compress
                    </button>
                  )}
                </div>

                {/* Side-by-side preview */}
                {previewId === entry.id && entry.compressedUrl && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Before — {entry.origWidth}×{entry.origHeight} · {formatBytes(entry.file.size)}
                      </p>
                      <img src={entry.originalUrl} alt="original"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-48 bg-gray-50 dark:bg-gray-800" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        After — {entry.compWidth}×{entry.compHeight} · {formatBytes(entry.compressedSize!)}
                        <span className={`ml-1 font-semibold ${savingsColor(entry.file.size, entry.compressedSize!)}`}>
                          ({savings(entry.file.size, entry.compressedSize!)})
                        </span>
                      </p>
                      <img src={entry.compressedUrl} alt="compressed"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-48 bg-gray-50 dark:bg-gray-800" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={compressAll}
              disabled={entries.some(e => e.compressing)}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Upload size={15} />
              {entries.length === 1 ? 'Compress' : `Compress All (${entries.length})`}
            </button>
            {allCompressed && entries.length > 1 && (
              <button onClick={downloadAll} className="btn-secondary flex items-center gap-2">
                <Download size={15} />
                Download All
              </button>
            )}
            <button onClick={() => setEntries([])} className="btn-ghost text-red-500 dark:text-red-400">
              Clear All
            </button>
          </div>
        </>
      )}
    </div>
  )
}
