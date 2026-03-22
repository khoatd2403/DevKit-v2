import { useState, useEffect, useContext, createContext, createElement } from 'react'
import type { ReactNode } from 'react'

const KEY = 'devkit-favorites'

interface FavoritesContextValue {
  favorites: string[]
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = (id: string) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const isFavorite = (id: string) => favorites.includes(id)

  return createElement(FavoritesContext.Provider, { value: { favorites, toggle, isFavorite } }, children)
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
