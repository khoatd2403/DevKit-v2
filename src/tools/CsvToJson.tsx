import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

type DelimiterOption = 'auto' | ',' | ';' | '\t' | '|'

function detectDelimiter(firstLine: string): string {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 }
  let inQuote = false
  for (const ch of firstLine) {
    if (ch === '"') { inQuote = !inQuote; continue }
    if (!inQuote && ch in counts) counts[ch]!++
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? best[0] : ','
}

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuote = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]!
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuote = false; i++; continue
      }
      field += ch; i++; continue
    }
    if (ch === '"') { inQuote = true; i++; continue }
    if (ch === delimiter) { row.push(field); field = ''; i++; continue }
    if (ch === '\n') {
      row.push(field); field = ''
      rows.push(row); row = []
      i++; continue
    }
    if (ch === '\r') {
      if (text[i + 1] === '\n') i++
      row.push(field); field = ''
      rows.push(row); row = []
      i++; continue
    }
    field += ch; i++
  }
  // final field/row
  row.push(field)
  if (row.some(f => f !== '') || rows.length === 0) rows.push(row)
  // remove trailing empty row
  const last = rows[rows.length - 1]
  if (last && last.length === 1 && last[0] === '') rows.pop()
  return rows
}

function toValue(s: string, parseNums: boolean, parseBools: boolean): unknown {
  if (parseBools) {
    if (s.toLowerCase() === 'true') return true
    if (s.toLowerCase() === 'false') return false
  }
  if (parseNums && s !== '') {
    const n = Number(s)
    if (!isNaN(n) && s.trim() !== '') return n
  }
  return s
}

export default function CsvToJson() {
  const [input, setInput] = useState('name,age,city\nAlice,28,New York\nBob,34,London\nCarol,22,Tokyo')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState<DelimiterOption>('auto')
  const [hasHeader, setHasHeader] = useState(true)
  const [trimWs, setTrimWs] = useState(true)
  const [parseNums, setParseNums] = useState(true)
  const [parseBools, setParseBools] = useState(true)
  const [format, setFormat] = useState<'objects' | 'arrays' | 'pretty'>('objects')
  const [stats, setStats] = useState<{ rows: number; cols: number; detectedDelim: string } | null>(null)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); setStats(null); return }
    try {
      const firstLine = input.split('\n')[0] ?? ''
      const detectedDelim = delimiter === 'auto' ? detectDelimiter(firstLine) : delimiter
      const rows = parseCsv(input, detectedDelim)
      if (rows.length === 0) { setOutput('[]'); setStats(null); return }

      const processField = (f: string) => {
        const s = trimWs ? f.trim() : f
        return toValue(s, parseNums, parseBools)
      }

      let result: unknown
      const colCount = rows[0]?.length ?? 0

      if (format === 'arrays') {
        result = rows.map(row => row.map(f => processField(f)))
      } else {
        let headers: string[]
        let dataRows: string[][]
        if (hasHeader) {
          headers = (rows[0] ?? []).map((h, i) => (trimWs ? h.trim() : h) || `column${i + 1}`)
          dataRows = rows.slice(1)
        } else {
          headers = Array.from({ length: colCount }, (_, i) => `column${i + 1}`)
          dataRows = rows
        }
        result = dataRows.map(row => {
          const obj: Record<string, unknown> = {}
          headers.forEach((h, i) => { obj[h] = processField(row[i] ?? '') })
          return obj
        })
      }

      const indent = format === 'pretty' ? 2 : undefined
      setOutput(JSON.stringify(result, null, indent))
      setError('')
      const dataRowCount = hasHeader && format !== 'arrays' ? rows.length - 1 : rows.length
      setStats({ rows: dataRowCount, cols: colCount, detectedDelim })
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
      setStats(null)
    }
  }, [input, delimiter, hasHeader, trimWs, parseNums, parseBools, format])

  const delimLabel = (d: string) => d === '\t' ? 'Tab' : d === 'auto' ? 'Auto' : d

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Delimiter</label>
          <select
            value={delimiter}
            onChange={e => setDelimiter(e.target.value as DelimiterOption)}
            className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            {(['auto', ',', ';', '\t', '|'] as DelimiterOption[]).map(d => (
              <option key={d} value={d}>{delimLabel(d)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Output Format</label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value as 'objects' | 'arrays' | 'pretty')}
            className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            <option value="objects">Array of objects</option>
            <option value="arrays">Array of arrays</option>
            <option value="pretty">Pretty print</option>
          </select>
        </div>
        <div className="flex gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
          {[
            { label: 'First row is header', val: hasHeader, set: setHasHeader },
            { label: 'Trim whitespace', val: trimWs, set: setTrimWs },
            { label: 'Parse numbers', val: parseNums, set: setParseNums },
            { label: 'Parse booleans', val: parseBools, set: setParseBools },
          ].map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="rounded" />
              {label}
            </label>
          ))}
        </div>
        <button
          onClick={() => { setInput(''); setOutput(''); setError(''); setStats(null) }}
          className="btn-ghost flex items-center gap-1 text-xs ml-auto"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input CSV</label>
          <FileDropTextarea
            className="h-80"
            placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
            value={input}
            onChange={setInput}
            accept=".csv,text/csv,text/*"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">JSON Output</label>
            <CopyButton text={output} />
          </div>
          <textarea
            className="tool-textarea h-80"
            readOnly
            value={output}
            placeholder="JSON will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {stats && !error && (
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Rows: <strong className="text-gray-700 dark:text-gray-300">{stats.rows}</strong></span>
          <span>Columns: <strong className="text-gray-700 dark:text-gray-300">{stats.cols}</strong></span>
          <span>Delimiter: <strong className="text-gray-700 dark:text-gray-300">{delimLabel(stats.detectedDelim)}</strong></span>
        </div>
      )}
    </div>
  )
}
