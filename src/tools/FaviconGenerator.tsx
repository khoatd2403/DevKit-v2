import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Image as ImageIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'emoji' | 'text'

const PREVIEW_SIZES = [16, 32, 64] as const
const EXPORT_PNG_SIZES = [16, 32, 48, 64, 128, 192, 512] as const

// ─── Canvas rendering ─────────────────────────────────────────────────────────

function renderToCanvas(
  canvas: HTMLCanvasElement,
  size: number,
  mode: Mode,
  emoji: string,
  text: string,
  bgColor: string,
  textColor: string,
  fontSize: number,
  bold: boolean,
  borderRadius: number,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = size
  canvas.height = size

  const radius = (borderRadius / 100) * (size / 2)

  // Background with optional rounded corners
  ctx.clearRect(0, 0, size, size)
  ctx.beginPath()
  if (radius > 0) {
    ctx.moveTo(radius, 0)
    ctx.lineTo(size - radius, 0)
    ctx.quadraticCurveTo(size, 0, size, radius)
    ctx.lineTo(size, size - radius)
    ctx.quadraticCurveTo(size, size, size - radius, size)
    ctx.lineTo(radius, size)
    ctx.quadraticCurveTo(0, size, 0, size - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
  } else {
    ctx.rect(0, 0, size, size)
  }
  ctx.fillStyle = bgColor
  ctx.fill()

  ctx.save()
  ctx.clip()

  if (mode === 'emoji') {
    if (emoji) {
      const emojiSize = size * 0.75
      ctx.font = `${emojiSize}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(emoji, size / 2, size / 2 + emojiSize * 0.04)
    }
  } else {
    const content = (text || '?').slice(0, 2)
    const scaledFontSize = (fontSize / 100) * size * 0.85
    ctx.font = `${bold ? 'bold ' : ''}${scaledFontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = textColor
    ctx.fillText(content, size / 2, size / 2)
  }

  ctx.restore()
}

// ─── ICO file builder ─────────────────────────────────────────────────────────
// Builds a minimal RIFF-less ICO with embedded PNG images (modern ICO format)

async function buildIco(sizes: number[], renderArgs: RenderArgs): Promise<Blob> {
  const pngBlobs: Blob[] = []
  for (const sz of sizes) {
    const c = document.createElement('canvas')
    renderToCanvas(c, sz, renderArgs.mode, renderArgs.emoji, renderArgs.text,
      renderArgs.bgColor, renderArgs.textColor, renderArgs.fontSize,
      renderArgs.bold, renderArgs.borderRadius)
    const blob = await new Promise<Blob>((res, rej) =>
      c.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
    )
    pngBlobs.push(blob)
  }

  const pngBuffers = await Promise.all(pngBlobs.map(b => b.arrayBuffer()))

  // ICO header: 6 bytes
  const numImages = sizes.length
  const headerSize = 6 + numImages * 16
  let totalSize = headerSize
  pngBuffers.forEach(buf => { totalSize += buf.byteLength })

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // Reserved, Type (1 = ICO), Count
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, numImages, true)

  let imageOffset = headerSize
  pngBuffers.forEach((pngBuf, i) => {
    const sz = sizes[i]
    const byteOffset = 6 + i * 16
    // Width, Height (0 means 256)
    bytes[byteOffset] = sz >= 256 ? 0 : sz
    bytes[byteOffset + 1] = sz >= 256 ? 0 : sz
    bytes[byteOffset + 2] = 0  // color count
    bytes[byteOffset + 3] = 0  // reserved
    view.setUint16(byteOffset + 4, 1, true)   // color planes
    view.setUint16(byteOffset + 6, 32, true)  // bits per pixel
    view.setUint32(byteOffset + 8, pngBuf.byteLength, true)
    view.setUint32(byteOffset + 12, imageOffset, true)

    bytes.set(new Uint8Array(pngBuf), imageOffset)
    imageOffset += pngBuf.byteLength
  })

  return new Blob([buffer], { type: 'image/x-icon' })
}

interface RenderArgs {
  mode: Mode
  emoji: string
  text: string
  bgColor: string
  textColor: string
  fontSize: number
  bold: boolean
  borderRadius: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FaviconGenerator() {
  const [mode, setMode] = useState<Mode>('emoji')
  const [emoji, setEmoji] = useState('🚀')
  const [text, setText] = useState('AB')
  const [bgColor, setBgColor] = useState('#6366f1')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(65)
  const [bold, setBold] = useState(true)
  const [borderRadius, setBorderRadius] = useState(20)

  const previewRefs = useRef<Record<number, HTMLCanvasElement | null>>({})
  const masterCanvasRef = useRef<HTMLCanvasElement>(null)

  const getRenderArgs = useCallback((): RenderArgs => ({
    mode, emoji, text, bgColor, textColor, fontSize, bold, borderRadius
  }), [mode, emoji, text, bgColor, textColor, fontSize, bold, borderRadius])

  // Redraw previews whenever settings change
  useEffect(() => {
    const args = getRenderArgs()
    PREVIEW_SIZES.forEach(sz => {
      const canvas = previewRefs.current[sz]
      if (canvas) renderToCanvas(canvas, sz * 2, args.mode, args.emoji, args.text,
        args.bgColor, args.textColor, args.fontSize, args.bold, args.borderRadius)
    })
    // Also render master at 256
    if (masterCanvasRef.current) {
      renderToCanvas(masterCanvasRef.current, 256, args.mode, args.emoji, args.text,
        args.bgColor, args.textColor, args.fontSize, args.bold, args.borderRadius)
    }
  }, [getRenderArgs])

  const downloadPng = useCallback(async (size: number) => {
    const canvas = document.createElement('canvas')
    const args = getRenderArgs()
    renderToCanvas(canvas, size, args.mode, args.emoji, args.text,
      args.bgColor, args.textColor, args.fontSize, args.bold, args.borderRadius)
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(b => b ? res(b) : rej(), 'image/png')
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `favicon-${size}x${size}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, [getRenderArgs])

  const downloadAllPngs = useCallback(async () => {
    for (let i = 0; i < EXPORT_PNG_SIZES.length; i++) {
      await new Promise(r => setTimeout(r, i * 80))
      await downloadPng(EXPORT_PNG_SIZES[i])
    }
  }, [downloadPng])

  const downloadIco = useCallback(async () => {
    const args = getRenderArgs()
    const blob = await buildIco([16, 32, 48], args)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favicon.ico'
    a.click()
    URL.revokeObjectURL(url)
  }, [getRenderArgs])

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div>
        <label className="tool-label block mb-2">Mode</label>
        <div className="flex gap-1">
          {(['emoji', 'text'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                mode === m
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {m === 'emoji' ? 'Emoji' : 'Text'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: settings */}
        <div className="space-y-4">
          {mode === 'emoji' ? (
            <div>
              <label className="tool-label block mb-1">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="🚀"
                className="tool-textarea py-2 text-2xl"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Type, paste, or pick an emoji below. <br/>
                <span className="opacity-80">
                  💡 <b>Tip:</b> Open OS emoji picker using <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-sans text-[10px]">Win</kbd> + <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-sans text-[10px]">.</kbd> (Windows) or <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-sans text-[10px]">Cmd</kbd> + <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-sans text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-sans text-[10px]">Space</kbd> (Mac).
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['🚀', '⭐', '🔥', '⚡', '💡', '🛠️', '💻', '🔮', '🎉', '🌟', '⚙️', '✨'].map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="p-1.5 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={`Use ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="tool-label block mb-1">Text (1–2 chars)</label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 2))}
                  placeholder="AB"
                  maxLength={2}
                  className="tool-textarea py-2 text-xl font-bold tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="tool-label block mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{textColor}</span>
                  </div>
                </div>
                <div>
                  <label className="tool-label block mb-1">Bold</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={bold} onChange={e => setBold(e.target.checked)}
                      className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Bold text</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="tool-label block mb-1">
                  Font size: {fontSize}%
                </label>
                <input type="range" min={30} max={100} value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-primary-600" />
              </div>
            </>
          )}

          {/* Background color */}
          <div>
            <label className="tool-label block mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{bgColor}</span>
            </div>
          </div>

          {/* Border radius */}
          <div>
            <label className="tool-label block mb-1">
              Corner radius: {borderRadius}%
            </label>
            <input type="range" min={0} max={50} value={borderRadius}
              onChange={e => setBorderRadius(Number(e.target.value))}
              className="w-full accent-primary-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>Square</span>
              <span>Rounded</span>
              <span>Circle</span>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          <div>
            <label className="tool-label block mb-3">Preview</label>
            {/* Master preview at 256 (displayed smaller) */}
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4">
              <canvas
                ref={masterCanvasRef}
                style={{ width: 128, height: 128, imageRendering: 'pixelated' }}
                className="rounded shadow-md"
              />
            </div>

            {/* Size previews */}
            <div className="flex items-end gap-6 flex-wrap">
              {PREVIEW_SIZES.map(sz => (
                <div key={sz} className="flex flex-col items-center gap-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-1">
                    <canvas
                      ref={el => { previewRefs.current[sz] = el }}
                      style={{ width: sz, height: sz, imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{sz}px</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export buttons */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Export</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadIco} className="btn-primary flex items-center gap-2">
                <Download size={15} />
                Download .ICO (16+32+48)
              </button>
              <button onClick={downloadAllPngs} className="btn-secondary flex items-center gap-2">
                <ImageIcon size={15} />
                All PNG Sizes
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {EXPORT_PNG_SIZES.map(sz => (
                <button
                  key={sz}
                  onClick={() => downloadPng(sz)}
                  className="btn-ghost text-xs px-2.5 py-1"
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
