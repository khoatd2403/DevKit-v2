import { useState, useMemo, type ReactElement } from 'react'
import { Search, Copy, Check, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal' | 'verbose' | 'unknown'

interface LogEntry {
  index: number
  timestamp?: string
  level: LogLevel
  message: string
  logger?: string
  thread?: string
  exception?: string
  extra?: Record<string, unknown>
  raw: string
}

// ── Parsers ───────────────────────────────────────────────────────────────────
function detectLevel(s: string): LogLevel {
  const u = s.toUpperCase()
  if (/\bFATAL\b/.test(u)) return 'fatal'
  if (/\bERROR\b|\bERR\b/.test(u)) return 'error'
  if (/\bWARN(ING)?\b|\bWRN\b/.test(u)) return 'warn'
  if (/\bINFO?\b|\bINF\b/.test(u)) return 'info'
  if (/\bDEBUG\b|\bDBG\b/.test(u)) return 'debug'
  if (/\bTRACE\b|\bTRC\b/.test(u)) return 'trace'
  if (/\bVERBOSE\b|\bVRB\b/.test(u)) return 'verbose'
  return 'unknown'
}

function parseJsonLog(line: string, index: number): LogEntry | null {
  try {
    const obj = JSON.parse(line)
    if (typeof obj !== 'object' || obj === null) return null

    const msg = obj.message ?? obj.msg ?? obj.Message ?? obj['@message'] ?? obj.text ?? ''
    const lvl = detectLevel(String(obj.level ?? obj.Level ?? obj.severity ?? obj['@level'] ?? ''))
    const ts = obj.timestamp ?? obj.time ?? obj['@timestamp'] ?? obj.Timestamp ?? obj.ts ?? obj.date ?? ''
    const logger = obj.logger ?? obj.Logger ?? obj.SourceContext ?? obj.category ?? ''
    const exception = obj.exception ?? obj.Exception ?? obj.error ?? obj.err ?? ''

    const known = new Set(['message', 'msg', 'Message', '@message', 'text', 'level', 'Level', 'severity',
      '@level', 'timestamp', 'time', '@timestamp', 'Timestamp', 'ts', 'date', 'logger', 'Logger',
      'SourceContext', 'category', 'exception', 'Exception', 'error', 'err'])
    const extra: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) if (!known.has(k)) extra[k] = v

    return {
      index,
      timestamp: ts ? String(ts) : undefined,
      level: lvl,
      message: String(msg),
      logger: logger ? String(logger) : undefined,
      exception: exception ? String(exception) : undefined,
      extra: Object.keys(extra).length > 0 ? extra : undefined,
      raw: line,
    }
  } catch {
    return null
  }
}

