import { useState, useMemo, useCallback } from 'react'
import { Download, ArrowUp, ArrowDown, ArrowUpDown, AlertTriangle } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------
type Delimiter = ',' | ';' | '\t' | '|'

function detectDelimiter(raw: string): Delimiter {
  const sample = raw.slice(0, 4096)
  const counts: Record<Delimiter, number> = {
    ',': 0,
    ';': 0,
    '\t': 0,
    '|': 0,
  }
  let inStr = false
  let strChar = ''
  for (const ch of sample) {
    if (inStr) {
      if (ch === strChar) inStr = false
      continue
    }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue }
    if (ch in counts) (counts as Record<string, number>)[ch]++
  }
  const best = (Object.entries(counts) as [Delimiter, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    [',', 0] as [Delimiter, number],
  )
  return best[0]
}

function parseCsvLine(line: string, delimiter: Delimiter): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  let quoteChar = ''

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === quoteChar) {
        // Escaped quote?
        if (line[i + 1] === quoteChar) { cur += ch; i++; continue }
        inQuotes = false
      } else {
        cur += ch
      }
      continue
    }

    if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; continue }
    if (ch === delimiter) { fields.push(cur); cur = ''; continue }
    cur += ch
  }

  fields.push(cur)
  return fields
}

function parseCsv(raw: string, delimiter: Delimiter): string[][] {
  return raw
    .split(/\r?\n/)
    .filter(l => l.trim() !== '')
    .map(l => parseCsvLine(l, delimiter))
}

// ---------------------------------------------------------------------------
// Re-serialise to CSV
// ---------------------------------------------------------------------------
function toCsvString(rows: string[][], delimiter: Delimiter): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const needsQuote =
            cell.includes(delimiter) ||
            cell.includes('"') ||
            cell.includes('\n')
          if (needsQuote) return `"${cell.replace(/"/g, '""')}"`
          return cell
        })
        .join(delimiter),
    )
    .join('\n')
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortDir = 'asc' | 'desc' | null

const MAX_ROWS = 10_000

const DELIMITER_LABELS: Record<Delimiter, string> = {
  ',': 'Comma (,)',
  ';': 'Semicolon (;)',
  '\t': 'Tab (⇥)',
  '|': 'Pipe (|)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CsvViewer() {
  const [input, setInput] = useState('')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const delimiter = useMemo(() => (input.trim() ? detectDelimiter(input) : ','), [input])

  const allRows = useMemo<string[][]>(() => {
    if (!input.trim()) return []
    return parseCsv(input, delimiter)
  }, [input, delimiter])

  const headers = allRows[0] ?? []
  const dataRows = allRows.slice(1)
  const truncated = dataRows.length > MAX_ROWS
  const visibleData = truncated ? dataRows.slice(0, MAX_ROWS) : dataRows

  const sortedData = useMemo(() => {
    if (sortCol === null || sortDir === null) return visibleData
    return [...visibleData].sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      // Try numeric
      const an = parseFloat(av)
      const bn = parseFloat(bv)
      const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [visibleData, sortCol, sortDir])

  const handleSort = useCallback(
    (colIdx: number) => {
      if (sortCol !== colIdx) { setSortCol(colIdx); setSortDir('asc'); return }
      if (sortDir === 'asc') { setSortDir('desc'); return }
      setSortCol(null); setSortDir(null)
    },
    [sortCol, sortDir],
  )

  const download = () => {
    const csvContent = toCsvString([headers, ...sortedData], delimiter)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }: { col: number }) => {
    if (sortCol !== col) return <ArrowUpDown size={12} className="opacity-40" />
    if (sortDir === 'asc') return <ArrowUp size={12} className="text-primary-500" />
    return <ArrowDown size={12} className="text-primary-500" />
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">Paste or drop a CSV file</label>
        <FileDropTextarea
          value={input}
          onChange={v => { setInput(v); setSortCol(null); setSortDir(null) }}
          placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
          accept=".csv"
          className="h-40"
        />
      </div>

      {/* Info bar */}
      {allRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Detected delimiter: <span className="font-medium text-gray-700 dark:text-gray-200">{DELIMITER_LABELS[delimiter]}</span>
          </span>
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <span className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">{dataRows.length.toLocaleString()}</span> rows ·{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{headers.length}</span> columns
          </span>
          <button onClick={download} className="btn-ghost flex items-center gap-1 ml-auto text-xs">
            <Download size={13} /> Download CSV
          </button>
        </div>
      )}

      {truncated && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <AlertTriangle size={15} />
          Showing first {MAX_ROWS.toLocaleString()} of {dataRows.length.toLocaleString()} rows for performance.
        </div>
      )}

      {/* Table */}
      {allRows.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto max-h-[520px]">
          <table className="min-w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-10 px-2 py-2 text-center text-xs text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-normal select-none">
                  #
                </th>
                {headers.map((h, ci) => (
                  <th
                    key={ci}
                    onClick={() => handleSort(ci)}
                    className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[200px]">{h || <em className="text-gray-400">(empty)</em>}</span>
                      <SortIcon col={ci} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }
                >
                  <td className="px-2 py-1.5 text-center text-xs text-gray-400 dark:text-gray-600 select-none border-b border-gray-100 dark:border-gray-800">
                    {ri + 1}
                  </td>
                  {headers.map((_, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 max-w-[300px] truncate"
                      title={row[ci] ?? ''}
                    >
                      {row[ci] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {input.trim() && allRows.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-8">
          No parseable CSV data found.
        </p>
      )}
    </div>
  )
}
