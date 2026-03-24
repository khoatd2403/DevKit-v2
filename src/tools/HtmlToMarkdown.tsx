import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function nodeToMarkdown(node: Node, listType: 'ul' | 'ol' | null = null, listIndex = { n: 1 }): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  const children = () => Array.from(el.childNodes).map(c => nodeToMarkdown(c, null, listIndex)).join('')

  // Headings
  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1])
    const hashes = '#'.repeat(level)
    const text = el.textContent?.trim() ?? ''
    return `\n${hashes} ${text}\n\n`
  }

  // Paragraph
  if (tag === 'p') {
    const text = children().trim()
    return text ? `\n${text}\n\n` : ''
  }

  // Line break
  if (tag === 'br') {
    return '\n'
  }

  // Bold
  if (tag === 'strong' || tag === 'b') {
    const text = children()
    return text ? `**${text}**` : ''
  }

  // Italic
  if (tag === 'em' || tag === 'i') {
    const text = children()
    return text ? `*${text}*` : ''
  }

  // Code block: pre > code
  if (tag === 'pre') {
    const codeEl = el.querySelector('code')
    const code = codeEl ? (codeEl.textContent ?? '') : (el.textContent ?? '')
    return `\n\`\`\`\n${code}\n\`\`\`\n\n`
  }

  // Inline code (only when not inside pre)
  if (tag === 'code') {
    const text = el.textContent ?? ''
    return `\`${text}\``
  }

  // Link
  if (tag === 'a') {
    const href = el.getAttribute('href') ?? ''
    const text = children()
    return `[${text}](${href})`
  }

  // Image
  if (tag === 'img') {
    const src = el.getAttribute('src') ?? ''
    const alt = el.getAttribute('alt') ?? ''
    return `![${alt}](${src})`
  }

  // Horizontal rule
  if (tag === 'hr') {
    return '\n---\n\n'
  }

  // Blockquote
  if (tag === 'blockquote') {
    const inner = children().trim()
    const lines = inner.split('\n').map(l => `> ${l}`)
    return `\n${lines.join('\n')}\n\n`
  }

  // Unordered list
  if (tag === 'ul') {
    const items = Array.from(el.children)
      .filter(c => c.tagName.toLowerCase() === 'li')
      .map(li => {
        const text = Array.from(li.childNodes).map(c => nodeToMarkdown(c, 'ul', listIndex)).join('').trim()
        return `- ${text}`
      })
      .join('\n')
    return `\n${items}\n\n`
  }

  // Ordered list
  if (tag === 'ol') {
    let idx = 1
    const items = Array.from(el.children)
      .filter(c => c.tagName.toLowerCase() === 'li')
      .map(li => {
        const text = Array.from(li.childNodes).map(c => nodeToMarkdown(c, 'ol', listIndex)).join('').trim()
        return `${idx++}. ${text}`
      })
      .join('\n')
    return `\n${items}\n\n`
  }

  // Table
  if (tag === 'table') {
    const rows = Array.from(el.querySelectorAll('tr'))
    if (rows.length === 0) return ''

    const parseRow = (row: Element) =>
      Array.from(row.querySelectorAll('th,td')).map(cell => cell.textContent?.trim() ?? '')

    const allRows = rows.map(parseRow)
    const colCount = Math.max(...allRows.map(r => r.length))

    const pad = (row: string[]) => {
      while (row.length < colCount) row.push('')
      return row
    }

    const header = pad(allRows[0])
    const separator = Array(colCount).fill('---')
    const body = allRows.slice(1).map(pad)

    const toMdRow = (cells: string[]) => `| ${cells.join(' | ')} |`
    const lines = [
      toMdRow(header),
      toMdRow(separator),
      ...body.map(toMdRow),
    ]
    return `\n${lines.join('\n')}\n\n`
  }

  // List item (handled inside ul/ol, but fall through if standalone)
  if (tag === 'li') {
    const text = children().trim()
    if (listType === 'ol') {
      const n = listIndex.n++
      return `${n}. ${text}\n`
    }
    return `- ${text}\n`
  }

  // Div, section, article, main, header, footer, aside, nav, span, etc. — recurse
  return children()
}

function htmlToMarkdown(html: string): string {
  if (!html.trim()) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body
  const md = nodeToMarkdown(body)
  // Clean up excessive blank lines
  return md.replace(/\n{3,}/g, '\n\n').trim()
}

export default function HtmlToMarkdown() {
  const [input, setInput] = useState('<h1>Hello World</h1>\n<p>This is a <strong>paragraph</strong> with <em>italic</em> and a <a href="https://example.com">link</a>.</p>\n<ul><li>Item 1</li><li>Item 2</li></ul>')
  const [output, setOutput] = useState('')

  const handleInput = (value: string) => {
    setInput(value)
    setOutput(htmlToMarkdown(value))
  }

  const byteSize = new TextEncoder().encode(input).length
  const lineCount = output ? output.split('\n').length : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              HTML Input
            </label>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {byteSize} byte{byteSize !== 1 ? 's' : ''}
            </span>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder={'<h1>Hello World</h1>\n<p>This is a <strong>paragraph</strong> with <em>formatting</em>.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'}
            value={input}
            onChange={handleInput}
            accept=".html,.htm,text/html,text/*"
          />
        </div>

        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              Markdown Output
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {lineCount} line{lineCount !== 1 ? 's' : ''}
              </span>
              <CopyButton text={output} toast="Markdown copied" />
            </div>
          </div>
          <textarea
            className="tool-textarea-output h-80"
            readOnly
            value={output}
            placeholder="Markdown will appear here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
