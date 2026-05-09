import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Footer from '../components/Footer'
import { getPostBySlug, renderMarkdown, formatDate, readingTimeMinutes, tagSlug } from '../lib/blog'
import { SITE_URL, SITE_NAME } from '../../site.config'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Post not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find a blog post at that URL.
          </p>
          <Link
            to="/blog/"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const url = `${SITE_URL}/blog/${post.slug}/`
  const title = `${post.title} | ${SITE_NAME}`
  const ogImage = post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og-image.svg`
  const html = renderMarkdown(post.body)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.description,
    'datePublished': post.date,
    'dateModified': post.date,
    'author': {
      '@type': 'Organization',
      'name': post.author,
      'url': SITE_URL,
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_URL,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/icons/icon-192.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
    'image': ogImage,
    'keywords': post.keywords.join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_URL}/blog/` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': url },
    ],
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            to="/blog/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {post.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.date)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {readingTimeMinutes(post.body)} min read
              </span>
              <span>by {post.author}</span>
            </div>
          </header>

          <article
            className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-pre:bg-gray-900 prose-pre:text-gray-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">Tagged:</span>
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog/tag/${tagSlug(tag)}/`}
                    className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  )
}
