import { useState } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'

type Country = 'vn' | 'us' | 'uk' | 'de' | 'fr' | 'sg'

interface IdResult { label: string; value: string; format?: string }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad(n: number, len: number) { return String(n).padStart(len, '0') }
function randDigits(n: number) { return Array.from({ length: n }, () => rand(0, 9)).join('') }
function randChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// Vietnam CCCD (Căn Cước Công Dân) - 12 digits
// Format: PPP GYY RRRRRR
// PPP = Province code (001-096 excl some), G = gender (0=male, 1=female), YY = birth year, RRRRRR = random
function genVietnamCCCD(): IdResult[] {
  const provinces = ['001','002','004','006','008','010','011','012','014','015','017','019','020','022','024','025','026','027','030','031','033','034','035','036','037','038','040','042','044','045','046','048','049','051','052','054','056','058','060','062','064','066','067','068','070','072','074','075','077','079','080','082','083','084','086','087','089','091','092','093','094','095','096']
  const province = randChoice(provinces)
  const gender = rand(0, 1)
  const year = pad(rand(0, 99), 2)
  const seq = randDigits(6)
  const cccd = `${province}${gender}${year}${seq}`

  const genderLabel = gender === 0 ? 'Male' : 'Female'
  const fullYear = parseInt(year) <= 30 ? `20${year}` : `19${year}`

  return [
    { label: 'CCCD Number', value: cccd, format: 'PPP G YY RRRRRR' },
    { label: 'Province Code', value: province },
    { label: 'Gender', value: genderLabel },
    { label: 'Birth Year', value: fullYear },
  ]
}

// US SSN - Social Security Number
// Format: AAA-GG-SSSS (not starting with 000, 666, 900-999)
function genUSSN(): IdResult[] {
  let area: number
  do { area = rand(1, 899) } while (area === 666)
  const group = rand(1, 99)
  const serial = rand(1, 9999)
  const ssn = `${pad(area, 3)}-${pad(group, 2)}-${pad(serial, 4)}`
  return [
    { label: 'SSN', value: ssn, format: 'AAA-GG-SSSS' },
    { label: 'Area Number', value: String(pad(area, 3)) },
    { label: 'Group Number', value: String(pad(group, 2)) },
    { label: 'Serial Number', value: String(pad(serial, 4)) },
  ]
}

// UK National Insurance Number
// Format: XX NNNNNN X  (letters excluding D,F,I,Q,U,V for prefix; not BG,GB,NK,KN,NT,TN,ZZ)
function genUKNI(): IdResult[] {
  const validLetters = 'ABCEHJ KLMNOPRSTWXY'.replace(' ', '')
  const invalid2 = ['D','F','I','Q','U','V']
  let l1: string, l2: string
  do { l1 = randChoice(validLetters.split('')) } while (!l1)
  do { l2 = randChoice('ABCDEFGHIJKLMNOPRSTUVWXYZ'.split('')) } while (invalid2.includes(l2))
  const invalidPairs = ['BG','GB','NK','KN','NT','TN','ZZ']
  while (invalidPairs.includes(l1 + l2)) {
    l1 = randChoice(validLetters.split(''))
  }
  const digits = randDigits(6)
  const suffix = randChoice(['A','B','C','D'])
  const ni = `${l1}${l2} ${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,6)} ${suffix}`
  return [
    { label: 'NI Number', value: ni, format: 'XX NNNNNN X' },
    { label: 'Prefix', value: `${l1}${l2}` },
    { label: 'Digits', value: digits },
    { label: 'Suffix', value: suffix },
  ]
}

// Germany Personalausweis (ID number, not real algorithm, illustrative)
// Format: XXXXXXXXXXX (9 chars alphanumeric + check digit)
function genGermanId(): IdResult[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const base = Array.from({ length: 9 }, () => randChoice(chars.split(''))).join('')
  const check = rand(0, 9)
  return [
    { label: 'Ausweis Nr.', value: `${base}${check}`, format: 'XXXXXXXXXX' },
    { label: 'Note', value: 'Illustrative format only' },
  ]
}

// France CNI (Carte Nationale d'Identité) - 12 digits
function genFrenchCNI(): IdResult[] {
  const dept = pad(rand(1, 95), 2)
  const year = pad(rand(50, 99), 2)
  const seq = randDigits(7)
  const check = rand(10, 99)
  const cni = `${dept}${year}${seq}${check}`
  return [
    { label: 'CNI Number', value: cni, format: 'DD YY NNNNNNN CC' },
    { label: 'Department', value: dept },
    { label: 'Year', value: `19${year}` },
  ]
}

