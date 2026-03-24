import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Alignment = 'left' | 'center' | 'right'

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------
function alignSep(a: Alignment): string {
  if (a === 'center') return ':---:'
  if (a === 'right') return '---:'
  return '---'
}

function buildMarkdown(
  headers: string[],
  alignments: Alignment[],
  rows: string[][],
): string {
  const colCount = headers.length

  const escape = (s: string) => s.replace(/\|/g, '\\|')

  const headerRow = '| ' + headers.map(h => escape(h) || ' ').join(' | ') + ' |'
  const sepRow = '| ' + alignments.slice(0, colCount).map(alignSep).join(' | ') + ' |'
  const dataRows = rows.map(
    row =>
      '| ' +
      Array.from({ length: colCount }, (_, ci) => escape(row[ci] ?? '')).join(' | ') +
      ' |',
  )

  return [headerRow, sepRow, ...dataRows].join('\n')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function AlignToggle({
  value,
  onChange,
}: {
  value: Alignment
  onChange: (a: Alignment) => void
}) {
  const options: { id: Alignment; icon: React.ReactNode }[] = [
    { id: 'left', icon: <AlignLeft size={13} /> },
    { id: 'center', icon: <AlignCenter size={13} /> },
    { id: 'right', icon: <AlignRight size={13} /> },
  ]
  return (
    <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          title={o.id}
          className={`p-1 transition-colors ${
            value === o.id
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-500'
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Default state factory
// ---------------------------------------------------------------------------
function makeRows(r: number, c: number): string[][] {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => ''))
}

const INIT_COLS = 3
const INIT_ROWS = 3

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MarkdownTable() {
  const [headers, setHeaders] = useState<string[]>(
    Array.from({ length: INIT_COLS }, (_, i) => `Header ${i + 1}`),
  )
  const [alignments, setAlignments] = useState<Alignment[]>(
    Array.from({ length: INIT_COLS }, () => 'left'),
  )
  const [rows, setRows] = useState<string[][]>(makeRows(INIT_ROWS, INIT_COLS))
  const [copied, setCopied] = useState(false)

  const colCount = headers.length
  const rowCount = rows.length

  // ---- helpers ----
  const setHeader = useCallback((ci: number, val: string) => {
    setHeaders(prev => prev.map((h, i) => (i === ci ? val : h)))
  }, [])

  const setAlign = useCallback((ci: number, a: Alignment) => {
    setAlignments(prev => prev.map((v, i) => (i === ci ? a : v)))
  }, [])

  const setCell = useCallback((ri: number, ci: number, val: string) => {
    setRows(prev =>
      prev.map((row, r) => (r === ri ? row.map((c, ci2) => (ci2 === ci ? val : c)) : row)),
    )
  }, [])

  const addColumn = () => {
    setHeaders(prev => [...prev, `Header ${prev.length + 1}`])
    setAlignments(prev => [...prev, 'left'])
    setRows(prev => prev.map(row => [...row, '']))
  }

  const removeColumn = (ci: number) => {
    if (colCount <= 1) return
    setHeaders(prev => prev.filter((_, i) => i !== ci))
    setAlignments(prev => prev.filter((_, i) => i !== ci))
    setRows(prev => prev.map(row => row.filter((_, i) => i !== ci)))
  }

  const addRow = () => {
    setRows(prev => [...prev, Array.from({ length: colCount }, () => '')])
  }

  const removeRow = (ri: number) => {
    if (rowCount <= 1) return
    setRows(prev => prev.filter((_, i) => i !== ri))
  }

  const markdown = buildMarkdown(headers, alignments, rows)

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Table editor */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label">Table Editor</label>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {colCount} col{colCount !== 1 ? 's' : ''} × {rowCount} row{rowCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full border-collapse">
            {/* Alignment row */}
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <th className="w-8" />
                {headers.map((_, ci) => (
                  <th key={ci} className="px-2 py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      <AlignToggle value={alignments[ci]} onChange={a => setAlign(ci, a)} />
                      <button
                        onClick={() => removeColumn(ci)}
                        disabled={colCount <= 1}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 transition-colors"
                        title="Remove column"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </th>
                ))}
                {/* Add column button cell */}
                <th className="px-2 py-1.5 w-10">
                  <button
                    onClick={addColumn}
                    className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Add column"
                  >
                    <Plus size={14} />
                  </button>
                </th>
              </tr>

              {/* Header row */}
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <td className="w-8 text-center text-xs text-gray-300 dark:text-gray-600 select-none px-1">H</td>
                {headers.map((h, ci) => (
                  <td key={ci} className="px-2 py-1.5">
                    <input
                      value={h}
                      onChange={e => setHeader(ci, e.target.value)}
                      placeholder={`Column ${ci + 1}`}
                      className="w-full bg-transparent font-semibold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none min-w-[80px]"
                    />
                  </td>
                ))}
                <td />
              </tr>
            </thead>

            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={`border-b border-gray-100 dark:border-gray-800 ${
                    ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'
                  }`}
                >
                  {/* Row number + delete */}
                  <td className="w-8 px-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-gray-300 dark:text-gray-600 select-none w-4 text-center">
                        {ri + 1}
                      </span>
                      <button
                        onClick={() => removeRow(ri)}
                        disabled={rowCount <= 1}
                        className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 disabled:opacity-0 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-2 py-1">
                      <input
                        value={row[ci] ?? ''}
                        onChange={e => setCell(ri, ci, e.target.value)}
                        placeholder="…"
                        className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-200 dark:placeholder-gray-700 focus:outline-none min-w-[80px]"
                        style={{
                          textAlign:
                            alignments[ci] === 'right'
                              ? 'right'
                              : alignments[ci] === 'center'
                              ? 'center'
                              : 'left',
                        }}
                      />
                    </td>
                  ))}
                  <td />
                </tr>
              ))}

              {/* Add row button row */}
              <tr>
                <td colSpan={colCount + 2} className="py-1 px-2">
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1"
                  >
                    <Plus size={13} /> Add row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Markdown preview */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label">Markdown Output</label>
          <button
            onClick={copy}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          className="tool-textarea-output h-48 font-mono"
          readOnly
          value={markdown}
        />
      </div>
    </div>
  )
}
