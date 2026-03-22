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
    return (localStorage.getItem('devkit-language') as Lang) ?? 'en'
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
