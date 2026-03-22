import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Zap, Clock } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanNode {
  operation: string
  detail: string
  estimatedCost?: number
  estimatedRows?: number
  actualTimeMs?: number
  actualRows?: number
  loops?: number
  width?: number
  filter?: string
  indexName?: string
  relation?: string
  children: PlanNode[]
  isExpensive: boolean
}

// ── PostgreSQL EXPLAIN text parser ─────────────────────────────────────────────
function parsePostgresText(text: string): PlanNode | null {
  const lines = text.split('\n')
  const nodeLines: { indent: number; text: string }[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    // Skip planning/execution timing lines
    if (/^(Planning|Execution|JIT|Workers|Buffers)/i.test(line.trim())) continue

    const stripped = line.replace(/^(\s*->\s*)/, '  ')
    const indent = stripped.search(/\S/)
    if (indent < 0) continue
    nodeLines.push({ indent, text: stripped.trim() })
  }

  if (!nodeLines.length) return null

  interface Frame { node: PlanNode; indent: number }
  const stack: Frame[] = []
  let root: PlanNode | null = null

  for (const { indent, text } of nodeLines) {
    // Cost: (cost=X..Y rows=R width=W)
    const costM = text.match(/\(cost=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+width=(\d+)\)/)
    // Actual: (actual time=X..Y rows=R loops=L)
    const actualM = text.match(/\(actual time=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+loops=(\d+)\)/)

    const operation = text.replace(/\s*\(.*/, '').trim()
    const relM = operation.match(/on\s+(\w+)/i)
    const idxM = operation.match(/using\s+(\w+)/i)

    const estimatedCost = costM ? parseFloat(costM[2]) : undefined
    const estimatedRows = costM ? parseInt(costM[3]) : undefined
    const actualTimeMs = actualM ? parseFloat(actualM[2]) : undefined
    const actualRows = actualM ? parseInt(actualM[3]) : undefined

    const node: PlanNode = {
      operation: operation.replace(/\s+on\s+\w+/i, '').replace(/\s+using\s+\w+/i, '').trim(),
      detail: text,
      estimatedCost,
      estimatedRows,
      actualTimeMs,
      actualRows,
      loops: actualM ? parseInt(actualM[4]) : undefined,
      width: costM ? parseInt(costM[4]) : undefined,
      relation: relM?.[1],
      indexName: idxM?.[1],
      children: [],
      isExpensive: (estimatedCost ?? 0) > 1000 || (actualTimeMs ?? 0) > 100,
    }

    // Check for filter/condition lines (sub-lines within same node)
    const filterM = text.match(/Filter:\s*(.+)/i)
    if (filterM) node.filter = filterM[1]

    // Pop stack until we find a parent with smaller indent
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop()

    if (!stack.length) {
      root = node
    } else {
      stack[stack.length - 1].node.children.push(node)
    }
    stack.push({ node, indent })
  }

  return root
}

// ── MySQL EXPLAIN table parser ─────────────────────────────────────────────────
interface MysqlRow {
  id: string; select_type: string; table: string; type: string
  possible_keys: string; key: string; key_len: string
  ref: string; rows: string; filtered: string; Extra: string
}

function parseMysqlExplain(text: string): MysqlRow[] {
  const lines = text.split('\n').filter(l => l.includes('|'))
  if (lines.length < 2) return []
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean)
  return lines.slice(2).map(line => {
    const vals = line.split('|').map(v => v.trim()).filter(Boolean)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row as unknown as MysqlRow
  }).filter(r => r.id)
}

