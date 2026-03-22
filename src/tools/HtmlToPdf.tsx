import { useState, useEffect, useRef } from 'react'
import FileDropTextarea from '../components/FileDropTextarea'

type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal'
type Orientation = 'portrait' | 'landscape'

const PAGE_SIZES: PageSize[] = ['A4', 'A3', 'Letter', 'Legal']
const ORIENTATIONS: { value: Orientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
]

function buildPrintCss(
  pageSize: PageSize,
  orientation: Orientation,
  includeDefaults: boolean,
  customCss: string,
): string {
  const parts: string[] = []

  parts.push(`@page { size: ${pageSize} ${orientation}; margin: 1cm; }`)

  if (includeDefaults) {
    parts.push(`
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #000; background: #fff; }
::-webkit-scrollbar { display: none; }
@media print {
  html, body { width: 100%; height: auto; overflow: visible; }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; page-break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; }
  pre, blockquote { page-break-inside: avoid; }
  h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
}`)
  }

  if (customCss.trim()) {
    parts.push(customCss)
  }

  return parts.join('\n')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function HtmlToPdf() {
  const [html, setHtml] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [includeDefaults, setIncludeDefaults] = useState(true)
  const [customCss, setCustomCss] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(html)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [html])

  const byteCount = new TextEncoder().encode(html).length

  const handlePrint = () => {
    const printCss = buildPrintCss(pageSize, orientation, includeDefaults, customCss)
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site and try again.')
      return
    }
    printWindow.document.write(
      `<!DOCTYPE html><html><head><style>${printCss}</style></head><body>${html}</body></html>`,
    )
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="space-y-4">
      {/* HTML Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            HTML Input
          </label>
          {html && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatBytes(byteCount)}
            </span>
          )}
        </div>
        <FileDropTextarea
          className="font-mono text-sm"
          placeholder={'<h1>My Document</h1>\n<p>This is a paragraph of text.</p>\n\n<table>\n  <tr><th>Name</th><th>Value</th></tr>\n  <tr><td>Alice</td><td>100</td></tr>\n</table>'}
          value={html}
          onChange={setHtml}
          accept=".html,.htm,text/html,text/*"
        />
      </div>

      {/* Page Settings */}
      <div className="space-y-3">
        {/* Page size pills */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Page Size
          </label>
          <div className="flex flex-wrap gap-2">
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  pageSize === size
                    ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation pills */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Orientation
          </label>
          <div className="flex gap-2">
            {ORIENTATIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOrientation(value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  orientation === value
                    ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500"
            checked={includeDefaults}
            onChange={(e) => setIncludeDefaults(e.target.checked)}
          />
          Include default print CSS (margins, font, table styles)
        </label>
      </div>

      {/* Custom CSS */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Custom CSS (optional, injected before printing)
        </label>
        <FileDropTextarea
          className="font-mono text-sm"
          placeholder={'body { font-size: 12pt; }\nh1 { color: #1a1a2e; }'}
          value={customCss}
          onChange={setCustomCss}
          accept=".css,text/css,text/*"
        />
      </div>

      {/* Print button */}
      <button
        className="btn-primary"
        onClick={handlePrint}
        disabled={!html.trim()}
      >
        Print / Save as PDF
      </button>

      {/* Tips */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          How to save as PDF
        </p>
        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
          <li>Click "Print / Save as PDF" — a print dialog will open in a new window.</li>
          <li>In the print dialog, set the <strong>Destination</strong> to <strong>"Save as PDF"</strong>.</li>
          <li>Adjust margins if needed — the page CSS sets <strong>1cm margins</strong> by default.</li>
          <li>
            Page size is pre-set to <strong>{pageSize} {orientation}</strong> via CSS — match it in the
            dialog for best results.
          </li>
          <li>Disable "Headers and footers" in the dialog to get a clean document.</li>
        </ul>
      </div>

      {/* Live Preview */}
      {previewHtml.trim() && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Live Preview
          </label>
          <iframe
            srcDoc={previewHtml}
            title="HTML Preview"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
            style={{ height: '450px' }}
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  )
}
