import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Bug, Lightbulb, Palette, MessageSquare, Copy, Check, ExternalLink, ChevronDown, Wrench } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { tools } from '../tools-registry'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
  toolName?: string
}

type FeedbackType = 'bug' | 'feature' | 'ux' | 'general'

const TYPES: { id: FeedbackType; label: string; icon: React.ReactNode; color: string; placeholder: string; labelText: string }[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: <Bug size={14} />,
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    placeholder: 'Describe what happened, what you expected, and steps to reproduce...',
    labelText: 'What went wrong?',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: <Lightbulb size={14} />,
    color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    placeholder: 'Describe the feature you\'d like to see and how it would help you...',
    labelText: 'What would you like to see?',
  },
  {
    id: 'ux',
    label: 'UX Feedback',
    icon: <Palette size={14} />,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    placeholder: 'Tell us about the experience — what felt confusing, clunky, or could be smoother...',
    labelText: 'What could be improved?',
  },
  {
    id: 'general',
    label: 'General',
    icon: <MessageSquare size={14} />,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    placeholder: 'Share your thoughts, suggestions, or anything on your mind...',
    labelText: 'Your message',
  },
]

const MAX_CHARS = 2000
const WARN_THRESHOLD = 1800

export default function FeedbackModal({ open, onClose, toolName }: FeedbackModalProps) {
  const { t } = useLang()
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState(toolName ?? '')
  const [toolOpen, setToolOpen] = useState(false)
  const [toolSearch, setToolSearch] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const feedbackTypeData = t.feedbackTypes[type]
  const current = TYPES.find(tp => tp.id === type)!
  const remaining = MAX_CHARS - message.length
  const isNearLimit = remaining <= MAX_CHARS - WARN_THRESHOLD
  const isOverLimit = remaining < 0

  const filteredTools = toolSearch
    ? tools.filter(tl => tl.name.toLowerCase().includes(toolSearch.toLowerCase()))
    : tools

  useEffect(() => {
    if (open) {
      setSelectedTool(toolName ?? '')
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open, toolName])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const reset = () => {
    setMessage('')
    setType('general')
    setSelectedTool('')
    setToolSearch('')
    setSubmitted(false)
  }

  const handleSubmit = () => {
    if (!message.trim() || isOverLimit) return
    setSubmitted(true)
  }

  const markdownFallback = `**[${feedbackTypeData.label}]${selectedTool ? ` — ${selectedTool}` : ''}**\n\n${message}`

  const labelMap: Record<FeedbackType, string> = { bug: 'bug', feature: 'enhancement', ux: 'ux', general: 'feedback' }
  const githubTitle = `${feedbackTypeData.label}${selectedTool ? ` — ${selectedTool}` : ''}: `
  const githubBody = `**Type:** ${feedbackTypeData.label}\n${selectedTool ? `**Tool:** ${selectedTool}\n` : ''}\n## Message\n\n${message}\n\n---\n*Submitted via DevTools Online feedback form*`
  const githubUrl = `https://github.com/khoatd2403/DevKit-v2/issues/new?assignees=khoatd2403&labels=${labelMap[type]}&title=${encodeURIComponent(githubTitle)}&body=${encodeURIComponent(githubBody)}`

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdownFallback)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{t.feedbackTitle}</h2>
            {selectedTool && (
              <p className="text-xs text-gray-400 mt-0.5">on <span className="text-primary-600 dark:text-primary-400 font-medium">{selectedTool}</span></p>
            )}
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label={t.close}>
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          /* Success screen */
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t.feedbackSuccessTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                {t.feedbackSuccessDesc}
              </p>
            </div>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ExternalLink size={13} /> {t.feedbackOpenGithub}
            </a>
            <div className="flex gap-2 mt-2">
              <button onClick={reset} className="btn-secondary text-sm" aria-label={t.feedbackSendAnother}>{t.feedbackSendAnother}</button>
              <button onClick={onClose} className="btn-primary text-sm" aria-label={t.done}>{t.done}</button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Type selector */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">{t.feedbackType}</label>
              <div className="relative">
                <button
                  onClick={() => setTypeOpen(o => !o)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${current.color}`}
                  aria-label={`${t.feedbackType}: ${feedbackTypeData.label}`}
                >
                  {current.icon}
                  <span className="flex-1 text-left">{feedbackTypeData.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                </button>
                {typeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                    {TYPES.map(tp => (
                      <button
                        key={tp.id}
                        onClick={() => { setType(tp.id); setTypeOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${type === tp.id ? 'font-medium' : ''}`}
                        aria-label={t.feedbackTypes[tp.id].label}
                      >
                        <span className={tp.color.split(' ')[0]}>{tp.icon}</span>
                        {t.feedbackTypes[tp.id].label}
                        {type === tp.id && <Check size={13} className="ml-auto text-primary-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tool selector */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                {t.feedbackRelatedTool} <span className="text-gray-400 font-normal">{t.feedbackOptional}</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => { setToolOpen(o => !o); setToolSearch('') }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  aria-label={t.feedbackRelatedTool}
                >
                  <Wrench size={13} className="text-gray-400 shrink-0" />
                  <span className={`flex-1 text-left ${selectedTool ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                    {selectedTool || t.feedbackSelectTool}
                  </span>
                  {selectedTool && (
                    <span
                      onClick={e => { e.stopPropagation(); setSelectedTool('') }}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                      aria-label="Clear selection"
                      role="button"
                    >
                      <X size={12} />
                    </span>
                  )}
                  <ChevronDown size={13} className={`text-gray-400 transition-transform shrink-0 ${toolOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <input
                        type="text"
                        autoFocus
                         placeholder={t.searchPlaceholder}
                        value={toolSearch}
                        onChange={e => setToolSearch(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {filteredTools.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">{t.noToolsFound(toolSearch)}</p>
                      ) : filteredTools.map(tl => (
                        <button
                          key={tl.id}
                          onClick={() => { setSelectedTool(tl.name); setToolOpen(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedTool === tl.name ? 'font-medium text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                          aria-label={tl.name}
                        >
                          <span>{tl.icon}</span>
                          <span className="flex-1 truncate">{tl.name}</span>
                          {selectedTool === tl.name && <Check size={12} className="text-primary-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                {feedbackTypeData.labelText}
              </label>
              <textarea
                ref={textareaRef}
                className={`tool-textarea h-36 resize-none transition-colors ${isOverLimit ? '!border-red-400 !ring-red-400' : ''}`}
                placeholder={feedbackTypeData.placeholder}
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={MAX_CHARS + 50}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-mono transition-colors ${isOverLimit ? 'text-red-500 font-bold' : isNearLimit ? 'text-orange-500' : 'text-gray-400'}`}>
                  {remaining.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>

            {/* No GitHub hint */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg shrink-0">💡</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.feedbackNoGithub}
                </p>
                <button
                  onClick={copyMarkdown}
                  disabled={!message.trim()}
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-40 disabled:no-underline"
                  aria-label={t.feedbackCopyMarkdown}
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t.feedbackCopied : t.feedbackCopyMarkdown}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {t.pressEscToClose.split('Esc')[0]} <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-mono">Esc</kbd> {t.pressEscToClose.split('Esc')[1]}
              </span>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary text-sm" aria-label={t.cancel}>{t.cancel}</button>
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isOverLimit}
                  className="btn-primary text-sm"
                  aria-label={t.feedbackSubmit}
                >
                  {t.feedbackSubmit}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
