import { Github, Heart } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const REPO = 'https://github.com/khoatd2403/DevKit-v2'

const BUG_URL = `${REPO}/issues/new?assignees=khoatd2403&labels=bug&title=${encodeURIComponent('Bug: ')}&body=${encodeURIComponent('## Describe the bug\n\n## Steps to reproduce\n1. \n2. \n\n## Expected behavior\n\n## Screenshots (if any)\n')}`
const FEATURE_URL = `${REPO}/issues/new?assignees=khoatd2403&labels=enhancement&title=${encodeURIComponent('Feature: ')}&body=${encodeURIComponent('## What problem does this solve?\n\n## Describe the feature\n\n## Additional context\n')}`

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  const links = [
    {
      title: t.footerTools,
      items: [
        { label: 'JSON Formatter', href: '/tool/json-formatter' },
        { label: 'Base64 Encode/Decode', href: '/tool/base64-encode-decode' },
        { label: 'UUID Generator', href: '/tool/uuid-generator' },
        { label: 'Password Generator', href: '/tool/password-generator' },
        { label: 'Regex Tester', href: '/tool/regex-tester' },
      ],
    },
    {
      title: t.footerCategories,
      items: [
        { label: t.categories.json, href: '/?cat=json' },
        { label: t.categories.encoding, href: '/?cat=encoding' },
        { label: t.categories.crypto, href: '/?cat=crypto' },
        { label: t.categories.color, href: '/?cat=color' },
        { label: t.categories.formatter, href: '/?cat=formatter' },
      ],
    },
    {
      title: t.footerProject,
      items: [
        { label: 'GitHub', href: REPO, external: true },
        { label: t.footerReportBug, href: BUG_URL, external: true },
        { label: t.footerFeatureRequest, href: FEATURE_URL, external: true },
        { label: t.whatsNew, href: '#', onClick: () => window.dispatchEvent(new CustomEvent('open-changelog')) },
      ],
    },
  ]

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect width="32" height="32" rx="7" fill="#111827"/>
                <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#374151"/>
                <circle cx="7" cy="8" r="2" fill="#ff5f57"/>
                <circle cx="13" cy="8" r="2" fill="#febc2e"/>
                <circle cx="19" cy="8" r="2" fill="#28c840"/>
                <text x="6" y="23" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#4ade80">&gt;_</text>
              </svg>
              <span className="font-semibold text-gray-900 dark:text-white">
                DevTools <span className="text-green-500">Online</span><span className="text-gray-400 dark:text-gray-600 font-normal text-sm">.dev</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t.footerDesc}
            </p>
            <a
              href="https://github.com/khoatd2403/DevKit-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={15} />
              {t.footerSocial}
            </a>
          </div>

          {/* Links */}
          {links.map(group => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map(item => (
                  <li key={item.label}>
                    {'onClick' in item && item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                    <a
                      href={item.href}
                      target={'external' in item && item.external ? '_blank' : undefined}
                      rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {item.label}
                    </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-600">
          <p>{t.footerCopyright(year)}</p>
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-1">
              {t.footerBuiltWith.split('{heart}')[0]} <Heart size={11} className="text-red-400 fill-red-400" /> {t.footerBuiltWith.split('{heart}')[1]}
            </p>
            <a
              href="https://paypal.me/tranphu0ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-xs font-medium"
            >
              <Heart size={11} className="fill-blue-500 dark:fill-blue-400" />
              {t.support}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
