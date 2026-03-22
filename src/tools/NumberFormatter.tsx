import { useState, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'

/* ── Types ── */
type FormatStyle = 'decimal' | 'currency' | 'percent' | 'scientific' | 'compact'

/* ── Constants ── */
const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ru-RU', label: 'Russian (Russia)' },
  { value: 'ja-JP', label: 'Japanese (Japan)' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'ko-KR', label: 'Korean (Korea)' },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { value: 'hi-IN', label: 'Hindi (India)' },
  { value: 'tr-TR', label: 'Turkish (Turkey)' },
  { value: 'pl-PL', label: 'Polish (Poland)' },
  { value: 'nl-NL', label: 'Dutch (Netherlands)' },
  { value: 'sv-SE', label: 'Swedish (Sweden)' },
]

const CURRENCIES = ['USD','EUR','GBP','JPY','CNY','AUD','CAD','CHF','INR','KRW','BRL','MXN','SGD','NOK','SEK','DKK','HKD','RUB','AED','TRY']

const STYLES: { value: FormatStyle; label: string }[] = [
  { value: 'decimal', label: 'Decimal' },
  { value: 'currency', label: 'Currency' },
  { value: 'percent', label: 'Percent' },
  { value: 'scientific', label: 'Scientific' },
  { value: 'compact', label: 'Compact' },
]

/* ── Number-to-words (English, up to trillions) ── */
const ONES = ['','one','two','three','four','five','six','seven','eight','nine',
              'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
              'seventeen','eighteen','nineteen']
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']

function wordsBelow1000(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]!
  if (n < 100) return TENS[Math.floor(n / 10)]! + (n % 10 ? '-' + ONES[n % 10]! : '')
  return ONES[Math.floor(n / 100)]! + ' hundred' + (n % 100 ? ' ' + wordsBelow1000(n % 100) : '')
}

function toWords(num: number): string {
  if (isNaN(num)) return 'not a number'
  if (!isFinite(num)) return num > 0 ? 'positive infinity' : 'negative infinity'
  const negative = num < 0
  num = Math.abs(num)

  // Handle decimals
  const decimalPart = num % 1
  const intPart = Math.floor(num)

  const groups = [
    [1_000_000_000_000, 'trillion'],
    [1_000_000_000, 'billion'],
    [1_000_000, 'million'],
    [1_000, 'thousand'],
  ] as [number, string][]

  let remaining = intPart
  const parts: string[] = []

  for (const [div, name] of groups) {
    if (remaining >= div) {
      const chunk = Math.floor(remaining / div)
      parts.push(wordsBelow1000(chunk) + ' ' + name)
      remaining %= div
    }
  }
  if (remaining > 0 || parts.length === 0) {
    parts.push(wordsBelow1000(remaining))
  }

  let result = parts.filter(Boolean).join(' ')
  if (intPart === 0) result = 'zero'

  if (decimalPart > 0) {
    const decStr = num.toString().split('.')[1] ?? ''
    const decWords = decStr.split('').map(d => ONES[parseInt(d)]!).join(' ')
    result += ' point ' + decWords
  }

  return (negative ? 'negative ' : '') + result
}

/* ── Engineering notation ── */
function toEngineering(num: number): string {
  if (num === 0) return '0'
  if (!isFinite(num)) return String(num)
  const sign = num < 0 ? '-' : ''
  const abs = Math.abs(num)
  const exp = Math.floor(Math.log10(abs))
  const engExp = Math.floor(exp / 3) * 3
  const mantissa = abs / Math.pow(10, engExp)
  return `${sign}${mantissa.toPrecision(4)} × 10^${engExp}`
}

/* ── Copy hook ── */
function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }
  return { copiedKey, copy }
}