// Singapore NRIC
// Format: SXXXXXXC or TXXXXXXC  S=born before 2000, T=born 2000+
// Weights: 2 7 6 5 4 3 2, check letter from array
function genSingaporeNRIC(): IdResult[] {
  const prefix = randChoice(['S', 'T'])
  const digits = Array.from({ length: 7 }, () => rand(0, 9))
  const weights = [2, 7, 6, 5, 4, 3, 2]
  let sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0)
  if (prefix === 'T') sum += 4
  const checksS = 'JZIHGFEDCBA'
  const checksT = 'GFEDCBAJIHZ' // simplified
  const checkLetters = prefix === 'S' ? checksS : checksT
  const checkChar = checkLetters[sum % 11]
  const nric = `${prefix}${digits.join('')}${checkChar}`
  return [
    { label: 'NRIC', value: nric, format: 'X NNNNNNN X' },
    { label: 'Prefix', value: prefix, },
    { label: 'Era', value: prefix === 'S' ? 'Born before 2000' : 'Born 2000 or after' },
    { label: 'Check Digit', value: checkChar },
  ]
}

const COUNTRIES: { code: Country; label: string; flag: string; gen: () => IdResult[] }[] = [
  { code: 'vn', label: 'Vietnam (CCCD)', flag: '🇻🇳', gen: genVietnamCCCD },
  { code: 'us', label: 'USA (SSN)', flag: '🇺🇸', gen: genUSSN },
  { code: 'uk', label: 'UK (NI Number)', flag: '🇬🇧', gen: genUKNI },
  { code: 'de', label: 'Germany (Ausweis)', flag: '🇩🇪', gen: genGermanId },
  { code: 'fr', label: 'France (CNI)', flag: '🇫🇷', gen: genFrenchCNI },
  { code: 'sg', label: 'Singapore (NRIC)', flag: '🇸🇬', gen: genSingaporeNRIC },
]

export default function NationalIdGenerator() {
  const [country, setCountry] = useState<Country>('vn')
  const [results, setResults] = useState<IdResult[]>([])
  const [batch, setBatch] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [batchCount, setBatchCount] = useState(5)

  const selected = COUNTRIES.find(c => c.code === country)!

  const generate = () => {
    const r = selected.gen()
    setResults(r)
    setBatch([])
  }

  const generateBatch = () => {
    const ids = Array.from({ length: batchCount }, () => selected.gen()[0].value)
    setBatch(ids)
    setResults([])
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const copyBatch = async () => {
    await navigator.clipboard.writeText(batch.join('\n'))
    setCopied('batch')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
        ⚠️ Generated IDs are for <strong>testing and development purposes only</strong>. They follow format rules but are not real identities.
      </div>

      {/* Country selector */}
      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map(c => (
          <button key={c.code} onClick={() => { setCountry(c.code); setResults([]); setBatch([]) }}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
              country === c.code
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}>
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={generate} className="btn-primary px-5 flex items-center gap-2">
          <RefreshCw size={14} /> Generate Single
        </button>
        <div className="flex items-center gap-2">
          <button onClick={generateBatch} className="btn-secondary px-4 flex items-center gap-2">
            Generate Batch
          </button>
          <select value={batchCount} onChange={e => setBatchCount(+e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5">
            {[5, 10, 20, 50].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Single result */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-primary-50 dark:bg-primary-950/30 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{selected.flag} {selected.label}</span>
            <button onClick={() => copy(results[0].value, 'main')} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {copied === 'main' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              Copy ID
            </button>
          </div>
          <div className="p-4 space-y-2.5">
            {results.map(r => (
              <div key={r.label} className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-32 shrink-0">{r.label}</span>
                <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">{r.value}</span>
                {r.format && <span className="text-[10px] text-gray-400 font-mono ml-auto">{r.format}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch result */}
      {batch.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{batch.length} Generated IDs</span>
            <button onClick={copyBatch} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {copied === 'batch' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              Copy All
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {batch.map((id, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 group">
                <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                <span className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200 flex-1">{id}</span>
                <button onClick={() => copy(id, `row-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied === `row-${i}` ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-gray-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && batch.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          Select a country and generate an ID
        </div>
      )}

      <p className="text-[11px] text-gray-400">Generated IDs follow official format rules for testing purposes only — not real documents</p>
    </div>
  )
}
