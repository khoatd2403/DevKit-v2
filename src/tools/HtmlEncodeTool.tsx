import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

const entities: [string, string][] = [
  ['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;'],
]

function encode(s: string) {
  return entities.reduce((acc, [c, e]) => acc.replaceAll(c, e), s)
}
function decode(s: string) {
  const txt = document.createElement('textarea')
  txt.innerHTML = s
  return txt.value
}

export default function HtmlEncodeTool() {
  const [input, setInput] = usePersistentState('tool-html-encode-input', '<h1>Hello & "World"</h1>\n<p>Copyright \u00a9 2024 \u2014 All rights reserved.</p>')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = (m = mode) => {
    setOutput(m === 'encode' ? encode(input) : decode(input))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={() => process()} className="btn-primary ml-auto">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input</label>
          <FileDropTextarea className="h-48" placeholder='<div class="test">Hello & World</div>' value={input} onChange={setInput} accept=".html,.htm,text/html,text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Output</label>
            <CopyButton text={output} />
          </div>
          <textarea className="tool-textarea h-48" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
    </div>
  )
}
