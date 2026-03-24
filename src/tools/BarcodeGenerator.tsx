import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, AlertCircle, CheckCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BarcodeType = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA' | 'ISBN13' | 'ITF14'

interface ValidationResult {
  valid: boolean
  message: string
  checksum?: number
  normalized?: string
}

// ─── Code 128 (Code B subset) ─────────────────────────────────────────────────

// Each value is an array: [bar1, space1, bar2, space2, bar3, space3] in units
const C128_PATTERNS: Record<number, number[]> = {
  0:  [2,1,2,2,2,2], 1:  [2,2,2,1,2,2], 2:  [2,2,2,2,2,1],
  3:  [1,2,1,2,2,3], 4:  [1,2,1,3,2,2], 5:  [1,3,1,2,2,2],
  6:  [1,2,2,2,1,3], 7:  [1,2,2,3,1,2], 8:  [1,3,2,2,1,2],
  9:  [2,2,1,2,1,3], 10: [2,2,1,3,1,2], 11: [2,3,1,2,1,2],
  12: [1,1,2,2,3,2], 13: [1,2,2,1,3,2], 14: [1,2,2,2,3,1],
  15: [1,1,3,2,2,2], 16: [1,2,3,1,2,2], 17: [1,2,3,2,2,1],
  18: [2,2,3,2,1,1], 19: [2,2,1,1,3,2], 20: [2,2,1,2,3,1],
  21: [2,1,3,2,1,2], 22: [2,2,3,1,1,2], 23: [3,1,2,1,3,1],
  24: [3,1,1,2,2,2], 25: [3,2,1,1,2,2], 26: [3,2,1,2,2,1],
  27: [3,1,2,2,1,2], 28: [3,2,2,1,1,2], 29: [3,2,2,2,1,1],
  30: [2,1,2,1,2,3], 31: [2,1,2,3,2,1], 32: [2,3,2,1,2,1],
  33: [1,1,1,3,2,3], 34: [1,3,1,1,2,3], 35: [1,3,1,3,2,1],
  36: [1,1,2,3,1,3], 37: [1,3,2,1,1,3], 38: [1,3,2,3,1,1],
  39: [2,1,1,3,1,3], 40: [2,3,1,1,1,3], 41: [2,3,1,3,1,1],
  42: [1,1,2,1,3,3], 43: [1,1,2,3,3,1], 44: [1,3,2,1,3,1],
  45: [1,1,3,1,2,3], 46: [1,1,3,3,2,1], 47: [1,3,3,1,2,1],
  48: [3,1,3,1,2,1], 49: [2,1,1,3,3,1], 50: [2,3,1,1,3,1],
  51: [2,1,3,1,1,3], 52: [2,1,3,3,1,1], 53: [2,1,3,1,3,1],
  54: [3,1,1,1,2,3], 55: [3,1,1,3,2,1], 56: [3,3,1,1,2,1],
  57: [3,1,2,1,1,3], 58: [3,1,2,3,1,1], 59: [3,3,2,1,1,1],
  60: [3,1,4,1,1,1], 61: [2,2,1,4,1,1], 62: [4,3,1,1,1,1],
  63: [1,1,1,2,2,4], 64: [1,1,1,4,2,2], 65: [1,2,1,1,2,4],
  66: [1,2,1,4,2,1], 67: [1,4,1,1,2,2], 68: [1,4,1,2,2,1],
  69: [1,1,2,2,1,4], 70: [1,1,2,4,1,2], 71: [1,2,2,1,1,4],
  72: [1,2,2,4,1,1], 73: [1,4,2,1,1,2], 74: [1,4,2,2,1,1],
  75: [2,4,1,2,1,1], 76: [2,2,1,1,1,4], 77: [4,1,3,1,1,1],
  78: [2,4,1,1,1,2], 79: [1,3,4,1,1,1], 80: [1,1,1,2,4,2],
  81: [1,2,1,1,4,2], 82: [1,2,1,2,4,1], 83: [1,1,4,2,1,2],
  84: [1,2,4,1,1,2], 85: [1,2,4,2,1,1], 86: [4,1,1,2,1,2],
  87: [4,2,1,1,1,2], 88: [4,2,1,2,1,1], 89: [2,1,2,1,4,1],
  90: [2,1,4,1,2,1], 91: [4,1,2,1,2,1], 92: [1,1,1,1,4,3],
  93: [1,1,1,3,4,1], 94: [1,3,1,1,4,1], 95: [1,1,4,1,1,3],
  96: [1,1,4,3,1,1], 97: [4,1,1,1,1,3], 98: [4,1,1,3,1,1],
  99: [1,1,3,1,4,1], 100:[1,1,4,1,3,1], 101:[3,1,1,1,4,1],
  102:[4,1,1,1,3,1],
  // Special codes
  103:[2,1,1,4,1,2], // START A
  104:[2,1,1,2,1,4], // START B
  105:[2,1,1,2,3,2], // START C
  106:[2,3,3,1,1,1,2], // STOP (7 elements)
}

