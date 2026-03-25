import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../site.config'
import { tools, categories } from '../tools-registry'
import { ArrowLeft, MessageSquare, Share2, Check, Star, BookMarked, X, LayoutPanelLeft, Zap } from 'lucide-react'
import ProTipBanner from '../components/ProTipBanner'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentTools } from '../hooks/useRecentTools'
import { useToolStats } from '../hooks/useToolStats'
import SnippetDrawer from '../components/SnippetDrawer'
import { useLiveMode } from '../context/LiveModeContext'
import { useLang } from '../context/LanguageContext'
import { lazyToolComponents } from '../lazyToolComponents'
import ToolErrorBoundary from '../components/ToolErrorBoundary'
import PrivacyBadge from '../components/PrivacyBadge'
import { ToolAbout } from '../components/ToolAbout'
import { encodeShareData, decodeShareData } from '../utils/shareUtils'
import { useToast } from '../context/ToastContext'

const PRO_TIPS: Record<string, { tip: string; tipId: string }> = {
  'json-formatter': { tipId: 'json-ctrl-enter', tip: 'Press Ctrl+Enter to format instantly without clicking the button.' },
  'base64-encode-decode': { tipId: 'base64-file', tip: 'Drag & drop any file onto the input to encode it as Base64.' },
  'regex-tester': { tipId: 'regex-flags', tip: 'Use the g flag to find all matches, and i for case-insensitive matching.' },
  'text-diff': { tipId: 'diff-side', tip: 'Switch to Side-by-Side view for easier comparison of long texts.' },
  'hash-generator': { tipId: 'hash-file', tip: 'Drop any file onto the input to compute its hash — great for verifying file integrity.' },
  'jwt-decoder': { tipId: 'jwt-exp', tip: 'DevTools Online automatically highlights expired JWTs and shows the expiry time in human-readable format.' },
  'color-converter': { tipId: 'color-picker', tip: 'Click the color swatch to open the native color picker for precise color selection.' },
  'sql-formatter': { tipId: 'sql-enter', tip: 'Press Ctrl+Enter to format your SQL query instantly.' },
  'url-encode-decode': { tipId: 'url-drag', tip: 'Paste a full URL with query params — DevTools Online will encode/decode each component correctly.' },
  'csv-viewer': { tipId: 'csv-sort', tip: 'Click any column header to sort. Click again to reverse the order.' },
  'qr-generator': { tipId: 'qr-types', tip: 'Switch between URL, WiFi, Email, Phone, SMS, and vCard modes for different QR code types.' },
  'aes-encrypt': { tipId: 'aes-gcm', tip: 'Use GCM mode for authenticated encryption — it detects tampering automatically.' },
  'data-faker': { tipId: 'faker-schema', tip: 'Build a schema with multiple field types and generate up to 1000 rows of realistic test data.' },
}