// ── Operation color/icon map ───────────────────────────────────────────────────
function getOpStyle(op: string): { bg: string; text: string; label: string } {
  const upper = op.toUpperCase()
  if (upper.includes('SEQ SCAN') || upper.includes('SEQUENTIAL')) return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: op }
  if (upper.includes('INDEX SCAN') || upper.includes('INDEX ONLY')) return { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', label: op }
  if (upper.includes('BITMAP')) return { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300', label: op }
  if (upper.includes('HASH JOIN') || upper.includes('HASH')) return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', label: op }
  if (upper.includes('NESTED LOOP')) return { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', label: op }
  if (upper.includes('MERGE JOIN')) return { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300', label: op }
  if (upper.includes('SORT')) return { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', label: op }
  if (upper.includes('AGGREGATE') || upper.includes('GROUP')) return { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', label: op }
  if (upper.includes('LIMIT')) return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: op }
  return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: op }
}

// ── Plan node component ────────────────────────────────────────────────────────
function PlanNodeView({ node, depth = 0, totalCost }: { node: PlanNode; depth?: number; totalCost: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children.length > 0
  const style = getOpStyle(node.operation)
  const costPct = totalCost > 0 && node.estimatedCost ? (node.estimatedCost / totalCost) * 100 : 0
  const rowDiff = node.actualRows !== undefined && node.estimatedRows !== undefined
    ? node.actualRows / Math.max(1, node.estimatedRows)
    : null

  return (
    <div className={depth > 0 ? 'ml-5 border-l-2 border-dashed border-gray-200 dark:border-gray-700 pl-3 mt-1' : ''}>
      <div
        className={`flex items-start gap-2 p-2 rounded-lg mb-0.5 transition-colors ${hasChildren ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50' : ''} ${node.isExpensive ? 'ring-1 ring-orange-200 dark:ring-orange-800/50' : ''}`}
        onClick={() => hasChildren && setOpen(p => !p)}
      >
        <div className="shrink-0 mt-0.5 w-4">
          {hasChildren ? (
            open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {node.isExpensive && <AlertTriangle size={12} className="text-orange-500 shrink-0" />}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {node.operation}
            </span>
            {node.relation && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{node.relation}</span>
            )}
            {node.indexName && (
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-mono">idx: {node.indexName}</span>
            )}
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-3 mt-1.5">
            {node.estimatedCost !== undefined && (
              <span className="text-[11px] text-gray-400 font-mono">
                cost: <span className="text-gray-600 dark:text-gray-300">{node.estimatedCost.toFixed(2)}</span>
                {costPct > 0 && <span className="text-orange-400 ml-1">({costPct.toFixed(0)}%)</span>}
              </span>
            )}
            {node.estimatedRows !== undefined && (
              <span className="text-[11px] text-gray-400 font-mono">
                est rows: <span className="text-gray-600 dark:text-gray-300">{node.estimatedRows.toLocaleString()}</span>
              </span>
            )}
            {node.actualRows !== undefined && (
              <span className="text-[11px] font-mono flex items-center gap-1">
                <Zap size={10} className="text-blue-400" />
                <span className="text-blue-500 dark:text-blue-400">actual: {node.actualRows.toLocaleString()}</span>
                {rowDiff !== null && (rowDiff > 10 || rowDiff < 0.1) && (
                  <span className="text-orange-400">({rowDiff > 1 ? '+' : ''}{((rowDiff - 1) * 100).toFixed(0)}%)</span>
                )}
              </span>
            )}
            {node.actualTimeMs !== undefined && (
              <span className="text-[11px] font-mono flex items-center gap-1">
                <Clock size={10} className="text-green-400" />
                <span className={node.actualTimeMs > 100 ? 'text-orange-500' : 'text-green-500 dark:text-green-400'}>
                  {node.actualTimeMs.toFixed(3)}ms
                </span>
              </span>
            )}
            {node.loops && node.loops > 1 && (
              <span className="text-[11px] text-gray-400 font-mono">×{node.loops} loops</span>
            )}
          </div>

          {/* Cost bar */}
          {costPct > 5 && (
            <div className="mt-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${costPct > 50 ? 'bg-red-400' : costPct > 20 ? 'bg-orange-400' : 'bg-green-400'}`}
                style={{ width: `${Math.min(100, costPct)}%` }}
              />
            </div>
          )}

          {/* Filter */}
          {node.filter && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-mono truncate">
              Filter: {node.filter}
            </p>
          )}
        </div>
      </div>

      {open && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <PlanNodeView key={i} node={child} depth={depth + 1} totalCost={totalCost} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── MySQL row display ──────────────────────────────────────────────────────────
function MysqlExplainView({ rows }: { rows: MysqlRow[] }) {
  const typeColor = (t: string) => {
    if (t === 'system' || t === 'const') return 'text-green-600 dark:text-green-400 font-bold'
    if (t === 'eq_ref' || t === 'ref') return 'text-blue-600 dark:text-blue-400'
    if (t === 'range') return 'text-yellow-600 dark:text-yellow-400'
    if (t === 'index') return 'text-orange-600 dark:text-orange-400'
    if (t === 'ALL') return 'text-red-600 dark:text-red-400 font-bold'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['id', 'select_type', 'table', 'type', 'key', 'rows', 'filtered', 'Extra'].map(h => (
              <th key={h} className="text-left px-2 py-2 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
              <td className="px-2 py-2 font-mono text-gray-600 dark:text-gray-400">{row.id}</td>
              <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{row.select_type}</td>
              <td className="px-2 py-2 font-mono font-medium text-gray-800 dark:text-gray-200">{row.table}</td>
              <td className={`px-2 py-2 font-mono ${typeColor(row.type)}`}>{row.type}</td>
              <td className="px-2 py-2 font-mono text-indigo-600 dark:text-indigo-400">{row.key || 'NULL'}</td>
              <td className="px-2 py-2 font-mono text-gray-600 dark:text-gray-400">{row.rows}</td>
              <td className="px-2 py-2 font-mono text-gray-600 dark:text-gray-400">{row.filtered}%</td>
              <td className="px-2 py-2 text-gray-500 dark:text-gray-400 max-w-48 truncate" title={row.Extra}>{row.Extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-400 mt-2 px-2">
        Access type: <span className="text-green-500">system/const</span> best →
        <span className="text-blue-500"> eq_ref/ref</span> good →
        <span className="text-yellow-500"> range</span> ok →
        <span className="text-orange-500"> index</span> poor →
        <span className="text-red-500"> ALL</span> avoid
      </p>
    </div>
  )
}

// ── Samples ───────────────────────────────────────────────────────────────────
const POSTGRES_SAMPLE = `Hash Join  (cost=37.32..82.86 rows=200 width=72) (actual time=1.123..2.456 rows=150 loops=1)
  Hash Cond: (orders.user_id = users.id)
  ->  Seq Scan on orders  (cost=0.00..35.00 rows=200 width=64) (actual time=0.021..0.934 rows=200 loops=1)
        Filter: (status = 'active')
        Rows Removed by Filter: 50
  ->  Hash  (cost=24.00..24.00 rows=1200 width=8) (actual time=0.543..0.543 rows=1200 loops=1)
        Buckets: 2048  Batches: 1  Memory Usage: 54kB
        ->  Index Scan using users_pkey on users  (cost=0.28..24.00 rows=1200 width=8) (actual time=0.012..0.321 rows=1200 loops=1)
Planning Time: 0.542 ms
Execution Time: 2.789 ms`

const MYSQL_SAMPLE = `+----+-------------+-----------+-------+---------------+---------+---------+--------------------+------+----------+-------------+
| id | select_type | table     | type  | possible_keys | key     | key_len | ref                | rows | filtered | Extra       |
+----+-------------+-----------+-------+---------------+---------+---------+--------------------+------+----------+-------------+
|  1 | SIMPLE      | users     | ALL   | PRIMARY       | NULL    | NULL    | NULL               | 1200 |   100.00 | Using where |
|  1 | SIMPLE      | orders    | ref   | user_id_idx   | user_id | 4       | mydb.users.id      |    5 |   100.00 | NULL        |
|  1 | SIMPLE      | products  | eq_ref| PRIMARY       | PRIMARY | 4       | mydb.orders.prod_id|    1 |   100.00 | NULL        |
+----+-------------+-----------+-------+---------------+---------+---------+--------------------+------+----------+-------------+`

type DbFlavor = 'postgres' | 'mysql'

export default function SqlPlanViewer() {
  const [flavor, setFlavor] = useState<DbFlavor>('postgres')
  const [input, setInput] = useState(POSTGRES_SAMPLE)

  const pgRoot = flavor === 'postgres' ? parsePostgresText(input) : null
  const mysqlRows = flavor === 'mysql' ? parseMysqlExplain(input) : []
  const totalCost = pgRoot?.estimatedCost ?? 0

  const setFlavor2 = (f: DbFlavor) => {
    setFlavor(f)
    setInput(f === 'postgres' ? POSTGRES_SAMPLE : MYSQL_SAMPLE)
  }

  return (
    <div className="space-y-4">
      {/* DB selector */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'postgres', label: '🐘 PostgreSQL EXPLAIN', hint: 'EXPLAIN ANALYZE output' },
          { id: 'mysql',    label: '🐬 MySQL EXPLAIN',     hint: 'EXPLAIN tabular output' },
        ] as { id: DbFlavor; label: string; hint: string }[]).map(f => (
          <button
            key={f.id}
            onClick={() => setFlavor2(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              flavor === f.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {flavor === 'postgres' ? 'EXPLAIN / EXPLAIN ANALYZE output' : 'EXPLAIN tabular output'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-xs resize-none"
            style={{ height: 440 }}
            placeholder="Paste your execution plan..."
          />
          {flavor === 'postgres' && (
            <p className="text-[11px] text-gray-400">
              Run: <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">EXPLAIN (ANALYZE, BUFFERS) SELECT ...</code>
            </p>
          )}
        </div>

        {/* Tree / Table */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {flavor === 'postgres' ? 'Execution Plan Tree' : 'EXPLAIN Analysis'}
          </label>
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 overflow-auto p-3" style={{ height: 440 }}>
            {flavor === 'postgres' && (
              pgRoot
                ? <PlanNodeView node={pgRoot} totalCost={totalCost} />
                : <p className="text-xs text-gray-400 p-2">Paste a PostgreSQL EXPLAIN output to visualize the plan tree</p>
            )}
            {flavor === 'mysql' && (
              mysqlRows.length > 0
                ? <MysqlExplainView rows={mysqlRows} />
                : <p className="text-xs text-gray-400 p-2">Paste MySQL EXPLAIN tabular output</p>
            )}
          </div>
        </div>
      </div>

      {/* Legend for PostgreSQL */}
      {flavor === 'postgres' && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {[
            ['bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', 'Seq Scan (avoid on large tables)'],
            ['bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', 'Index Scan (efficient)'],
            ['bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', 'Hash Join'],
            ['bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', 'Sort'],
          ].map(([cls, label]) => (
            <span key={label} className={`px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
