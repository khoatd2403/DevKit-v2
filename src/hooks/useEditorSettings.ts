import { useState } from 'react'

const FONT_SIZE_KEY = 'devkit-editor-font-size'
const WRAP_KEY = 'devkit-editor-wrap'

function applyFontSize(n: number) {
  document.documentElement.style.setProperty('--editor-font-size', `${n}px`)
}

function applyLineWrap(v: boolean) {
  document.documentElement.classList.toggle('editor-nowrap', !v)
}

export function useEditorSettings() {
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_SIZE_KEY)
    const n = stored ? parseInt(stored, 10) : 13
    const clamped = isNaN(n) ? 13 : Math.max(10, Math.min(20, n))
    applyFontSize(clamped)
    return clamped
  })

  const [lineWrap, setLineWrapState] = useState<boolean>(() => {
    const v = localStorage.getItem(WRAP_KEY) !== 'false'
    applyLineWrap(v)
    return v
  })

  const setFontSize = (n: number) => {
    const clamped = Math.max(10, Math.min(20, n))
    setFontSizeState(clamped)
    localStorage.setItem(FONT_SIZE_KEY, String(clamped))
    applyFontSize(clamped)
  }

  const setLineWrap = (v: boolean) => {
    setLineWrapState(v)
    localStorage.setItem(WRAP_KEY, String(v))
    applyLineWrap(v)
  }

  return { fontSize, setFontSize, lineWrap, setLineWrap }
}
