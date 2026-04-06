import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Trash2, WrapText, Wand2, Sparkles, FileText, Download } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'
import { SmartNextSteps } from '../components/SmartNextSteps'
import { formatJson, autoFixJson, validateJson, minifyJson, sortJsonKeys } from '../core/json'

const SAMPLE = '{"name":"John Doe","age":30,"email":"john@example.com","address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}'

export default function JsonFormatter() {
  const [input, setInput] = usePersistentState('tool-json-formatter-input', SAMPLE)
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = usePersistentState<number | '\t'>('json-indent', 2)

  useEffect(() => {
    const { output: res, error: err } = formatJson(input, indent)
    setOutput(res)
    setError(err)
  }, [input, indent])

  const handleAutoFix = () => {
    const { output: res, error: err } = autoFixJson(input, indent)
    if (res) {
      setInput(res)
      setOutput(res)
      setError(err)
    } else {
      setError(err)
    }
  };

  const validate = () => {
    setError(validateJson(input))
  }

  const handleMinify = () => {
    const { output: res, error: err } = minifyJson(input)
    if (res) {
      setInput(res)
      setOutput(res)
      setError(err)
    } else {
      setError(err)
    }
  }

  const handleSort = () => {
    const { output: res, error: err } = sortJsonKeys(input, indent)
    if (res) {
      setInput(res)
      setOutput(res)
      setError(err)
    } else {
      setError(err)
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <WrapText size={14} />
          <span>Indent:</span>
          {[2, 4, '\t'].map(v => (
            <button
              key={v.toString()}
              onClick={() => setIndent(v as any)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === v
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
            >
              {v === '\t' ? 'Tab' : `${v} spaces`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-3">
          <button
            onClick={handleMinify}
            className="btn-ghost text-xs px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-400 font-medium transition-colors"
            title="Remove all whitespace"
          >
            Nén (Minify)
          </button>
          <button
            onClick={handleSort}
            className="btn-ghost text-xs px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-400 font-medium transition-colors"
            title="Sort object keys alphabetically"
          >
            Sắp xếp (Sort)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JSON</label>
            <div className="flex items-center gap-1">
              {output && !error && (
                <button onClick={() => setInput(output)} className="btn-ghost flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <Wand2 size={12} /> Format code
                </button>
              )}
              <button onClick={() => setInput(SAMPLE)} className="btn-ghost text-xs gap-1 flex items-center">
                <FileText size={12} /> Load Example
              </button>
              <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-ghost text-xs gap-1 flex items-center">
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            value={input}
            onChange={setInput}
            accept=".json,text/plain,text/*"
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Formatted Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!output}
                className="btn-ghost text-xs flex items-center gap-1.5 text-gray-500 hover:text-primary-600 disabled:opacity-50 transition-colors"
                title="Download as .json file"
              >
                <Download size={14} />
                Tải về
              </button>
              <CopyButton text={output} toast="JSON copied" />
            </div>
          </div>
          <textarea
            className="tool-textarea-output h-80"
            readOnly
            value={output}
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className={`mt-4 p-3 rounded-lg flex items-center justify-between border ${error.includes('✨') || error.includes('✅') ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'}`}>
          <p className="text-sm font-medium">{error}</p>
          {!error.includes('✨') && error !== 'Input is empty' && !error.includes('✅') && input.trim() && (
            <button onClick={handleAutoFix} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
              <Sparkles size={13} /> Auto Fix
            </button>
          )}
        </div>
      )}

      {output && !error && (
        <SmartNextSteps currentToolId="json-formatter" output={output} />
      )}
    </div>
  )
}
