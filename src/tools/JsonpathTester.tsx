import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// ── JSONPath Evaluator ─────────────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

function getChildren(node: JsonValue): JsonValue[] {
  if (Array.isArray(node)) return node
  if (node !== null && typeof node === 'object') return Object.values(node) as JsonValue[]
  return []
}

function recursiveDescend(node: JsonValue, key: string): JsonValue[] {
  const results: JsonValue[] = []

  if (Array.isArray(node)) {
    for (const item of node) {
      results.push(...recursiveDescend(item, key))
    }
  } else if (node !== null && typeof node === 'object') {
    const obj = node as Record<string, JsonValue>
    if (key === '*') {
      results.push(...(Object.values(obj) as JsonValue[]))
    } else if (key in obj) {
      results.push(obj[key])
    }
    for (const child of Object.values(obj) as JsonValue[]) {
      results.push(...recursiveDescend(child, key))
    }
  }

  return results
}

function applySlice(arr: JsonValue[], sliceStr: string): JsonValue[] {
  const parts = sliceStr.split(':')
  const len = arr.length
  const parseIdx = (s: string | undefined, def: number) => {
    if (s === undefined || s === '') return def
    const n = parseInt(s, 10)
    return isNaN(n) ? def : n
  }

  const start = parseIdx(parts[0], 0)
  const end = parseIdx(parts[1], len)
  const step = parseIdx(parts[2], 1)

  const normalize = (i: number) => {
    if (i < 0) return Math.max(0, len + i)
    return Math.min(i, len)
  }

  const s = normalize(start)
  const e = normalize(end)
  const result: JsonValue[] = []

  if (step > 0) {
    for (let i = s; i < e; i += step) result.push(arr[i])
  } else if (step < 0) {
    for (let i = e - 1; i >= s; i += step) result.push(arr[i])
  }

  return result
}

function evalFilter(items: JsonValue[], filterExpr: string): JsonValue[] {
  // filterExpr is like: @.field, @.field == 'val', @.field > 5
  const expr = filterExpr.trim()

  // Existence check: @.field or @['field']
  const existMatch = expr.match(/^@\.(\w+)$/) || expr.match(/^@\['([^']+)'\]$/)
  if (existMatch) {
    const field = existMatch[1]
    return items.filter(item => {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        return field in (item as Record<string, JsonValue>)
      }
      return false
    })
  }

  // Comparison: @.field OP value
  const compMatch = expr.match(/^@\.(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/)
  if (compMatch) {
    const [, field, op, rawVal] = compMatch
    let compareVal: JsonValue
    const trimmed = rawVal.trim()
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      compareVal = trimmed.slice(1, -1)
    } else if (trimmed === 'true') compareVal = true
    else if (trimmed === 'false') compareVal = false
    else if (trimmed === 'null') compareVal = null
    else compareVal = parseFloat(trimmed)

    return items.filter(item => {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) return false
      const obj = item as Record<string, JsonValue>
      if (!(field in obj)) return false
      const v = obj[field]
      switch (op) {
        case '==': return v === compareVal
        case '!=': return v !== compareVal
        case '>': return (v as number) > (compareVal as number)
        case '<': return (v as number) < (compareVal as number)
        case '>=': return (v as number) >= (compareVal as number)
        case '<=': return (v as number) <= (compareVal as number)
        default: return false
      }
    })
  }

  return items
}

function processStep(nodes: JsonValue[], step: string): JsonValue[] {
  // Recursive descent
  if (step.startsWith('..')) {
    const key = step.slice(2)
    const results: JsonValue[] = []
    for (const node of nodes) {
      if (key === '*') {
        results.push(...recursiveDescend(node, '*'))
      } else {
        results.push(...recursiveDescend(node, key))
      }
    }
    return results
  }

  // Dot wildcard
  if (step === '*') {
    const results: JsonValue[] = []
    for (const node of nodes) results.push(...getChildren(node))
    return results
  }

  // Dot access: field name
  if (/^\w+$/.test(step)) {
    const results: JsonValue[] = []
    for (const node of nodes) {
      if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
        const obj = node as Record<string, JsonValue>
        if (step in obj) results.push(obj[step])
      }
    }
    return results
  }

  // Bracket notation: ['field'], [0], [-1], [0,1,2], [0:3], [?(@.x)]
  const bracketMatch = step.match(/^\[(.+)\]$/)
  if (bracketMatch) {
    const inner = bracketMatch[1].trim()
    const results: JsonValue[] = []

    // Filter expression
    if (inner.startsWith('?(') && inner.endsWith(')')) {
      const filterExpr = inner.slice(2, -1).trim()
      for (const node of nodes) {
        const arr = Array.isArray(node) ? node : (node !== null && typeof node === 'object' ? Object.values(node as Record<string, JsonValue>) : [])
        results.push(...evalFilter(arr as JsonValue[], filterExpr))
      }
      return results
    }

    // Wildcard
    if (inner === '*') {
      for (const node of nodes) results.push(...getChildren(node))
      return results
    }

    // Quoted string key
    const quotedMatch = inner.match(/^'([^']+)'$/) || inner.match(/^"([^"]+)"$/)
    if (quotedMatch) {
      const key = quotedMatch[1]
      for (const node of nodes) {
        if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
          const obj = node as Record<string, JsonValue>
          if (key in obj) results.push(obj[key])
        }
      }
      return results
    }

    // Slice: contains ':'
    if (inner.includes(':')) {
      for (const node of nodes) {
        if (Array.isArray(node)) results.push(...applySlice(node, inner))
      }
      return results
    }

    // Multiple indices: contains ','
    if (inner.includes(',')) {
      const indices = inner.split(',').map(s => parseInt(s.trim(), 10))
      for (const node of nodes) {
        if (Array.isArray(node)) {
          for (const idx of indices) {
            const i = idx < 0 ? node.length + idx : idx
            if (i >= 0 && i < node.length) results.push(node[i])
          }
        }
      }
      return results
    }

    // Single integer index
    if (/^-?\d+$/.test(inner)) {
      const idx = parseInt(inner, 10)
      for (const node of nodes) {
        if (Array.isArray(node)) {
          const i = idx < 0 ? node.length + idx : idx
          if (i >= 0 && i < node.length) results.push(node[i])
        }
      }
      return results
    }

    // Bare key in brackets
    for (const node of nodes) {
      if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
        const obj = node as Record<string, JsonValue>
        if (inner in obj) results.push(obj[inner])
      }
    }
    return results
  }

  return []
}

