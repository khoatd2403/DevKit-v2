import { Suspense, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { tools } from '../tools-registry'
import { X, ArrowLeft } from 'lucide-react'
import { lazyToolComponents } from '../lazyToolComponents'
import ToolErrorBoundary from '../components/ToolErrorBoundary'

function ToolPanel({ toolId, onToolChange, onClose }: {
  toolId: string
  onToolChange: (id: string) => void
  onClose: () => void
}) {
  const toolMeta = tools.find(t => t.id === toolId)
  const ToolComponent = lazyToolComponents[toolId]

  // Group tools by category for the select
  const categories = [...new Set(tools.map(t => t.category))]

  return (
    <div className="flex-1 min-w-0 flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-950">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
        <span className="text-lg shrink-0">{toolMeta?.icon}</span>
        <select
          value={toolId}
          onChange={e => onToolChange(e.target.value)}
          className="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none cursor-pointer"
        >
          {categories.map(cat => (
            <optgroup key={cat} label={cat}>
              {tools.filter(t => t.category === cat).map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={onClose}
          className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tool content */}
      <div className="flex-1 overflow-y-auto p-4">
        {ToolComponent ? (
          <ToolErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
              </div>
            }>
              <ToolComponent />
            </Suspense>
          </ToolErrorBoundary>
        ) : (
          <div className="text-center py-8 text-gray-400">Tool not found</div>
        )}
      </div>
    </div>
  )
}

export default function SplitPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const aId = searchParams.get('a') || 'json-formatter'
  const bId = searchParams.get('b') || 'base64-encode-decode'

  const [toolA, setToolA] = useState(aId)
  const [toolB, setToolB] = useState(bId)

  const updateA = (id: string) => {
    setToolA(id)
    setSearchParams({ a: id, b: toolB })
  }
  const updateB = (id: string) => {
    setToolB(id)
    setSearchParams({ a: toolA, b: id })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <span className="text-sm text-gray-400 dark:text-gray-600">Split View</span>
        <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto">Use dropdowns to switch tools in each panel</span>
      </div>

      {/* Split panels */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">
        <ToolPanel
          toolId={toolA}
          onToolChange={updateA}
          onClose={() => {
            const tool = tools.find(t => t.id === toolA);
            navigate(tool ? `/${tool.category}-tools/${toolA}` : `/tool/${toolA}`);
          }}
        />
        <ToolPanel
          toolId={toolB}
          onToolChange={updateB}
          onClose={() => {
            const tool = tools.find(t => t.id === toolB);
            navigate(tool ? `/${tool.category}-tools/${toolB}` : `/tool/${toolB}`);
          }}
        />
      </div>
    </div>
  )
}
