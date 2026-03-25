import { useState } from 'react'
import { Share2, Facebook, Twitter, Linkedin, Globe, Code, Copy, Check, Eye, Layout, Image as ImageIcon, Type, MousePointer2 } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import { usePersistentState } from '../hooks/usePersistentState'

interface OGState {
  title: string
  description: string
  url: string
  siteName: string
  image: string
  twitterCard: 'summary' | 'summary_large_image'
}

export default function OpenGraphPreview() {
  const [form, setForm] = usePersistentState<OGState>('tool-og-preview-form', {
    title: 'Modern Web Development with Next.js & Tailwind CSS',
    description: 'Learn how to build high-performance, responsive websites using the latest web technologies. A comprehensive guide with real-world examples.',
    url: 'https://mysite.com/blog/modern-web',
    siteName: 'DevDocs Pro',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    twitterCard: 'summary_large_image',
  })

  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'facebook' | 'twitter' | 'linkedin' | 'google'>('facebook')
  const [fetchUrl, setFetchUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const setK = (k: keyof OGState, v: string) => setForm(f => ({ ...f, [k]: v }))

  const fetchMetadata = async () => {
    let targetUrl = fetchUrl.trim()
    if (!targetUrl) return
    
    // Auto-normalize URL: add https:// if missing
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl
    }
    
    setIsFetching(true)
    setFetchError('')
    
    try {
      // Use AllOrigins as a primary proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error('Proxy error')
      
      const data = await res.json()
      const html = data.contents
      if (!html) throw new Error('Empty response')
      
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Robust meta extractor: handles property/name and case-insensitivity
      const getMeta = (names: string[]) => {
        for (const n of names) {
          // Find meta by property or name attribute (CSS selectors are case-sensitive, so we find all and filter)
          const meta = Array.from(doc.querySelectorAll('meta')).find(m => {
            const attr = m.getAttribute('property') || m.getAttribute('name')
            return attr && names.some(name => attr.toLowerCase() === name.toLowerCase())
          })
          if (meta?.getAttribute('content')) return meta.getAttribute('content')
        }
        return ''
      }

      const title = getMeta(['og:title', 'twitter:title', 'title']) || doc.title || ''
      const description = getMeta(['og:description', 'twitter:description', 'description']) || ''
      const image = getMeta(['og:image', 'twitter:image', 'image']) || ''
      const siteName = getMeta(['og:site_name', 'site_name']) || ''
      
      setForm({
        title: title || form.title,
        description: description || form.description,
        url: targetUrl,
        siteName: siteName || form.siteName,
        image: image || form.image,
        twitterCard: (getMeta(['twitter:card']) as any) || form.twitterCard,
      })
      
      setFetchUrl('')
    } catch (err) {
      setFetchError('Could not fetch metadata automatically. This website might be blocking scrapers.')
    } finally {
      setIsFetching(false)
    }
  }

  const metaHtml = [
    '<!-- Primary Meta Tags -->',
    `<title>${form.title}</title>`,
    `<meta name="title" content="${form.title}">`,
    `<meta name="description" content="${form.description}">`,
    '',
    '<!-- Open Graph / Facebook -->',
    '<meta property="og:type" content="website">',
    `<meta property="og:url" content="${form.url}">`,
    `<meta property="og:title" content="${form.title}">`,
    `<meta property="og:description" content="${form.description}">`,
    `<meta property="og:image" content="${form.image}">`,
    form.siteName && `<meta property="og:site_name" content="${form.siteName}">`,
    '',
    '<!-- Twitter -->',
    `<meta name="twitter:card" content="${form.twitterCard}">`,
    `<meta name="twitter:url" content="${form.url}">`,
    `<meta name="twitter:title" content="${form.title}">`,
    `<meta name="twitter:description" content="${form.description}">`,
    `<meta name="twitter:image" content="${form.image}">`,
  ].filter(Boolean).join('\n')

  const hostname = form.url ? new URL(form.url).hostname : 'example.com'

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <Share2 size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Open Graph Previewer & Generator</h2>
          <p className="text-xs text-gray-500">Preview and generate social media meta tags for better reach</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Eye size={14} /> Quick Action
            </h3>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                className="tool-textarea h-auto py-2.5 text-sm flex-1" 
                placeholder="https://mysite.com/blog-post"
                value={fetchUrl}
                onChange={e => setFetchUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchMetadata()}
              />
              <button 
                onClick={fetchMetadata}
                disabled={isFetching || !fetchUrl}
                className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap min-w-[100px]"
              >
                {isFetching ? 'Fetching...' : 'Fetch Meta'}
              </button>
            </div>
            
            {fetchError && (
              <p className="text-[11px] text-red-500 font-medium px-1 leading-tight">{fetchError}</p>
            )}

            <div className="pt-2 border-t border-gray-50 dark:border-gray-800/50" />

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Type size={14} /> Content Metadata
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="tool-label block mb-1.5 flex items-center gap-2">
                   Page Title <span className="text-[10px] opacity-60">(Recommended: 60 chars)</span>
                </label>
                <input 
                  type="text" 
                  className="tool-textarea h-auto py-2.5 text-sm" 
                  value={form.title} 
                  onChange={e => setK('title', e.target.value)} 
                />
              </div>

              <div>
                <label className="tool-label block mb-1.5 flex items-center gap-2">
                  Description <span className="text-[10px] opacity-60">(Recommended: 155 chars)</span>
                </label>
                <textarea 
                  className="tool-textarea h-24 text-sm" 
                  value={form.description} 
                  onChange={e => setK('description', e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="tool-label block mb-1.5">Canonical URL</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      className="tool-textarea h-auto py-2.5 pl-9 text-sm" 
                      value={form.url} 
                      onChange={e => setK('url', e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="tool-label block mb-1.5">Site Name</label>
                  <input 
                    type="text" 
                    className="tool-textarea h-auto py-2.5 text-sm" 
                    value={form.siteName} 
                    onChange={e => setK('siteName', e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="tool-label block mb-1.5">Cover Image URL</label>
                <div className="relative">
                  <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="tool-textarea h-auto py-2.5 pl-9 text-sm font-mono" 
                    value={form.image} 
                    onChange={e => setK('image', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} /> Meta Tags
              </h3>
              <CopyButton text={metaHtml} />
            </div>
            <textarea 
              readOnly 
              className="tool-textarea-output h-48 text-[11px] font-mono leading-relaxed" 
              value={metaHtml} 
            />
          </div>
        </div>

        {/* Preview Side */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-wrap gap-2">
              {[
                { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
                { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: '#000000' },
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
                { id: 'google', label: 'Google', icon: Globe, color: '#EA4335' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={14} style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-100/50 dark:bg-gray-950/50 min-h-[400px]">
              
              {/* Facebook Preview */}
              {activeTab === 'facebook' && (
                <div className="bg-white dark:bg-[#242526] w-full max-w-[500px] border border-gray-200 dark:border-gray-800 animate-slide-up rounded-sm shadow-xl">
                  {/* Header */}
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                      <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="px-3 pb-3 text-sm dark:text-gray-200">Checking out this awesome new tool! 🚀</div>
                  {/* OG Card */}
                  <div className="border-y border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer group">
                    <div className="relative aspect-[1200/630] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] p-3">
                      <div className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-0.5">{hostname}</div>
                      <div className="text-[16px] font-bold text-gray-900 dark:text-white leading-5 line-clamp-2 mb-1">{form.title}</div>
                      <div className="text-[14px] text-gray-600 dark:text-gray-400 line-clamp-1 leading-4">{form.description}</div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="p-1 px-3 flex justify-between border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-4 py-2">
                      <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
              )}

              {/* Twitter Preview */}
              {activeTab === 'twitter' && (
                <div className="bg-white dark:bg-black w-full max-w-[500px] border border-gray-100 dark:border-gray-800 p-4 animate-slide-up rounded-2xl shadow-xl">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="text-sm dark:text-white mb-2">Build tools like a pro. #DevTools #WebPerf</div>
                      {/* Twitter Card */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group cursor-pointer">
                        <div className="relative aspect-[1200/630] bg-gray-100 dark:bg-gray-900 overflow-hidden border-b border-gray-200 dark:border-gray-800">
                          <img src={form.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="p-3">
                          <div className="text-[13px] text-gray-500 mb-0.5">{hostname}</div>
                          <div className="text-[14px] font-bold text-gray-900 dark:text-white mb-0.5 leading-tight line-clamp-1">{form.title}</div>
                          <div className="text-[14px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">{form.description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Preview */}
              {activeTab === 'linkedin' && (
                <div className="bg-white dark:bg-[#1d2226] w-full max-w-[500px] border border-gray-200 dark:border-gray-800 animate-slide-up shadow-xl rounded font-sans">
                  <div className="p-3 py-4 flex items-center gap-2">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                    <div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
                      <div className="h-2 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="px-3 pb-3 text-[14px] dark:text-white line-clamp-3 leading-tight">I just found this incredible tool for OpenGraph previews! It's going to save so much time.</div>
                  <div className="bg-[#eef3f8] dark:bg-[#38434f] overflow-hidden group cursor-pointer border-t border-gray-200 dark:border-gray-800">
                    <div className="aspect-[1.91] relative overflow-hidden">
                       <img src={form.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-3 py-2.5">
                      <div className="text-[14px] font-bold text-gray-900 dark:text-white min-h-[36px] line-clamp-2 leading-tight">{form.title}</div>
                      <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 uppercase">{hostname}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Preview */}
              {activeTab === 'google' && (
                <div className="bg-white dark:bg-[#202124] w-full max-w-[600px] p-6 rounded-lg animate-slide-up shadow-xl shadow-black/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Globe size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-[14px] text-gray-900 dark:text-[#dadce0] font-medium leading-tight">{form.siteName || hostname}</div>
                      <div className="text-[12px] text-gray-500 dark:text-[#bdc1c6] items-center gap-1 flex">
                        {form.url} <span className="text-[8px]">▼</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-0.5">{form.title}</div>
                  <div className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-snug">
                    <span className="text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-1 rounded text-[11px] font-bold mr-1">Translate</span>
                    {form.description}
                  </div>
                </div>
              )}

              <p className="mt-8 text-[11px] text-gray-400 font-medium tracking-wide items-center gap-1.5 flex uppercase">
                <Eye size={12} /> Interactive Preview Mockup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
