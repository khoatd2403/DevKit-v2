import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { tools, categories } from '../tools-registry'
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X, Clock, Sparkles } from 'lucide-react'
import { useRecentTools } from '../hooks/useRecentTools'
import { detectContent } from '../lib/contentDetector'
import { useLang } from '../context/LanguageContext'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function fuzzyMatch(str: string, query: string): boolean {
  const s = str.toLowerCase()
  const q = query.toLowerCase()
  let si = 0
  for (let qi = 0; qi < q.length; qi++) {
    const idx = s.indexOf(q[qi]!, si)
    if (idx === -1) return false
    si = idx + 1
  }
  return true
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const parts: React.ReactNode[] = []
  let pos = 0
  for (const ch of q) {
    const idx = lower.indexOf(ch, pos)
    if (idx === -1) return text
    if (idx > pos) parts.push(text.slice(pos, idx))
    parts.push(<mark key={idx} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 rounded-sm">{text[idx]}</mark>)
    pos = idx + 1
  }
  if (pos < text.length) parts.push(text.slice(pos))
  return parts
}

// ── Smart Detect Panel ──────────────────────────────────────────────────────────
function SmartDetectPanel({ pasteInput, setPasteInput, pasteRef, onSelectTool, onBack }: {
  pasteInput: string
  setPasteInput: (v: string) => void
  pasteRef: React.RefObject<HTMLTextAreaElement | null>
  onSelectTool: (id: string) => void
  onBack: () => void
}) {
  const { t } = useLang()
  const results = useMemo(() => detectContent(pasteInput), [pasteInput])

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Sparkles size={14} className="text-purple-500" />
          {t.smartDetectTitle}
        </div>
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {t.backToSearch}
        </button>
      </div>

      <textarea
        ref={pasteRef}
        value={pasteInput}
        onChange={e => setPasteInput(e.target.value)}
        placeholder={t.smartDetectPlaceholder}
        className="w-full h-28 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 font-mono"
      />

      {pasteInput.trim().length > 0 && results.length === 0 && (
        <div className="text-center py-3 text-gray-400 text-sm">
          <p>{t.couldNotDetect}</p>
          <p className="text-xs mt-1">{t.tryPastingJSON}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {t.detected}: {results.map(r => r.label).join(', ')}
          </p>
          {results.map(r => (
            <div key={r.type} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{r.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  r.confidence >= 0.9 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                  : r.confidence >= 0.7 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {r.confidence >= 0.9 ? t.matchHigh : r.confidence >= 0.7 ? t.matchLikely : t.matchMaybe}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 pl-6">
                {r.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{tool.name}</span>
                      <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                    </div>
                    <span className="text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Open →</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [detectMode, setDetectMode] = useState(false)
  const [pasteInput, setPasteInput] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const pasteRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { recent } = useRecentTools()
  const recentToolObjects = recent
    .map(id => tools.find(t => t.id === id))
    .filter(Boolean) as typeof tools

  const filtered = query
    ? tools.filter(t =>
        fuzzyMatch(t.name, query) ||
        fuzzyMatch(t.description, query) ||
        t.tags.some(tag => fuzzyMatch(tag, query))
      )
    : tools

  // When query is empty and there are recent tools, the navigable list is:
  // [...recentToolObjects, ...tools]
  const displayList = (query === '' && recentToolObjects.length > 0)
    ? [...recentToolObjects, ...tools]
    : filtered

  const getCatName = (catId: string) => categories.find(c => c.id === catId)?.name ?? catId
  const getCatIcon = (catId: string) => categories.find(c => c.id === catId)?.icon ?? '🔧'

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setDetectMode(false)
      setPasteInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setCursor(0) }, [query])

  const select = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`)
    onClose()
  }, [navigate, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor(c => Math.min(c + 1, displayList.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor(c => Math.max(c - 1, 0))
      }
      if (e.key === 'Enter' && displayList[cursor]) {
        select(displayList[cursor]!.id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, cursor, displayList, select, onClose])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${cursor}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  const showRecentSection = query === '' && recentToolObjects.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[65vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md shrink-0 border border-purple-100 dark:border-purple-800/50">
            <Sparkles size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Smart</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none placeholder-gray-400"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          <kbd className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono shrink-0">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {displayList.length === 0 && !detectMode ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-400 text-sm mb-3">{t.noToolsFound(query)}</p>
              <button
                onClick={() => { setDetectMode(true); setTimeout(() => pasteRef.current?.focus(), 50) }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
              >
                <Sparkles size={14} />
                {t.smartDetectPrompt}
              </button>
            </div>
          ) : detectMode ? (
            <SmartDetectPanel
              pasteInput={pasteInput}
              setPasteInput={setPasteInput}
              pasteRef={pasteRef}
              onSelectTool={(id) => select(id)}
              onBack={() => setDetectMode(false)}
            />
          ) : showRecentSection ? (
            <>
              {/* Recent section */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t.recent}
              </div>
              {recentToolObjects.map((tool, i) => (
                <div
                  key={`recent-${tool.id}`}
                  data-index={i}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === cursor ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => select(tool.id)}
                >
                  <span className="text-xl shrink-0">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {tool.name}
                      </span>
                      {tool.new && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                  </div>
                  <Clock size={12} className="text-gray-400 shrink-0" />
                  {i === cursor && (
                    <CornerDownLeft size={13} className="text-gray-400 shrink-0" />
                  )}
                </div>
              ))}

              {/* All Tools section */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                All Tools ({tools.length})
              </div>
              {tools.map((tool, i) => {
                const globalIndex = recentToolObjects.length + i
                return (
                  <div
                    key={`all-${tool.id}`}
                    data-index={globalIndex}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${globalIndex === cursor ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    onMouseEnter={() => setCursor(globalIndex)}
                    onClick={() => select(tool.id)}
                  >
                    <span className="text-xl shrink-0">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tool.name}
                        </span>
                        {tool.new && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">{t.new}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">
                      {getCatIcon(tool.category)} {getCatName(tool.category)}
                    </span>
                    {globalIndex === cursor && (
                      <CornerDownLeft size={13} className="text-gray-400 shrink-0" />
                    )}
                  </div>
                )
              })}
            </>
          ) : (
            <>
              {query === '' && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t.allTools} ({tools.length})
                </div>
              )}
              {filtered.map((tool, i) => (
                <div
                  key={tool.id}
                  data-index={i}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === cursor ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => select(tool.id)}
                >
                  <span className="text-xl shrink-0">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {highlightMatch(tool.name, query)}
                      </span>
                      {tool.new && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">{t.new}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">
                    {getCatIcon(tool.category)} {getCatName(tool.category)}
                  </span>
                  {i === cursor && (
                    <CornerDownLeft size={13} className="text-gray-400 shrink-0" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          <span className="flex items-center gap-1"><ArrowUp size={11} /><ArrowDown size={11} /> {t.navHint}</span>
          <span className="flex items-center gap-1"><CornerDownLeft size={11} /> {t.selectHint}</span>
          <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono">Esc</kbd> {t.closeHint}</span>
          <span className="ml-auto">{displayList.length} {t.allTools.toLowerCase()}</span>
        </div>
      </div>
    </div>
  )
}
