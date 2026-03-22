import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

interface ShortcutRow {
  keys: string[]
  description: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutRow[]
}

const SECTIONS: ShortcutSection[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Send feedback' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Alt', 'L'], description: 'Toggle live mode' },
    ],
  },
  {
    title: 'Tool',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Run / process' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy output' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', '['], description: 'Previous tool in history' },
      { keys: ['Ctrl', ']'], description: 'Next tool in history' },
    ],
  },
]

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-mono">Esc</kbd> to close</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>

        {/* Sections */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-1.5"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {shortcut.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <kbd className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-400 shadow-sm">
                            {key}
                          </kbd>
                          {ki < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 dark:text-gray-600 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
