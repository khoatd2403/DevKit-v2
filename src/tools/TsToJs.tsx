import { useState, useMemo } from 'react'
import { Copy, Check, FileCode } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

// ─── TypeScript → JavaScript stripper ─────────────────────────────────────────

function stripTypeScript(code: string, removeComments: boolean, preserveJsx: boolean): string {
  let result = code

  // 1. Remove import type / export type statements
  result = result.replace(/^\s*import\s+type\s+[^;]+;?\s*$/gm, '')
  result = result.replace(/^\s*export\s+type\s+\{[^}]*\}\s*(?:from\s+['"][^'"]+['"])?\s*;?\s*$/gm, '')

  // 2. Remove standalone interface declarations (possibly exported)
  result = result.replace(/^\s*(?:export\s+)?(?:declare\s+)?interface\s+\w+(?:<[^{]*>)?\s*(?:extends\s+[^{]+)?\{[^}]*\}/gms, '')

  // 3. Remove standalone type alias declarations (possibly exported)
  result = result.replace(/^\s*(?:export\s+)?(?:declare\s+)?type\s+\w+(?:<[^>]*>)?\s*=\s*[^;]+;/gm, '')

  // 4. Remove `declare` statements (ambient declarations)
  result = result.replace(/^\s*declare\s+[^\n]+\n?/gm, '')

  // 5. Remove `as Type` casts — but not `as const`, we keep that actually… keep `as const` too for safety
  //    Pattern: ` as SomeType` but not `as const`
  result = result.replace(/\s+as\s+(?!const\b)(?:[A-Za-z_$][\w$.<>\[\]|& ,]*)/g, '')

  // 6. Remove generic type parameters from function/class/arrow definitions
  //    e.g. function foo<T extends Bar>(...)  →  function foo(...)
  //    e.g. const foo = <T>(...)  →  const foo = (...)  [only when NOT JSX mode for tsx]
  result = result.replace(/(<\s*[A-Za-z_$][\w$\s,|&.[\]]*(?:extends\s+[^>]+)?>\s*)(?=\()/g, '')

  // 7. Remove return type annotations: ): ReturnType {  or ): void =>
  result = result.replace(/\)\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*)(?:\s*\|[\s\w$.<>\[\]|& ,?]*)*(?=\s*(?:\{|=>|\n))/g, ')')

  // 8. Remove parameter type annotations: (param: Type, param?: Type, ...rest: Type[])
  //    This handles simple cases; must be done carefully to avoid eating object destructuring colons
  result = result.replace(/(\w)\s*\?\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*(?:\[\])*)/g, '$1')
  result = result.replace(/(\w)\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*(?:\[\])*)\s*(?=[,)=\n])/g, '$1')

  // 9. Remove variable type annotations: const x: Type = ...
  result = result.replace(/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*)/g, '$1 $2')

  // 10. Remove destructuring annotations: const { x }: MyType = ...
  result = result.replace(/\}\s*:\s*[A-Za-z_$][\w$.<>\[\]|& ,?]*\s*=/g, '} =')
  result = result.replace(/\]\s*:\s*[A-Za-z_$][\w$.<>\[\]|& ,?]*\s*=/g, '] =')

  // 11. Remove non-null assertions: foo!.bar → foo.bar, foo! → foo
  result = result.replace(/!(?=[\s.,;)\]}])/g, '')
  result = result.replace(/!$/gm, '')

  // 12. Remove access modifiers from class members
  result = result.replace(/\b(?:public|private|protected|readonly|override|abstract)\s+/g, '')

  // 13. Remove enum declarations (replace with plain object)
  result = result.replace(
    /^\s*(?:export\s+)?(?:const\s+)?enum\s+(\w+)\s*\{([^}]*)\}/gm,
    (_match, name: string, body: string) => {
      const members = body
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
        .map((m, i) => {
          const eqIdx = m.indexOf('=')
          if (eqIdx !== -1) {
            const key = m.slice(0, eqIdx).trim()
            const val = m.slice(eqIdx + 1).trim()
            return `  ${key}: ${val}`
          }
          return `  ${m}: ${i}`
        })
      return `const ${name} = {\n${members.join(',\n')}\n}`
    }
  )

  // 14. Remove satisfies expressions: foo satisfies Bar → foo
  result = result.replace(/\s+satisfies\s+[A-Za-z_$][\w$.<>\[\]|& ,?]*/g, '')

  // 15. Remove angle-bracket type assertions: <Type>expr (only when not JSX or not preserving JSX)
  if (!preserveJsx) {
    result = result.replace(/<[A-Za-z_$][\w$.<>\[\]|& ,?]*>\s*(?=[^=])/g, '')
  }

  // 16. Remove comments if requested
  if (removeComments) {
    // Remove block comments /* ... */
    result = result.replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove line comments // ...
    result = result.replace(/\/\/[^\n]*/g, '')
    // Remove extra blank lines left behind
    result = result.replace(/^\s*\n/gm, '')
  }

  // 17. Clean up extra blank lines (collapse 3+ newlines to 2)
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TsToJs() {
  const [input, setInput] = useState('')
  const [removeComments, setRemoveComments] = useState(false)
  const [preserveJsx, setPreserveJsx] = useState(true)
  const [copied, setCopied] = useState(false)

  const output = useMemo(
    () => (input.trim() ? stripTypeScript(input, removeComments, preserveJsx) : ''),
    [input, removeComments, preserveJsx]
  )

  const inputLines = input ? input.split('\n').length : 0
  const outputLines = output ? output.split('\n').length : 0

  const copyOutput = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-4">
      {/* Options bar */}
      <div className="flex flex-wrap gap-4 items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Options</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeComments}
            onChange={e => setRemoveComments(e.target.checked)}
            className="w-4 h-4 accent-primary-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Remove comments</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={preserveJsx}
            onChange={e => setPreserveJsx(e.target.checked)}
            className="w-4 h-4 accent-primary-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Preserve JSX</span>
        </label>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="tool-label">
              TypeScript Input
            </label>
            {inputLines > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{inputLines} lines</span>
            )}
          </div>
          <FileDropTextarea
            value={input}
            onChange={setInput}
            placeholder="Paste TypeScript code here, or drop a .ts / .tsx file…"
            accept=".ts,.tsx"
            className="h-96 font-mono text-sm"
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="tool-label">
              JavaScript Output
            </label>
            <div className="flex items-center gap-3">
              {outputLines > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{outputLines} lines</span>
              )}
              <button
                onClick={copyOutput}
                disabled={!output}
                className="flex items-center gap-1.5 btn-ghost text-xs disabled:opacity-40"
              >
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="JavaScript output will appear here…"
            className="tool-textarea-output h-96 font-mono text-sm"
          />
        </div>
      </div>

      {/* Stats bar */}
      {input && output && (
        <div className="flex flex-wrap gap-6 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2.5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <FileCode size={13} />
            <span>Input: <strong className="text-gray-700 dark:text-gray-300">{inputLines}</strong> lines / <strong className="text-gray-700 dark:text-gray-300">{input.length}</strong> chars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileCode size={13} />
            <span>Output: <strong className="text-gray-700 dark:text-gray-300">{outputLines}</strong> lines / <strong className="text-gray-700 dark:text-gray-300">{output.length}</strong> chars</span>
          </div>
          {input.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span>Reduction: <strong className="text-green-600 dark:text-green-400">
                {Math.round((1 - output.length / input.length) * 100)}%
              </strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
