import { useState } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() =>
    localStorage.getItem('devkit-cookie-consent') === null
  )

  if (!visible) return null

  const accept = () => {
    localStorage.setItem('devkit-cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('devkit-cookie-consent', 'declined')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <Cookie size={18} className="text-primary-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">We use cookies</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We use essential cookies to save your preferences (theme, favorites, recent tools).
            No tracking or analytics cookies are used.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={accept}
              className="flex-1 btn-primary text-xs py-1.5"
            >
              Accept All
            </button>
            <button
              onClick={decline}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Necessary Only
            </button>
          </div>
        </div>
        <button
          onClick={decline}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 -mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
