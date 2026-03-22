import { useState, useRef, useCallback } from 'react'
import { Upload, Download, X, ImageIcon } from 'lucide-react'

type OutputFormat = 'png' | 'jpg' | 'webp' | 'bmp'

interface ImageEntry {
  id: string
  file: File
  objectUrl: string
  width: number
  height: number
  convertedUrl?: string
  convertedSize?: number
  converting?: boolean
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function encodeBmp(ctx: CanvasRenderingContext2D, width: number, height: number): Blob {
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  const rowSize = Math.ceil((width * 3) / 4) * 4 // padded to 4 bytes
  const pixelDataSize = rowSize * height
  const fileSize = 54 + pixelDataSize

  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // BMP File Header (14 bytes)
  bytes[0] = 0x42; bytes[1] = 0x4d // "BM"
  view.setUint32(2, fileSize, true)
  view.setUint16(6, 0, true)
  view.setUint16(8, 0, true)
  view.setUint32(10, 54, true) // pixel data offset

  // DIB Header - BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true)     // header size
  view.setInt32(18, width, true)
  view.setInt32(22, -height, true) // negative = top-down; we flip rows below
  view.setUint16(26, 1, true)      // color planes
  view.setUint16(28, 24, true)     // bits per pixel (24-bit, no alpha)
  view.setUint32(30, 0, true)      // compression (none)
  view.setUint32(34, pixelDataSize, true)
  view.setInt32(38, 2835, true)    // X pixels per meter (~72 DPI)
  view.setInt32(42, 2835, true)    // Y pixels per meter
  view.setUint32(46, 0, true)
  view.setUint32(50, 0, true)

  // Pixel data — BMP stores rows bottom-to-top
  for (let row = 0; row < height; row++) {
    const bmpRow = height - 1 - row
    const srcRowOffset = row * width * 4
    const dstRowOffset = 54 + bmpRow * rowSize

    for (let col = 0; col < width; col++) {
      const srcIdx = srcRowOffset + col * 4
      const dstIdx = dstRowOffset + col * 3
      bytes[dstIdx]     = pixels[srcIdx + 2] // B
      bytes[dstIdx + 1] = pixels[srcIdx + 1] // G
      bytes[dstIdx + 2] = pixels[srcIdx]     // R
    }
    // remaining bytes in row are already 0 (padding)
  }

  return new Blob([buffer], { type: 'image/bmp' })
}

async function convertImage(entry: ImageEntry, format: OutputFormat, quality: number): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      if (format === 'jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)

      if (format === 'bmp') {
        const blob = encodeBmp(ctx, canvas.width, canvas.height)
        const url = URL.createObjectURL(blob)
        resolve({ url, size: blob.size })
        return
      }

      const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
      const mime = mimeMap[format]
      const q = (format === 'jpg' || format === 'webp') ? quality / 100 : undefined

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Conversion failed')); return }
          const url = URL.createObjectURL(blob)
          resolve({ url, size: blob.size })
        },
        mime,
        q
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = entry.objectUrl
  })
}

export default function ImageConverter() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [format, setFormat] = useState<OutputFormat>('png')
  const [quality, setQuality] = useState(92)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    arr.forEach(file => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setImages(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          file,
          objectUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        }])
      }
      img.src = objectUrl
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length) loadImages(e.dataTransfer.files)
  }, [loadImages])

  const removeImage = (id: string) => {
    setImages(prev => {
      const entry = prev.find(e => e.id === id)
      if (entry) {
        URL.revokeObjectURL(entry.objectUrl)
        if (entry.convertedUrl) URL.revokeObjectURL(entry.convertedUrl)
      }
      return prev.filter(e => e.id !== id)
    })
  }

  const convertAll = async () => {
    setImages(prev => prev.map(e => ({ ...e, converting: true, error: undefined, convertedUrl: undefined })))

    for (const entry of images) {
      try {
        const { url, size } = await convertImage(entry, format, quality)
        setImages(prev => prev.map(e =>
          e.id === entry.id ? { ...e, converting: false, convertedUrl: url, convertedSize: size } : e
        ))
      } catch (err) {
        setImages(prev => prev.map(e =>
          e.id === entry.id ? { ...e, converting: false, error: String(err) } : e
        ))
      }
    }
  }

  const downloadOne = (entry: ImageEntry) => {
    if (!entry.convertedUrl) return
    const a = document.createElement('a')
    a.href = entry.convertedUrl
    a.download = `converted.${format}`
    a.click()
  }

  const downloadAll = () => {
    images.forEach((entry, i) => {
      if (!entry.convertedUrl) return
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = entry.convertedUrl!
        const base = entry.file.name.replace(/\.[^.]+$/, '')
        a.download = `${base}_converted.${format}`
        a.click()
      }, i * 200)
    })
  }

  const formats: OutputFormat[] = ['png', 'jpg', 'webp', 'bmp']
  const showQuality = format === 'jpg' || format === 'webp'
  const allConverted = images.length > 0 && images.every(e => e.convertedUrl)

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
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, BMP, GIF supported · Multiple files allowed</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) loadImages(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* Output format */}
      {images.length > 0 && (
        <>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Output Format</label>
            <div className="flex gap-2 flex-wrap">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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

          {/* Quality slider */}
          {showQuality && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
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

          {/* Image list */}
          <div className="space-y-3">
            {images.map(entry => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
              >
                <div className="flex gap-3">
                  <img
                    src={entry.objectUrl}
                    alt={entry.file.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{entry.file.name}</p>
                      <button
                        onClick={() => removeImage(entry.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {entry.width} × {entry.height}px · {formatBytes(entry.file.size)} · {entry.file.type.split('/')[1]?.toUpperCase()}
                    </p>
                    {entry.converting && (
                      <p className="text-xs text-primary-500 mt-1">Converting…</p>
                    )}
                    {entry.error && (
                      <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 mt-1">
                        {entry.error}
                      </div>
                    )}
                    {entry.convertedUrl && entry.convertedSize !== undefined && (
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Output: {formatBytes(entry.convertedSize)}
                        </p>
                        <button
                          onClick={() => downloadOne(entry)}
                          className="flex items-center gap-1 text-xs btn-ghost py-0.5 px-2"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={convertAll}
              disabled={images.some(e => e.converting)}
              className="btn-primary flex items-center gap-2"
            >
              <ImageIcon size={16} />
              {images.length === 1 ? 'Convert' : `Convert All (${images.length})`}
            </button>
            {allConverted && images.length > 1 && (
              <button onClick={downloadAll} className="btn-secondary flex items-center gap-2">
                <Download size={16} />
                Download All
              </button>
            )}
            <button
              onClick={() => setImages([])}
              className="btn-ghost text-red-500 dark:text-red-400"
            >
              Clear All
            </button>
          </div>
        </>
      )}
    </div>
  )
}