function OutputRow({ label, value, id, copiedKey, copy, mono = true }: {
  label: string; value: string; id: string
  copiedKey: string | null; copy: (t: string, k: string) => void
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-36 shrink-0">{label}</span>
      <span className={`flex-1 text-sm text-gray-800 dark:text-gray-200 break-all ${mono ? 'font-mono' : ''} ${!value ? 'text-gray-300 dark:text-gray-600 italic' : ''}`}>
        {value || 'N/A'}
      </span>
      {value && (
        <button onClick={() => copy(value, id)} className="btn-ghost text-xs flex items-center gap-1 shrink-0">
          {copiedKey === id ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          {copiedKey === id ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}

/* ── Main Component ── */
export default function NumberFormatter() {
  const [input, setInput] = useState('1234567.89')
  const [locale, setLocale] = useState('en-US')
  const [style, setStyle] = useState<FormatStyle>('decimal')
  const [currency, setCurrency] = useState('USD')
  const [minDecimals, setMinDecimals] = useState(0)
  const [maxDecimals, setMaxDecimals] = useState(3)
  const { copiedKey, copy } = useCopy()

  const num = useMemo(() => {
    const n = parseFloat(input.replace(/,/g, ''))
    return isNaN(n) ? null : n
  }, [input])

  const isInteger = num !== null && Number.isInteger(num)

  const formatted = useMemo(() => {
    if (num === null) return null

    // locale format
    let standard = '—'
    try {
      const opts: Intl.NumberFormatOptions = {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals,
      }
      if (style === 'decimal') {
        opts.style = 'decimal'
      } else if (style === 'currency') {
        opts.style = 'currency'
        opts.currency = currency
      } else if (style === 'percent') {
        opts.style = 'percent'
      } else if (style === 'compact') {
        opts.notation = 'compact'
        opts.compactDisplay = 'long'
      }
      standard = new Intl.NumberFormat(locale, opts).format(num)
    } catch {
      standard = 'Format error'
    }

    // scientific
    let scientific = '—'
    try {
      scientific = new Intl.NumberFormat(locale, {
        notation: 'scientific',
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(num)
    } catch {
      scientific = num.toExponential(maxDecimals)
    }

    // engineering
    const engineering = toEngineering(num)

    // binary/octal/hex (integers only)
    const intVal = Math.trunc(num)
    const binary = isInteger ? `0b${(intVal >>> 0).toString(2)}` : ''
    const octal = isInteger ? `0o${(intVal >>> 0).toString(8)}` : ''
    const hex = isInteger ? `0x${(intVal >>> 0).toString(16).toUpperCase()}` : ''

    // words
    let words = '—'
    try {
      if (Math.abs(num) < 1e15) {
        words = toWords(num)
      } else {
        words = 'Number too large for word representation'
      }
    } catch {
      words = 'Conversion error'
    }

    return { standard, scientific, engineering, binary, octal, hex, words }
  }, [num, locale, style, currency, minDecimals, maxDecimals])

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">Number</label>
        <input
          type="text"
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-lg font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a number…"
        />
        {input && num === null && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">Invalid number</p>
        )}
      </div>

      {/* Options row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label-text block mb-1">Locale</label>
          <select
            value={locale}
            onChange={e => setLocale(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label-text block mb-1">Style</label>
          <select
            value={style}
            onChange={e => setStyle(e.target.value as FormatStyle)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {style === 'currency' && (
          <div>
            <label className="label-text block mb-1">Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div className="sm:col-span-1">
          <label className="label-text block mb-1">Decimal Places</label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={20}
              value={minDecimals}
              onChange={e => setMinDecimals(Math.min(Number(e.target.value), maxDecimals))}
              className="w-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              title="Min decimal places"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number" min={0} max={20}
              value={maxDecimals}
              onChange={e => setMaxDecimals(Math.max(Number(e.target.value), minDecimals))}
              className="w-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              title="Max decimal places"
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">min – max</p>
        </div>
      </div>

      {/* Outputs */}
      {formatted && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Formatted Output</div>

          <OutputRow label="Standard (locale)" value={formatted.standard} id="std" copiedKey={copiedKey} copy={copy} />
          <OutputRow label="Scientific notation" value={formatted.scientific} id="sci" copiedKey={copiedKey} copy={copy} />
          <OutputRow label="Engineering notation" value={formatted.engineering} id="eng" copiedKey={copiedKey} copy={copy} />

          {isInteger ? (
            <>
              <OutputRow label="Binary" value={formatted.binary} id="bin" copiedKey={copiedKey} copy={copy} />
              <OutputRow label="Octal" value={formatted.octal} id="oct" copiedKey={copiedKey} copy={copy} />
              <OutputRow label="Hexadecimal" value={formatted.hex} id="hex" copiedKey={copiedKey} copy={copy} />
            </>
          ) : (
            <div className="py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400 dark:text-gray-500">Binary/Octal/Hex — only available for integers</span>
            </div>
          )}

          <OutputRow label="In words" value={formatted.words} id="words" copiedKey={copiedKey} copy={copy} mono={false} />
        </div>
      )}

      {/* Quick number presets */}
      <div>
        <label className="label-text block mb-2">Quick Values</label>
        <div className="flex flex-wrap gap-2">
          {[
            ['42', '42'],
            ['1,000', '1000'],
            ['1M', '1000000'],
            ['1B', '1000000000'],
            ['π', '3.14159265358979'],
            ['e', '2.71828182845904'],
            ['−255', '-255'],
            ['0.5', '0.5'],
            ['1e15', '1000000000000000'],
          ].map(([label, val]) => (
            <button
              key={label}
              onClick={() => setInput(val)}
              className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-400 rounded-lg px-3 py-1.5 font-mono text-gray-600 dark:text-gray-400 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
