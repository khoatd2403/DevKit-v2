import { useState } from 'react'
import CopyButton from '../components/CopyButton'

type PermSet = { r: boolean; w: boolean; x: boolean }
type Special = { suid: boolean; sgid: boolean; sticky: boolean }

const PRESETS = [
  { label: '644', octal: '644' },
  { label: '755', octal: '755' },
  { label: '700', octal: '700' },
  { label: '600', octal: '600' },
  { label: '777', octal: '777' },
  { label: '400', octal: '400' },
]

function permToInt(p: PermSet): number {
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0)
}

function intToPerm(n: number): PermSet {
  return { r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) }
}

function permToSymbol(p: PermSet): string {
  return `${p.r ? 'r' : '-'}${p.w ? 'w' : '-'}${p.x ? 'x' : '-'}`
}

function calcOctal(special: Special, owner: PermSet, group: PermSet, others: PermSet): string {
  const specBit = (special.suid ? 4 : 0) + (special.sgid ? 2 : 0) + (special.sticky ? 1 : 0)
  const o = permToInt(owner), g = permToInt(group), ot = permToInt(others)
  if (specBit > 0) return `${specBit}${o}${g}${ot}`
  return `${o}${g}${ot}`
}

function calcSymbolic(special: Special, owner: PermSet, group: PermSet, others: PermSet): string {
  let os = permToSymbol(owner)
  let gs = permToSymbol(group)
  let ts = permToSymbol(others)
  // apply special bits to execute position
  if (special.suid) os = os.slice(0, 2) + (owner.x ? 's' : 'S')
  if (special.sgid) gs = gs.slice(0, 2) + (group.x ? 's' : 'S')
  if (special.sticky) ts = ts.slice(0, 2) + (others.x ? 't' : 'T')
  return `${os}${gs}${ts}`
}

function calcAbsolute(owner: PermSet, group: PermSet, others: PermSet): string {
  const part = (prefix: string, p: PermSet) => {
    const parts: string[] = []
    if (p.r) parts.push('r')
    if (p.w) parts.push('w')
    if (p.x) parts.push('x')
    return parts.length > 0 ? `${prefix}=${parts.join('')}` : `${prefix}=`
  }
  return [part('u', owner), part('g', group), part('o', others)].join(',')
}

function calcDescription(special: Special, owner: PermSet, group: PermSet, others: PermSet): string {
  const describe = (who: string, p: PermSet) => {
    const perms: string[] = []
    if (p.r) perms.push('read')
    if (p.w) perms.push('write')
    if (p.x) perms.push('execute')
    if (perms.length === 0) return `${who} has no permissions.`
    return `${who} can ${perms.join(', ')}.`
  }
  const parts = [describe('Owner', owner), describe('Group', group), describe('Others', others)]
  if (special.suid) parts.push('SetUID bit is set.')
  if (special.sgid) parts.push('SetGID bit is set.')
  if (special.sticky) parts.push('Sticky bit is set.')
  return parts.join(' ')
}

function applyOctal(value: string): { special: Special; owner: PermSet; group: PermSet; others: PermSet } | null {
  const cleaned = value.replace(/^0+/, '') || '0'
  if (!/^\d{3,4}$/.test(cleaned)) return null
  let specDigit = 0, ownerDigit: number, groupDigit: number, othersDigit: number
  if (cleaned.length === 4) {
    specDigit = parseInt(cleaned[0]!); ownerDigit = parseInt(cleaned[1]!); groupDigit = parseInt(cleaned[2]!); othersDigit = parseInt(cleaned[3]!)
  } else {
    ownerDigit = parseInt(cleaned[0]!); groupDigit = parseInt(cleaned[1]!); othersDigit = parseInt(cleaned[2]!)
  }
  if ([specDigit, ownerDigit, groupDigit, othersDigit].some(d => d > 7)) return null
  return {
    special: { suid: !!(specDigit & 4), sgid: !!(specDigit & 2), sticky: !!(specDigit & 1) },
    owner: intToPerm(ownerDigit),
    group: intToPerm(groupDigit),
    others: intToPerm(othersDigit),
  }
}

function applySymbolic(value: string): { owner: PermSet; group: PermSet; others: PermSet } | null {
  if (!/^[rwxsStT-]{9}$/.test(value)) return null
  const parse = (chars: string): PermSet => ({
    r: chars[0] === 'r',
    w: chars[1] === 'w',
    x: chars[2] === 'x' || chars[2] === 's' || chars[2] === 't',
  })
  return {
    owner: parse(value.slice(0, 3)),
    group: parse(value.slice(3, 6)),
    others: parse(value.slice(6, 9)),
  }
}

