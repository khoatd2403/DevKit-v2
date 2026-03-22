import { useState, useRef, useCallback, useEffect } from 'react'
import { Copy, Check, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Column {
  name: string
  type: string
  isPK: boolean
  isFK: boolean
  isNullable: boolean
  isUnique: boolean
  references?: { table: string; column: string }
}
interface Table { name: string; columns: Column[] }
interface ForeignKey { fromTable: string; fromCol: string; toTable: string; toCol: string }
interface TablePos { x: number; y: number }

// ── SQL Parser ───────────────────────────────────────────────────────────────
function parseSql(sql: string): { tables: Table[]; fks: ForeignKey[] } {
  const tables: Table[] = []
  const fks: ForeignKey[] = []

  // Extract CREATE TABLE blocks
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?(\w+)["'`]?\s*\(([^;]+)\)/gis
  let m: RegExpExecArray | null

  while ((m = tableRegex.exec(sql)) !== null) {
    const tableName = m[1]
    const body = m[2]
    const columns: Column[] = []

    // Split by commas at top level (not inside parens)
    const lines: string[] = []
    let depth = 0, cur = ''
    for (const ch of body) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) { lines.push(cur.trim()); cur = '' }
      else cur += ch
    }
    if (cur.trim()) lines.push(cur.trim())

    for (const line of lines) {
      const upper = line.trim().toUpperCase()

      // Skip table-level PRIMARY KEY constraint
      if (upper.startsWith('PRIMARY KEY')) {
        const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)
        if (pkMatch) {
          const pkCols = pkMatch[1].split(',').map(c => c.trim().replace(/["'`]/g, ''))
          for (const col of columns) if (pkCols.includes(col.name)) col.isPK = true
        }
        continue
      }

      // Table-level FOREIGN KEY
      if (upper.startsWith('FOREIGN KEY') || upper.startsWith('CONSTRAINT')) {
        const fkMatch = line.match(/FOREIGN\s+KEY\s*\(["'`]?(\w+)["'`]?\)\s*REFERENCES\s+["'`]?(\w+)["'`]?\s*\(["'`]?(\w+)["'`]?\)/i)
        if (fkMatch) {
          fks.push({ fromTable: tableName, fromCol: fkMatch[1], toTable: fkMatch[2], toCol: fkMatch[3] })
          const col = columns.find(c => c.name === fkMatch[1])
          if (col) { col.isFK = true; col.references = { table: fkMatch[2], column: fkMatch[3] } }
        }
        continue
      }

      // Skip UNIQUE, INDEX, KEY constraints
      if (upper.startsWith('UNIQUE') || upper.startsWith('INDEX') || upper.startsWith('KEY') || upper.startsWith('CHECK')) continue

      // Parse column definition
      const colMatch = line.match(/^["'`]?(\w+)["'`]?\s+(\w+(?:\s*\([^)]*\))?)/i)
      if (!colMatch) continue

      const colName = colMatch[1]
      const colType = colMatch[2].replace(/\s*\([^)]*\)/, match => match) // keep type params

      const rest = upper
      const isPK = rest.includes('PRIMARY KEY')
      const isNullable = !rest.includes('NOT NULL') && !isPK
      const isUnique = rest.includes('UNIQUE') && !isPK

      // Inline REFERENCES
      const refMatch = line.match(/REFERENCES\s+["'`]?(\w+)["'`]?\s*\(["'`]?(\w+)["'`]?\)/i)
      let references: { table: string; column: string } | undefined
      if (refMatch) {
        references = { table: refMatch[1], column: refMatch[2] }
        fks.push({ fromTable: tableName, fromCol: colName, toTable: refMatch[1], toCol: refMatch[2] })
      }

      columns.push({
        name: colName,
        type: colType.toUpperCase(),
        isPK,
        isFK: !!refMatch,
        isNullable,
        isUnique,
        references,
      })
    }

    tables.push({ name: tableName, columns })
  }

  return { tables, fks }
}

// ── Layout ───────────────────────────────────────────────────────────────────
const TW = 220   // table width
const TH = 36    // header height
const RH = 26    // row height
const GAP_X = 60
const GAP_Y = 50

function computeLayout(tables: Table[]): Record<string, TablePos> {
  const positions: Record<string, TablePos> = {}
  const COLS = 3
  tables.forEach((t, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const maxHeightInRow = tables
      .filter((_, j) => Math.floor(j / COLS) === row)
      .reduce((max, t2) => Math.max(max, TH + t2.columns.length * RH), 0)
    let y = 20
    for (let r = 0; r < row; r++) {
      const rowTables = tables.filter((_, j) => Math.floor(j / COLS) === r)
      const rowH = rowTables.reduce((max, t2) => Math.max(max, TH + t2.columns.length * RH), 0)
      y += rowH + GAP_Y
    }
    void maxHeightInRow
    positions[t.name] = {
      x: 20 + col * (TW + GAP_X),
      y,
    }
  })
  return positions
}

// ── FK Line ───────────────────────────────────────────────────────────────────
function FkLine({ fk, positions, tables }: {
  fk: ForeignKey
  positions: Record<string, TablePos>
  tables: Table[]
}) {
  const fromPos = positions[fk.fromTable]
  const toPos = positions[fk.toTable]
  if (!fromPos || !toPos) return null

  const fromTable = tables.find(t => t.name === fk.fromTable)
  const toTable = tables.find(t => t.name === fk.toTable)
  if (!fromTable || !toTable) return null

  const fromColIdx = fromTable.columns.findIndex(c => c.name === fk.fromCol)
  const toColIdx = toTable.columns.findIndex(c => c.name === fk.toCol)

  const fromY = fromPos.y + TH + (fromColIdx >= 0 ? fromColIdx * RH + RH / 2 : RH / 2)
  const toY = toPos.y + TH + (toColIdx >= 0 ? toColIdx * RH + RH / 2 : RH / 2)

  // Decide which side to connect from
  const fromRight = fromPos.x + TW
  const toRight = toPos.x + TW
  const useFromRight = fromPos.x < toPos.x || (fromPos.x === toPos.x && fromRight < toPos.x)

  const x1 = useFromRight ? fromRight : fromPos.x
  const x2 = useFromRight ? toPos.x : toRight
  const cx1 = x1 + (useFromRight ? 40 : -40)
  const cx2 = x2 + (useFromRight ? -40 : 40)

  return (
    <g>
      <path
        d={`M ${x1} ${fromY} C ${cx1} ${fromY}, ${cx2} ${toY}, ${x2} ${toY}`}
        fill="none"
        stroke="#6366f1"
        strokeWidth={1.5}
        strokeDasharray="5,3"
        opacity={0.7}
      />
      {/* Arrow at target */}
      <circle cx={x2} cy={toY} r={4} fill="#6366f1" opacity={0.8} />
      <circle cx={x1} cy={fromY} r={3} fill="#f59e0b" opacity={0.9} />
    </g>
  )
}

// ── Table SVG ─────────────────────────────────────────────────────────────────
function TableNode({ table, pos, selected, onMouseDown, onSelect }: {
  table: Table
  pos: TablePos
  selected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onSelect: () => void
}) {
  const h = TH + table.columns.length * RH
  const isDark = document.documentElement.classList.contains('dark')

  const headerFill = selected ? '#3b82f6' : (isDark ? '#1e3a5f' : '#dbeafe')
  const headerText = selected ? '#fff' : (isDark ? '#93c5fd' : '#1d4ed8')
  const bodyFill = isDark ? '#111827' : '#fff'
  const borderColor = selected ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const typeColor = isDark ? '#6b7280' : '#9ca3af'
  const altRowFill = isDark ? '#1f2937' : '#f9fafb'

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: 'grab' }}>
      {/* Shadow */}
      <rect x={2} y={2} width={TW} height={h} rx={8} fill="rgba(0,0,0,0.08)" />
      {/* Body */}
      <rect width={TW} height={h} rx={8} fill={bodyFill} stroke={borderColor} strokeWidth={1.5} />
      {/* Header */}
      <rect width={TW} height={TH} rx={8} fill={headerFill} />
      <rect y={TH - 8} width={TW} height={8} fill={headerFill} />
      {/* Table name */}
      <text
        x={TW / 2} y={TH / 2 + 5}
        textAnchor="middle"
        fill={headerText}
        fontSize={13}
        fontWeight="bold"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        onMouseDown={onMouseDown}
        onClick={onSelect}
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        {table.name}
      </text>
      {/* Divider */}
      <line x1={0} y1={TH} x2={TW} y2={TH} stroke={borderColor} strokeWidth={1} />

      {/* Columns */}
      {table.columns.map((col, i) => {
        const cy = TH + i * RH
        return (
          <g key={col.name}>
            {i % 2 === 1 && <rect x={1} y={cy} width={TW - 2} height={RH} fill={altRowFill} rx={i === table.columns.length - 1 ? 0 : 0} />}
            {/* Icons */}
            {col.isPK && (
              <text x={10} y={cy + RH / 2 + 5} fontSize={11} fill="#f59e0b" style={{ userSelect: 'none' }}>🔑</text>
            )}
            {col.isFK && !col.isPK && (
              <text x={10} y={cy + RH / 2 + 5} fontSize={11} fill="#8b5cf6" style={{ userSelect: 'none' }}>🔗</text>
            )}
            {col.isUnique && !col.isPK && !col.isFK && (
              <text x={10} y={cy + RH / 2 + 5} fontSize={10} fill="#10b981" style={{ userSelect: 'none' }}>◆</text>
            )}
            {!col.isPK && !col.isFK && !col.isUnique && (
              <text x={12} y={cy + RH / 2 + 5} fontSize={10} fill={typeColor} style={{ userSelect: 'none' }}>·</text>
            )}
            {/* Column name */}
            <text x={28} y={cy + RH / 2 + 5} fontSize={11} fill={textColor} fontFamily="ui-monospace, monospace" style={{ userSelect: 'none' }}>
              {col.name.length > 16 ? col.name.slice(0, 15) + '…' : col.name}
            </text>
            {/* Type */}
            <text x={TW - 8} y={cy + RH / 2 + 5} textAnchor="end" fontSize={10} fill={typeColor} fontFamily="ui-monospace, monospace" style={{ userSelect: 'none' }}>
              {col.type.length > 12 ? col.type.slice(0, 11) + '…' : col.type}
              {col.isNullable && col.type !== 'NULL' ? '?' : ''}
            </text>
            {/* Bottom divider for all but last */}
            {i < table.columns.length - 1 && (
              <line x1={1} y1={cy + RH} x2={TW - 1} y2={cy + RH} stroke={borderColor} strokeWidth={0.5} opacity={0.5} />
            )}
          </g>
        )
      })}

      {/* Bottom radius fix */}
      <rect x={1} y={h - 8} width={TW - 2} height={8} rx={0} fill={bodyFill} />
      <rect x={0} y={h - 8} width={TW} height={8} rx={0} fill="transparent" />
      {/* Reapply bottom corners */}
      <rect x={1} y={h - 8} width={TW - 2} height={9} fill={bodyFill} />
    </g>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const SAMPLE = `CREATE TABLE Categories (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Products (
  Id INT PRIMARY KEY,
  CategoryId INT NOT NULL REFERENCES Categories(Id),
  Name VARCHAR(200) NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  Stock INT NOT NULL DEFAULT 0,
  IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE Users (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(255) UNIQUE NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  CreatedAt DATETIME NOT NULL
);

CREATE TABLE Orders (
  Id INT PRIMARY KEY,
  UserId INT NOT NULL REFERENCES Users(Id),
  Total DECIMAL(10,2) NOT NULL,
  Status VARCHAR(50) NOT NULL,
  OrderDate DATETIME NOT NULL
);

CREATE TABLE OrderItems (
  Id INT PRIMARY KEY,
  OrderId INT NOT NULL REFERENCES Orders(Id),
  ProductId INT NOT NULL REFERENCES Products(Id),
  Quantity INT NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL
);`

export default function ErdDiagram() {
  const [sql, setSql] = useState(SAMPLE)
  const [positions, setPositions] = useState<Record<string, TablePos>>({})
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [copied, setCopied] = useState(false)

  const dragging = useRef<{ table: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const { tables, fks } = parseSql(sql)

  // Init positions when tables change
  useEffect(() => {
    const layout = computeLayout(tables)
    setPositions(prev => {
      const next: Record<string, TablePos> = {}
      for (const t of tables) {
        next[t.name] = prev[t.name] ?? layout[t.name]
      }
      return next
    })
  }, [sql])

  const svgWidth = Math.max(...Object.values(positions).map(p => p.x + TW + 40), 800)
  const svgHeight = Math.max(...Object.values(positions).map(p => {
    const t = tables.find(t => t.name === Object.keys(positions).find(k => positions[k] === p))
    return p.y + (t ? TH + t.columns.length * RH : 100) + 40
  }), 600)

  const startDrag = useCallback((e: React.MouseEvent, tableName: string) => {
    e.preventDefault()
    const svgRect = svgRef.current?.getBoundingClientRect()
    if (!svgRect) return
    dragging.current = {
      table: tableName,
      startX: e.clientX,
      startY: e.clientY,
      origX: positions[tableName]?.x ?? 0,
      origY: positions[tableName]?.y ?? 0,
    }
  }, [positions])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = (e.clientX - dragging.current.startX) / zoom
    const dy = (e.clientY - dragging.current.startY) / zoom
    setPositions(prev => ({
      ...prev,
      [dragging.current!.table]: {
        x: Math.max(0, dragging.current!.origX + dx),
        y: Math.max(0, dragging.current!.origY + dy),
      },
    }))
  }, [zoom])

  const onMouseUp = useCallback(() => { dragging.current = null }, [])

  const resetLayout = () => setPositions(computeLayout(tables))

  const copy = async () => {
    if (!svgRef.current) return
    const svgStr = new XMLSerializer().serializeToString(svgRef.current)
    await navigator.clipboard.writeText(svgStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* SQL Input */}
        <div className="lg:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            CREATE TABLE SQL
          </label>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-xs resize-none"
            style={{ height: 560 }}
            placeholder="Paste CREATE TABLE statements..."
          />
          <p className="text-[11px] text-gray-400">
            {tables.length} tables · {fks.length} relationships
          </p>
        </div>

        {/* Diagram */}
        <div className="lg:col-span-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">ERD Diagram <span className="text-gray-400 font-normal">(drag tables)</span></label>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="btn-ghost p-1.5"><ZoomIn size={13} /></button>
              <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="btn-ghost p-1.5"><ZoomOut size={13} /></button>
              <button onClick={resetLayout} className="btn-ghost p-1.5" title="Reset layout"><Maximize2 size={13} /></button>
              <button onClick={copy} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                SVG
              </button>
            </div>
          </div>

          <div
            className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-auto bg-gray-50 dark:bg-gray-950"
            style={{ height: 560 }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {tables.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Paste SQL with CREATE TABLE statements
              </div>
            ) : (
              <svg
                ref={svgRef}
                width={svgWidth * zoom}
                height={svgHeight * zoom}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ display: 'block' }}
              >
                {/* FK Lines (behind tables) */}
                {fks.map((fk, i) => (
                  <FkLine key={i} fk={fk} positions={positions} tables={tables} />
                ))}
                {/* Tables */}
                {tables.map(table => (
                  <TableNode
                    key={table.name}
                    table={table}
                    pos={positions[table.name] ?? { x: 0, y: 0 }}
                    selected={selectedTable === table.name}
                    onMouseDown={e => startDrag(e, table.name)}
                    onSelect={() => setSelectedTable(t => t === table.name ? null : table.name)}
                  />
                ))}
              </svg>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>🔑 PK &nbsp; 🔗 FK &nbsp; ◆ Unique &nbsp; · Column</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-indigo-500 opacity-70 border-dashed" style={{ borderTop: '1.5px dashed #6366f1' }} />
              Relationship
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