export default function ToolPage({ onFeedback }: { onFeedback: (name?: string) => void }) {
  const { toolId } = useParams<{ toolId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const toolMeta = useMemo(() => tools.find(t => t.id === toolId), [toolId])
  const ToolComponent = useMemo(() => toolId ? lazyToolComponents[toolId] : undefined, [toolId])

  const { lang } = useLang()
  const isVi = lang === 'vi'
  const { toggle, isFavorite } = useFavorites()
  const fav = useMemo(() => toolMeta ? isFavorite(toolMeta.id) : false, [toolMeta, isFavorite])
  const { addRecent } = useRecentTools()
  const { markExplored } = useToolStats()
  const [snippetOpen, setSnippetOpen] = useState(false)
  const { liveMode, setLiveMode } = useLiveMode()

  // Track the current toolId to avoid double tracking or loops
  const lastTracked = useRef<string>('')
  useEffect(() => {
    if (toolId && toolId !== lastTracked.current) {
      addRecent(toolId)
      markExplored(toolId)
      lastTracked.current = toolId
    }
  }, [toolId, addRecent, markExplored])

  // Process shared state from URL
  useEffect(() => {
    if (!toolId) return
    const s = searchParams.get('s')
    if (s) {
      const decoded = decodeShareData(s)
      if (decoded) {
        const timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('devkit:load-state', { detail: { state: decoded } }))
        }, 400)
        return () => clearTimeout(timer)
      }
    }
  }, [toolId, searchParams])

  // Related Tools calculation
  const relatedTools = useMemo(() => {
    if (!toolMeta) return []
    return tools
      .filter(t => t.id !== toolMeta.id && (
        t.category === toolMeta.category ||
        t.tags.some(tag => toolMeta.tags.includes(tag))
      ))
      .slice(0, 6)
  }, [toolMeta])

  const categoryName = useMemo(() => {
    if (!toolMeta) return ''
    return categories.find(c => c.id === toolMeta.category)?.name || toolMeta.category
  }, [toolMeta])

  const handleShare = useCallback(() => {
    let responded = false
    const timeout = setTimeout(() => {
      if (!responded) {
        const url = window.location.href.split('?')[0].split('#')[0] + '#' + window.location.hash
        navigator.clipboard.writeText(url)
        showToast(isVi ? 'Đã sao chép liên kết (không kèm dữ liệu)' : 'Link copied to clipboard (no state data)', 'info')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }, 100)

    const stateHandler = (e: any) => {
      responded = true
      clearTimeout(timeout)
      window.removeEventListener('devkit:state-provided', stateHandler)
      const data = e.detail?.state
      const url = new URL(window.location.href.split('#')[0] + window.location.hash)
      if (data) {
        const encoded = encodeShareData(data)
        url.searchParams.set('s', encoded)
      }
      navigator.clipboard.writeText(url.toString())
      showToast(isVi ? 'Đã sao chép liên kết kèm dữ liệu' : 'Share link copied to clipboard', 'success')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    window.addEventListener('devkit:state-provided', stateHandler)
    window.dispatchEvent(new CustomEvent('devkit:request-state'))
  }, [isVi, showToast])

  const handleSnippetLoad = useCallback((content: string) => {
    window.dispatchEvent(new CustomEvent('devkit:load-state', { detail: { state: content } }))
    setSnippetOpen(false)
    showToast(isVi ? 'Đã tải mẫu code' : 'Snippet loaded', 'success')
  }, [isVi, showToast])

  // Manual Schema Injection for React 19 reliability
  useEffect(() => {
    if (!toolMeta) return

    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": toolMeta.name,
      "url": `${SITE_URL}/tool/${toolMeta.id}`,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "description": toolMeta.seoDescription || toolMeta.description,
      "isAccessibleForFree": true,
      "inLanguage": "en",
      "author": {
        "@type": "Organization",
        "name": "DevTools Online",
        "url": SITE_URL
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": categoryName,
          "item": `${SITE_URL}/${toolMeta.category}-tools`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": toolMeta.name,
          "item": `${SITE_URL}/tool/${toolMeta.id}`
        }
      ]
    }

    const s1 = document.createElement('script')
    s1.type = 'application/ld+json'
    s1.id = `schema-app-${toolMeta.id}`
    s1.innerHTML = JSON.stringify(softwareSchema)
    document.head.appendChild(s1)

    const s2 = document.createElement('script')
    s2.type = 'application/ld+json'
    s2.id = `schema-bread-${toolMeta.id}`
    s2.innerHTML = JSON.stringify(breadcrumbSchema)
    document.head.appendChild(s2)

    return () => {
      document.getElementById(`schema-app-${toolMeta.id}`)?.remove()
      document.getElementById(`schema-bread-${toolMeta.id}`)?.remove()
    }
  }, [toolMeta, categoryName])

  if (!toolMeta || !ToolComponent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <X size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tool Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-sm">The tool you are looking for might have been moved or renamed.</p>
        <Link to="/" className="btn-primary px-8">Return Home</Link>
      </div>
    )
  }

  return (
    <>
      {/* React 19 Native Metadata Hoisting */}
      <title>{toolMeta.seoTitle || `${toolMeta.name} | DevTools Online`}</title>
      <meta name="description" content={toolMeta.seoDescription || toolMeta.description} />
      <meta name="keywords" content={toolMeta.tags.join(', ')} />
      <link rel="canonical" href={`${SITE_URL}/tool/${toolMeta.id}`} />

      {/* OpenGraph */}
      <meta property="og:title" content={toolMeta.seoTitle || `${toolMeta.name} | DevTools Online`} />
      <meta property="og:description" content={toolMeta.seoDescription || toolMeta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/tool/${toolMeta.id}`} />
      <meta property="og:image" content={`${SITE_URL}/og/${toolMeta.id}.png`} />
      <meta property="og:site_name" content="DevTools Online" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={toolMeta.seoTitle || `${toolMeta.name} | DevTools Online`} />
      <meta name="twitter:description" content={toolMeta.seoDescription || toolMeta.description} />
      <meta name="twitter:image" content={`${SITE_URL}/og/${toolMeta.id}.png`} />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950">

        {/* Sticky Sub-Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0 outline-none">
                <ArrowLeft size={18} className="text-gray-500 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <span className="text-xl sm:text-2xl shrink-0 leading-none">{toolMeta.icon}</span>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate flex-1 min-w-0 leading-tight">{toolMeta.name}</h1>
                <PrivacyBadge />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setLiveMode(!liveMode)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${liveMode ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                title={isVi ? 'Chế độ Trực tiếp' : 'Live Mode'}
              >
                <Zap size={18} className={liveMode ? 'fill-current' : ''} />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">{isVi ? 'Trực tiếp' : 'Live'}</span>
              </button>

              <button onClick={() => setSnippetOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 relative" title={isVi ? 'Mẫu code' : 'Snippets'}>
                <BookMarked size={20} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              </button>

              <button onClick={() => toggle(toolMeta.id)} className={`p-2 rounded-lg transition-colors ${fav ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Star size={20} fill={fav ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={handleShare}
                className={`p-2 rounded-lg flex items-center gap-2 transition-all ${copied ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20'}`}
              >
                {copied ? <Check size={18} /> : (
                  <>
                    <Share2 size={18} />
                    {toolMeta.supportsShare && (
                      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">{isVi ? 'Chia sẻ' : 'Share with Data'}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 tool-content min-h-[400px]">
                  <Suspense fallback={<ToolLoader />}>
                    <ToolErrorBoundary>
                      <ToolComponent />
                    </ToolErrorBoundary>
                  </Suspense>
                </div>

                <ToolAbout
                  toolId={toolMeta.id}
                  toolName={toolMeta.name}
                  onSupport={() => onFeedback(toolMeta.name)}
                />
              </div>

              <div className="space-y-6">
                {PRO_TIPS[toolMeta.id] && (
                  <ProTipBanner toolId={toolMeta.id} tipId={PRO_TIPS[toolMeta.id].tipId} tip={PRO_TIPS[toolMeta.id].tip} />
                )}

                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LayoutPanelLeft size={16} />
                    {isVi ? 'Liên quan' : 'Related'}
                  </h3>
                  <div className="space-y-1.5">
                    {relatedTools.map(tool => (
                      <Link key={tool.id} to={`/tool/${tool.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <span className="text-xl">{tool.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white">
                  <MessageSquare className="mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-1">Need a feature?</h3>
                  <p className="text-xs text-primary-200 mb-6 leading-relaxed">We love building custom tools for our users. Drop us a request!</p>
                  <button onClick={() => onFeedback(toolMeta.name)} className="w-full py-2.5 bg-white text-primary-700 rounded-xl text-xs font-bold hover:bg-primary-50 transition-colors">
                    Request it now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SnippetDrawer
          open={snippetOpen}
          onClose={() => setSnippetOpen(false)}
          toolId={toolId}
          onLoad={handleSnippetLoad}
        />
      </div>
    </>
  )
}

function ToolLoader() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full"></div>
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full"></div>
    </div>
  )
}
