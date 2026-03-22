import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import CommandPalette from './components/CommandPalette'
import FeedbackModal from './components/FeedbackModal'
import ChangelogModal from './components/ChangelogModal'
import ShortcutsModal from './components/ShortcutsModal'
import SettingsModal from './components/SettingsModal'
import OnboardingTour from './components/OnboardingTour'
import ToastContainer from './components/ToastContainer'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home'
import ToolPage from './pages/ToolPage'
import SplitPage from './pages/SplitPage'
import AllTools from './pages/AllTools'
import { ThemeContext } from './context/ThemeContext'
import type { ThemeMode } from './context/ThemeContext'
import { LiveModeProvider } from './context/LiveModeContext'
import { ToastProvider } from './context/ToastContext'
import { usePwaInstall } from './hooks/usePwaInstall'
import { useEditorSettings } from './hooks/useEditorSettings'
import { useAppearance } from './hooks/useAppearance'
import { LanguageProvider } from './context/LanguageContext'
import { FavoritesProvider } from './hooks/useFavorites'
import { LATEST_VERSION } from './version'
import { X } from 'lucide-react'

function getSystemDark() {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches
}

function AppInner() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode | null
    return (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'system'
  })

  // Derive darkMode from theme
  const [systemDark, setSystemDark] = useState(getSystemDark)
  const darkMode = theme === 'system' ? systemDark : theme === 'dark'

  const setTheme = (v: ThemeMode) => {
    setThemeState(v)
    localStorage.setItem('theme', v)
  }

  // Legacy helper — header moon/sun button still uses this
  const setDarkMode = (v: boolean) => setTheme(v ? 'dark' : 'light')

  // Apply dark class + listen to system changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Appearance (accent color + bg shade)
  useAppearance()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTool, setFeedbackTool] = useState<string | undefined>(undefined)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // LATEST_VERSION imported from src/version.ts (auto-generated from git tag)
  const [hasNewChangelog, setHasNewChangelog] = useState(() =>
    localStorage.getItem('devkit-seen-version') !== LATEST_VERSION
  )

  // Apply saved editor settings on mount
  useEditorSettings()

  // PWA install
  const { canInstall, install } = usePwaInstall()
  const [visitCount, setVisitCount] = useState(() => {
    const stored = parseInt(localStorage.getItem('devkit-visit-count') ?? '0', 10)
    return stored
  })
  const [bannerDismissed, setBannerDismissed] = useState(() =>
    localStorage.getItem('devkit-pwa-banner-dismissed') === 'true'
  )

  // Increment visit count on mount
  useEffect(() => {
    const next = visitCount + 1
    setVisitCount(next)
    localStorage.setItem('devkit-visit-count', String(next))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for changelog open event from Footer
  useEffect(() => {
    const handler = () => setChangelogOpen(true)
    globalThis.addEventListener('open-changelog', handler)
    return () => globalThis.removeEventListener('open-changelog', handler)
  }, [])

  const handleDismissBanner = () => {
    setBannerDismissed(true)
    localStorage.setItem('devkit-pwa-banner-dismissed', 'true')
  }

  const openChangelog = () => {
    setChangelogOpen(true)
    setHasNewChangelog(false)
    localStorage.setItem('devkit-seen-version', LATEST_VERSION)
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K — command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(o => !o)
      }
      // Ctrl+Shift+F — feedback
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setFeedbackOpen(o => !o)
      }
      // Ctrl+Enter — run/process (dispatch devkit:run)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        globalThis.dispatchEvent(new CustomEvent('devkit:run'))
      }
      // Ctrl+Shift+C — copy output (dispatch devkit:copy-output)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        globalThis.dispatchEvent(new CustomEvent('devkit:copy-output'))
      }
      // Alt+L — toggle live mode (dispatch devkit:toggle-live)
      if (e.altKey && e.key === 'l') {
        e.preventDefault()
        globalThis.dispatchEvent(new CustomEvent('devkit:toggle-live'))
      }
      // ? — open shortcuts modal (? = Shift+/ on most keyboards, so shiftKey is expected)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        const tag = target.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          setShortcutsOpen(o => !o)
        }
      }
      // Ctrl+[ — go back
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault()
        globalThis.history.back()
      }
      // Ctrl+] — go forward
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault()
        globalThis.history.forward()
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme, setTheme }}>
      <LiveModeProvider>
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onFeedback={() => { setFeedbackTool(undefined); setFeedbackOpen(true) }}
              onChangelog={openChangelog}
              onSettings={() => setSettingsOpen(true)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header
                onMenuClick={() => setSidebarOpen(o => !o)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenCmd={() => setCmdOpen(true)}
                onChangelog={openChangelog}
                hasNewChangelog={hasNewChangelog}
              />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Home searchQuery={searchQuery} />} />
                  <Route path="/tool/:toolId" element={<ToolPage onFeedback={(toolName) => { setFeedbackTool(toolName); setFeedbackOpen(true) }} />} />
                  <Route path="/split" element={<SplitPage />} />
                  <Route path="/tools" element={<AllTools />} />
                </Routes>
              </main>
            </div>
          </div>

          {/* PWA install banner */}
          {canInstall && visitCount >= 3 && !bannerDismissed && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary-600 text-white px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔧</span>
                <div>
                  <p className="text-sm font-medium">Install DevKit</p>
                  <p className="text-xs text-primary-200">Add to your desktop for faster access</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={install} className="bg-white text-primary-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                  Install
                </button>
                <button onClick={handleDismissBanner} className="text-primary-200 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
          <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} toolName={feedbackTool} />
          <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
          <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          <OnboardingTour />
          <ToastContainer />
          <CookieBanner />
        </BrowserRouter>
      </LiveModeProvider>
    </ThemeContext.Provider>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <AppInner />
          </FavoritesProvider>
        </LanguageProvider>
      </ToastProvider>
    </HelmetProvider>
  )
}
