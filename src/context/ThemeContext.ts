import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  theme: ThemeMode
  setTheme: (v: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  theme: 'system',
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)
