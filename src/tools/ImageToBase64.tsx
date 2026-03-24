import { useState, useRef } from 'react'
import CopyButton from '../components/CopyButton'
import { Upload } from 'lucide-react'

export default function ImageToBase64() {
  const [result, setResult] = useState('')
  const [preview, setPreview] = useState('')
  const [info, setInfo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setResult(dataUrl)
      setPreview(dataUrl)
      const sizeKb = (file.size / 1024).toFixed(1)
      const b64Size = ((dataUrl.length * 3) / 4 / 1024).toFixed(1)
      setInfo(`${file.name} • ${file.type} • ${sizeKb} KB → Base64: ~${b64Size} KB`)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
      >
        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop an image here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG, WebP supported</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {preview && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <img src={preview} alt="Preview" className="max-h-48 max-w-full mx-auto rounded-lg object-contain" />
          {info && <p className="text-xs text-gray-400 text-center mt-2">{info}</p>}
        </div>
      )}

      {result && (
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Data URL (Base64)</label>
            <div className="flex gap-2">
              <CopyButton text={result} toast="Data URL copied" />
              <CopyButton text={result.split(',')[1] || ''} toast="Base64 copied" className="!text-xs" />
            </div>
          </div>
          <textarea className="tool-textarea-output h-40 text-xs" readOnly value={result} />
        </div>
      )}
    </div>
  )
}
