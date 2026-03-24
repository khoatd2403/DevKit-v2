import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

const FIELDS = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function describePart(part: string, type: string): string {
  if (part === '*') return `every ${type}`
  if (part.includes('/')) {
    const [, step] = part.split('/')
    return `every ${step} ${type}s`
  }
  if (part.includes('-')) {
    const [s, e] = part.split('-')
    if (type === 'month') return `from ${MONTHS[parseInt(s!) - 1]} to ${MONTHS[parseInt(e!) - 1]}`
    if (type === 'weekday') return `${DAYS[parseInt(s!)]} through ${DAYS[parseInt(e!)]}`
    return `from ${s} to ${e}`
  }
  if (part.includes(',')) {
    const vals = part.split(',')
    if (type === 'month') return vals.map(v => MONTHS[parseInt(v) - 1]).join(', ')
    if (type === 'weekday') return vals.map(v => DAYS[parseInt(v)]).join(', ')
    return vals.join(', ')
  }
  if (type === 'month') return MONTHS[parseInt(part) - 1] || part
  if (type === 'weekday') return DAYS[parseInt(part)] || part
  return part
}

function parseCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid: must have 5 fields'
  const [min, hour, dom, month, dow] = parts
  const descs = [
    describePart(min!, 'minute'),
    describePart(hour!, 'hour'),
    describePart(dom!, 'day'),
    describePart(month!, 'month'),
    describePart(dow!, 'weekday'),
  ]
  return `At ${descs[0]} past ${descs[1]}, on ${descs[2]} of ${descs[3]}, on ${descs[4]}`
}

const EXAMPLES = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every day at midnight', expr: '0 0 * * *' },
  { label: 'Every Monday at 9am', expr: '0 9 * * 1' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'First day of month', expr: '0 0 1 * *' },
]

export default function CronParser() {
  const [expr, setExpr] = usePersistentState('tool-cron-input', '0 9 * * 1-5')
  const parts = expr.trim().split(/\s+/)
  const valid = parts.length === 5

  return (
    <div className="space-y-4">
      <div>
        <label className="tool-label block mb-1">Cron Expression</label>
        <input
          type="text"
          className="tool-textarea h-auto py-2 text-lg font-mono"
          placeholder="* * * * *"
          value={expr}
          onChange={e => setExpr(e.target.value)}
        />
      </div>

      {/* Field labels */}
      <div className="grid grid-cols-5 gap-2 text-center">
        {FIELDS.map((f, i) => (
          <div key={f} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
            <div className="font-mono text-lg font-bold text-primary-600 dark:text-primary-400">{parts[i] || '?'}</div>
            <div className="text-xs text-gray-400 mt-1 leading-tight">{f}</div>
          </div>
        ))}
      </div>

      {/* Human description */}
      {valid && (
        <p className="tool-msg tool-msg--info font-medium">📅 {parseCron(expr)}</p>
      )}

      {/* Examples */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quick Examples</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ label, expr: e }) => (
            <button key={e} onClick={() => setExpr(e)} className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-400 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-400 transition-colors">
              <span className="font-mono text-primary-600 dark:text-primary-400 mr-1.5">{e}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Special Characters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[['*', 'Any value'], [',', 'Value list'], ['-', 'Range'], ['/', 'Step values'], ['?', 'No specific value (dom/dow)']].map(([char, desc]) => (
            <div key={char} className="flex gap-2">
              <code className="font-mono font-bold text-primary-600 dark:text-primary-400 w-4">{char}</code>
              <span className="text-gray-500 dark:text-gray-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
