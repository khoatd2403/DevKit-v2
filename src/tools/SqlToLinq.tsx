import { useState } from 'react'
import { Copy, Check, ArrowDown } from 'lucide-react'
import { SqlCodeBlock } from '../lib/sqlHighlight'
import { CsharpHighlight } from '../lib/codeHighlight'

// ── Simple SQL → LINQ converter ──────────────────────────────────────────────

type SqlToken = { type: 'kw' | 'id' | 'op' | 'str' | 'num' | 'punct'; value: string }

function tokenize(sql: string): SqlToken[] {
  const tokens: SqlToken[] = []
  let i = 0
  const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'HAVING', 'JOIN',
    'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS', 'AND', 'OR', 'NOT',
    'IN', 'LIKE', 'IS', 'NULL', 'BETWEEN', 'EXISTS', 'TOP', 'DISTINCT',
    'ASC', 'DESC', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
    'SET', 'DELETE', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'TRUE', 'FALSE',
  ])
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue }
    if (sql[i] === '-' && sql[i + 1] === '-') { while (i < sql.length && sql[i] !== '\n') i++; continue }
    if (sql[i] === '/' && sql[i + 1] === '*') {
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++
      i += 2; continue
    }
    if (sql[i] === "'" || sql[i] === '"') {
      const q = sql[i]; let val = ''; i++
      while (i < sql.length && sql[i] !== q) { val += sql[i]; i++ }
      i++
      tokens.push({ type: 'str', value: val })
      continue
    }
    if (/[a-zA-Z_]/.test(sql[i])) {
      let val = ''
      while (i < sql.length && /[a-zA-Z0-9_.]/.test(sql[i])) { val += sql[i]; i++ }
      tokens.push({ type: KEYWORDS.has(val.toUpperCase()) ? 'kw' : 'id', value: val })
      continue
    }
    if (/[0-9]/.test(sql[i])) {
      let val = ''
      while (i < sql.length && /[0-9.]/.test(sql[i])) { val += sql[i]; i++ }
      tokens.push({ type: 'num', value: val })
      continue
    }
    if (/[<>=!]/.test(sql[i])) {
      let val = sql[i]; i++
      if (i < sql.length && /[<>=]/.test(sql[i])) { val += sql[i]; i++ }
      tokens.push({ type: 'op', value: val })
      continue
    }
    if (/[(),*]/.test(sql[i])) { tokens.push({ type: 'punct', value: sql[i] }); i++; continue }
    i++
  }
  return tokens
}

function toPascalCase(s: string): string {
  return s.replace(/[._](.)/g, (_, c: string) => c.toUpperCase()).replace(/^(.)/, (_, c: string) => c.toUpperCase())
}

