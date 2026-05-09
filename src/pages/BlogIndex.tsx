import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Clock, Search, X, ChevronLeft, ChevronRight, Rss, ChevronDown, ChevronUp } from 'lucide-react'
import Footer from '../components/Footer'
import { getAllPosts, getAllTags, formatDate, readingTimeMinutes, tagSlug } from '../lib/blog'
import { SITE_URL, SITE_NAME } from '../../site.config'

const POSTS_PER_PAGE = 10

export default function BlogIndex() {
  const allPosts = getAllPosts()
  const allTags = getAllTags()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const TAGS_VISIBLE = 10

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return allPosts
    const q = query.toLowerCase()
    return allPosts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.keywords.some(k => k.toLowerCase().includes(q))
    )
  }, [query, allPosts])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * POSTS_PER_PAGE
  const visiblePosts = filteredPosts.slice(start, start + POSTS_PER_PAGE)

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    if (p === 1) next.delete('page')
    else next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0 })
  }

  const url = `${SITE_URL}/blog/`
  const title = `Blog | ${SITE_NAME}`
  const description = 'Tutorials, guides, and deep dives on JSON, SQL, JWT, encoding, security, and the developer tools we build.'

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <link rel="alternate" type="application/rss+xml" title="DevTools Online Blog RSS" href="/feed.xml" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Blog
              </h1>
              <a
                href="/feed.xml"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                title="RSS feed"
              >
                <Rss size={14} />
                RSS
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </header>

          <div className="mb-6 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts by title, tag, or keyword..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {allTags.length > 0 && (() => {
            const sortedTags = allTags
              .map(tag => ({ tag, count: allPosts.filter(p => p.tags.includes(tag)).length }))
              .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
            const visibleTags = tagsExpanded ? sortedTags : sortedTags.slice(0, TAGS_VISIBLE)
            const hasMore = sortedTags.length > TAGS_VISIBLE

            return (
              <div className="flex flex-wrap gap-1.5 mb-8">
                {visibleTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    to={`/blog/tag/${tagSlug(tag)}/`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {tag}
                    <span className="text-gray-400 dark:text-gray-500 font-normal">{count}</span>
                  </Link>
                ))}
                {hasMore && (
                  <button
                    onClick={() => setTagsExpanded(v => !v)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {tagsExpanded ? (
                      <>
                        Show less
                        <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Show all {sortedTags.length}
                        <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })()}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {query ? `No posts found for "${query}"` : 'No posts yet. Check back soon.'}
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-8">
                {visiblePosts.map(post => (
                  <li
                    key={post.slug}
                    className="border-b border-gray-200 dark:border-gray-800 pb-8 last:border-0"
                  >
                    <Link to={`/blog/${post.slug}/`} className="group block">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                        {post.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {post.date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.date)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {readingTimeMinutes(post.body)} min read
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
                      <span className="inline-block mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:underline">
                        Read more →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  )
}
