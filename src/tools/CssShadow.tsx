import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'

interface BoxShadow {
  id: number
  x: number
  y: number
  blur: number
  spread: number
  color: string
  alpha: number
  inset: boolean
}

interface TextShadow {
  id: number
  x: number
  y: number
  blur: number
  color: string
  alpha: number
}

let idCounter = 10

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

function buildBoxShadowCss(shadows: BoxShadow[]): string {
  if (shadows.length === 0) return 'box-shadow: none;'
  const parts = shadows.map(s => {
    const col = hexToRgba(s.color, s.alpha)
    return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${col}`
  })
  return `box-shadow: ${parts.join(',\n           ')};`
}

function buildTextShadowCss(shadows: TextShadow[]): string {
  if (shadows.length === 0) return 'text-shadow: none;'
  const parts = shadows.map(s => {
    const col = hexToRgba(s.color, s.alpha)
    return `${s.x}px ${s.y}px ${s.blur}px ${col}`
  })
  return `text-shadow: ${parts.join(',\n            ')};`
}

function NumberInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="label-text block mb-1">{label}</label>
      <input
        type="number" min={min} max={max} value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="tool-textarea h-auto py-1.5 text-center font-mono text-sm w-full"
      />
    </div>
  )
}

export default function CssShadow() {
  const [mode, setMode] = useState<'box' | 'text'>('box')
  const [previewText, setPreviewText] = useState('Shadow Preview')
  const [copied, setCopied] = useState(false)

  const [boxShadows, setBoxShadows] = useState<BoxShadow[]>([
    { id: 1, x: 4, y: 4, blur: 12, spread: 0, color: '#000000', alpha: 0.25, inset: false },
  ])
  const [textShadows, setTextShadows] = useState<TextShadow[]>([
    { id: 1, x: 2, y: 2, blur: 4, color: '#000000', alpha: 0.4 },
  ])

  const boxCss = buildBoxShadowCss(boxShadows)
  const textCss = buildTextShadowCss(textShadows)
  const outputCss = mode === 'box' ? boxCss : textCss

  const addBox = () => setBoxShadows(prev => [...prev, { id: ++idCounter, x: 0, y: 4, blur: 8, spread: 0, color: '#000000', alpha: 0.2, inset: false }])
  const removeBox = (id: number) => setBoxShadows(prev => prev.filter(s => s.id !== id))
  const updateBox = useCallback((id: number, field: keyof BoxShadow, value: number | string | boolean) => {
    setBoxShadows(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }, [])

  const addText = () => setTextShadows(prev => [...prev, { id: ++idCounter, x: 1, y: 1, blur: 2, color: '#000000', alpha: 0.4 }])
  const removeText = (id: number) => setTextShadows(prev => prev.filter(s => s.id !== id))
  const updateText = useCallback((id: number, field: keyof TextShadow, value: number | string) => {
    setTextShadows(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(outputCss)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const previewBoxStyle = boxShadows.map(s => {
    const col = hexToRgba(s.color, s.alpha)
    return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${col}`
  }).join(', ')

  const previewTextStyle = textShadows.map(s => {
    const col = hexToRgba(s.color, s.alpha)
    return `${s.x}px ${s.y}px ${s.blur}px ${col}`
  }).join(', ')

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm w-fit">
        {(['box', 'text'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            {m === 'box' ? 'Box Shadow' : 'Text Shadow'}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 min-h-[120px]">
        {mode === 'box' ? (
          <div
            className="bg-white dark:bg-gray-200 rounded-lg px-8 py-5 text-gray-800 font-semibold text-lg"
            style={{ boxShadow: previewBoxStyle || 'none' }}
          >
            {previewText}
          </div>
        ) : (
          <span
            className="text-3xl font-bold text-gray-800 dark:text-gray-100"
            style={{ textShadow: previewTextStyle || 'none' }}
          >
            {previewText}
          </span>
        )}
      </div>

      {/* Preview text editor */}
      <div>
        <label className="label-text block mb-1">Preview Text</label>
        <input
          type="text"
          value={previewText}
          onChange={e => setPreviewText(e.target.value)}
          className="tool-textarea h-auto py-2"
        />
      </div>

      {/* Box Shadow controls */}
      {mode === 'box' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label-text">Shadows</label>
            <button onClick={addBox} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
              <Plus size={13} /> Add Shadow
            </button>
          </div>
          {boxShadows.map((s, idx) => (
            <div key={s.id} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shadow {idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.inset}
                      onChange={e => updateBox(s.id, 'inset', e.target.checked)}
                      className="accent-primary-600"
                    />
                    Inset
                  </label>
                  <button onClick={() => removeBox(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <NumberInput label="X Offset" value={s.x} min={-100} max={100} onChange={v => updateBox(s.id, 'x', v)} />
                <NumberInput label="Y Offset" value={s.y} min={-100} max={100} onChange={v => updateBox(s.id, 'y', v)} />
                <NumberInput label="Blur" value={s.blur} min={0} max={200} onChange={v => updateBox(s.id, 'blur', v)} />
                <NumberInput label="Spread" value={s.spread} min={-100} max={100} onChange={v => updateBox(s.id, 'spread', v)} />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="label-text block mb-1">Color</label>
                  <input
                    type="color" value={s.color}
                    onChange={e => updateBox(s.id, 'color', e.target.value)}
                    className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="flex-1">
                  <label className="label-text block mb-1">Alpha: {s.alpha.toFixed(2)}</label>
                  <input
                    type="range" min={0} max={1} step={0.01} value={s.alpha}
                    onChange={e => updateBox(s.id, 'alpha', Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-4">
                  {hexToRgba(s.color, s.alpha)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Text Shadow controls */}
      {mode === 'text' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label-text">Shadows</label>
            <button onClick={addText} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
              <Plus size={13} /> Add Shadow
            </button>
          </div>
          {textShadows.map((s, idx) => (
            <div key={s.id} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shadow {idx + 1}</span>
                <button onClick={() => removeText(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberInput label="X Offset" value={s.x} min={-100} max={100} onChange={v => updateText(s.id, 'x', v)} />
                <NumberInput label="Y Offset" value={s.y} min={-100} max={100} onChange={v => updateText(s.id, 'y', v)} />
                <NumberInput label="Blur" value={s.blur} min={0} max={100} onChange={v => updateText(s.id, 'blur', v)} />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="label-text block mb-1">Color</label>
                  <input
                    type="color" value={s.color}
                    onChange={e => updateText(s.id, 'color', e.target.value)}
                    className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="flex-1">
                  <label className="label-text block mb-1">Alpha: {s.alpha.toFixed(2)}</label>
                  <input
                    type="range" min={0} max={1} step={0.01} value={s.alpha}
                    onChange={e => updateText(s.id, 'alpha', Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-4">
                  {hexToRgba(s.color, s.alpha)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSS Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-text">Generated CSS</label>
          <button onClick={copy} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <textarea readOnly value={outputCss} className="tool-textarea font-mono text-sm h-24" />
      </div>
    </div>
  )
}
