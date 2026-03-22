import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { tools, categories } from '../tools-registry'
import type { Tool } from '../types'
import { Star, Zap, Clock, X } from 'lucide-react'
import Footer from '../components/Footer'
import { useRecentTools } from '../hooks/useRecentTools'
import { useFavorites } from '../hooks/useFavorites'
import { useToolStats } from '../hooks/useToolStats'
import { useLang } from '../context/LanguageContext'

interface HomeProps {
  searchQuery: string
}

export default function Home({ searchQuery: _searchQuery }: HomeProps) {
  const { t } = useLang()
  const navigate = useNavigate()
  const { recent } = useRecentTools()
  const recentTools = recent.map(id => tools.find(t => t.id === id)).filter(Boolean) as Tool[]
  const { favorites, toggle } = useFavorites()
  const { explored } = useToolStats()
  const [favEditMode, setFavEditMode] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const todayTool = useMemo(() => {
    const seed = new Date().toDateString()
    const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return tools[hash % tools.length]
  }, [])

  const unexploredTools = useMemo(() => {
    if (explored.length === 0) return []
    const seed = new Date().toDateString()
    const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const unexplored = tools.filter(t => !explored.includes(t.id))
    // Pseudo-shuffle with day seed
    const shuffled = [...unexplored].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) * hash) % 997
      const hb = (b.id.charCodeAt(0) * hash) % 997
      return ha - hb
    })
    return shuffled.slice(0, 8)
  }, [explored])

  const favoriteTools = favorites.map(id => tools.find(t => t.id === id)).filter(Boolean) as Tool[]

  const popularTools = tools.filter(t => t.popular)
  const newTools = tools.filter(t => t.new)

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <div className="tool-card" onClick={() => navigate(`/tool/${tool.id}`)}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tool.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {tool.name}
            </h3>
            {tool.new && (
              <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                {t.new}
              </span>
            )}
            {tool.popular && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                {t.popular}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {tool.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="p-6 max-w-6xl mx-auto">

        {/* ── Hero ── */}
        <div className="mb-6 text-center py-5">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-800 mb-3">
            <Zap size={12} /> {t.toolsAvailableBadge(tools.length)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
            {t.heroDesc}
          </p>
        </div>

        {/* ── Category filter tabs ── */}
        <div className="flex gap-1.5 flex-wrap mb-6 -mt-2">
            {[{ id: 'all', name: 'All', icon: '🧰', color: 'gray' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
        </div>

        {activeCategory !== 'all' ? (
          /* ── Category view ── */
          <div className="mb-8">
            {(() => {
              const cat = categories.find(c => c.id === activeCategory)
              const catTools = tools.filter(t => t.category === activeCategory)
              return (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{cat?.icon}</span>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{cat?.name}</h2>
                    <span className="text-xs text-gray-400">({catTools.length})</span>
                    <button
                      onClick={() => navigate('/tools?cat=' + activeCategory)}
                      className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {catTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                  </div>
                </>
              )
            })()}
          </div>
        ) : (
          <>
            {/* ── Usage Stats ── */}
            {explored.length > 0 && (
              <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.toolsExplored}
                  </span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {explored.length} / {tools.length}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (explored.length / tools.length) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {t.complete(Math.round((explored.length / tools.length) * 100))}
                  {explored.length === tools.length && ' ' + t.triedAll}
                </p>
              </div>
            )}

            {/* ── Tool of the Day ── */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span>✨</span>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{t.toolOfDay}</h2>
                <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <div
                onClick={() => navigate(`/tool/${todayTool.id}`)}
                className="cursor-pointer bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/40 dark:to-purple-950/40 border border-primary-200 dark:border-primary-800 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl">{todayTool.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{todayTool.name}</h3>
                    {todayTool.new && <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">{t.new}</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{todayTool.description}</p>
                </div>
                <span className="text-primary-600 dark:text-primary-400 text-sm font-medium shrink-0">{t.tryIt}</span>
              </div>
            </section>

            {/* ── Favorites ── */}
            {favoriteTools.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t.favorites}</h2>
                  <button
                    onClick={() => setFavEditMode(prev => !prev)}
                    className="ml-auto btn-ghost text-xs px-2 py-1"
                  >
                    {favEditMode ? t.done : t.edit}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {favoriteTools.map(tool => (
                    <div key={tool.id} className="relative">
                      <ToolCard tool={tool} />
                      {favEditMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(tool.id) }}
                          className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                          title="Remove from favorites"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Recently Used ── */}
            {recentTools.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t.recentlyUsed}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {recentTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </section>
            )}

            {/* ── Popular Tools ── */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-orange-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">{t.popularTools}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {popularTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            </section>

            {/* ── New Tools ── */}
            {newTools.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-green-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t.newTools}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {newTools.slice(0, 8).map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </section>
            )}

            {/* ── Browse All ── */}
            <div className="mb-8 text-center">
              <button
                onClick={() => navigate('/tools')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
              >
                {t.browseAll(tools.length)}
              </button>
            </div>

            {/* ── Chưa Khám Phá (Unexplored) ── */}
            {explored.length > 0 && unexploredTools.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span>🧭</span>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t.unexplored}</h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{t.unexploredRemaining(tools.length - explored.length)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {unexploredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </section>
            )}
          </>
        )}

      </div>

      <Footer />
    </div>
  )
}
