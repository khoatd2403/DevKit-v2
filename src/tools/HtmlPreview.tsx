import { useState, useCallback, useRef } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Play, Maximize2, Minimize2, RotateCcw, Upload } from 'lucide-react'

const TABS = ['HTML', 'CSS', 'JS'] as const
type Tab = typeof TABS[number]

const ACCEPT: Record<Tab, string> = {
  HTML: '.html,.htm',
  CSS: '.css',
  JS: '.js,.ts',
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit the HTML, CSS, and JS tabs to see your changes live.</p>
  <button id="btn">Click me</button>
</body>
</html>`

const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #1f2937;
}

h1 {
  color: #2563eb;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #1d4ed8;
}`

const DEFAULT_JS = `document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from JS!')
})`

function buildSrcdoc(html: string, css: string, js: string): string {
  const hasHtml = /<html[\s>]/i.test(html)
  if (hasHtml) {
    let doc = html
    const styleTag = `<style>${css}</style>`
    const scriptTag = `<script>${js}<\/script>`
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${styleTag}</head>`)
    } else {
      doc = styleTag + doc
    }
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${scriptTag}</body>`)
    } else {
      doc = doc + scriptTag
    }
    return doc
  }
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string ?? '')
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export default function HtmlPreview() {
  const [html, setHtml] = usePersistentState('tool-html-preview-html', DEFAULT_HTML)
  const [css, setCss] = usePersistentState('tool-html-preview-css', DEFAULT_CSS)
  const [js, setJs] = usePersistentState('tool-html-preview-js', DEFAULT_JS)
  const [activeTab, setActiveTab] = useState<Tab>('HTML')
  const [fullscreen, setFullscreen] = useState(false)
  const [key, setKey] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const srcdoc = buildSrcdoc(html, css, js)
  const run = useCallback(() => setKey(k => k + 1), [])

  const reset = () => {
    setHtml(DEFAULT_HTML)
    setCss(DEFAULT_CSS)
    setJs(DEFAULT_JS)
    setKey(k => k + 1)
  }

  const setters: Record<Tab, (v: string) => void> = { HTML: setHtml, CSS: setCss, JS: setJs }
  const values: Record<Tab, string> = { HTML: html, CSS: css, JS: js }

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const text = await readFile(file)
    if (['html', 'htm'].includes(ext)) { setHtml(text); setActiveTab('HTML') }
    else if (ext === 'css') { setCss(text); setActiveTab('CSS') }
    else if (['js', 'ts'].includes(ext)) { setJs(text); setActiveTab('JS') }
    setKey(k => k + 1)
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const TAB_COLORS: Record<Tab, string> = {
    HTML: 'text-orange-500',
    CSS: 'text-blue-500',
    JS: 'text-yellow-500',
  }

  return (
    <div className="space-y-3">
      {/* Editor */}
      <div
        className={`border rounded-xl overflow-hidden transition-colors ${
          dragging
            ? 'border-primary-400 ring-2 ring-primary-300 dark:ring-primary-700'
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? `${TAB_COLORS[tab]} border-current bg-white dark:bg-gray-950`
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 px-2">
            {/* Import file button */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT[activeTab]}
              className="hidden"
              onChange={onFileInput}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={`Import ${activeTab} file`}
            >
              <Upload size={14} />
            </button>
            <button
              onClick={reset}
              className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Reset to default"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={run}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              <Play size={12} />
              Run
            </button>
          </div>
        </div>

        {/* Code area + drop overlay */}
        <div className="relative">
          <textarea
            key={activeTab}
            value={values[activeTab]}
            onChange={e => setters[activeTab](e.target.value)}
            spellCheck={false}
            className="w-full h-52 px-4 py-3 font-mono text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 resize-none focus:outline-none leading-relaxed"
            placeholder={`Enter ${activeTab} here...`}
          />
          {dragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary-50/90 dark:bg-primary-950/90 pointer-events-none">
              <Upload size={28} className="text-primary-500 mb-2" />
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Drop .html / .css / .js file</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${fullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 font-mono">preview</span>
          <button
            onClick={() => setFullscreen(f => !f)}
            className="btn-ghost p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
        <iframe
          key={key}
          ref={iframeRef}
          srcDoc={srcdoc}
          sandbox="allow-scripts allow-modals"
          className={`w-full bg-white ${fullscreen ? 'h-[calc(100%-40px)]' : 'h-80'}`}
          title="HTML Preview"
        />
      </div>

      {fullscreen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFullscreen(false)} />
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Drag & drop or <button onClick={() => fileInputRef.current?.click()} className="underline hover:text-gray-600">import</button> a <code>.html</code> / <code>.css</code> / <code>.js</code> file. Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">Run</kbd> to refresh. Sandboxed — nothing leaves your browser.
      </p>
    </div>
  )
}