function parsePlainLog(line: string, index: number): LogEntry {
  // .NET Serilog: [10:30:00 INF] Message
  let m = line.match(/^\[(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(\w{3,5})\]\s*(.*)/)
  if (m) return { index, timestamp: m[1], level: detectLevel(m[2]), message: m[3], raw: line }

  // .NET NLog: 2024-01-15 10:30:00.123 | INFO | Logger | Message
  m = line.match(/^(\d{4}-\d{2}-\d{2}\s+[\d:.]+)\s*\|\s*(\w+)\s*\|\s*([^|]+)\|\s*(.*)/)
  if (m) return { index, timestamp: m[1], level: detectLevel(m[2]), logger: m[3].trim(), message: m[4], raw: line }

  // ISO timestamp + level: 2024-01-15T10:30:00 [ERROR] message
  m = line.match(/^(\d{4}-\d{2}-\d{2}[T\s][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)\s*(?:\[(\w+)\])?\s*(.*)/)
  if (m) return { index, timestamp: m[1], level: m[2] ? detectLevel(m[2]) : detectLevel(line), message: m[3] || line, raw: line }

  // Apache/Nginx: 127.0.0.1 - - [15/Jan/2024:10:30:00 +0000] "GET /path HTTP/1.1" 200 1234
  m = line.match(/^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d+)\s+(\d+)/)
  if (m) {
    const status = parseInt(m[4])
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    return { index, timestamp: m[2], level, message: `${m[3]} → ${m[4]} (${m[5]}B)`, extra: { ip: m[1], status, bytes: m[5] }, raw: line }
  }

  // Level at start: ERROR: message or [ERROR] message
  m = line.match(/^(?:\[(\w+)\]|(\w+):)\s*(.*)/)
  if (m) {
    const lvl = detectLevel(m[1] ?? m[2] ?? '')
    if (lvl !== 'unknown') return { index, level: lvl, message: m[3], raw: line }
  }

  return { index, level: detectLevel(line), message: line, raw: line }
}

function parseLog(text: string): LogEntry[] {
  const lines = text.split('\n').filter(l => l.trim())
  const entries: LogEntry[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Try JSON
    if (line.startsWith('{')) {
      const entry = parseJsonLog(line, entries.length)
      if (entry) { entries.push(entry); continue }
    }

    // Append stack trace lines to previous entry
    if (entries.length > 0 && (line.startsWith('   at ') || line.startsWith('\tat ') || line.startsWith('   ---'))) {
      const prev = entries[entries.length - 1]
      prev.exception = (prev.exception ?? '') + '\n' + line
      continue
    }

    entries.push(parsePlainLog(line, entries.length))
  }

  return entries
}

// ── Level config ──────────────────────────────────────────────────────────────
const LEVEL_CFG: Record<LogLevel, { bg: string; text: string; border: string; icon: ReactElement; label: string }> = {
  fatal:   { bg: 'bg-red-50 dark:bg-red-950/50',    text: 'text-red-700 dark:text-red-300',    border: 'border-l-4 border-red-500',     icon: <AlertCircle size={12} />, label: 'FATAL' },
  error:   { bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400',    border: 'border-l-4 border-red-400',     icon: <AlertCircle size={12} />, label: 'ERR' },
  warn:    { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-l-4 border-yellow-400', icon: <AlertTriangle size={12} />, label: 'WARN' },
  info:    { bg: 'bg-blue-50 dark:bg-blue-950/20',  text: 'text-blue-600 dark:text-blue-400',  border: 'border-l-4 border-blue-400',    icon: <Info size={12} />, label: 'INFO' },
  debug:   { bg: 'bg-gray-50 dark:bg-gray-900',     text: 'text-gray-500 dark:text-gray-500',  border: 'border-l-4 border-gray-300',    icon: <Bug size={12} />, label: 'DBG' },
  trace:   { bg: 'bg-gray-50 dark:bg-gray-900',     text: 'text-gray-400 dark:text-gray-600',  border: 'border-l-4 border-gray-200',    icon: <Bug size={12} />, label: 'TRC' },
  verbose: { bg: 'bg-gray-50 dark:bg-gray-900',     text: 'text-gray-400 dark:text-gray-600',  border: 'border-l-4 border-gray-200',    icon: <Bug size={12} />, label: 'VRB' },
  unknown: { bg: 'bg-white dark:bg-gray-950',       text: 'text-gray-600 dark:text-gray-400',  border: 'border-l-4 border-transparent',  icon: <Info size={12} />, label: '---' },
}

// ── Log entry component ────────────────────────────────────────────────────────
function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false)
  const cfg = LEVEL_CFG[entry.level]
  const hasExtra = entry.extra || entry.exception || entry.logger

  return (
    <div className={`${cfg.bg} ${cfg.border} mb-0.5 rounded-r-lg`}>
      <div
        className={`flex items-start gap-2 px-3 py-2 ${hasExtra ? 'cursor-pointer' : ''}`}
        onClick={() => hasExtra && setOpen(p => !p)}
      >
        {hasExtra && (
          <span className="shrink-0 mt-0.5 text-gray-400">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {!hasExtra && <span className="w-3 shrink-0" />}

        <span className={`shrink-0 mt-0.5 ${cfg.text}`}>{cfg.icon}</span>

        <span className={`text-[10px] font-bold font-mono shrink-0 mt-0.5 w-8 ${cfg.text}`}>
          {cfg.label}
        </span>

        {entry.timestamp && (
          <span className="text-[10px] font-mono text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
            {entry.timestamp.replace('T', ' ').replace(/\.\d{3,}Z?$/, '')}
          </span>
        )}

        <span className="text-xs text-gray-800 dark:text-gray-200 min-w-0 flex-1 break-words font-mono">
          {entry.message}
        </span>
      </div>

      {open && hasExtra && (
        <div className="pl-10 pr-3 pb-2 space-y-1">
          {entry.logger && (
            <p className="text-[11px] text-gray-400">
              <span className="text-gray-500">Logger:</span> <span className="font-mono">{entry.logger}</span>
            </p>
          )}
          {entry.extra && Object.entries(entry.extra).map(([k, v]) => (
            <p key={k} className="text-[11px] text-gray-400">
              <span className="text-gray-500">{k}:</span>{' '}
              <span className="font-mono text-gray-600 dark:text-gray-300">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </p>
          ))}
          {entry.exception && (
            <pre className="text-[10px] font-mono text-red-500 dark:text-red-400 whitespace-pre-wrap bg-red-50 dark:bg-red-950/40 p-2 rounded overflow-x-auto max-h-32">
              {entry.exception}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sample logs ────────────────────────────────────────────────────────────────
const SAMPLE = `{"timestamp":"2024-01-15T10:30:00.123Z","level":"info","message":"Application started","SourceContext":"Microsoft.Hosting.Lifetime","version":"1.0.0"}
{"timestamp":"2024-01-15T10:30:01.456Z","level":"info","message":"Now listening on: https://localhost:5001","SourceContext":"Microsoft.Hosting.Lifetime"}
{"timestamp":"2024-01-15T10:30:05.789Z","level":"info","message":"User login successful","SourceContext":"AuthController","userId":42,"email":"john@example.com","ip":"192.168.1.1"}
{"timestamp":"2024-01-15T10:30:10.000Z","level":"debug","message":"Cache miss for key: user:42:profile","SourceContext":"CacheService","key":"user:42:profile","ttl":300}
{"timestamp":"2024-01-15T10:30:10.234Z","level":"info","message":"Database query executed","SourceContext":"UserRepository","query":"SELECT * FROM Users WHERE Id=42","durationMs":12}
{"timestamp":"2024-01-15T10:30:15.567Z","level":"warn","message":"Rate limit approaching for IP","SourceContext":"RateLimitMiddleware","ip":"10.0.0.5","requests":95,"limit":100}
{"timestamp":"2024-01-15T10:30:20.890Z","level":"error","message":"Unhandled exception in OrderService","SourceContext":"OrderService","orderId":1001,"exception":"System.NullReferenceException: Object reference not set to an instance of an object.\n   at OrderService.ProcessOrder(Int32 id)\n   at OrderController.Post(OrderRequest request)"}
{"timestamp":"2024-01-15T10:30:25.123Z","level":"info","message":"HTTP GET /api/users/42 responded 200 in 45ms","SourceContext":"RequestLogging","path":"/api/users/42","statusCode":200,"durationMs":45}
{"timestamp":"2024-01-15T10:30:30.456Z","level":"warn","message":"Slow database query detected","SourceContext":"DbProfiler","durationMs":2340,"query":"SELECT * FROM Orders JOIN Products ON..."}
{"timestamp":"2024-01-15T10:30:35.789Z","level":"fatal","message":"Database connection pool exhausted","SourceContext":"DbContext","poolSize":100,"waitingRequests":47}`

const LEVELS: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'verbose', 'unknown']

export default function LogViewer() {
  const [input, setInput] = useState(SAMPLE)
  const [search, setSearch] = useState('')
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(new Set(LEVELS))
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'viewer' | 'input'>('viewer')

  const entries = useMemo(() => parseLog(input), [input])

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (!enabledLevels.has(e.level)) return false
      if (search && !e.raw.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [entries, search, enabledLevels])

  const counts = useMemo(() => {
    const c: Partial<Record<LogLevel, number>> = {}
    for (const e of entries) c[e.level] = (c[e.level] ?? 0) + 1
    return c
  }, [entries])

  const toggleLevel = (l: LogLevel) => {
    setEnabledLevels(prev => {
      const next = new Set(prev)
      if (next.has(l)) next.delete(l); else next.add(l)
      return next
    })
  }

  const copyFiltered = async () => {
    await navigator.clipboard.writeText(filtered.map(e => e.raw).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {(['viewer', 'input'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'viewer' ? `📋 Log Viewer (${entries.length})` : '✏️ Paste Logs'}
          </button>
        ))}
      </div>

      {tab === 'input' && (
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400">
            Supports: JSON Lines (Serilog, Pino, Bunyan), .NET NLog, Apache/Nginx access logs, plain text
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-xs resize-none"
            style={{ height: 480 }}
            placeholder="Paste log output here..."
          />
          <button onClick={() => setTab('viewer')} className="btn-primary text-xs px-4 py-2">
            View Logs →
          </button>
        </div>
      )}

      {tab === 'viewer' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {LEVELS.filter(l => (counts[l] ?? 0) > 0).map(l => {
              const cfg = LEVEL_CFG[l]
              const active = enabledLevels.has(l)
              return (
                <button
                  key={l}
                  onClick={() => toggleLevel(l)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all border ${
                    active
                      ? `${cfg.bg} ${cfg.text} border-current opacity-100`
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 opacity-50'
                  }`}
                >
                  {cfg.icon}
                  {cfg.label}
                  <span className="text-[10px] bg-black/10 dark:bg-white/10 rounded-full px-1.5 font-mono">
                    {counts[l] ?? 0}
                  </span>
                </button>
              )
            })}

            {/* Search */}
            <div className="flex-1 relative min-w-40">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full text-xs pl-7 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
              />
            </div>

            <button onClick={copyFiltered} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
              {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              {filtered.length}
            </button>
          </div>

          {/* Log entries */}
          <div
            className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-y-auto bg-gray-50 dark:bg-gray-950 p-2 font-mono"
            style={{ height: 500 }}
          >
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-16">No log entries match the current filters</p>
            ) : (
              filtered.map(entry => <LogRow key={entry.index} entry={entry} />)
            )}
          </div>

          <p className="text-[11px] text-gray-400">
            Showing {filtered.length} of {entries.length} entries · Click entries with stack traces to expand
          </p>
        </>
      )}
    </div>
  )
}