const C128_START_B = 104
const C128_STOP    = 106

function encodeCode128(data: string): number[] {
  // Code B: ASCII 32–126
  const values: number[] = [C128_START_B]
  let checksum = C128_START_B

  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i) - 32
    values.push(code)
    checksum += code * (i + 1)
  }

  values.push(checksum % 103)
  values.push(C128_STOP)
  return values
}

// ─── Code 39 ──────────────────────────────────────────────────────────────────

const C39_CHARS: Record<string, string> = {
  '0':'101001101101','1':'110100101011','2':'101100101011',
  '3':'110110010101','4':'101001101011','5':'110100110101',
  '6':'101100110101','7':'101001011011','8':'110100101101',
  '9':'101100101101','A':'110101001011','B':'101101001011',
  'C':'110110100101','D':'101011001011','E':'110101100101',
  'F':'101101100101','G':'101010011011','H':'110101001101',
  'I':'101101001101','J':'101011001101','K':'110101010011',
  'L':'101101010011','M':'110110101001','N':'101011010011',
  'O':'110101101001','P':'101101101001','Q':'101010110011',
  'R':'110101011001','S':'101101011001','T':'101011011001',
  'U':'110010101011','V':'100110101011','W':'110011010101',
  'X':'100101101011','Y':'110010110101','Z':'100110110101',
  '-':'100101011011','.'  :'110010101101',' ':'100110101101',
  '$':'100100100101','/':'100100101001','+':'100101001001',
  '%':'101001001001','*':'100101101101',
}

function encodeCode39(data: string): string {
  const str = '*' + data.toUpperCase() + '*'
  return str.split('').map((c, i) => {
    const pattern = C39_CHARS[c] ?? ''
    return i > 0 ? '0' + pattern : pattern
  }).join('')
}

// ─── EAN/UPC encoding ─────────────────────────────────────────────────────────

// L-codes (left side odd parity)
const EAN_L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
// G-codes (left side even parity)
const EAN_G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
// R-codes (right side)
const EAN_R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']

// First digit parity patterns for EAN-13
const EAN13_PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function ean13Checksum(digits: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return (10 - (sum % 10)) % 10
}

function ean8Checksum(digits: string): number {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1)
  }
  return (10 - (sum % 10)) % 10
}

function encodeEAN13(digits: string): string {
  const first = parseInt(digits[0])
  const parity = EAN13_PARITY[first]
  let bits = '101' // left guard
  for (let i = 1; i <= 6; i++) {
    const d = parseInt(digits[i])
    bits += parity[i - 1] === 'L' ? EAN_L[d] : EAN_G[d]
  }
  bits += '01010' // center guard
  for (let i = 7; i <= 12; i++) {
    bits += EAN_R[parseInt(digits[i])]
  }
  bits += '101' // right guard
  return bits
}

