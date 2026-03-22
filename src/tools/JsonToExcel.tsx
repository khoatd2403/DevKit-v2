import { useState } from 'react'
import * as XLSX from 'xlsx'
import FileDropTextarea from '../components/FileDropTextarea'

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

function flattenObject(
  obj: Record<string, JsonValue>,
  prefix = '',
): Record<string, string | number | boolean | null> {
  const result: Record<string, string | number | boolean | null> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val)
    ) {
      const nested = flattenObject(
        val as Record<string, JsonValue>,
        fullKey,
      )
      Object.assign(result, nested)
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val)
    } else {
      result[fullKey] = val as string | number | boolean | null
    }
  }
  return result
}

export default function JsonToExcel() {
  const [jsonText, setJsonText] = useState('')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [flattenNested, setFlattenNested] = useState(false)
  const [error, setError] = useState('')

  const parseJson = ():
    | { rows: Record<string, JsonValue>[]; isAoa: boolean }
    | null => {
    if (!jsonText.trim()) return null
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of objects or an array of arrays.')
        return null
      }
      if (parsed.length === 0) {
        setError('JSON array is empty.')
        return null
      }
      if (Array.isArray(parsed[0])) {
        return { rows: parsed as Record<string, JsonValue>[], isAoa: true }
      }
      if (typeof parsed[0] === 'object' && parsed[0] !== null) {
        return { rows: parsed as Record<string, JsonValue>[], isAoa: false }
      }
      setError('JSON array items must be objects or arrays.')
      return null
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`)
      return null
    }
  }

  const parsed = (() => {
    try {
      if (!jsonText.trim()) return null
      const p = JSON.parse(jsonText)
      if (!Array.isArray(p)) return null
      return p
    } catch {
      return null
    }
  })()

  const isAoa = parsed && Array.isArray(parsed[0])
  const rowCount = parsed?.length ?? 0
  const colCount = isAoa
    ? (parsed?.[0] as unknown[])?.length ?? 0
    : parsed && !isAoa && parsed[0] && typeof parsed[0] === 'object'
    ? (() => {
        const sample =
          flattenNested
            ? flattenObject(parsed[0] as Record<string, JsonValue>)
            : (parsed[0] as Record<string, JsonValue>)
        return Object.keys(sample).length
      })()
    : 0

  const handleConvert = () => {
    setError('')
    const result = parseJson()
    if (!result) return

    try {
      const name = sheetName.trim() || 'Sheet1'
      const wb = XLSX.utils.book_new()
      let ws: XLSX.WorkSheet

      if (result.isAoa) {
        ws = XLSX.utils.aoa_to_sheet(
          result.rows as unknown as unknown[][],
        )
      } else {
        const processedRows = result.rows.map((row) => {
          const r = row as Record<string, JsonValue>
          return flattenNested ? flattenObject(r) : r
        })
        ws = XLSX.utils.json_to_sheet(processedRows, {
          skipHeader: !includeHeaders,
        })
      }

      XLSX.utils.book_append_sheet(wb, ws, name)
      XLSX.writeFile(wb, 'export.xlsx')
    } catch (err) {
      setError(`Conversion failed: ${(err as Error).message}`)
    }
  }

  // Build preview rows
  const getPreviewData = (): {
    headers: string[]
    rows: (string | number | boolean | null)[][]
  } => {
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0)
      return { headers: [], rows: [] }

    if (isAoa) {
      const slice = parsed.slice(0, 5) as unknown[][]
      return { headers: [], rows: slice.map((r) => r as (string | number | boolean | null)[]) }
    }

    const processedRows = (parsed as Record<string, JsonValue>[])
      .slice(0, 5)
      .map((row) =>
        flattenNested
          ? flattenObject(row as Record<string, JsonValue>)
          : (row as Record<string, string | number | boolean | null>),
      )

    const headers = includeHeaders
      ? Object.keys(processedRows[0] ?? {})
      : []
    const rows = processedRows.map((r) => Object.values(r) as (string | number | boolean | null)[])

    return { headers, rows }
  }

  const { headers: previewHeaders, rows: previewRows } = getPreviewData()

  return (
    <div className="space-y-4">
      {/* JSON Input */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          JSON Input (array of objects or array of arrays)
        </label>
        <FileDropTextarea
          className="font-mono text-sm"
          placeholder={`[\n  { "name": "Alice", "age": 30, "city": "New York" },\n  { "name": "Bob", "age": 25, "city": "London" }\n]`}
          value={jsonText}
          onChange={(v) => {
            setJsonText(v)
            setError('')
          }}
          accept=".json,text/plain,text/*"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
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

        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              disabled={isAoa === true}
            />
            Include headers (object keys)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500"
              checked={flattenNested}
              onChange={(e) => setFlattenNested(e.target.checked)}
              disabled={isAoa === true}
            />
            Flatten nested objects
          </label>
        </div>

        {parsed && (
          <div className="flex flex-col justify-end gap-1 pb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
              Rows: <strong>{rowCount}</strong>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
              Columns: <strong>{colCount}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Convert button */}
      <button
        className="btn-primary"
        onClick={handleConvert}
        disabled={!jsonText.trim()}
      >
        Download as Excel (.xlsx)
      </button>

      {/* Preview */}
      {previewRows.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Preview (first {previewRows.length} row{previewRows.length !== 1 ? 's' : ''})
          </label>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-xs">
              {previewHeaders.length > 0 && (
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    {previewHeaders.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {previewRows.map((row, ri) => (
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
                        {cell === null ? (
                          <span className="text-gray-400 dark:text-gray-500 italic">null</span>
                        ) : (
                          String(cell)
                        )}
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