function toCamel(s: string): string {
  const p = toPascalCase(s)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function convertCondition(tokens: SqlToken[], varName: string): string {
  let result = ''
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (t.type === 'kw' && t.value.toUpperCase() === 'AND') { result += ' && '; i++; continue }
    if (t.type === 'kw' && t.value.toUpperCase() === 'OR') { result += ' || '; i++; continue }
    if (t.type === 'kw' && t.value.toUpperCase() === 'NOT') { result += '!'; i++; continue }
    if (t.type === 'kw' && t.value.toUpperCase() === 'IS' && tokens[i + 1]?.value.toUpperCase() === 'NULL') {
      result = result.trimEnd() + ' == null'; i += 2; continue
    }
    if (t.type === 'kw' && t.value.toUpperCase() === 'IS' && tokens[i + 1]?.value.toUpperCase() === 'NOT') {
      result = result.trimEnd() + ' != null'; i += 3; continue
    }
    if (t.type === 'kw' && t.value.toUpperCase() === 'LIKE') {
      const prev = result.trimEnd()
      const next = tokens[i + 1]
      const pattern = next?.value ?? ''
      if (pattern.startsWith('%') && pattern.endsWith('%'))
        result = prev.replace(/[^.]*$/, '') + `${prev.match(/[^.]+$/)?.[0] ?? ''}.Contains("${pattern.slice(1, -1)}")`
      else if (pattern.startsWith('%'))
        result = prev.replace(/[^.]*$/, '') + `${prev.match(/[^.]+$/)?.[0] ?? ''}.EndsWith("${pattern.slice(1)}")`
      else
        result = prev.replace(/[^.]*$/, '') + `${prev.match(/[^.]+$/)?.[0] ?? ''}.StartsWith("${pattern.slice(0, -1)}")`
      i += 2; continue
    }
    if (t.type === 'kw' && t.value.toUpperCase() === 'IN' && tokens[i + 1]?.value === '(') {
      const values: string[] = []
      i += 2
      while (i < tokens.length && tokens[i].value !== ')') {
        if (tokens[i].type === 'str') values.push(`"${tokens[i].value}"`)
        else if (tokens[i].type === 'num') values.push(tokens[i].value)
        i++
      }
      i++ // skip )
      result = result.trimEnd()
      const prop = result.match(/\w+$/)?.[0] ?? ''
      result = result.replace(/\w+$/, '') + `new[] { ${values.join(', ')} }.Contains(${varName}.${toPascalCase(prop)})`
      continue
    }
    if (t.type === 'id') {
      const col = t.value.includes('.') ? t.value.split('.').pop()! : t.value
      result += `${varName}.${toPascalCase(col)}`
    } else if (t.type === 'op') {
      const map: Record<string, string> = { '=': ' == ', '!=': ' != ', '<>': ' != ', '<': ' < ', '>': ' > ', '<=': ' <= ', '>=': ' >= ' }
      result += map[t.value] ?? ` ${t.value} `
    } else if (t.type === 'str') {
      result += `"${t.value}"`
    } else if (t.type === 'num') {
      result += t.value
    } else if (t.type === 'kw' && (t.value.toUpperCase() === 'TRUE' || t.value.toUpperCase() === 'FALSE')) {
      result += t.value.toLowerCase()
    } else if (t.value === '(') {
      result += '('
    } else if (t.value === ')') {
      result += ')'
    }
    i++
  }
  return result.trim()
}

interface ParsedSql {
  select: string[]
  from: string
  where: SqlToken[]
  orderBy: { col: string; desc: boolean }[]
  groupBy: string[]
  having: SqlToken[]
  limit?: string
  top?: string
  distinct: boolean
  aggregate: string | null
}

