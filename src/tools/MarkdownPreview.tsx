import { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react'
import { marked } from 'marked'
import FileDropTextarea from '../components/FileDropTextarea'
import { Copy, Printer, Play, FileText, Columns, Code, Eye, Eraser } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

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

type ViewMode = 'split' | 'code' | 'preview'

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE)
  const [html, setHtml] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const previewRef = useRef<HTMLDivElement>(null)
  
  // Use deferred value to prevent input lag. 
  // Typing remains buttery smooth even with huge documents.
  const deferredInput = useDeferredValue(input)
  
  const { showToast } = useToast()
  const { lang } = useLang()
  const isVi = lang === 'vi'

  useEffect(() => {
    // Process markdown conversion based on the deferred value
    const result = marked(deferredInput, { breaks: true })
    if (typeof result === 'string') setHtml(result)
    else (result as any).then(setHtml)
  }, [deferredInput])

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(html)
    showToast(isVi ? 'Đã sao chép mã HTML' : 'HTML code copied to clipboard', 'success')
  }, [html, isVi, showToast])

  const downloadHtml = useCallback(() => {
    const fullHtml = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export - DevTools Online</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1, h2, h3, h4, h5, h6 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; color: #111827; }
    h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1f2937; color: #f9fafb; padding: 1.5em; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; color: inherit; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.75em; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; color: #4b5563; font-style: italic; margin: 1em 0; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${html}
  </div>
</body>
</html>
    `.trim()

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `markdown-export-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
    showToast(isVi ? 'Đã tải xuống tệp HTML' : 'HTML file downloaded', 'success')
  }, [html, lang, isVi, showToast])

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Print Markdown - DevTools Online</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; }
    h1, h2, h3, h4, h5, h6 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
    code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1.5em; border-radius: 8px; white-space: pre-wrap; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.75em; text-align: left; }
    blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #4b5563; }
    @media print {
      body { padding: 0; }
      pre { break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = () => {
      window.print();
      setTimeout(() => window.close(), 500);
    };
  </script>
</body>
</html>
    `.trim()

    printWindow.document.write(fullHtml)
    printWindow.document.close()
  }, [html])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'split' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Columns size={14} />
            <span className="hidden lg:inline">{isVi ? 'Chia đôi' : 'Split View'}</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'code' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Code size={14} />
            <span className="hidden lg:inline">{isVi ? 'Soạn thảo' : 'Editor'}</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'preview' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Eye size={14} />
            <span className="hidden lg:inline">{isVi ? 'Xem trước' : 'Preview'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
           <button onClick={() => setInput('')} className="btn-ghost p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={isVi ? 'Xóa trắng' : 'Clear'}>
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
          <button
            onClick={handleCopyHtml}
            className="btn-ghost px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Copy size={14} />
            <span className="hidden sm:inline">{isVi ? 'Chép HTML' : 'Copy'}</span>
          </button>
          <button
            onClick={downloadHtml}
            className="btn-secondary px-3 py-2 text-xs flex items-center gap-2"
          >
            <FileText size={14} />
            <span>{isVi ? 'Xuất HTML' : 'HTML'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary px-3 py-2 text-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Printer size={14} />
            <span>{isVi ? 'Xuất PDF / In' : 'PDF / Print'}</span>
          </button>
        </div>
      </div>

      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner overflow-hidden"
        style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}
      >
        {/* Editor Column */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div className={`flex flex-col min-h-0 h-full ${viewMode === 'code' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2 px-1 shrink-0">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{isVi ? 'Trình soạn thảo' : 'Editor'}</label>
              <span className="text-[10px] text-gray-400 font-mono">.md / .txt supported</span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <FileDropTextarea
                className="w-full h-full resize-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm font-mono shadow-sm focus:ring-2 focus:ring-primary-500/20"
                wrapperClassName="h-full"
                value={input}
                onChange={setInput}
                placeholder={isVi ? '# Nhập nội dung markdown tại đây...' : '# Write markdown here...'}
                accept=".md,.markdown,text/plain,text/*"
              />
            </div>
          </div>
        )}

        {/* Preview Column */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`flex flex-col min-h-0 h-full ${viewMode === 'preview' ? 'lg:col-span-2' : ''}`}>
             <div className="flex items-center justify-between mb-2 px-1 shrink-0">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{isVi ? 'Trực tiếp' : 'Preview'}</label>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] text-gray-400 font-medium">Synced</span>
              </div>
            </div>
            <div
              ref={previewRef}
              className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-img:rounded-xl prose-pre:bg-gray-900 dark:prose-pre:bg-black"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
