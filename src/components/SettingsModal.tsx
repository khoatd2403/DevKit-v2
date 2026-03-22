import { useState, useEffect, useRef } from 'react'
import { X, Download, Upload, Trash2, Settings } from 'lucide-react'
import { useEditorSettings } from '../hooks/useEditorSettings'
import { useAppearance, ACCENT_META, BG_SHADE_META } from '../hooks/useAppearance'
import { useTheme } from '../context/ThemeContext'
import type { ThemeMode } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import type { Lang } from '../i18n'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
]

function getExportStats() {
  let favorites = 0
  let snippets = 0
  let recentlyUsed = 0

  try {
    const favRaw = localStorage.getItem('devkit-favorites')
    if (favRaw) favorites = (JSON.parse(favRaw) as string[]).length
  } catch { /* ignore */ }

  try {
    const snipRaw = localStorage.getItem('devkit-snippets')
    if (snipRaw) snippets = (JSON.parse(snipRaw) as unknown[]).length
  } catch { /* ignore */ }

  try {
    const recentRaw = localStorage.getItem('devkit-recent')
    if (recentRaw) recentlyUsed = (JSON.parse(recentRaw) as string[]).length
  } catch { /* ignore */ }

  return { favorites, snippets, recentlyUsed }
}

function exportData() {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    if (key.startsWith('devkit-') || key.startsWith('tool-')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)!) }
      catch { data[key] = localStorage.getItem(key) }
    }
  }
  data['_exported_at'] = new Date().toISOString()
  data['_version'] = '1.0'
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const domain = window.location.hostname.replace(/^www\./, '') || 'devkit'
  a.download = `${domain}-settings-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { fontSize, setFontSize, lineWrap, setLineWrap } = useEditorSettings()
  const { accent, setAccent, bgShade, setBgShade } = useAppearance()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState('')
  const [clearConfirm, setClearConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const stats = getExportStats()

  useEffect(() => {
    if (!open) {
      setImportStatus('idle')
      setImportError('')
      setClearConfirm(false)
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const parsed = JSON.parse(raw) as Record<string, unknown>

        if (!('_version' in parsed)) {
          setImportError('Invalid file: missing _version key.')
          setImportStatus('error')
          return
        }

        for (const [key, value] of Object.entries(parsed)) {
          if (key.startsWith('_')) continue
          if (key.startsWith('devkit-') || key.startsWith('tool-')) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
          }
        }

        setImportStatus('success')
        setImportError('')
      } catch {
        setImportError('Could not parse file. Make sure it is a valid DevKit JSON export.')
        setImportStatus('error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearData = () => {
    if (!clearConfirm) {
      setClearConfirm(true)
      return
    }
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!
      if (key.startsWith('devkit-') || key.startsWith('tool-')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
    setClearConfirm(false)
    onClose()
    window.location.reload()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <Settings size={15} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{t.settingsTitle}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">

          {/* ── Appearance ──────────────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.appearance}
            </p>

            {/* Theme */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.theme}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.themeDesc}</p>
              </div>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value as ThemeMode)}
                className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
              >
                <option value="system">{t.themeSystem}</option>
                <option value="light">{t.themeLight}</option>
                <option value="dark">{t.themeDark}</option>
              </select>
            </div>

            {/* Accent color */}
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{t.accentColor}</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_META.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAccent(a.id)}
                    title={a.label}
                    className={`w-7 h-7 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all ${accent === a.id ? 'ring-2 ring-gray-800 dark:ring-white scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: a.color }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 capitalize">{ACCENT_META.find(a => a.id === accent)?.label}</p>
            </div>

            {/* Background shade */}
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{t.background}</p>
              <div className="grid grid-cols-4 gap-2">
                {BG_SHADE_META.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setBgShade(s.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center ${bgShade === s.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'}`}
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
                    <span className="text-[10px] text-gray-400">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* ── Language ────────────────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t.language}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.displayLanguage}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.languageDesc}</p>
              </div>
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Lang)}
                className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0 max-w-[160px]"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* ── Editor ──────────────────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.editor}
            </p>

            {/* Font size */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.fontSize}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.fontSizeDesc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setFontSize(fontSize - 1)}
                  disabled={fontSize <= 10}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-sm font-mono text-gray-800 dark:text-gray-200 w-8 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(fontSize + 1)}
                  disabled={fontSize >= 20}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Line wrap */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.lineWrap}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.lineWrapDesc}</p>
              </div>
              <button
                onClick={() => setLineWrap(!lineWrap)}
                className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none ${lineWrap ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${lineWrap ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* ── Your data ───────────────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              {t.yourData}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favorites}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.favorites}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.snippets}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.snippets}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentlyUsed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.recent}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Export */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.exportSettings}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t.exportDesc}</p>
            <button onClick={exportData} className="btn-primary text-sm flex items-center gap-2">
              <Download size={14} />
              {t.exportSettings}
            </button>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Import */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.importSettings}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t.importDesc}</p>

            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            {importStatus === 'idle' && (
              <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm flex items-center gap-2">
                <Upload size={14} />
                {t.chooseFile}
              </button>
            )}

            {importStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{t.importSuccess}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.location.reload()} className="btn-primary text-xs">{t.reloadNow}</button>
                  <button onClick={() => setImportStatus('idle')} className="btn-secondary text-xs">{t.importAnother}</button>
                </div>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 space-y-2">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{t.importFailed}</p>
                <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>
                <button onClick={() => { setImportStatus('idle'); fileRef.current?.click() }} className="btn-secondary text-xs">Try Again</button>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Clear data */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={14} className="text-red-500 shrink-0" />
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.clearAllData}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t.clearDesc}</p>

            {!clearConfirm ? (
              <button
                onClick={handleClearData}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 size={14} />
                {t.clearBtn}
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{t.clearConfirm}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearData}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    {t.clearYes}
                  </button>
                  <button onClick={() => setClearConfirm(false)} className="btn-secondary text-sm">{t.cancel}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {t.pressEscToClose.split('Esc')[0]}<kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-mono">Esc</kbd>{t.pressEscToClose.split('Esc')[1]}
          </span>
          <button onClick={onClose} className="btn-secondary text-sm">{t.close}</button>
        </div>
      </div>
    </div>
  )
}
