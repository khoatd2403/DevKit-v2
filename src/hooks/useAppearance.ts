import { useState } from 'react'

export type AccentColor = 'blue' | 'indigo' | 'violet' | 'green' | 'orange' | 'rose' | 'teal'
export type BgShade = 'default' | 'zinc' | 'slate' | 'stone'

type Palette = Record<string, string>

const ACCENTS: Record<AccentColor, Palette> = {
  blue: {
    '--p50': '239 246 255', '--p100': '219 234 254', '--p200': '191 219 254',
    '--p300': '147 197 253', '--p400': '96 165 250',  '--p500': '59 130 246',
    '--p600': '37 99 235',   '--p700': '29 78 216',   '--p800': '30 64 175', '--p900': '30 58 138',
  },
  indigo: {
    '--p50': '238 242 255', '--p100': '224 231 255', '--p200': '199 210 254',
    '--p300': '165 180 252', '--p400': '129 140 248', '--p500': '99 102 241',
    '--p600': '79 70 229',   '--p700': '67 56 202',   '--p800': '55 48 163', '--p900': '49 46 129',
  },
  violet: {
    '--p50': '245 243 255', '--p100': '237 233 254', '--p200': '221 214 254',
    '--p300': '196 181 253', '--p400': '167 139 250', '--p500': '139 92 246',
    '--p600': '124 58 237',  '--p700': '109 40 217',  '--p800': '91 33 182', '--p900': '76 29 149',
  },
  green: {
    '--p50': '236 253 245', '--p100': '209 250 229', '--p200': '167 243 208',
    '--p300': '110 231 183', '--p400': '52 211 153',  '--p500': '16 185 129',
    '--p600': '5 150 105',   '--p700': '4 120 87',    '--p800': '6 95 70',   '--p900': '6 78 59',
  },
  orange: {
    '--p50': '255 247 237', '--p100': '255 237 213', '--p200': '254 215 170',
    '--p300': '253 186 116', '--p400': '251 146 60',  '--p500': '249 115 22',
    '--p600': '234 88 12',   '--p700': '194 65 12',   '--p800': '154 52 18', '--p900': '124 45 18',
  },
  rose: {
    '--p50': '255 241 242', '--p100': '255 228 230', '--p200': '254 205 211',
    '--p300': '253 164 175', '--p400': '251 113 133', '--p500': '244 63 94',
    '--p600': '225 29 72',   '--p700': '190 18 60',   '--p800': '159 18 57', '--p900': '136 19 55',
  },
  teal: {
    '--p50': '240 253 250', '--p100': '204 251 241', '--p200': '153 246 228',
    '--p300': '94 234 212',  '--p400': '45 212 191',  '--p500': '20 184 166',
    '--p600': '13 148 136',  '--p700': '15 118 110',  '--p800': '17 94 89',  '--p900': '19 78 74',
  },
}

const BG_SHADES: Record<BgShade, { main: string; dark: string }> = {
  default: { main: '249 250 251', dark: '3 7 18' },
  zinc:    { main: '250 250 250', dark: '9 9 11' },
  slate:   { main: '248 250 252', dark: '2 6 23' },
  stone:   { main: '250 250 249', dark: '12 10 9' },
}

function applyAccent(accent: AccentColor) {
  const palette = ACCENTS[accent]
  const root = document.documentElement
  Object.entries(palette).forEach(([k, v]) => root.style.setProperty(k, v))
}

function applyBgShade(shade: BgShade) {
  const { main, dark } = BG_SHADES[shade]
  const root = document.documentElement
  root.style.setProperty('--bg-main', main)
  root.style.setProperty('--bg-dark', dark)
}

export function useAppearance() {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('devkit-accent') as AccentColor | null
    const val = saved && ACCENTS[saved] ? saved : 'blue'
    applyAccent(val)
    return val
  })

  const [bgShade, setBgShadeState] = useState<BgShade>(() => {
    const saved = localStorage.getItem('devkit-bg-shade') as BgShade | null
    const val = saved && BG_SHADES[saved] ? saved : 'default'
    applyBgShade(val)
    return val
  })

  const setAccent = (v: AccentColor) => {
    setAccentState(v)
    applyAccent(v)
    localStorage.setItem('devkit-accent', v)
  }

  const setBgShade = (v: BgShade) => {
    setBgShadeState(v)
    applyBgShade(v)
    localStorage.setItem('devkit-bg-shade', v)
  }

  return { accent, setAccent, bgShade, setBgShade }
}

export const ACCENT_META: { id: AccentColor; label: string; color: string }[] = [
  { id: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'green',  label: 'Green',  color: '#10b981' },
  { id: 'orange', label: 'Orange', color: '#f97316' },
  { id: 'rose',   label: 'Rose',   color: '#f43f5e' },
  { id: 'teal',   label: 'Teal',   color: '#14b8a6' },
]

export const BG_SHADE_META: { id: BgShade; label: string; desc: string }[] = [
  { id: 'default', label: 'Gray',  desc: 'Classic neutral' },
  { id: 'zinc',    label: 'Zinc',  desc: 'Cooler gray' },
  { id: 'slate',   label: 'Slate', desc: 'Blue-tinted' },
  { id: 'stone',   label: 'Stone', desc: 'Warm gray' },
]
