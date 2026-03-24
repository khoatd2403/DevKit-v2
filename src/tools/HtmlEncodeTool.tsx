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
        <div className="tool-tabs">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`tool-tab ${mode === m ? 'active' : ''}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={() => process()} className="btn-primary ml-auto">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input</label>
          </div>
          <FileDropTextarea className="h-48" placeholder='<div class="test">Hello & World</div>' value={input} onChange={setInput} accept=".html,.htm,text/html,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output</label>
            <CopyButton text={output} toast={mode === 'encode' ? 'Encoded HTML copied' : 'Decoded HTML copied'} />
          </div>
          <textarea className="tool-textarea-output h-48" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
    </div>
  )
}
