import { useState, useRef, useEffect } from 'react'
import { BookMarked, Copy, Trash2, X, Search, Plus, Check } from 'lucide-react'
import { useSnippets } from '../hooks/useSnippets'
import { useToast } from '../context/ToastContext'
import { tools } from '../tools-registry'
import { useLang } from '../context/LanguageContext'

interface SnippetDrawerProps {
  open: boolean
  onClose: () => void
  toolId?: string
  onLoad: (content: string) => void
}

function getToolName(id: string): string {
  return tools.find(t => t.id === id)?.name ?? id
}

export default function SnippetDrawer({ open, onClose, toolId, onLoad }: SnippetDrawerProps) {
  const { t } = useLang()
  const { snippets, save, remove, update } = useSnippets(toolId)
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const labelInputRef = useRef<HTMLInputElement>(null)

  function relativeTime(ts: number): string {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return t.time.justNow
    if (mins < 60) return t.time.minsAgo(mins)
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return t.time.hrsAgo(hrs)
    const days = Math.floor(hrs / 24)
    if (days < 30) return t.time.daysAgo(days)
    const months = Math.floor(days / 30)
    return t.time.monthsAgo(months)
  }

  // Focus label input when drawer opens
  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => labelInputRef.current?.focus(), 150)
    }
  }, [open])

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 50)
    }
  }, [editingId])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) { setEditingId(null); return }
        if (confirmDeleteId) { setConfirmDeleteId(null); return }
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, editingId, confirmDeleteId, onClose])

  const handleSave = () => {
    const label = newLabel.trim()
    const content = newContent.trim()
    if (!label || !content) return
    save(label, content)
    setNewLabel('')
    setNewContent('')
    showToast(t.snippetSaved, 'success')
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      remove(id)
      setConfirmDeleteId(null)
      showToast(t.snippetDeleted, 'info')
    } else {
      setConfirmDeleteId(id)
      // Auto-cancel confirm after 3s
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000)
    }
  }

  const commitEdit = (id: string) => {
    const label = editingLabel.trim()
    if (label) update(id, label)
    setEditingId(null)
  }

  const filtered = snippets.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          w-full sm:w-[380px]
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <BookMarked size={16} className="text-primary-500 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{t.snippetsTitle}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t.close}
            aria-label={t.close}
          >
            <X size={16} />
          </button>
        </div>

        {/* Save current section */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.saveSnippet}</p>
          <input
            ref={labelInputRef}
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={t.snippetName}
            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder={t.contentToSave}
            rows={3}
            className="w-full text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!newLabel.trim() || !newContent.trim()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            aria-label={t.saveSnippet}
          >
            <Plus size={14} />
            {t.saveSnippet}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchSnippets}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Snippet list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-3">
              <BookMarked size={32} className="text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {search
                  ? t.noSnippetsMatch(search)
                  : t.noSnippetsYet}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(snippet => (
                <li key={snippet.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Label row */}
                  <div className="flex items-start gap-2 mb-1">
                    {editingId === snippet.id ? (
                      <input
                        ref={editInputRef}
                        value={editingLabel}
                        onChange={e => setEditingLabel(e.target.value)}
                        onBlur={() => commitEdit(snippet.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit(snippet.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="flex-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 border border-primary-400 rounded px-1.5 py-0.5 text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-text select-none truncate"
                        title={t.renameSnippet}
                        onDoubleClick={() => {
                          setEditingId(snippet.id)
                          setEditingLabel(snippet.label)
                        }}
                      >
                        {snippet.label}
                      </span>
                    )}
                    {/* Tool badge */}
                    {snippet.toolId && (
                      <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                        {getToolName(snippet.toolId)}
                      </span>
                    )}
                  </div>

                  {/* Content preview */}
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 break-all">
                    {snippet.content.length > 80
                      ? snippet.content.slice(0, 80) + '…'
                      : snippet.content}
                  </p>

                  {/* Footer: timestamp + actions */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-1">
                      {relativeTime(snippet.createdAt)}
                    </span>
                    <button
                      onClick={() => { onLoad(snippet.content) }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors font-medium"
                      title={t.loadIntoTool}
                      aria-label={`${t.loadIntoTool} ${snippet.label}`}
                    >
                      {t.loadIntoTool}
                    </button>
                    <button
                      onClick={() => handleCopy(snippet.content, snippet.id)}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t.copyToClipboard}
                      aria-label={`${t.copyToClipboard} ${snippet.label}`}
                    >
                      {copiedId === snippet.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(snippet.id)}
                      className={`p-1 rounded transition-colors ${
                        confirmDeleteId === snippet.id
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={confirmDeleteId === snippet.id ? t.confirmDeleteSnippet : t.deleteSnippet}
                      aria-label={`${t.deleteSnippet} ${snippet.label}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
