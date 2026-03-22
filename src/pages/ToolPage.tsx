import { Suspense, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../site.config'
import { tools } from '../tools-registry'
import { ArrowLeft, MessageSquare, Share2, Check, Star, BookMarked, X, LayoutPanelLeft } from 'lucide-react'
import ProTipBanner from '../components/ProTipBanner'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentTools } from '../hooks/useRecentTools'
import { useToolStats } from '../hooks/useToolStats'
import { useSnippets } from '../hooks/useSnippets'
import SnippetDrawer from '../components/SnippetDrawer'
import { useLiveMode } from '../context/LiveModeContext'
import { lazyToolComponents } from '../lazyToolComponents'
import ToolErrorBoundary from '../components/ToolErrorBoundary'

interface ToolPageProps {
  onFeedback: (toolName?: string) => void
}

const PRO_TIPS: Record<string, { tip: string; tipId: string }> = {
  'json-formatter': { tipId: 'json-ctrl-enter', tip: 'Press Ctrl+Enter to format instantly without clicking the button.' },
  'base64-encode-decode': { tipId: 'base64-file', tip: 'Drag & drop any file onto the input to encode it as Base64.' },
  'regex-tester': { tipId: 'regex-flags', tip: 'Use the g flag to find all matches, and i for case-insensitive matching.' },
  'text-diff': { tipId: 'diff-side', tip: 'Switch to Side-by-Side view for easier comparison of long texts.' },
  'hash-generator': { tipId: 'hash-file', tip: 'Drop any file onto the input to compute its hash — great for verifying file integrity.' },
  'jwt-decoder': { tipId: 'jwt-exp', tip: 'DevKit automatically highlights expired JWTs and shows the expiry time in human-readable format.' },
  'color-converter': { tipId: 'color-picker', tip: 'Click the color swatch to open the native color picker for precise color selection.' },
  'sql-formatter': { tipId: 'sql-enter', tip: 'Press Ctrl+Enter to format your SQL query instantly.' },
  'url-encode-decode': { tipId: 'url-drag', tip: 'Paste a full URL with query params — DevKit will encode/decode each component correctly.' },
  'csv-viewer': { tipId: 'csv-sort', tip: 'Click any column header to sort. Click again to reverse the order.' },
  'qr-generator': { tipId: 'qr-types', tip: 'Switch between URL, WiFi, Email, Phone, SMS, and vCard modes for different QR code types.' },
  'aes-encrypt': { tipId: 'aes-gcm', tip: 'Use GCM mode for authenticated encryption — it detects tampering automatically.' },
  'data-faker': { tipId: 'faker-schema', tip: 'Build a schema with multiple field types and generate up to 1000 rows of realistic test data.' },
}

