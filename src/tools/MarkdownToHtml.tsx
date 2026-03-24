import { useState, useEffect } from 'react'
import { marked } from 'marked'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

const GITHUB_CSS = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#24292e;line-height:1.6}
h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25}
h1{font-size:2em;border-bottom:1px solid #eaecef;padding-bottom:.3em}
h2{font-size:1.5em;border-bottom:1px solid #eaecef;padding-bottom:.3em}
code{background:#f6f8fa;padding:.2em .4em;border-radius:3px;font-size:85%}
pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow:auto}
pre code{background:none;padding:0}
blockquote{border-left:4px solid #dfe2e5;color:#6a737d;margin:0;padding:0 1em}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #dfe2e5;padding:6px 13px}
tr:nth-child(even){background:#f6f8fa}
a{color:#0366d6}
img{max-width:100%}`

function convertMarkdown(md: string, wrapPage: boolean): string {
  const rawHtml = marked.parse(md, { async: false }) as string
  if (!wrapPage) return rawHtml
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style>
${GITHUB_CSS}
</style>
</head>
<body>
${rawHtml}
</body>
</html>`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState('')
  const [wrapPage, setWrapPage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [outputHtml, setOutputHtml] = useState('')

  useEffect(() => {
    if (markdown.trim()) {
      setOutputHtml(convertMarkdown(markdown, wrapPage))
    } else {
      setOutputHtml('')
    }
  }, [markdown, wrapPage])

  const lineCount = markdown ? markdown.split('\n').length : 0
  const byteSize = new TextEncoder().encode(outputHtml).length

  const handleDownload = () => {
    if (!outputHtml) return
    const blob = new Blob([outputHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="tool-label block mb-1">
          Markdown Input
        </label>
        <FileDropTextarea
          className="font-mono text-sm"
          placeholder={'# Hello World\n\nWrite your **markdown** here...\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("hello")\n```'}
          value={markdown}
          onChange={setMarkdown}
          accept=".md,.markdown,text/plain,text/*"
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500"
            checked={wrapPage}
            onChange={(e) => setWrapPage(e.target.checked)}
          />
          Include full HTML page wrapper (with GitHub-style CSS)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
          />
          Show live preview
        </label>
      </div>

      {/* Stats */}
      {markdown && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
            Input lines: <strong>{lineCount}</strong>
          </span>
          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
            Output size: <strong>{formatBytes(byteSize)}</strong>
          </span>
        </div>
      )}

      {/* Output */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label">
            HTML Output
          </label>
          {outputHtml && <CopyButton text={outputHtml} toast="HTML copied" />}
        </div>
        <textarea
          className="tool-textarea-output font-mono text-sm"
          rows={8}
          readOnly
          value={outputHtml}
          placeholder="HTML output will appear here..."
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          className="btn-primary"
          onClick={handleDownload}
          disabled={!outputHtml}
        >
          Download as .html
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowPreview((v) => !v)}
          disabled={!outputHtml}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Live Preview */}
      {showPreview && outputHtml && (
        <div>
          <label className="tool-label block mb-2">
            Rendered Preview
          </label>
          <iframe
            srcDoc={outputHtml}
            title="Markdown Preview"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
            style={{ height: '400px' }}
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  )
}