function tokenizePath(path: string): string[] {
  const tokens: string[] = []
  let i = 0
  const len = path.length

  while (i < len) {
    // Recursive descent ..
    if (path[i] === '.' && path[i + 1] === '.') {
      i += 2
      // collect key after ..
      if (path[i] === '[') {
        // collect bracket
        let j = i + 1
        let depth = 1
        while (j < len && depth > 0) {
          if (path[j] === '[') depth++
          else if (path[j] === ']') depth--
          j++
        }
        tokens.push('..' + path.slice(i, j))
        i = j
      } else {
        let j = i
        while (j < len && path[j] !== '.' && path[j] !== '[') j++
        tokens.push('..' + path.slice(i, j))
        i = j
      }
      continue
    }

    // Dot separator
    if (path[i] === '.') {
      i++
      if (i >= len) break
      if (path[i] === '[') {
        // bracket immediately after dot
      } else {
        let j = i
        while (j < len && path[j] !== '.' && path[j] !== '[') j++
        if (j > i) tokens.push(path.slice(i, j))
        i = j
        continue
      }
    }

    // Bracket
    if (path[i] === '[') {
      let j = i + 1
      let depth = 1
      let inStr: string | null = null
      while (j < len && depth > 0) {
        const c = path[j]
        if (inStr) {
          if (c === inStr) inStr = null
        } else {
          if (c === "'" || c === '"') inStr = c
          else if (c === '[') depth++
          else if (c === ']') depth--
        }
        j++
      }
      tokens.push(path.slice(i, j))
      i = j
      continue
    }

    // Otherwise collect identifier
    let j = i
    while (j < len && path[j] !== '.' && path[j] !== '[') j++
    if (j > i) tokens.push(path.slice(i, j))
    i = j
  }

  return tokens
}

function evaluateJsonPath(root: JsonValue, path: string): JsonValue[] {
  const trimmed = path.trim()
  if (!trimmed.startsWith('$')) throw new Error('Path must start with $')

  let rest = trimmed.slice(1)
  // Remove leading dot
  if (rest.startsWith('.') && !rest.startsWith('..')) rest = rest.slice(1)

  if (rest === '') return [root]

  const steps = tokenizePath(rest)
  let nodes: JsonValue[] = [root]

  for (const step of steps) {
    nodes = processStep(nodes, step)
    if (nodes.length === 0) break
  }

  return nodes
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function JsonpathTester() {
  const [jsonInput, setJsonInput] = useState('{"store":{"book":[{"title":"Moby Dick","price":8.99},{"title":"The Great Gatsby","price":10.99}],"bicycle":{"color":"red","price":19.95}}}')
  const [pathExpr, setPathExpr] = useState('$.store.book[*].title')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [resultCount, setResultCount] = useState<number | null>(null)

  useEffect(() => {
    if (!jsonInput.trim() || !pathExpr.trim()) {
      setOutput('')
      setError('')
      setResultCount(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const results = evaluateJsonPath(parsed as JsonValue, pathExpr)
      setResultCount(results.length)
      setOutput(JSON.stringify(results, null, 2))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
      setResultCount(null)
    }
  }, [jsonInput, pathExpr])

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON Input</label>
        <FileDropTextarea
          className="h-48"
          placeholder={'{\n  "store": {\n    "book": [\n      { "author": "Alice", "price": 9.99 },\n      { "author": "Bob", "price": 14.99 }\n    ]\n  }\n}'}
          value={jsonInput}
          onChange={setJsonInput}
          accept=".json,text/plain,text/*"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSONPath Expression</label>
        <input
          type="text"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          placeholder="$.store.book[*].author"
          value={pathExpr}
          onChange={e => setPathExpr(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
            Results
            {resultCount !== null && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs">
                {resultCount} {resultCount === 1 ? 'result' : 'results'}
              </span>
            )}
          </label>
          <CopyButton text={output} />
        </div>
        <textarea
          className="tool-textarea h-48"
          readOnly
          value={output}
          placeholder="Matched results will appear here..."
        />
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  )
}
