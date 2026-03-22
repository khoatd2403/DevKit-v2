import { useState, useMemo } from 'react'
import { AlignLeft, Copy, Check } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type IndentOption = '2' | '4' | 'tab'

// ---------------------------------------------------------------------------
// Constants – element classification
// ---------------------------------------------------------------------------
const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code',
  'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output',
  'q', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup',
  'textarea', 'time', 'tt', 'u', 'var',
])

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
])

const RAW_TEXT_ELEMENTS = new Set(['script', 'style'])

// ---------------------------------------------------------------------------
// Tokeniser
// ---------------------------------------------------------------------------
type Token =
  | { type: 'doctype'; raw: string }
  | { type: 'comment'; raw: string }
  | { type: 'open'; tag: string; attrs: string; selfClose: boolean }
  | { type: 'close'; tag: string }
  | { type: 'text'; value: string }
  | { type: 'raw'; tag: string; content: string }

function tokenise(html: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < html.length) {
    // DOCTYPE
    if (html.slice(i, i + 9).toLowerCase() === '<!doctype') {
      const end = html.indexOf('>', i)
      const raw = end === -1 ? html.slice(i) : html.slice(i, end + 1)
      tokens.push({ type: 'doctype', raw })
      i += raw.length
      continue
    }

    // Comment
    if (html.slice(i, i + 4) === '<!--') {
      const end = html.indexOf('-->', i + 4)
      const raw = end === -1 ? html.slice(i) : html.slice(i, end + 3)
      tokens.push({ type: 'comment', raw })
      i += raw.length
      continue
    }

    // Closing tag
    if (html.slice(i, i + 2) === '</') {
      const end = html.indexOf('>', i)
      const raw = end === -1 ? html.slice(i) : html.slice(i, end + 1)
      const tag = raw.slice(2, -1).trim().toLowerCase()
      tokens.push({ type: 'close', tag })
      i += raw.length
      continue
    }

    // Opening / self-closing tag
    if (html[i] === '<' && i + 1 < html.length && /[a-zA-Z!]/.test(html[i + 1])) {
      // Find matching >
      let j = i + 1
      let inStr: '"' | "'" | null = null
      while (j < html.length) {
        const c = html[j]
        if (inStr) {
          if (c === inStr) inStr = null
        } else if (c === '"' || c === "'") {
          inStr = c
        } else if (c === '>') {
          break
        }
        j++
      }
      const raw = html.slice(i, j + 1)
      // parse tag name + attrs
      const inner = raw.slice(1, raw.endsWith('/>') ? -2 : -1).trim()
      const spaceIdx = inner.search(/\s/)
      const tag = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase()
      const attrs = spaceIdx === -1 ? '' : inner.slice(spaceIdx + 1).trim()
      const selfClose = raw.endsWith('/>') || VOID_ELEMENTS.has(tag)

      // Raw text blocks – grab everything up to closing tag
      if (RAW_TEXT_ELEMENTS.has(tag) && !selfClose) {
        const closeTag = `</${tag}`
        const closeIdx = html.toLowerCase().indexOf(closeTag, j + 1)
        if (closeIdx !== -1) {
          const content = html.slice(j + 1, closeIdx)
          const closeEnd = html.indexOf('>', closeIdx)
          tokens.push({ type: 'raw', tag, content })
          i = closeEnd + 1
          continue
        }
      }

      tokens.push({ type: 'open', tag, attrs, selfClose })
      i = j + 1
      continue
    }

    // Text – consume until next '<'
    const next = html.indexOf('<', i)
    const value = next === -1 ? html.slice(i) : html.slice(i, next)
    if (value) tokens.push({ type: 'text', value })
    i += value.length || 1
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------
function formatHtml(
  html: string,
  indentSize: IndentOption,
  preserveInlineWS: boolean,
): string {
  const indentStr = indentSize === 'tab' ? '\t' : ' '.repeat(Number(indentSize))
  const tokens = tokenise(html.trim())

  const lines: string[] = []
  let depth = 0

  const pad = (d: number) => indentStr.repeat(Math.max(0, d))

  for (const tok of tokens) {
    switch (tok.type) {
      case 'doctype':
        lines.push(tok.raw)
        break

      case 'comment': {
        // Multi-line comments get indented
        const commentLines = tok.raw.split('\n')
        if (commentLines.length === 1) {
          lines.push(pad(depth) + tok.raw.trim())
        } else {
          lines.push(
            ...commentLines.map((l, idx) =>
              idx === 0 ? pad(depth) + l.trim() : pad(depth + 1) + l.trim(),
            ),
          )
        }
        break
      }

      case 'raw': {
        lines.push(pad(depth) + `<${tok.tag}${tok.content.includes('\n') ? '' : ''}>`)
        // Preserve raw content as-is but strip leading/trailing blank lines
        const rawLines = tok.content.split('\n')
        // Remove leading/trailing empty lines
        while (rawLines.length && !rawLines[0].trim()) rawLines.shift()
        while (rawLines.length && !rawLines[rawLines.length - 1].trim()) rawLines.pop()
        for (const rl of rawLines) {
          lines.push(pad(depth + 1) + rl.trimEnd())
        }
        lines.push(pad(depth) + `</${tok.tag}>`)
        break
      }

      case 'open': {
        const isInline = INLINE_ELEMENTS.has(tok.tag)
        const attrStr = tok.attrs ? ` ${tok.attrs}` : ''
        const tagStr = tok.selfClose
          ? `<${tok.tag}${attrStr} />`
          : `<${tok.tag}${attrStr}>`

        if (isInline && preserveInlineWS) {
          // Append to last line if possible, else new line
          if (lines.length && !lines[lines.length - 1].endsWith('>')) {
            lines[lines.length - 1] += tagStr
          } else {
            lines.push(pad(depth) + tagStr)
          }
        } else {
          lines.push(pad(depth) + tagStr)
        }

        if (!tok.selfClose) depth++
        break
      }

      case 'close': {
        depth = Math.max(0, depth - 1)
        const isInline = INLINE_ELEMENTS.has(tok.tag)
        const closeStr = `</${tok.tag}>`

        if (isInline && preserveInlineWS && lines.length) {
          lines[lines.length - 1] += closeStr
        } else {
          lines.push(pad(depth) + closeStr)
        }
        break
      }

      case 'text': {
        const trimmed = tok.value.replace(/\s+/g, ' ').trim()
        if (!trimmed) break
        if (lines.length && INLINE_ELEMENTS.has(extractLastTag(lines[lines.length - 1]))) {
          lines[lines.length - 1] += trimmed
        } else {
          lines.push(pad(depth) + trimmed)
        }
        break
      }
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** Pull the last opened tag name from a line string, e.g. "<span class='x'>" → "span" */
function extractLastTag(line: string): string {
  const m = line.match(/<([a-zA-Z][a-zA-Z0-9]*)[\s>]/)
  return m ? m[1].toLowerCase() : ''
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HtmlFormatter() {
  const [input, setInput] = useState('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Hello</title></head><body><div class="container"><h1>Hello World</h1><p>Sample page</p></div></body></html>')
  const [indent, setIndent] = useState<IndentOption>('2')
  const [preserveInlineWS, setPreserveInlineWS] = useState(true)
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      return formatHtml(input, indent, preserveInlineWS)
    } catch {
      return ''
    }
  }, [input, indent, preserveInlineWS])

  const lineCount = output ? output.split('\n').length : 0

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <AlignLeft size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Indent:</span>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
            {(['2', '4', 'tab'] as IndentOption[]).map(v => (
              <button
                key={v}
                onClick={() => setIndent(v)}
                className={`px-3 py-1.5 transition-colors ${
                  indent === v
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {v === 'tab' ? 'Tab' : `${v} spaces`}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={preserveInlineWS}
            onChange={e => setPreserveInlineWS(e.target.checked)}
            className="rounded"
          />
          Preserve whitespace in inline elements
        </label>
      </div>

      {/* Side-by-side editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="label-text block mb-1">Input HTML</label>
          <FileDropTextarea
            value={input}
            onChange={setInput}
            placeholder={'<!DOCTYPE html>\n<html>\n<head><title>Example</title></head>\n<body>\n<p>Hello <strong>world</strong></p>\n</body>\n</html>'}
            accept=".html,.htm"
            className="h-96"
          />
          {input && (
            <p className="text-xs text-gray-400 mt-1 text-right">
              {input.split('\n').length} lines
            </p>
          )}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-text">Formatted Output</label>
            <div className="flex items-center gap-2">
              {output && (
                <span className="text-xs text-gray-400">{lineCount} lines</span>
              )}
              <button
                onClick={copy}
                disabled={!output}
                className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-40"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            className="tool-textarea h-96"
            readOnly
            value={output}
            placeholder="Formatted HTML will appear here…"
          />
        </div>
      </div>
    </div>
  )
}