function encodeEAN8(digits: string): string {
  let bits = '101'
  for (let i = 0; i < 4; i++) bits += EAN_L[parseInt(digits[i])]
  bits += '01010'
  for (let i = 4; i < 8; i++) bits += EAN_R[parseInt(digits[i])]
  bits += '101'
  return bits
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(type: BarcodeType, data: string): ValidationResult {
  if (!data) return { valid: false, message: 'Enter barcode data' }

  switch (type) {
    case 'CODE128': {
      const bad = data.split('').find(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)
      if (bad) return { valid: false, message: `Invalid character: ${JSON.stringify(bad)}` }
      return { valid: true, message: `Code 128 — ${data.length} chars` }
    }
    case 'CODE39': {
      const valid39 = /^[A-Z0-9\-. $/+%*]+$/i
      if (!valid39.test(data)) return { valid: false, message: 'Code 39 supports A-Z, 0-9, and - . $ / + % *' }
      return { valid: true, message: `Code 39 — ${data.length} chars` }
    }
    case 'EAN13':
    case 'ISBN13': {
      const digits = data.replace(/[-\s]/g, '')
      if (!/^\d{12,13}$/.test(digits)) return { valid: false, message: 'EAN-13 requires 12 or 13 digits' }
      const d12 = digits.slice(0, 12)
      const check = ean13Checksum(d12)
      const full = d12 + check
      if (digits.length === 13 && parseInt(digits[12]) !== check) {
        return { valid: false, message: `Invalid checksum — expected ${check}`, checksum: check, normalized: full }
      }
      return { valid: true, message: `Checksum: ${check}`, checksum: check, normalized: full }
    }
    case 'EAN8': {
      const digits = data.replace(/\s/g, '')
      if (!/^\d{7,8}$/.test(digits)) return { valid: false, message: 'EAN-8 requires 7 or 8 digits' }
      const d7 = digits.slice(0, 7)
      const check = ean8Checksum(d7)
      const full = d7 + check
      if (digits.length === 8 && parseInt(digits[7]) !== check) {
        return { valid: false, message: `Invalid checksum — expected ${check}`, checksum: check, normalized: full }
      }
      return { valid: true, message: `Checksum: ${check}`, checksum: check, normalized: full }
    }
    case 'UPCA': {
      const digits = data.replace(/\s/g, '')
      if (!/^\d{11,12}$/.test(digits)) return { valid: false, message: 'UPC-A requires 11 or 12 digits' }
      // UPC-A is EAN-13 with leading 0
      const d12 = '0' + digits.slice(0, 11)
      const check = ean13Checksum(d12.slice(0, 12))
      const full = d12.slice(1) + check
      return { valid: true, message: `Checksum: ${check}`, checksum: check, normalized: '0' + full }
    }
    case 'ITF14': {
      const digits = data.replace(/\s/g, '')
      if (!/^\d{13,14}$/.test(digits)) return { valid: false, message: 'ITF-14 requires 13 or 14 digits' }
      const d13 = digits.slice(0, 13)
      let sum = 0
      for (let i = 0; i < 13; i++) sum += parseInt(d13[i]) * (i % 2 === 0 ? 3 : 1)
      const check = (10 - (sum % 10)) % 10
      return { valid: true, message: `Checksum: ${check}`, checksum: check, normalized: d13 + check }
    }
  }
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawBarcode(
  canvas: HTMLCanvasElement,
  type: BarcodeType,
  data: string,
  barWidth: number,
  barHeight: number,
  showText: boolean,
  textFontSize: number,
  validation: ValidationResult,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const normalized = validation.normalized ?? data
  const paddingX = barWidth * 10
  const paddingY = 10
  const textHeight = showText ? textFontSize + 8 : 0

  let bitPattern = ''

  try {
    if (type === 'CODE128') {
      const codes = encodeCode128(normalized)
      codes.forEach(code => {
        const pattern = C128_PATTERNS[code]
        if (!pattern) return
        let isBar = true
        pattern.forEach(units => {
          bitPattern += (isBar ? '1' : '0').repeat(units)
          isBar = !isBar
        })
      })
    } else if (type === 'CODE39') {
      const bits = encodeCode39(normalized)
      bitPattern = bits
    } else if (type === 'EAN13' || type === 'ISBN13') {
      bitPattern = encodeEAN13(normalized.padStart(13, '0').slice(0, 13))
    } else if (type === 'EAN8') {
      bitPattern = encodeEAN8(normalized.padStart(8, '0').slice(0, 8))
    } else if (type === 'UPCA') {
      // UPC-A is EAN-13 with a leading 0
      bitPattern = encodeEAN13(normalized.slice(0, 13))
    } else if (type === 'ITF14') {
      // ITF: interleaved 2 of 5
      const itfNarrow = 1, itfWide = 2.5
      const itfDigits = normalized.padStart(14, '0').slice(0, 14)
      // Start: 4 narrow bars
      bitPattern = '1010'
      for (let i = 0; i < itfDigits.length; i += 2) {
        const bars = [3,2,1,0,4].map(b => [1,0,2,4,3][b])
        const d1 = parseInt(itfDigits[i])
        const d2 = parseInt(itfDigits[i + 1])
        // ITF-14 bars encoding table
        const ITF_VALS = [[0,0,1,1,0],[1,0,0,0,1],[0,1,0,0,1],[1,1,0,0,0],[0,0,1,0,1],[1,0,1,0,0],[0,1,1,0,0],[0,0,0,1,1],[1,0,0,1,0],[0,1,0,1,0]]
        const b1 = ITF_VALS[d1]
        const b2 = ITF_VALS[d2]
        for (let pos = 0; pos < 5; pos++) {
          const barW = b1[pos] ? itfWide : itfNarrow
          const spW  = b2[pos] ? itfWide : itfNarrow
          bitPattern += '1'.repeat(Math.round(barW)) + '0'.repeat(Math.round(spW))
        }
      }
      // Stop: wide bar + narrow space + narrow bar
      bitPattern += '110'
    }
  } catch {
    return
  }

  const totalWidth = bitPattern.length * barWidth + paddingX * 2
  canvas.width = totalWidth
  canvas.height = barHeight + paddingY * 2 + textHeight

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let x = paddingX
  for (const bit of bitPattern) {
    if (bit === '1') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, paddingY, barWidth, barHeight)
    }
    x += barWidth
  }

  if (showText) {
    ctx.fillStyle = '#000000'
    ctx.font = `${textFontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(normalized, canvas.width / 2, paddingY + barHeight + 4)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: BarcodeType; label: string }[] = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39',  label: 'Code 39' },
  { value: 'EAN13',   label: 'EAN-13' },
  { value: 'EAN8',    label: 'EAN-8' },
  { value: 'UPCA',    label: 'UPC-A' },
  { value: 'ISBN13',  label: 'ISBN-13' },
  { value: 'ITF14',   label: 'ITF-14' },
]

const DEFAULT_DATA: Record<BarcodeType, string> = {
  CODE128: 'Hello World 123',
  CODE39:  'HELLO-WORLD',
  EAN13:   '590123412345',
  EAN8:    '9638507',
  UPCA:    '03600029145',
  ISBN13:  '9780306406157',
  ITF14:   '1234567890128',
}

export default function BarcodeGenerator() {
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('CODE128')
  const [data, setData] = useState(DEFAULT_DATA['CODE128'])
  const [barWidth, setBarWidth] = useState(2)
  const [barHeight, setBarHeight] = useState(80)
  const [showText, setShowText] = useState(true)
  const [textFontSize, setTextFontSize] = useState(13)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const validation = validate(barcodeType, data)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !validation.valid) return
    drawBarcode(canvas, barcodeType, data, barWidth, barHeight, showText, textFontSize, validation)
  }, [barcodeType, data, barWidth, barHeight, showText, textFontSize, validation])

  useEffect(() => { redraw() }, [redraw])

  const handleTypeChange = (t: BarcodeType) => {
    setBarcodeType(t)
    setData(DEFAULT_DATA[t])
  }

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `barcode-${barcodeType}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <label className="tool-label block mb-2">Barcode Type</label>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                barcodeType === opt.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data input */}
      <div>
        <label className="tool-label block mb-1">Barcode Data</label>
        <input
          type="text"
          value={data}
          onChange={e => setData(e.target.value)}
          placeholder={DEFAULT_DATA[barcodeType]}
          className="tool-textarea py-2"
        />
      </div>

      {/* Validation status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
        validation.valid
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
      }`}>
        {validation.valid
          ? <CheckCircle size={15} />
          : <AlertCircle size={15} />
        }
        <span>{validation.message}</span>
        {validation.valid && validation.normalized && validation.normalized !== data && (
          <span className="ml-1 text-xs opacity-70">(normalized: {validation.normalized})</span>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="tool-label block mb-1">Bar Width: {barWidth}px</label>
          <input type="range" min={1} max={6} value={barWidth} onChange={e => setBarWidth(Number(e.target.value))}
            className="w-full accent-primary-600" />
        </div>
        <div>
          <label className="tool-label block mb-1">Bar Height: {barHeight}px</label>
          <input type="range" min={30} max={200} value={barHeight} onChange={e => setBarHeight(Number(e.target.value))}
            className="w-full accent-primary-600" />
        </div>
        <div>
          <label className="tool-label block mb-1">Font Size: {textFontSize}px</label>
          <input type="range" min={8} max={24} value={textFontSize} onChange={e => setTextFontSize(Number(e.target.value))}
            disabled={!showText} className="w-full accent-primary-600 disabled:opacity-40" />
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id="show-text" checked={showText} onChange={e => setShowText(e.target.checked)}
            className="w-4 h-4 accent-primary-600" />
          <label htmlFor="show-text" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Show text</label>
        </div>
      </div>

      {/* Canvas preview */}
      <div>
        <label className="tool-label block mb-2">Preview</label>
        <div className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
          <canvas
            ref={canvasRef}
            className={validation.valid ? '' : 'opacity-30'}
          />
          {!validation.valid && (
            <p className="text-sm text-gray-400 mt-2">Enter valid data to see barcode preview</p>
          )}
        </div>
      </div>

      {/* Download */}
      <div className="flex gap-3">
        <button
          onClick={downloadPng}
          disabled={!validation.valid}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={15} />
          Download PNG
        </button>
      </div>
    </div>
  )
}
