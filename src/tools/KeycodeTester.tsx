import { useState, useCallback, useRef } from 'react'
import { Keyboard, Trash2 } from 'lucide-react'

type KeyEvent = {
  id: number
  key: string
  code: string
  keyCode: number
  which: number
  charCode: number
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  type: 'keydown' | 'keyup' | 'keypress'
  timestamp: number
}

let evtId = 0

function shortcutString(e: KeyEvent): string {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Meta')
  if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key)
  }
  return parts.join('+')
}

function ModBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-mono font-semibold border transition-colors ${
      active
        ? 'bg-primary-500 border-primary-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
    }`}>
      {label}
    </span>
  )
}

export default function KeycodeTester() {
  const [current, setCurrent] = useState<KeyEvent | null>(null)
  const [history, setHistory] = useState<KeyEvent[]>([])
  const focusRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault()
    const evt: KeyEvent = {
      id: evtId++,
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      charCode: e.charCode ?? 0,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
      type: e.type as KeyEvent['type'],
      timestamp: Date.now(),
    }
    setCurrent(evt)
    if (e.type === 'keydown') {
      setHistory(prev => [evt, ...prev].slice(0, 10))
    }
  }, [])

  function clearAll() {
    setCurrent(null)
    setHistory([])
  }

  const shortcut = current ? shortcutString(current) : ''

  return (
    <div className="space-y-4">
      {/* Focus area */}
      <div
        ref={focusRef}
        tabIndex={0}
        onKeyDown={handleKey}
        onKeyUp={handleKey}
        onKeyPress={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer select-none transition-colors outline-none h-40 ${
          focused
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/50'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-primary-300'
        }`}
      >
        {focused ? (
          current ? (
            <div className="text-center">
              <div className="font-mono text-5xl font-bold text-gray-800 dark:text-gray-100 leading-none">
                {current.key === ' ' ? '␣' : current.key.length === 1 ? current.key : ''}
              </div>
              {current.key.length > 1 && (
                <div className="font-mono text-xl font-semibold text-primary-600 dark:text-primary-400 mt-1">{current.key}</div>
              )}
              {shortcut && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-mono">{shortcut}</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-primary-500 dark:text-primary-400">
              <Keyboard size={32} />
              <span className="text-sm font-medium">Press any key</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
            <Keyboard size={32} />
            <span className="text-sm">Click here to focus, then press keys</span>
          </div>
        )}
      </div>

      {/* Current key details */}
      {current && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Properties</span>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
                current.type === 'keydown'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                  : current.type === 'keyup'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400'
              }`}>
                {current.type}
              </span>
            </div>
          </div>

          {/* Modifiers */}
          <div className="flex gap-2 mb-4">
            <ModBadge active={current.ctrlKey} label="Ctrl" />
            <ModBadge active={current.altKey} label="Alt" />
            <ModBadge active={current.shiftKey} label="Shift" />
            <ModBadge active={current.metaKey} label="Meta" />
          </div>

          {/* Property grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'key', value: current.key === ' ' ? 'Space' : current.key, desc: 'String representation' },
              { label: 'code', value: current.code, desc: 'Physical key code' },
              { label: 'keyCode', value: String(current.keyCode), desc: 'Deprecated numeric code', deprecated: true },
              { label: 'which', value: String(current.which), desc: 'Deprecated (same as keyCode)', deprecated: true },
              { label: 'charCode', value: String(current.charCode), desc: 'Deprecated character code', deprecated: true },
              { label: 'shortcut', value: shortcut || '—', desc: 'Formatted shortcut string' },
            ].map(prop => (
              <div key={prop.label} className={`rounded-lg p-3 border ${prop.deprecated ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-xs font-mono font-semibold ${prop.deprecated ? 'text-amber-600 dark:text-amber-400' : 'text-primary-600 dark:text-primary-400'}`}>
                    {prop.label}
                  </span>
                  {prop.deprecated && (
                    <span className="text-xs text-amber-500 dark:text-amber-500">(deprecated)</span>
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 break-all">{prop.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{prop.desc}</div>
              </div>
            ))}
          </div>

          {shortcut && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Shortcut format: </span>
              <code className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{shortcut}</code>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-text">Key History (last 10 keydowns)</label>
            <button onClick={clearAll} className="btn-ghost text-xs flex items-center gap-1">
              <Trash2 size={11} /> Clear
            </button>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">key</th>
                  <th className="text-left px-3 py-2 font-semibold">code</th>
                  <th className="text-left px-3 py-2 font-semibold">keyCode</th>
                  <th className="text-left px-3 py-2 font-semibold">Modifiers</th>
                  <th className="text-left px-3 py-2 font-semibold">Shortcut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((e, i) => (
                  <tr key={e.id} className={i === 0 ? 'bg-primary-50 dark:bg-primary-950/30' : ''}>
                    <td className="px-3 py-2 font-mono font-bold text-gray-800 dark:text-gray-200">
                      {e.key === ' ' ? '␣' : e.key}
                    </td>
                    <td className="px-3 py-2 font-mono text-primary-600 dark:text-primary-400">{e.code}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{e.keyCode}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {e.ctrlKey && <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-600 dark:text-gray-400">Ctrl</span>}
                        {e.altKey && <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-600 dark:text-gray-400">Alt</span>}
                        {e.shiftKey && <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-600 dark:text-gray-400">Shift</span>}
                        {e.metaKey && <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-600 dark:text-gray-400">Meta</span>}
                        {!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{shortcutString(e) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deprecation note */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
        <span className="font-semibold">Note on deprecated properties:</span> <code className="font-mono">keyCode</code>, <code className="font-mono">which</code>, and <code className="font-mono">charCode</code> are deprecated Web platform features.
        Use <code className="font-mono">key</code> and <code className="font-mono">code</code> in new code. <code className="font-mono">key</code> gives the logical key value, <code className="font-mono">code</code> gives the physical keyboard position.
      </div>
    </div>
  )
}
