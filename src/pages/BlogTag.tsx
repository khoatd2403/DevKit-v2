import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, ArrowLeft, Tag as TagIcon } from 'lucide-react'
import Footer from '../components/Footer'
import { getPostsByTag, getAllTags, formatDate, readingTimeMinutes, tagSlug } from '../lib/blog'
import { SITE_URL, SITE_NAME } from '../../site.config'

export default function BlogTag() {
  const { tag: tagParam } = useParams<{ tag: string }>()
  const allTags = getAllTags()
  const matchingTag = allTags.find(t => tagSlug(t) === tagParam)
  const posts = tagParam ? getPostsByTag(tagParam) : []

  const tagName = matchingTag || tagParam || ''
  const url = `${SITE_URL}/blog/tag/${tagParam}/`
  const title = `Posts tagged "${tagName}" | ${SITE_NAME}`
  const description = `Browse all DevTools Online blog posts tagged with ${tagName}.`

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            to="/blog/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            All posts
          </Link>

          <header className="mb-10">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">
              <TagIcon size={14} />
              Tag
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {tagName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged with "{tagName}"
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No posts found for this tag.</p>
              <Link
                to="/blog/"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                Browse all posts →
              </Link>
            </div>
          ) : (
            <ul className="space-y-8">
              {posts.map(post => (
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Footer />
      </div>
    </>
  )
}