export default function ChmodCalculator() {
  const [owner, setOwner] = useState<PermSet>({ r: true, w: true, x: true })
  const [group, setGroup] = useState<PermSet>({ r: true, w: false, x: true })
  const [others, setOthers] = useState<PermSet>({ r: true, w: false, x: false })
  const [special, setSpecial] = useState<Special>({ suid: false, sgid: false, sticky: false })
  const [octalInput, setOctalInput] = useState('')
  const [symbolicInput, setSymbolicInput] = useState('')
  const [octalError, setOctalError] = useState('')
  const [symbolicError, setSymbolicError] = useState('')

  const octal = calcOctal(special, owner, group, others)
  const symbolic = calcSymbolic(special, owner, group, others)
  const absolute = calcAbsolute(owner, group, others)
  const description = calcDescription(special, owner, group, others)

  function handleOctalInput(val: string) {
    setOctalInput(val)
    if (!val.trim()) { setOctalError(''); return }
    const result = applyOctal(val)
    if (!result) { setOctalError('Invalid octal (e.g. 755 or 4755)'); return }
    setOctalError('')
    setSpecial(result.special)
    setOwner(result.owner)
    setGroup(result.group)
    setOthers(result.others)
  }

  function handleSymbolicInput(val: string) {
    setSymbolicInput(val)
    if (!val.trim()) { setSymbolicError(''); return }
    const result = applySymbolic(val)
    if (!result) { setSymbolicError('Invalid symbolic (e.g. rwxr-xr-x)'); return }
    setSymbolicError('')
    setOwner(result.owner)
    setGroup(result.group)
    setOthers(result.others)
  }

  function applyPreset(octalStr: string) {
    const result = applyOctal(octalStr)
    if (!result) return
    setSpecial(result.special)
    setOwner(result.owner)
    setGroup(result.group)
    setOthers(result.others)
    setOctalInput('')
    setSymbolicInput('')
    setOctalError('')
    setSymbolicError('')
  }

  function PermPanel({ label, perm, onChange }: { label: string; perm: PermSet; onChange: (p: PermSet) => void }) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{label}</div>
        <div className="space-y-2">
          {(['r', 'w', 'x'] as const).map(bit => (
            <label key={bit} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={perm[bit]}
                onChange={e => onChange({ ...perm, [bit]: e.target.checked })}
                className="rounded"
              />
              <span className="font-mono">{bit}</span>
              <span className="text-xs text-gray-400">{bit === 'r' ? 'Read (4)' : bit === 'w' ? 'Write (2)' : 'Execute (1)'}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="font-mono text-2xl font-bold text-primary-600 dark:text-primary-400">{permToInt(perm)}</span>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400 ml-2">{permToSymbol(perm)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="tool-label">Presets:</span>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p.octal)} className="btn-secondary text-xs px-2 py-1">
            {p.label}
          </button>
        ))}
      </div>

      {/* Permission panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PermPanel label="Owner (u)" perm={owner} onChange={setOwner} />
        <PermPanel label="Group (g)" perm={group} onChange={setGroup} />
        <PermPanel label="Others (o)" perm={others} onChange={setOthers} />
      </div>

      {/* Special bits */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Special Bits</div>
        <div className="flex gap-6 flex-wrap">
          {[
            { key: 'suid', label: 'SetUID (4)', desc: 'Run as file owner' },
            { key: 'sgid', label: 'SetGID (2)', desc: 'Run as group' },
            { key: 'sticky', label: 'Sticky Bit (1)', desc: 'Only owner can delete' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={special[key as keyof Special]}
                onChange={e => setSpecial({ ...special, [key]: e.target.checked })}
                className="rounded"
              />
              <span>{label}</span>
              <span className="text-xs text-gray-400">({desc})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Output</div>
        {[
          { label: 'Octal', value: octal },
          { label: 'Symbolic', value: symbolic },
          { label: 'Absolute symbolic', value: absolute },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-36">{label}</span>
            <code className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1 flex-1">
              {value}
            </code>
            <CopyButton text={value} toast={`${label} copied`} />
          </div>
        ))}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-lg px-3 py-2">
          {description}
        </div>
      </div>

      {/* Reverse inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="tool-label block mb-1">Parse Octal (e.g. 755)</label>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="755"
            value={octalInput}
            onChange={e => handleOctalInput(e.target.value)}
          />
          {octalError && (
            <p className="tool-msg tool-msg--error">
              {octalError}
            </p>
          )}
        </div>
        <div>
          <label className="tool-label block mb-1">Parse Symbolic (e.g. rwxr-xr-x)</label>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="rwxr-xr-x"
            value={symbolicInput}
            onChange={e => handleSymbolicInput(e.target.value)}
          />
          {symbolicError && (
            <p className="tool-msg tool-msg--error">
              {symbolicError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
