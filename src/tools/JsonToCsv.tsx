import { useState, useEffect, useCallback } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { usePersistentState } from '../hooks/usePersistentState'
import { useShareableState } from '../hooks/useShareableState'
import { SmartNextSteps } from '../components/SmartNextSteps'
import { Trash2, FileText, Zap, Download, FileSpreadsheet } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

const SAMPLE = '[{"id":1,"name":"Alice","role":"Engineer","salary":95000},{"id":2,"name":"Bob","role":"Designer","salary":85000},{"id":3,"name":"Carol","role":"Manager","salary":110000}]'

export default function JsonToCsv() {
  const [input, setInput] = usePersistentState('tool-json-to-csv-input', SAMPLE)
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  
  const { showToast } = useToast()
  const { lang } = useLang()
  const isVi = lang === 'vi'

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      let data = JSON.parse(input)
      if (typeof data !== 'object' || data === null) {
        setError('Input must be a JSON object or array');
        return;
      }
      const arr: any[] = Array.isArray(data) ? data : [data]
      if (arr.length === 0) { setError('Empty array'); return }
      
      const headers = [...new Set(arr.flatMap(row => Object.keys(row)))]
      const escape = (val: any) => {
        const str = (val === null || val === undefined) ? '' : String(val)
        return str.includes(delimiter) || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }
      
      const rows = [
        headers.map(escape).join(delimiter), 
        ...arr.map(row => headers.map(h => escape(row[h])).join(delimiter))
      ]
      setOutput(rows.join('\n'))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [input, delimiter])

  useEffect(() => {
    if (input.trim()) {
      convert()
    }
  }, [input, delimiter, convert])

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `converted-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(isVi ? 'Đã tải xuống tệp CSV' : 'CSV file downloaded', 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">{isVi ? 'Dấu phân cách' : 'Delimiter'}</span>
           <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800">
            {[',', ';', '\t', '|'].map(d => (
              <button 
                key={d}
                onClick={() => setDelimiter(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  delimiter === d 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {d === '\t' ? 'Tab' : d === ',' ? 'Comma' : d === ';' ? 'Semicolon' : 'Pipe'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={() => setInput(SAMPLE)} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2">
                  <FileText size={14} /> {isVi ? 'Mẫu' : 'Load Sample'}
             </button>
             <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title={isVi ? 'Xóa trắng' : 'Clear'}>
                  <Trash2 size={18} />
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{isVi ? 'Dữ liệu JSON' : 'JSON Input'}</label>
            </div>
            <button onClick={convert} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider flex items-center gap-1 transition-colors">
                <Zap size={12} fill="currentColor" /> {isVi ? 'Chuyển sang CSV' : 'Convert Now'}
            </button>
          </div>
          <FileDropTextarea 
            className="h-96 font-mono text-xs" 
            placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' 
            value={input} 
            onChange={setInput} 
            accept=".json,text/plain,text/*" 
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{isVi ? 'Kết quả CSV' : 'CSV Output'}</label>
            </div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={handleDownload}
                 disabled={!output}
                 className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
               >
                  <Download size={12} /> {isVi ? 'Tải CSV' : 'Download'}
               </button>
               <div className="w-px h-3 bg-gray-300 dark:bg-gray-700 mx-1"></div>
               <CopyButton text={output} toast="CSV copied" className="!p-0 !bg-transparent !text-primary-600 hover:!text-primary-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" />
            </div>
          </div>
          <div className="relative h-96 group">
            <textarea 
              className="tool-textarea-output h-full w-full font-mono text-xs p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl resize-none shadow-inner" 
              readOnly 
              value={output} 
              placeholder={isVi ? 'Kết quả CSV sẽ xuất hiện tại đây...' : 'CSV will appear here...'} 
            />
            {output && !error && (
               <div className="absolute top-2 right-4 text-[10px] font-mono text-gray-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {output.split('\n').length} rows detected
               </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
           <Zap size={16} className="shrink-0" />
           <p className="font-medium">{error}</p>
        </div>
      )}

      {output && !error && (
        <SmartNextSteps currentToolId="json-to-csv" output={output} />
      )}
    </div>
  )
}
