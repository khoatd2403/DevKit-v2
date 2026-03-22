import { Github, Menu, Newspaper } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { tools } from '../tools-registry'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

interface HeaderProps {
  onMenuClick: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onOpenCmd: () => void
  onChangelog: () => void
  hasNewChangelog: boolean
}

export default function Header({ onMenuClick, onSearchChange: _onSearchChange, onOpenCmd, onChangelog, hasNewChangelog }: HeaderProps) {
  const { t } = useLang()
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const quickTools = favorites
    .slice(0, 6)
    .map(id => tools.find(t => t.id === id))
    .filter(Boolean) as typeof tools

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-4 gap-3 shrink-0 z-10">
      <button onClick={onMenuClick} className="btn-ghost p-2">
        <Menu size={18} />
      </button>

      {/* Search triggers command palette */}
      <button
        onClick={onOpenCmd}
        className="flex-1 max-w-lg flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-400 transition-colors text-left"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span className="flex-1">{t.searchPlaceholder}</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono text-gray-400">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      {/* Quick Access — first 6 favorites */}
      {quickTools.length > 0 && (
        <div className="hidden md:flex items-center gap-0.5 border-l border-gray-200 dark:border-gray-800 pl-3">
          {quickTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => navigate(`/tool/${tool.id}`)}
              className="btn-ghost p-1.5 text-lg leading-none"
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {/* What's New / Changelog */}
        <button
          onClick={onChangelog}
          className="btn-ghost p-2 relative"
          title={t.whatsNew}
        >
          <Newspaper size={18} />
          {hasNewChangelog && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950" />
          )}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost p-2"
          title="GitHub"
        >
          <Github size={18} />
        </a>
      </div>
    </header>
  )
}
