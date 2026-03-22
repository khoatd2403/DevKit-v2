import { Wrench, Github, Heart } from 'lucide-react'

const REPO = 'https://github.com/khoatd2403/DevKit-v2'

const BUG_URL = `${REPO}/issues/new?assignees=khoatd2403&labels=bug&title=${encodeURIComponent('Bug: ')}&body=${encodeURIComponent('## Describe the bug\n\n## Steps to reproduce\n1. \n2. \n\n## Expected behavior\n\n## Screenshots (if any)\n')}`
const FEATURE_URL = `${REPO}/issues/new?assignees=khoatd2403&labels=enhancement&title=${encodeURIComponent('Feature: ')}&body=${encodeURIComponent('## What problem does this solve?\n\n## Describe the feature\n\n## Additional context\n')}`

export default function Footer() {
  const year = new Date().getFullYear()

  const links = [
    {
      title: 'Tools',
      items: [
        { label: 'JSON Formatter', href: '/tool/json-formatter' },
        { label: 'Base64 Encode/Decode', href: '/tool/base64-encode-decode' },
        { label: 'UUID Generator', href: '/tool/uuid-generator' },
        { label: 'Password Generator', href: '/tool/password-generator' },
        { label: 'Regex Tester', href: '/tool/regex-tester' },
      ],
    },
    {
      title: 'Categories',
      items: [
        { label: 'JSON Tools', href: '/?cat=json' },
        { label: 'Encoding', href: '/?cat=encoding' },
        { label: 'Crypto & Hash', href: '/?cat=crypto' },
        { label: 'Color Tools', href: '/?cat=color' },
        { label: 'Formatters', href: '/?cat=formatter' },
      ],
    },
    {
      title: 'Project',
      items: [
        { label: 'GitHub', href: REPO, external: true },
        { label: 'Report a Bug', href: BUG_URL, external: true },
        { label: 'Feature Request', href: FEATURE_URL, external: true },
        { label: 'Changelog', href: '#', onClick: () => window.dispatchEvent(new CustomEvent('open-changelog')) },
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
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Wrench size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">DevKit</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              A free, fast, and privacy-friendly developer toolkit. Everything runs in your browser — no sign-up, no tracking.
            </p>
            <a
              href="https://github.com/khoatd2403/DevKit-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={15} />
              DevKit on GitHub
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
          <p>© {year} DevKit. Open source under MIT License.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={11} className="text-red-400 fill-red-400" /> for developers.
          </p>
        </div>
      </div>
    </footer>
  )
}