export default function ToolPage({ onFeedback }: ToolPageProps) {
  const { toolId } = useParams<{ toolId: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const toolMeta = tools.find(t => t.id === toolId)
  const ToolComponent = toolId ? lazyToolComponents[toolId] : undefined
  const { toggle, isFavorite } = useFavorites()
  const fav = toolMeta ? isFavorite(toolMeta.id) : false
  const { addRecent } = useRecentTools()
  const { markExplored } = useToolStats()
  const [snippetOpen, setSnippetOpen] = useState(false)
  const { snippets } = useSnippets(toolId)
  const { liveMode, setLiveMode } = useLiveMode()

  useEffect(() => {
    if (toolId) {
      addRecent(toolId)
      markExplored(toolId)
    }
  }, [toolId])

  useEffect(() => {
    return () => { document.title = 'DevKit — Free Online Developer Tools' }
  }, [])

  useEffect(() => {
    const handler = () => {
      const btn = document.querySelector<HTMLButtonElement>('.tool-content .btn-primary')
      btn?.click()
    }
    window.addEventListener('devkit:run', handler)
    return () => window.removeEventListener('devkit:run', handler)
  }, [])

  const relatedTools = toolMeta ? tools
    .filter(t => t.id !== toolMeta.id && (
      t.category === toolMeta.category ||
      t.tags.some(tag => toolMeta.tags.includes(tag))
    ))
    .slice(0, 4) : []

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!toolMeta || !ToolComponent) {
    return (
      <div className="p-8 text-center">
        <p className="text-4xl mb-4">🔧</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tool not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
      </div>
    )
  }

  const BASE_URL = SITE_URL
  const pageUrl = `${BASE_URL}/tool/${toolId}`
  const pageTitle = `${toolMeta.name} — DevKit`
  const pageDesc = `${toolMeta.description}. Free online tool, no sign-up required.`
  const ogImage = `${BASE_URL}/og/${toolId}.png`

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Tool header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{toolMeta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{toolMeta.name}</h1>
            {toolMeta.new && (
              <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">New</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{toolMeta.description}</p>
        </div>
        <button
          onClick={() => setLiveMode(!liveMode)}
          className={`btn-ghost flex items-center gap-1 text-xs shrink-0 ${liveMode ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
          title={liveMode ? 'Live mode on (Alt+L)' : 'Live mode off (Alt+L)'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
          Live
        </button>
        <button
          onClick={() => toolMeta && toggle(toolMeta.id)}
          className={`btn-ghost p-1.5 shrink-0 ${fav ? 'text-yellow-500' : ''}`}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={15} className={fav ? 'fill-yellow-500' : ''} />
        </button>
        <button
          onClick={() => setSnippetOpen(true)}
          className="btn-ghost flex items-center gap-1.5 text-xs shrink-0 relative"
          title="Snippets"
        >
          <BookMarked size={13} />
          Snippets
          {snippets.filter(s => s.toolId === toolId).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {snippets.filter(s => s.toolId === toolId).length}
            </span>
          )}
        </button>
        <button
          onClick={handleShare}
          className="btn-ghost flex items-center gap-1.5 text-xs shrink-0"
          title="Copy link to this tool"
        >
          {copied ? <Check size={13} /> : <Share2 size={13} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          onClick={() => navigate(`/split?a=${toolId}&b=${toolId === 'json-formatter' ? 'base64-encode-decode' : 'json-formatter'}`)}
          className="btn-ghost flex items-center gap-1.5 text-xs shrink-0"
          title="Open in split pane"
        >
          <LayoutPanelLeft size={13} />
          Split
        </button>
        <button
          onClick={() => onFeedback(toolMeta?.name)}
          className="btn-ghost flex items-center gap-1.5 text-xs shrink-0"
          title="Send feedback (Ctrl+Shift+F)"
        >
          <MessageSquare size={13} />
          Feedback
        </button>
      </div>

      {/* Keyboard shortcuts hint bar */}
      <div className="hidden sm:flex items-center gap-3 mb-4 text-[11px] text-gray-400 dark:text-gray-600 flex-wrap">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">↵</kbd>
          <span className="ml-0.5">Run</span>
        </span>
        <span className="text-gray-200 dark:text-gray-800">·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">Shift</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">C</kbd>
          <span className="ml-0.5">Copy output</span>
        </span>
        <span className="text-gray-200 dark:text-gray-800">·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">Alt</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">L</kbd>
          <span className="ml-0.5">Live mode</span>
        </span>
        <span className="text-gray-200 dark:text-gray-800">·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500 dark:text-gray-400">?</kbd>
          <span className="ml-0.5">All shortcuts</span>
        </span>
      </div>

      {/* Pro tip banner */}
      {toolId && PRO_TIPS[toolId] && (
        <ProTipBanner
          toolId={toolId}
          tip={PRO_TIPS[toolId].tip}
          tipId={PRO_TIPS[toolId].tipId}
        />
      )}

      {/* Tool content */}
      <div className="tool-content">
        <ToolErrorBoundary toolName={toolMeta.name}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
          }>
            <ToolComponent />
          </Suspense>
        </ToolErrorBoundary>
      </div>

      {relatedTools.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {relatedTools.map(tool => (
              <div
                key={tool.id}
                onClick={() => navigate(`/tool/${tool.id}`)}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 cursor-pointer transition-colors bg-white dark:bg-gray-900 hover:bg-primary-50 dark:hover:bg-primary-950/30"
              >
                <span className="text-lg shrink-0">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SnippetDrawer
        open={snippetOpen}
        onClose={() => setSnippetOpen(false)}
        toolId={toolId}
        onLoad={(content) => {
          window.dispatchEvent(new CustomEvent('devkit:load-snippet', { detail: { content } }))
          setSnippetOpen(false)
        }}
      />
    </div>
  )
}
