import { createContext, useContext, useState, type ReactNode } from 'react'
import { getT, type Lang, type Translations } from '../i18n'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: getT('en'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('devkit-language') as Lang
    if (saved) return saved

    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    
    if (browserLang.startsWith('vi')) return 'vi'
    if (browserLang.startsWith('zh')) return 'zh-CN'
    if (browserLang.startsWith('ja')) return 'ja'
    if (browserLang.startsWith('ko')) return 'ko'
    if (browserLang.startsWith('es')) return 'es'
    if (browserLang.startsWith('fr')) return 'fr'
    if (browserLang.startsWith('de')) return 'de'
    if (browserLang.startsWith('pt')) return 'pt'
    if (browserLang.startsWith('ru')) return 'ru'

    // Final fallback: English
    return 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('devkit-language', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
