import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim()
}

export default function HtmlMinifier() {
  const [input, setInput] = useState(`<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Hello World</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is a sample HTML page.</p>\n  </body>\n</html>`)
  const [output, setOutput] = useState('')

  useEffect(() => {
    setOutput(minifyHtml(input))
  }, [input])

  const savings = input.length && output.length
    ? Math.round((1 - output.length / input.length) * 100)
    : 0

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input HTML</label>
          </div>
          <FileDropTextarea className="h-72" placeholder="<html>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>" value={input} onChange={setInput} accept=".html,.htm,text/html,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Minified Output</label>
            <div className="flex items-center gap-2">
              {savings > 0 && <span className="text-xs text-green-600 dark:text-green-400">-{savings}%</span>}
              <CopyButton text={output} toast="HTML copied" />
            </div>
          </div>
          <textarea className="tool-textarea-output h-72" readOnly value={output} placeholder="Minified HTML will appear here..." />
        </div>
      </div>
    </div>
  )
}
