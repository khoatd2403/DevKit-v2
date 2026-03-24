import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LATEST_VERSION } from '../version'
import { categories, tools } from '../tools-registry'
import { X, ChevronDown, ChevronRight, Home, MessageSquare, Newspaper, Star, Settings } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useLang } from '../context/LanguageContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onFeedback: () => void
  onChangelog: () => void
  onSettings: () => void
}

export default function Sidebar({ open, onClose, onFeedback, onChangelog, onSettings }: SidebarProps) {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const currentToolId = location.pathname.startsWith('/tool/')
    ? location.pathname.slice('/tool/'.length)
    : ''

  const activeCat = tools.find(t => t.id === currentToolId)?.category ?? ''
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    if (activeCat) init[activeCat] = true
    return init
  })
  const [favExpanded, setFavExpanded] = useState(true)

  const toggle = (catId: string) =>
    setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }))

  const { favorites } = useFavorites()
  const favoriteTools = tools.filter(t => favorites.includes(t.id))

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        ${open ? 'w-60' : 'w-0 lg:w-0'}
        shrink-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
        flex flex-col overflow-hidden transition-all duration-200 z-30
        fixed lg:relative top-0 left-0
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 gap-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <rect width="32" height="32" rx="7" fill="#111827"/>
            <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#374151"/>
            {/* traffic lights */}
            <circle cx="7" cy="8" r="2" fill="#ff5f57"/>
            <circle cx="13" cy="8" r="2" fill="#febc2e"/>
            <circle cx="19" cy="8" r="2" fill="#28c840"/>
            {/* prompt */}
            <text x="6" y="23" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#4ade80">&gt;_</text>
          </svg>
          <span className="font-semibold text-gray-900 dark:text-white leading-none">
            DevTools <span className="text-green-500">Online</span><span className="text-gray-400 dark:text-gray-600 font-normal text-sm">.dev</span>
          </span>
          <button onClick={onClose} className="ml-auto btn-ghost p-2 lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {/* Home */}
          <div
            className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <Home size={14} className="shrink-0" />
            <span>{t.home}</span>
          </div>
          {/* All Tools */}
          <div
            className={`sidebar-item ${location.pathname === '/tools' ? 'active' : ''}`}
            onClick={() => navigate('/tools')}
          >
            <span className="text-sm shrink-0">🧰</span>
            <span>{t.allTools}</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-600">{tools.length}</span>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

          <>
              {/* Favorites */}
              <div className="mb-0.5">
                <button
                  onClick={() => setFavExpanded(prev => !prev)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <Star size={14} className="shrink-0 text-yellow-500" />
                  <span className="flex-1 text-left truncate">{t.favorites}</span>
                  {favoriteTools.length > 0 && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full shrink-0 mr-1">
                      {favoriteTools.length}
                    </span>
                  )}
                  {favExpanded
                    ? <ChevronDown size={13} className="shrink-0 text-gray-400" />
                    : <ChevronRight size={13} className="shrink-0 text-gray-400" />
                  }
                </button>

                {favExpanded && (
                  <div className="ml-3 pl-3 border-l border-gray-100 dark:border-gray-800 mt-0.5 mb-1 space-y-0.5">
                    {favoriteTools.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-600 px-2 py-1.5 italic">
                        {t.noFavorites}
                      </p>
                    ) : (
                      favoriteTools.map(tool => (
                        <div
                          key={tool.id}
                          className={`sidebar-item py-1.5 ${currentToolId === tool.id ? 'active' : ''}`}
                          onClick={() => navigate(`/tool/${tool.id}`)}
                        >
                          <span className="text-sm shrink-0">{tool.icon}</span>
                          <span className="truncate flex-1 text-sm">{tool.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

              {/* Collapsible categories */}
              {categories.filter(c => c.id !== 'all').map(cat => {
                const catTools = tools.filter(t => t.category === cat.id)
                if (catTools.length === 0) return null
                const isOpen = !!expanded[cat.id]
                const hasActive = catTools.some(t => t.id === currentToolId)

                return (
                  <div key={cat.id} className="mb-0.5">
                    <button
                      onClick={() => toggle(cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                        ${hasActive
                          ? 'text-primary-700 dark:text-primary-300 font-semibold'
                          : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <span className="flex-1 text-left truncate">{t.categories[cat.id as keyof typeof t.categories] || cat.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0 mr-1">
                        {catTools.length}
                      </span>
                      {isOpen
                        ? <ChevronDown size={13} className="shrink-0 text-gray-400" />
                        : <ChevronRight size={13} className="shrink-0 text-gray-400" />
                      }
                    </button>

                    {isOpen && (
                      <div className="ml-3 pl-3 border-l border-gray-100 dark:border-gray-800 mt-0.5 mb-1 space-y-0.5">
                        {catTools.map(tool => (
                          <div
                            key={tool.id}
                            className={`sidebar-item py-1.5 ${currentToolId === tool.id ? 'active' : ''}`}
                            onClick={() => navigate(`/tool/${tool.id}`)}
                          >
                            <span className="truncate flex-1 text-sm">{tool.name}</span>
                            {tool.new && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full shrink-0">
                                {t.new}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </>
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-2 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-0.5 shrink-0">
          {/* Settings */}
          <button
            onClick={onSettings}
            className="sidebar-item w-full"
          >
            <Settings size={14} className="shrink-0" />
            <span className="text-sm">{t.settings}</span>
          </button>

          {/* What's New */}
          <button
            onClick={onChangelog}
            className="sidebar-item w-full"
          >
            <Newspaper size={14} className="shrink-0" />
            <span className="text-sm">{t.whatsNew}</span>
            <span className="ml-auto text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full font-medium">{LATEST_VERSION}</span>
          </button>

          {/* Feedback */}
          <button
            onClick={onFeedback}
            className="sidebar-item w-full"
          >
            <MessageSquare size={14} className="shrink-0" />
            <span className="text-sm">{t.feedback}</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-600 font-mono">Shift+?</span>
          </button>

          <p className="text-xs text-gray-400 dark:text-gray-600 text-center pt-1">
            {t.toolsCount(tools.length)}
          </p>
        </div>
      </aside>
    </>
  )
}
