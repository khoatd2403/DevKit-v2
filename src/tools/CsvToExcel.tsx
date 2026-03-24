import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'

type Delimiter = ',' | ';' | '\t' | '|' | 'auto'

function detectDelimiter(line: string): ',' | ';' | '\t' | '|' {
  const counts: Record<string, number> = {
    ',': 0,
    ';': 0,
    '\t': 0,
    '|': 0,
  }
  for (const ch of line) {
    if (ch in counts) counts[ch]++
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return (best[1] > 0 ? best[0] : ',') as ',' | ';' | '\t' | '|'
}

function parseCsv(text: string, delimiter: ',' | ';' | '\t' | '|'): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  return lines.map((line) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  })
}

const DELIMITER_LABELS: Record<string, string> = {
  auto: 'Auto-detect',
  ',': 'Comma (,)',
  ';': 'Semicolon (;)',
  '\t': 'Tab',
  '|': 'Pipe (|)',
}

export default function CsvToExcel() {
  const [csvText, setCsvText] = useState('')
  const [delimiterOverride, setDelimiterOverride] = useState<Delimiter>('auto')
  const [hasHeader, setHasHeader] = useState(true)
  const [sheetName, setSheetName] = useState('Sheet1')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstLine = csvText.split(/\r?\n/)[0] ?? ''
  const detectedDelimiter: ',' | ';' | '\t' | '|' = firstLine
    ? detectDelimiter(firstLine)
    : ','
  const activeDelimiter =
    delimiterOverride === 'auto' ? detectedDelimiter : delimiterOverride

  const parsed = csvText.trim() ? parseCsv(csvText, activeDelimiter) : []
  const rowCount = hasHeader ? Math.max(0, parsed.length - 1) : parsed.length
  const colCount = parsed[0]?.length ?? 0

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setCsvText((e.target?.result as string) ?? '')
      setError('')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConvert = () => {
    setError('')
    if (!csvText.trim()) {
      setError('Please paste CSV data or upload a file.')
      return
    }
    if (parsed.length === 0) {
      setError('No data to convert.')
      return
    }
    try {
      const name = sheetName.trim() || 'Sheet1'
      let ws: XLSX.WorkSheet
      if (hasHeader && parsed.length > 1) {
        const headers = parsed[0]
        const rows = parsed.slice(1).map((r) => {
          const obj: Record<string, string> = {}
          headers.forEach((h, i) => {
            obj[h || `Col${i + 1}`] = r[i] ?? ''
          })
          return obj
        })
        ws = XLSX.utils.json_to_sheet(rows)
      } else {
        ws = XLSX.utils.aoa_to_sheet(parsed)
      }
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, name)
      XLSX.writeFile(wb, 'converted.xlsx')
    } catch (err) {
      setError(`Conversion failed: ${(err as Error).message}`)
    }
  }

  const previewRows = parsed.slice(0, hasHeader ? 6 : 5)
  const headerRow = hasHeader ? previewRows[0] : null
  const dataRows = hasHeader ? previewRows.slice(1) : previewRows

  const delimiterDisplay =
    activeDelimiter === '\t' ? 'Tab' : `"${activeDelimiter}"`

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div>
        <label className="tool-label block mb-1">
          Upload CSV File
        </label>
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop a .csv file here or{' '}
            <span className="text-blue-500 dark:text-blue-400 underline">
              click to browse
            </span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </div>
      </div>

      {/* CSV Textarea */}
      <div>
        <label className="tool-label block mb-1">
          Or paste CSV data
        </label>
        <textarea
          className="tool-textarea font-mono text-sm"
          rows={8}
          placeholder={'name,age,city\nAlice,30,New York\nBob,25,London'}
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value)
            setError('')
          }}
        />
      </div>

      {/* Options Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Delimiter selector */}
        <div>
          <label className="tool-label block mb-1">
            Delimiter
          </label>
          <select
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={delimiterOverride}
            onChange={(e) => setDelimiterOverride(e.target.value as Delimiter)}
          >
            {Object.entries(DELIMITER_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Sheet name */}
        <div>
          <label className="tool-label block mb-1">
            Sheet Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet1"
          />
        </div>

        {/* Header checkbox */}
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
            />
            First row is header
          </label>
        </div>
      </div>

      {/* Stats */}
      {csvText.trim() && parsed.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
            Detected delimiter: <strong>{delimiterDisplay}</strong>
          </span>
          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
            Rows: <strong>{rowCount}</strong>
          </span>
          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
            Columns: <strong>{colCount}</strong>
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}

      {/* Convert button */}
      <button
        className="btn-primary"
        onClick={handleConvert}
        disabled={!csvText.trim()}
      >
        Download as Excel (.xlsx)
      </button>

      {/* Preview */}
      {parsed.length > 0 && (
        <div>
          <label className="tool-label block mb-2">
            Preview (first {dataRows.length} data row{dataRows.length !== 1 ? 's' : ''})
          </label>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-xs">
              {headerRow && (
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    {headerRow.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 whitespace-nowrap"
                      >
                        {h || `Col${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={
                      ri % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-700/40'
                    }
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-1.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50 whitespace-nowrap max-w-[200px] truncate"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
