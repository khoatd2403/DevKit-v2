import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import Footer from '../components/Footer'
import { SITE_URL, SITE_NAME } from '../../site.config'

interface LegalLayoutProps {
  title: string
  description: string
  path: string
  lastUpdated?: string
  children: ReactNode
}

export default function LegalLayout({ title, description, path, lastUpdated, children }: LegalLayoutProps) {
  const url = `${SITE_URL}${path}`
  const pageTitle = `${title} | ${SITE_NAME}`

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Last updated: {lastUpdated}
            </p>
          )}
          <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary-600 dark:prose-a:text-primary-400">
            {children}
          </article>
        </div>
        <Footer />
      </div>
    </>
  )
}
