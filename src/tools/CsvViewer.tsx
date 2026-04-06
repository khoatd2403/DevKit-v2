import { useState, useMemo, useCallback } from 'react'
import { 
  Download, ArrowUp, ArrowDown, ArrowUpDown, 
  Search, FileJson, Table, Hash, ListFilter,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  FileSpreadsheet, Trash2
} from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

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
// Serialization
// ---------------------------------------------------------------------------
function toCsvString(rows: string[][], delimiter: Delimiter): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const s = String(cell)
          const needsQuote =
            s.includes(delimiter) ||
            s.includes('"') ||
            s.includes('\n')
          if (needsQuote) return `"${s.replace(/"/g, '""')}"`
          return s
        })
        .join(delimiter),
    )
    .join('\n')
}

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------
type SortDir = 'asc' | 'desc' | null

const DELIMITER_LABELS: Record<Delimiter, string> = {
  ',': 'Comma',
  ';': 'Semicolon',
  '\t': 'Tab',
  '|': 'Pipe',
}

const PAGE_SIZES = [50, 100, 500, 1000]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CsvViewer() {
  const [input, setInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  const { showToast } = useToast()
  const { lang } = useLang()
  const isVi = lang === 'vi'

  const delimiter = useMemo(() => (input.trim() ? detectDelimiter(input) : ','), [input])

  const allRows = useMemo<string[][]>(() => {
    if (!input.trim()) return []
    return parseCsv(input, delimiter)
  }, [input, delimiter])

  const headers = useMemo(() => allRows[0] ?? [], [allRows])
  const dataRows = useMemo(() => allRows.slice(1), [allRows])

  // Filter & Sort Logic
  const filteredAndSortedData = useMemo(() => {
    let result = [...dataRows]

    // 1. Filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(row => 
        row.some(cell => cell.toLowerCase().includes(lower))
      )
    }

    // 2. Sort
    if (sortCol !== null && sortDir !== null) {
      result.sort((a, b) => {
        const av = a[sortCol] ?? ''
        const bv = b[sortCol] ?? ''
        const an = parseFloat(av)
        const bn = parseFloat(bv)
        const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv)
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [dataRows, searchTerm, sortCol, sortDir])

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedData.slice(start, start + pageSize)
  }, [filteredAndSortedData, page, pageSize])

  const handleSort = useCallback((colIdx: number) => {
    if (sortCol !== colIdx) { setSortCol(colIdx); setSortDir('asc'); return }
    if (sortDir === 'asc') { setSortDir('desc'); return }
    setSortCol(null); setSortDir(null)
  }, [sortCol, sortDir])

  const downloadCsv = () => {
    const csvContent = toCsvString([headers, ...filteredAndSortedData], delimiter)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(isVi ? 'Đã tải xuống tệp CSV' : 'CSV file downloaded', 'success')
  }

  const downloadJson = () => {
    const jsonData = filteredAndSortedData.map(row => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h || `column_${i}`] = row[i] ?? ''
      })
      return obj
    })
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast(isVi ? 'Đã tải xuống tệp JSON' : 'JSON file downloaded', 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
               <Table size={20} />
             </div>
             <div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{isVi ? 'Nguồn dữ liệu CSV' : 'CSV Data Source'}</h3>
               <p className="text-xs text-gray-400 mt-0.5">{isVi ? 'Dán dữ liệu hoặc kéo tệp .csv vào đây' : 'Paste text or drop a .csv file'}</p>
             </div>
          </div>
          {input && (
            <button 
              onClick={() => { setInput(''); setSearchTerm(''); setPage(1) }} 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title={isVi ? 'Xóa toàn bộ' : 'Clear All'}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <FileDropTextarea
          value={input}
          onChange={v => { setInput(v); setSortCol(null); setSortDir(null); setPage(1) }}
          placeholder={"id,name,email,role\n1,Alice,alice@example.com,Developer\n2,Bob,bob@example.com,Designer"}
          accept=".csv,.txt"
          className="h-32 font-mono text-xs"
        />
      </div>

      {allRows.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Controls & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                placeholder={isVi ? 'Tìm kiếm trong bảng...' : 'Search records...'}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-500">
                 <ListFilter size={14} className="text-primary-500" />
                 <span>{DELIMITER_LABELS[delimiter]}</span>
               </div>
               
               <button onClick={downloadCsv} className="btn-secondary px-3 py-2 text-xs flex items-center gap-2">
                 <FileSpreadsheet size={14} />
                 <span className="hidden sm:inline">CSV</span>
               </button>
               <button onClick={downloadJson} className="btn-secondary px-3 py-2 text-xs flex items-center gap-2">
                 <FileJson size={14} />
                 <span className="hidden sm:inline">JSON</span>
               </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 px-1">
             <div className="flex items-center gap-2 text-xs text-gray-500">
               <Hash size={14} />
               <span className="font-bold text-gray-900 dark:text-white">{dataRows.length.toLocaleString()}</span> {isVi ? 'dòng dữ liệu' : 'total rows'}
             </div>
             {filteredAndSortedData.length !== dataRows.length && (
               <div className="text-xs text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                 {isVi ? 'Đã tìm thấy' : 'Found'} {filteredAndSortedData.length.toLocaleString()} {isVi ? 'kết quả' : 'matches'}
               </div>
             )}
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                    <th className="w-12 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center select-none">#</th>
                    {headers.map((h, ci) => (
                      <th 
                        key={ci} 
                        onClick={() => handleSort(ci)}
                        className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[250px]">{h || `Col ${ci+1}`}</span>
                          <div className={`transition-opacity ${sortCol === ci ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                            {sortCol === ci ? (
                              sortDir === 'asc' ? <ArrowUp size={14} className="text-primary-500" /> : <ArrowDown size={14} className="text-primary-500" />
                            ) : <ArrowUpDown size={14} />}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="py-20 text-center text-gray-400">
                        {isVi ? 'Không tìm thấy dữ liệu phù hợp' : 'No matching records found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, ri) => (
                      <tr key={ri} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-4 py-2.5 text-center text-xs font-mono text-gray-400 group-hover:text-primary-500 transition-colors">
                          {(page - 1) * pageSize + ri + 1}
                        </td>
                        {headers.map((_, ci) => (
                          <td key={ci} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-[400px] truncate border-l border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700">
                            {row[ci] ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {isVi ? 'Hiển thị' : 'Show'}
                    <select 
                      value={pageSize} 
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <span>{isVi ? 'Trang' : 'Page'} {page} / {totalPages}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                    <ChevronsLeft size={18} />
                  </button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let p = page;
                      if (totalPages > 5) {
                        if (page <= 3) p = i + 1;
                        else if (page >= totalPages - 2) p = totalPages - 4 + i;
                        else p = page - 2 + i;
                      } else {
                        p = i + 1;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>

                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                    <ChevronRight size={18} />
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {input.trim() && allRows.length === 0 && (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
          <p className="text-gray-400">{isVi ? 'Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' : 'Invalid data format. Please check your CSV.'}</p>
        </div>
      )}
    </div>
  )
}
