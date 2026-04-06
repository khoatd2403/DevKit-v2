import { useRef, useState, useCallback } from 'react'
import { Upload } from 'lucide-react'

interface FileDropTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  wrapperClassName?: string
  accept?: string
  readOnly?: boolean
  id?: string
}

export default function FileDropTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  wrapperClassName = '',
  accept = '*',
  readOnly = false,
  id,
}: FileDropTextareaProps) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => onChange((e.target?.result as string) ?? '')
    reader.readAsText(file)
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) { readFile(file); return }
    const text = e.dataTransfer.getData('text')
    if (text) onChange(text)
  }, [readFile, onChange])

  const charCount = value.length
  const lineCount = value ? value.split('\n').length : 0

  if (readOnly) {
    return (
      <div className="relative">
        <textarea
          id={id}
          value={value}
          readOnly
          placeholder={placeholder}
          className={`tool-textarea ${className}`}
        />
        {value && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none select-none bg-white/80 dark:bg-gray-900/80 px-1 rounded">
            {charCount} chars · {lineCount} lines
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative group ${wrapperClassName}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
      onDrop={onDrop}
    >
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`tool-textarea ${className} ${dragging ? '!border-primary-400 !ring-primary-400' : ''}`}
      />

      {/* Drag overlay */}
      {dragging && (
        <div className="absolute inset-0 rounded-xl bg-primary-50/90 dark:bg-primary-950/80 border-2 border-dashed border-primary-400 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-1 text-primary-600 dark:text-primary-400">
            <Upload size={22} />
            <span className="text-sm font-medium">Drop file here</span>
          </div>
        </div>
      )}

      {/* Clear button — top-left corner, visible on hover */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-2 top-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          title="Clear"
          aria-label="Clear input"
        >
          ×
        </button>
      )}

      {/* Import button — top-right corner, visible on hover */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="absolute right-2 top-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
        title="Import file"
        aria-label="Import file"
      >
        <Upload size={11} /> Import
      </button>

      {/* Character & line counter — bottom-right, shown when non-empty */}
      {value && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none select-none bg-white/80 dark:bg-gray-900/80 px-1 rounded">
          {charCount} chars · {lineCount} lines
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) readFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
