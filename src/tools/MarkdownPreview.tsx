import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import FileDropTextarea from '../components/FileDropTextarea'

const SAMPLE = `# Markdown Preview

## Features
- **Bold** and *italic* text
- \`inline code\` and code blocks
- [Links](https://example.com)
- Tables and blockquotes

## Code Example

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Table

| Name | Age | Role |
|------|-----|------|
| Alice | 30 | Dev |
| Bob | 25 | Designer |

> This is a blockquote

---

Done!
`

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE)
  const [html, setHtml] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const result = marked(input, { breaks: true })
    if (typeof result === 'string') setHtml(result)
    else result.then(setHtml)
  }, [input])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="flex flex-col min-h-0">
        <label className="tool-label mb-1 shrink-0">Markdown</label>
        <FileDropTextarea
          className="h-full resize-none"
          wrapperClassName="flex-1 min-h-0 flex flex-col"
          value={input}
          onChange={setInput}
          placeholder="# Write markdown here..."
          accept=".md,.markdown,text/plain,text/*"
        />
      </div>
      <div className="flex flex-col min-h-0">
        <label className="tool-label mb-1 shrink-0">Preview</label>
        <div
          ref={previewRef}
          className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
