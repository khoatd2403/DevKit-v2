import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tools, categories } from '../tools-registry'
import type { Tool } from '../types'
import { ArrowLeft, SortAsc } from 'lucide-react'

type SortOption = 'default' | 'az' | 'za' | 'popular' | 'new'

export default function AllTools() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get('cat') || 'all'
  const [sort, setSort] = useState<SortOption>('default')

  const displayTools = useMemo(() => {
    let list = activeCat === 'all' ? [...tools] : tools.filter(t => t.category === activeCat)

    switch (sort) {
      case 'az': list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za': list.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'popular': list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)); break
      case 'new': list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)); break
    }

    return list
  }, [activeCat, sort])

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <div
      className="tool-card"
      onClick={() => navigate(`/tool/${tool.id}`)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tool.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {tool.name}
            </h3>
            {tool.new && (
              <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                New
              </span>
            )}
            {tool.popular && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {tool.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Home
        </button>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Tools</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {displayTools.length} of {tools.length} tools
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <SortAsc size={15} />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="default">Default</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="popular">Popular first</option>
                <option value="new">New first</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {categories.map(cat => {
          const count = cat.id === 'all' ? tools.length : tools.filter(t => t.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              onClick={() => setSearchParams(cat.id === 'all' ? {} : { cat: cat.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCat === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCat === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tools grid */}
      {displayTools.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No tools found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      )}
    </div>
  )
}
