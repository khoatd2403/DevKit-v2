import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { tools, categories } from '../tools-registry'
import type { Tool } from '../types'
import { Star, Zap, Clock, X } from 'lucide-react'
import Footer from '../components/Footer'
import { useRecentTools } from '../hooks/useRecentTools'
import { useFavorites } from '../hooks/useFavorites'
import { useToolStats } from '../hooks/useToolStats'
import { useLang } from '../context/LanguageContext'
import { categoryAboutTranslations } from '../i18n/categoryContent'
import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../site.config'

interface HomeProps {
  searchQuery: string
}

export default function Home({ searchQuery: _searchQuery }: HomeProps) {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { slug } = useParams<{ slug: string }>()
  
  const catFromSlug = useMemo(() => {
    if (slug?.endsWith('-tools')) {
      const catId = slug.replace('-tools', '')
      // Verify if it's a valid category
      if (categories.some(c => c.id === catId)) return catId
    }
    return null
  }, [slug])

  const { recent } = useRecentTools()
  const recentTools = recent.map(id => tools.find(t => t.id === id)).filter(Boolean) as Tool[]
  const { favorites, toggle } = useFavorites()
  const { explored } = useToolStats()
  const [settingsOpen, setSettingsOpen] = useState(false)


  const [favEditMode, setFavEditMode] = useState(false)
  const [activeCategory, setActiveCategory] = useState(() => (catFromSlug || searchParams.get('cat')) ?? 'all')

  useEffect(() => {
    const cat = catFromSlug || searchParams.get('cat') || 'all'
    setActiveCategory(cat)
  }, [searchParams, catFromSlug])

  // JSON-LD for category pages
  useEffect(() => {
    if (activeCategory === 'all') return;

    const cat = categories.find(c => c.id === activeCategory);
    const catName = t.categories[activeCategory as keyof typeof t.categories] || cat?.name || activeCategory;
    const catContent = categoryAboutTranslations[lang || 'en']?.[activeCategory] || categoryAboutTranslations['en']?.[activeCategory];
    const seoDesc = catContent?.seoDescription || (lang === 'vi' ? `Tổng hợp các công cụ ${catName} trực tuyến mạnh mẽ, bảo mật và hoàn toàn chạy trên trình duyệt.` : `A comprehensive collection of powerful, secure, and client-side ${catName} tools.`);

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": catName,
      "url": `${SITE_URL}/${activeCategory}-tools`,
      "description": seoDesc,
      "isPartOf": {
        "@type": "WebSite",
        "name": "DevTools Online",
        "url": SITE_URL
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": catName,
          "item": `${SITE_URL}/${activeCategory}-tools`
        }
      ]
    };

    const s1 = document.createElement('script');
    s1.type = 'application/ld+json';
    s1.id = `schema-cat-collection-${activeCategory}`;
    s1.innerHTML = JSON.stringify(collectionSchema);
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.type = 'application/ld+json';
    s2.id = `schema-cat-bread-${activeCategory}`;
    s2.innerHTML = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(s2);

    return () => {
      document.getElementById(`schema-cat-collection-${activeCategory}`)?.remove();
      document.getElementById(`schema-cat-bread-${activeCategory}`)?.remove();
    };
  }, [activeCategory, lang, t, categories]);

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
    <div className="tool-card" onClick={() => navigate(`/${tool.category}-tools/${tool.id}`)}>
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
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">

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
            {[{ id: 'all', name: t.categories.all, icon: '🧰', color: 'gray' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(cat.id === 'all' ? '/' : `/${cat.id}-tools`)}
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

        {activeCategory === 'all' && (
          <Helmet>
            <title>{lang === 'vi' ? 'DevTools Online | Công cụ Lập trình viên Trực tuyến' : 'DevTools Online | Free Online Developer Tools'}</title>
            <meta name="description" content={lang === 'vi' ? 'Hơn 120 công cụ lập trình viên trực tuyến miễn phí, bảo mật và chạy trên trình duyệt. Định dạng JSON, SQL, mã hóa Base64, Webhook và nhiều hơn nữa.' : '120+ free, secure, and browser-based developer tools. Format JSON, beautify SQL, encode Base64, test Webhooks, and more.'} />
            <link rel="canonical" href={SITE_URL} />
            <meta property="og:title" content={lang === 'vi' ? 'DevTools Online | Công cụ Lập trình viên Trực tuyến' : 'DevTools Online | Free Online Developer Tools'} />
            <meta property="og:description" content={lang === 'vi' ? 'Bộ công cụ lập trình viên toàn diện nhất ngay trong trình duyệt của bạn.' : 'The most comprehensive developer toolbox right in your browser.'} />
            <meta property="og:url" content={SITE_URL} />
            <meta property="og:image" content={`${SITE_URL}/og-image.svg`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={lang === 'vi' ? 'DevTools Online | Công cụ Lập trình viên Trực tuyến' : 'DevTools Online | Free Online Developer Tools'} />
            <meta name="twitter:description" content={lang === 'vi' ? 'Bộ công cụ lập trình viên toàn diện nhất ngay trong trình duyệt của bạn.' : 'The most comprehensive developer toolbox right in your browser.'} />
            <meta name="twitter:image" content={`${SITE_URL}/og-image.svg`} />
          </Helmet>
        )}

        {activeCategory !== 'all' ? (
          /* ── Category view ── */
          <div className="mb-8">
            {(() => {
              const cat = categories.find(c => c.id === activeCategory)
              const catTools = tools.filter(t => t.category === activeCategory)
              return (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{cat?.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t.categories[cat?.id as keyof typeof t.categories] || cat?.name}</h3>
                    <span className="text-xs text-gray-400">({catTools.length})</span>
                  </div>

                  {(() => {
                    const { lang } = useLang();
                    const currentLang = lang || 'en';
                    const catContent = categoryAboutTranslations[currentLang]?.[activeCategory] || categoryAboutTranslations['en']?.[activeCategory];
                    const catName = t.categories[activeCategory as keyof typeof t.categories] || cat?.name || activeCategory;
                    
                    const seoTitle = catContent?.seoTitle || (currentLang === 'vi' ? `Công cụ ${catName} Trực tuyến Miễn phí | DevTools` : `Free Online ${catName} Tools | DevTools Online`);
                    const seoDesc = catContent?.seoDescription || (currentLang === 'vi' ? `Tổng hợp các công cụ ${catName} trực tuyến mạnh mẽ, bảo mật và hoàn toàn chạy trên trình duyệt. Không cần cài đặt, không lưu trữ dữ liệu người dùng.` : `A comprehensive collection of powerful, secure, and client-side ${catName} tools. No installation required, 100% private, works instantly in your browser.`);

                    const displayTools = tools.filter(t => t.category === activeCategory);
                    const firstTool = displayTools[0];

                    return (
                      <Helmet>
                        <title>{seoTitle}</title>
                        <meta name="description" content={seoDesc} />
                        <link rel="canonical" href={`${SITE_URL}/${activeCategory}-tools`} />
                        <meta property="og:title" content={seoTitle} />
                        <meta property="og:description" content={seoDesc} />
                        <meta property="og:url" content={`${SITE_URL}/${activeCategory}-tools`} />
                        <meta property="og:image" content={catContent?.seoImage || `${SITE_URL}/og/categories/${activeCategory}.png` || (firstTool ? `${SITE_URL}/og/${firstTool.id}.png` : `${SITE_URL}/og-image.svg`)} />
                        <meta name="twitter:title" content={seoTitle} />
                        <meta name="twitter:description" content={seoDesc} />
                        <meta name="twitter:image" content={catContent?.seoImage || `${SITE_URL}/og/categories/${activeCategory}.png` || (firstTool ? `${SITE_URL}/og/${firstTool.id}.png` : `${SITE_URL}/og-image.svg`)} />
                        <meta name="twitter:card" content="summary_large_image" />
                      </Helmet>
                    );
                  })()}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {catTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                  </div>

                  {/* ── Category About Section ── */}
                  {(() => {
                    const { lang } = useLang();
                    const currentLang = lang || 'en';
                    const catDesc = categoryAboutTranslations[currentLang]?.[activeCategory] || categoryAboutTranslations['en']?.[activeCategory];
                    if (!catDesc) return null;
                    
                    return (
                      <div className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800">
                        <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-900 shadow-sm">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                             <span>{cat?.icon}</span>
                             {currentLang === 'vi' ? `Về công cụ ${cat?.name}` : `About ${cat?.name} Tools`}
                          </h2>
                          <div 
                            className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed
                              prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold"
                            dangerouslySetInnerHTML={{ __html: catDesc.description }}
                          />
                        </div>
                      </div>
                    );
                  })()}
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
                onClick={() => navigate(`/${todayTool.category}-tools/${todayTool.id}`)}
                className="cursor-pointer bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/40 dark:to-purple-950/40 border border-primary-200 dark:border-primary-800 rounded-lg sm:rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
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

      {/* ── SEO Content Section ── */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.whatIsDevTools}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-3xl">
            {t.whatIsDesc(tools.length)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoJsonTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoJSON}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoSqlTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
               {t.seoSQL}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoEncodingTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoCrypto}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoWebTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoWeb}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoFormattersTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoFormatters}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoGeneratorsTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoGenerators}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoColorTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoColor}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.seoPrivacyTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.seoPrivacy}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