function parseSql(tokens: SqlToken[]): ParsedSql {
  const result: ParsedSql = {
    select: [], from: '', where: [], orderBy: [], groupBy: [],
    having: [], distinct: false, aggregate: null,
  }
  let i = 0

  // Skip SELECT
  if (tokens[i]?.value.toUpperCase() === 'SELECT') i++
  if (tokens[i]?.value.toUpperCase() === 'DISTINCT') { result.distinct = true; i++ }
  if (tokens[i]?.value.toUpperCase() === 'TOP') { i++; result.top = tokens[i]?.value; i++ }

  // SELECT columns
  while (i < tokens.length && tokens[i]?.value.toUpperCase() !== 'FROM') {
    const t = tokens[i]
    if (t.value === '*') { result.select.push('*'); i++; continue }
    if (t.value === ',') { i++; continue }
    // Detect aggregate functions
    if (t.type === 'id' && tokens[i + 1]?.value === '(') {
      const fn = t.value.toUpperCase()
      if (['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(fn)) {
        let inner = ''; let depth = 0; i++
        while (i < tokens.length) {
          if (tokens[i].value === '(') { depth++; i++; continue }
          if (tokens[i].value === ')') { if (--depth === 0) { i++; break } }
          inner += tokens[i].value; i++
        }
        result.aggregate = `${fn}(${inner})`
        result.select.push(`${fn}(${inner})`)
        continue
      }
    }
    // Skip AS alias
    if (t.type === 'id' || t.type === 'kw') {
      result.select.push(t.value)
      i++
      if (tokens[i]?.value.toUpperCase() === 'AS') { i += 2 } // skip AS alias
      continue
    }
    i++
  }

  // FROM
  if (tokens[i]?.value.toUpperCase() === 'FROM') {
    i++
    result.from = tokens[i]?.value ?? ''
    i++
    if (tokens[i]?.value.toUpperCase() === 'AS' || (tokens[i]?.type === 'id' && tokens[i]?.value.toUpperCase() !== 'WHERE')) i += (tokens[i]?.value.toUpperCase() === 'AS' ? 2 : 1)
  }

  // WHERE
  if (tokens[i]?.value.toUpperCase() === 'WHERE') {
    i++
    while (i < tokens.length) {
      const kw = tokens[i]?.value.toUpperCase()
      if (kw === 'GROUP' || kw === 'ORDER' || kw === 'HAVING' || kw === 'LIMIT') break
      result.where.push(tokens[i])
      i++
    }
  }

  // GROUP BY
  if (tokens[i]?.value.toUpperCase() === 'GROUP' && tokens[i + 1]?.value.toUpperCase() === 'BY') {
    i += 2
    while (i < tokens.length && tokens[i]?.value.toUpperCase() !== 'HAVING' && tokens[i]?.value.toUpperCase() !== 'ORDER' && tokens[i]?.value.toUpperCase() !== 'LIMIT') {
      if (tokens[i].value !== ',') result.groupBy.push(tokens[i].value)
      i++
    }
  }

  // HAVING
  if (tokens[i]?.value.toUpperCase() === 'HAVING') {
    i++
    while (i < tokens.length && tokens[i]?.value.toUpperCase() !== 'ORDER' && tokens[i]?.value.toUpperCase() !== 'LIMIT') {
      result.having.push(tokens[i]); i++
    }
  }

  // ORDER BY
  if (tokens[i]?.value.toUpperCase() === 'ORDER' && tokens[i + 1]?.value.toUpperCase() === 'BY') {
    i += 2
    while (i < tokens.length && tokens[i]?.value.toUpperCase() !== 'LIMIT') {
      if (tokens[i].value === ',') { i++; continue }
      const col = tokens[i].value; i++
      const desc = tokens[i]?.value.toUpperCase() === 'DESC'
      if (tokens[i]?.value.toUpperCase() === 'ASC' || desc) i++
      result.orderBy.push({ col, desc })
    }
  }

  // LIMIT
  if (tokens[i]?.value.toUpperCase() === 'LIMIT') { i++; result.limit = tokens[i]?.value }

  return result
}

function convertToLinq(sql: string): string {
  if (!sql.trim()) return ''
  try {
    const tokens = tokenize(sql)
    if (!tokens.length) return ''

    const parsed = parseSql(tokens)
    const tableName = parsed.from || 'source'
    const varName = toCamel(tableName.split('.').pop()?.replace(/s$/i, '') ?? 'x')
    const lines: string[] = []

    lines.push(`var result = ${toCamel(tableName.split('.').pop() ?? tableName)}`)

    if (parsed.where.length > 0) {
      const cond = convertCondition(parsed.where, varName)
      lines.push(`    .Where(${varName} => ${cond})`)
    }

    if (parsed.groupBy.length > 0) {
      const key = parsed.groupBy.length === 1
        ? `${varName}.${toPascalCase(parsed.groupBy[0])}`
        : `new { ${parsed.groupBy.map(c => `${varName}.${toPascalCase(c)}`).join(', ')} }`
      lines.push(`    .GroupBy(${varName} => ${key})`)
      if (parsed.having.length > 0) {
        const havingCond = convertCondition(parsed.having, 'g')
        lines.push(`    .Where(g => ${havingCond})`)
      }
    }

    if (parsed.orderBy.length > 0) {
      const [first, ...rest] = parsed.orderBy
      const firstFn = first.desc ? 'OrderByDescending' : 'OrderBy'
      lines.push(`    .${firstFn}(${varName} => ${varName}.${toPascalCase(first.col)})`)
      for (const ob of rest) {
        lines.push(`    .${ob.desc ? 'ThenByDescending' : 'ThenBy'}(${varName} => ${varName}.${toPascalCase(ob.col)})`)
      }
    }

    if (parsed.top) lines.push(`    .Take(${parsed.top})`)
    if (parsed.limit) lines.push(`    .Take(${parsed.limit})`)

    // SELECT projection
    const cols = parsed.select.filter(c => c !== '*' && !c.includes('('))
    if (cols.length > 0 && (parsed.select[0] !== '*' || parsed.distinct)) {
      if (cols.length === 1) {
        lines.push(`    .Select(${varName} => ${varName}.${toPascalCase(cols[0])})`)
      } else {
        lines.push(`    .Select(${varName} => new`)
        lines.push(`    {`)
        for (const col of cols) {
          lines.push(`        ${varName}.${toPascalCase(col)},`)
        }
        lines.push(`    })`)
      }
    }

    if (parsed.distinct) {
      lines.push(`    .Distinct()`)
    }

    // Aggregate
    if (parsed.aggregate) {
      const [fn, inner] = [parsed.aggregate.replace(/\(.*/, ''), parsed.aggregate.match(/\(([^)]*)\)/)?.[1] ?? '*']
      const linqAgg: Record<string, string> = { COUNT: 'Count', SUM: `Sum(${varName} => ${varName}.${toPascalCase(inner)})`, AVG: `Average(${varName} => ${varName}.${toPascalCase(inner)})`, MIN: `Min(${varName} => ${varName}.${toPascalCase(inner)})`, MAX: `Max(${varName} => ${varName}.${toPascalCase(inner)})` }
      const aggCall = linqAgg[fn] ?? `${fn}()`
      if (!aggCall.includes('=>')) {
        lines[lines.length - 1] = lines[lines.length - 1].replace(/\)$/, '') + ''
        lines.push(`    .${aggCall}();`)
      } else {
        lines.push(`    .${aggCall};`)
      }
    } else {
      lines[lines.length - 1] += ';'
    }

    return lines.join('\n')
  } catch {
    return '// Could not parse SQL'
  }
}

