import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

type EscapeMode = 'js' | 'json' | 'html' | 'regex' | 'url'
type SubMode = 'escape' | 'unescape'

// JS String
function jsEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\0/g, '\\0')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f')
}

function jsUnescape(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\0/g, '\0')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}

// JSON
function jsonEscape(s: string): string {
  return JSON.stringify(s).slice(1, -1)
}

function jsonUnescape(s: string): { result: string; error: string } {
  try {
    const result = JSON.parse('"' + s + '"')
    return { result, error: '' }
  } catch (e) {
    return { result: '', error: (e as Error).message }
  }
}

// HTML Entities
const htmlEscapeMap: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
]

function htmlEscape(s: string): string {
  return htmlEscapeMap.reduce((acc, [re, ent]) => acc.replace(re, ent), s)
}

function htmlUnescape(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Regex escape
function regexEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Process function
function process(input: string, mode: EscapeMode, sub: SubMode): { result: string; error: string } {
  if (!input) return { result: '', error: '' }
  try {
    if (mode === 'js') {
      return { result: sub === 'escape' ? jsEscape(input) : jsUnescape(input), error: '' }
    }
    if (mode === 'json') {
      if (sub === 'escape') return { result: jsonEscape(input), error: '' }
      return jsonUnescape(input)
    }
    if (mode === 'html') {
      return { result: sub === 'escape' ? htmlEscape(input) : htmlUnescape(input), error: '' }
    }
    if (mode === 'regex') {
      if (sub === 'escape') return { result: regexEscape(input), error: '' }
      return { result: '', error: 'Regex unescape is not deterministic — use escape mode only.' }
    }
    if (mode === 'url') {
      if (sub === 'escape') return { result: encodeURIComponent(input), error: '' }
      return { result: decodeURIComponent(input), error: '' }
    }
  } catch (e) {
    return { result: '', error: (e as Error).message }
  }
  return { result: '', error: '' }
}

const MODES: { value: EscapeMode; label: string }[] = [
  { value: 'js', label: 'JS String' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML Entities' },
  { value: 'regex', label: 'Regex' },
  { value: 'url', label: 'URL Component' },
]

export default function StringEscape() {
  const [mode, setMode] = useState<EscapeMode>('js')
  const [sub, setSub] = useState<SubMode>('escape')
  const [input, setInput] = useState('Hello "World"\nThis is a tab:\there and a backslash: C:\\Users\\test')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleInput = (value: string, currentMode = mode, currentSub = sub) => {
    setInput(value)
    const { result, error: err } = process(value, currentMode, currentSub)
    setOutput(result)
    setError(err)
  }

  const switchMode = (m: EscapeMode) => {
    setMode(m)
    const { result, error: err } = process(input, m, sub)
    setOutput(result)
    setError(err)
  }

  const switchSub = (s: SubMode) => {
    setSub(s)
    const { result, error: err } = process(input, mode, s)
    setOutput(result)
    setError(err)
  }

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="tool-tabs flex-wrap">
          {MODES.map(({ value, label }) => (
            <button key={value} onClick={() => switchMode(value)} className={`tool-tab whitespace-nowrap ${mode === value ? 'active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="tool-tabs ml-auto">
          {(['escape', 'unescape'] as const).map(s => (
            <button key={s} onClick={() => switchSub(s)} className={`tool-tab ${sub === s ? 'active' : ''}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input</label>
          </div>
          <FileDropTextarea className="h-56" placeholder={`Enter text to ${sub}...`} value={input} onChange={handleInput} accept="text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output</label>
            <CopyButton text={output} toast={`${sub === 'escape' ? 'Escaped' : 'Unescaped'} text copied`} />
          </div>
          <textarea className="tool-textarea-output h-56" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>

      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
