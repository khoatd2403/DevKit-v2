import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function formatXml(xml: string, indent = 2): string {
  const PADDING = ' '.repeat(indent)
  let formatted = ''
  let level = 0
  const tokens = xml.replace(/>\s*</g, '><').split(/(<[^>]+>)/).filter(Boolean)

  for (const token of tokens) {
    if (!token.trim()) continue
    if (token.startsWith('</')) {
      level--
      formatted += PADDING.repeat(Math.max(0, level)) + token + '\n'
    } else if (token.startsWith('<') && !token.startsWith('<?') && !token.endsWith('/>')) {
      formatted += PADDING.repeat(level) + token + '\n'
      if (!token.includes('</')) level++
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      formatted += PADDING.repeat(level) + token + '\n'
    } else {
      formatted = formatted.trimEnd() + token
      if (!tokens[tokens.indexOf(token) + 1]?.startsWith('</')) formatted += '\n'
    }
  }
  return formatted.trim()
}

export default function XmlFormatter() {
  const [input, setInput] = usePersistentState('tool-xml-input', '<?xml version="1.0"?><root><user id="1"><name>Alice</name><email>alice@example.com</email><role>admin</role></user><user id="2"><name>Bob</name><email>bob@example.com</email><role>user</role></user></root>')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = () => {
    if (!input.trim()) return
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'text/xml')
      const err = doc.querySelector('parsererror')
      if (err) throw new Error(err.textContent || 'XML parse error')
      setOutput(formatXml(input))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const minify = () => setOutput(input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim())

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <button onClick={minify} className="btn-secondary">Minify</button>
        <button onClick={format} className="btn-primary">Format XML</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input XML</label>
          </div>
          <FileDropTextarea className="h-72" placeholder="<root><item>value</item></root>" value={input} onChange={setInput} accept=".xml,text/xml,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output</label>
            <CopyButton text={output} toast="XML copied" />
          </div>
          <textarea className="tool-textarea-output h-72" readOnly value={output} placeholder="Formatted XML will appear here..." />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
