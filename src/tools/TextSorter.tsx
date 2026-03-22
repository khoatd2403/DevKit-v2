import { useState, useMemo } from 'react'
import { ArrowUpDown, Copy, Check, Shuffle, ArrowUp, ArrowDown } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

type SortOrder = 'az' | 'za' | 'len-asc' | 'len-desc' | 'natural' | 'random'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'len-asc', label: 'Length ↑ (shortest first)' },
  { value: 'len-desc', label: 'Length ↓ (longest first)' },
  { value: 'natural', label: 'Natural / Numeric' },
  { value: 'random', label: 'Random Shuffle' },
]

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function TextSorter() {
  const [input, setInput] = useState('banana\napple\ncherry\ndate\napple\nelderberry\nfig\ngrape')
  const [sortOrder, setSortOrder] = useState<SortOrder>('az')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [trimWhitespace, setTrimWhitespace] = useState(true)
  const [copied, setCopied] = useState(false)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const { output, inputCount, outputCount } = useMemo(() => {
    if (!input.trim()) return { output: '', inputCount: 0, outputCount: 0 }

    let lines = input.split('\n')
    const inputCount = lines.filter(l => l.length > 0).length

    if (trimWhitespace) lines = lines.map(l => l.trim())

    lines = lines.filter(l => l.length > 0)

    if (removeDuplicates) {
      const seen = new Set<string>()
      lines = lines.filter(l => {
        const key = caseSensitive ? l : l.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    if (sortOrder === 'random') {
      // shuffleSeed is used as a dependency to re-trigger shuffle
      void shuffleSeed
      lines = shuffleArray(lines)
    } else if (sortOrder === 'az') {
      lines = [...lines].sort((a, b) =>
        caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())
      )
    } else if (sortOrder === 'za') {
      lines = [...lines].sort((a, b) =>
        caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())
      )
    } else if (sortOrder === 'len-asc') {
      lines = [...lines].sort((a, b) => a.length - b.length || a.localeCompare(b))
    } else if (sortOrder === 'len-desc') {
      lines = [...lines].sort((a, b) => b.length - a.length || a.localeCompare(b))
    } else if (sortOrder === 'natural') {
      lines = [...lines].sort((a, b) =>
        caseSensitive ? naturalCompare(a, b) : naturalCompare(a.toLowerCase(), b.toLowerCase())
      )
    }

    const output = lines.join('\n')
    return { output, inputCount, outputCount: lines.length }
  }, [input, sortOrder, caseSensitive, removeDuplicates, trimWhitespace, shuffleSeed])

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">Input Lines</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste lines of text here, one per line..."
          className="h-44"
          accept="text/*"
        />
        {input && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{inputCount} line{inputCount !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Options</h3>

        {/* Sort order */}
        <div>
          <label className="label-text block mb-1.5">Sort Order</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setSortOrder(opt.value)
                  if (opt.value === 'random') setShuffleSeed(s => s + 1)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  sortOrder === opt.value
                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {sortOrder === 'random' && (
            <button
              onClick={() => setShuffleSeed(s => s + 1)}
              className="mt-2 flex items-center gap-1.5 btn-secondary text-xs"
            >
              <Shuffle size={12} /> Re-shuffle
            </button>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Case sensitive', value: caseSensitive, setter: setCaseSensitive },
            { label: 'Remove duplicates', value: removeDuplicates, setter: setRemoveDuplicates },
            { label: 'Trim whitespace', value: trimWhitespace, setter: setTrimWhitespace },
          ].map(({ label, value, setter }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setter(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative ${value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label-text flex items-center gap-2">
            <ArrowUpDown size={13} />
            Output
            {output && (
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                {outputCount} line{outputCount !== 1 ? 's' : ''}
                {inputCount !== outputCount && (
                  <span className={outputCount < inputCount ? 'text-amber-500' : 'text-green-500'}>
                    {' '}({outputCount < inputCount
                      ? <><ArrowDown size={10} className="inline" /> {inputCount - outputCount} removed</>
                      : <><ArrowUp size={10} className="inline" /> {outputCount - inputCount} added</>
                    })
                  </span>
                )}
              </span>
            )}
          </label>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <FileDropTextarea
          value={output}
          onChange={() => {}}
          readOnly
          placeholder="Sorted lines will appear here..."
          className="h-44"
        />
      </div>
    </div>
  )
}
