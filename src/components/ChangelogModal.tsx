import { useEffect, useState } from 'react'
import { X, Zap, Bug, Sparkles, Palette } from 'lucide-react'

interface ChangelogModalProps {
  open: boolean
  onClose: () => void
}

type ChangeType = 'new' | 'fix' | 'improvement' | 'design'

interface ChangeEntry {
  type: ChangeType
  text: string
}

interface Version {
  date: string
  changes: ChangeEntry[]
}


const TYPE_CONFIG: Record<ChangeType, { icon: React.ReactNode; label: string; color: string }> = {
  new: {
    icon: <Zap size={11} />,
    label: 'New',
    color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  },
  fix: {
    icon: <Bug size={11} />,
    label: 'Fix',
    color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  },
  improvement: {
    icon: <Sparkles size={11} />,
    label: 'Improved',
    color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  },
  design: {
    icon: <Palette size={11} />,
    label: 'Design',
    color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  },
}

export default function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  const [changelog, setChangelog] = useState<Version[]>([])

  useEffect(() => {
    if (!open || changelog.length > 0) return
    fetch('/changelog.json')
      .then(r => r.json())
      .then(setChangelog)
      .catch(() => {})
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">What's New</h2>
              <p className="text-xs text-gray-400">DevTools Online changelog</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {changelog.map((v, i) => {
            const version = `v1.${changelog.length - i + 1}`
            const badge = i === 0 ? 'latest' : i === 1 ? 'recent' : null
            return (
            <div key={i}>
              {/* Version header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-gray-900 dark:text-white">{version}</span>
                {badge === 'latest' && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800 font-medium">
                    Latest
                  </span>
                )}
                {badge === 'recent' && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    Recent
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">{v.date}</span>
              </div>

              {/* Changes */}
              <div className="space-y-2">
                {v.changes.map((c, i) => {
                  const cfg = TYPE_CONFIG[c.type]
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{c.text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-gray-800 mt-5" />
            </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
          <a
            href="https://github.com/khoatd2403/DevKit-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Full commit history on GitHub →
          </a>
          <button onClick={onClose} className="btn-primary text-sm">Got it</button>
        </div>
      </div>
    </div>
  )
}