const EXAMPLES = [
  {
    label: 'Basic SELECT',
    sql: `SELECT Id, Name, Email\nFROM Users\nWHERE IsActive = true\nORDER BY Name ASC`,
  },
  {
    label: 'WHERE + LIMIT',
    sql: `SELECT *\nFROM Products\nWHERE Price > 100 AND Category = 'Electronics'\nORDER BY Price DESC\nLIMIT 10`,
  },
  {
    label: 'TOP + LIKE',
    sql: `SELECT TOP 5 Name, Email\nFROM Customers\nWHERE Email LIKE '%@gmail.com'`,
  },
  {
    label: 'GROUP BY',
    sql: `SELECT CategoryId, COUNT(*)\nFROM Products\nGROUP BY CategoryId\nHAVING COUNT > 5`,
  },
  {
    label: 'Multi-column ORDER',
    sql: `SELECT *\nFROM Orders\nWHERE Status = 'Pending'\nORDER BY CreatedAt DESC, Amount DESC`,
  },
  {
    label: 'DISTINCT',
    sql: `SELECT DISTINCT CategoryId\nFROM Products\nWHERE IsAvailable = true`,
  },
]

export default function SqlToLinq() {
  const [sql, setSql] = useState(EXAMPLES[0].sql)
  const [copied, setCopied] = useState(false)

  const linq = convertToLinq(sql)

  const copy = async () => {
    await navigator.clipboard.writeText(linq)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setSql(ex.sql)}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Supports: SELECT, FROM, WHERE, ORDER BY, GROUP BY, HAVING, TOP, LIMIT, DISTINCT, LIKE, IN, IS NULL
      </p>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="tool-label">SQL Query</label>
            {sql && <span className="text-[10px] text-gray-400">editing</span>}
          </div>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-sm h-36 resize-none"
            placeholder="Enter SQL SELECT query..."
          />
          <SqlCodeBlock code={sql} className="h-36" placeholder="SQL preview will appear here..." />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="tool-label">LINQ (Method Syntax)</label>
            <button onClick={copy} disabled={!linq} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="bg-[#1e1e1e] rounded-xl font-mono text-xs h-[calc(18rem+6px)] overflow-auto whitespace-pre p-3">
            {linq
              ? <CsharpHighlight code={linq} />
              : <span className="text-gray-500">// LINQ output will appear here</span>}
          </pre>
        </div>
      </div>

      {/* Limitations note */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
        <strong>Note:</strong> This converts basic SELECT queries. JOINs, subqueries, CTEs, and complex expressions require manual adjustment.
      </div>
    </div>
  )
}
