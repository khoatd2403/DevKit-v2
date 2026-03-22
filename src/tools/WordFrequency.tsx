import { useState, useMemo } from 'react'
import { BarChart2, Copy, Check, Download } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'not', 'no', 'nor',
  'so', 'yet', 'both', 'either', 'neither', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'than', 'too', 'very', 'just', 'that', 'this',
  'these', 'those', 'it', 'its', 'he', 'she', 'they', 'we', 'you', 'i',
  'me', 'my', 'your', 'his', 'her', 'our', 'their', 'us', 'him', 'who',
  'what', 'which', 'when', 'where', 'why', 'how', 'if', 'as', 'up', 'out',
  'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'then', 'once', 'any', 'all', 'also', 'only', 'same',
])

interface WordEntry {
  word: string
  count: number
  percent: number
}

export default function WordFrequency() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. The dog barked at the fox. The fox ran away quickly.')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [ignoreStopWords, setIgnoreStopWords] = useState(false)
  const [minLength, setMinLength] = useState(1)
  const [copied, setCopied] = useState(false)

  const { entries, totalWords } = useMemo((): { entries: WordEntry[]; totalWords: number } => {
    if (!input.trim()) return { entries: [], totalWords: 0 }

    const words = input.match(/\b[a-zA-Z'-]+\b/g) ?? []
    const totalWords = words.length
    const freq = new Map<string, number>()

    for (const raw of words) {
      const word = caseSensitive ? raw : raw.toLowerCase()
      if (word.length < minLength) continue
      if (ignoreStopWords && STOP_WORDS.has(word.toLowerCase())) continue
      freq.set(word, (freq.get(word) ?? 0) + 1)
    }

    const sorted = [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([word, count]) => ({
        word,
        count,
        percent: totalWords > 0 ? (count / totalWords) * 100 : 0,
      }))

    return { entries: sorted, totalWords }
  }, [input, caseSensitive, ignoreStopWords, minLength])

  const csvContent = useMemo(() => {
    if (!entries.length) return ''
    const header = 'Word,Count,Percentage'
    const rows = entries.map(e => `${e.word},${e.count},${e.percent.toFixed(2)}%`)
    return [header, ...rows].join('\n')
  }, [entries])

  const handleCopyCsv = async () => {
    if (!csvContent) return
    await navigator.clipboard.writeText(csvContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maxCount = entries[0]?.count ?? 1

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">Input Text</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste your text here..."
          className="h-40"
          accept="text/*"
        />
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Options</h3>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: 'Case sensitive', value: caseSensitive, setter: setCaseSensitive },
            { label: 'Ignore stop words', value: ignoreStopWords, setter: setIgnoreStopWords },
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

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Min word length</label>
            <input
              type="number"
              min={1}
              max={50}
              value={minLength}
              onChange={e => setMinLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {entries.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entries.length} unique word{entries.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                out of {totalWords} total
              </span>
            </div>
            <button
              onClick={handleCopyCsv}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy as CSV'}
            </button>
          </div>

          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Word</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Count</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">%</th>
                  <th className="px-4 py-2 w-36"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {entries.map((entry, idx) => (
                  <tr key={entry.word} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-2 text-gray-400 dark:text-gray-600 text-xs">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono text-gray-800 dark:text-gray-200 font-medium">{entry.word}</td>
                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300 tabular-nums">{entry.count}</td>
                    <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 tabular-nums">{entry.percent.toFixed(1)}%</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all"
                          style={{ width: `${(entry.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : input.trim() ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
          No words found matching the current filters.
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm flex flex-col items-center gap-2">
          <BarChart2 size={28} className="opacity-40" />
          Enter some text to see word frequency analysis.
        </div>
      )}
    </div>
  )
}
