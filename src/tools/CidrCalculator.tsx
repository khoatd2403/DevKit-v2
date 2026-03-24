import { useState, useMemo } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Network, AlertCircle } from 'lucide-react'
import CopyButton from '../components/CopyButton'

// ---------------------------------------------------------------------------
// Pure IPv4 maths
// ---------------------------------------------------------------------------

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IP address: ${ip}`)
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.')
}

function intToHex(n: number): string {
  return '0x' + n.toString(16).padStart(8, '0').toUpperCase()
}

function toBinaryIp(n: number): string {
  return [
    ((n >>> 24) & 0xff).toString(2).padStart(8, '0'),
    ((n >>> 16) & 0xff).toString(2).padStart(8, '0'),
    ((n >>> 8) & 0xff).toString(2).padStart(8, '0'),
    (n & 0xff).toString(2).padStart(8, '0'),
  ].join('.')
}

function prefixToMask(prefix: number): number {
  if (prefix === 0) return 0
  return (0xffffffff << (32 - prefix)) >>> 0
}

function maskToPrefix(mask: number): number {
  // Count leading 1-bits
  let m = mask >>> 0
  let count = 0
  while (m & 0x80000000) { count++; m = (m << 1) >>> 0 }
  // Validate: rest should be all zeros
  if ((m >>> 0) !== 0) throw new Error('Not a valid contiguous subnet mask')
  return count
}

function ipClass(ip: number): string {
  const firstOctet = (ip >>> 24) & 0xff
  if (firstOctet < 128) return 'A'
  if (firstOctet < 192) return 'B'
  if (firstOctet < 224) return 'C'
  if (firstOctet < 240) return 'D (Multicast)'
  return 'E (Reserved)'
}

// ---------------------------------------------------------------------------
// Parser: accepts CIDR ("192.168.1.0/24") or IP + mask ("192.168.1.0 255.255.255.0")
// ---------------------------------------------------------------------------
interface CidrInfo {
  networkAddr: string
  broadcastAddr: string
  subnetMask: string
  subnetMaskHex: string
  wildcardMask: string
  firstHost: string
  lastHost: string
  totalHosts: string
  usableHosts: string
  prefix: number
  ipClass: string
  networkBinary: string
  maskBinary: string
  inputIp: string
}

function parseCidr(raw: string): CidrInfo {
  raw = raw.trim()

  let ipInt: number
  let prefix: number

  // CIDR notation: a.b.c.d/n
  if (raw.includes('/')) {
    const [ipPart, prefixPart] = raw.split('/')
    prefix = parseInt(prefixPart, 10)
    if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error('Prefix must be 0–32')
    ipInt = ipToInt(ipPart.trim())
  } else {
    // IP + mask separated by space or comma
    const parts = raw.split(/[\s,]+/)
    if (parts.length < 2) throw new Error('Enter CIDR (e.g. 192.168.1.0/24) or IP + mask')
    ipInt = ipToInt(parts[0])
    const maskInt = ipToInt(parts[1])
    prefix = maskToPrefix(maskInt)
  }

  const maskInt = prefixToMask(prefix)
  const networkInt = (ipInt & maskInt) >>> 0
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0
  const wildcardInt = (~maskInt) >>> 0

  const totalHosts = Math.pow(2, 32 - prefix)
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2)

  const firstHostInt = prefix >= 31 ? networkInt : (networkInt + 1) >>> 0
  const lastHostInt = prefix >= 31 ? broadcastInt : (broadcastInt === 0 ? 0 : broadcastInt - 1)

  return {
    networkAddr: intToIp(networkInt),
    broadcastAddr: intToIp(broadcastInt),
    subnetMask: intToIp(maskInt),
    subnetMaskHex: intToHex(maskInt),
    wildcardMask: intToIp(wildcardInt),
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    totalHosts: totalHosts.toLocaleString(),
    usableHosts: usableHosts.toLocaleString(),
    prefix,
    ipClass: ipClass(networkInt),
    networkBinary: toBinaryIp(networkInt),
    maskBinary: toBinaryIp(maskInt),
    inputIp: intToIp(ipInt),
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
interface InfoRowProps {
  label: string
  value: string
  mono?: boolean
  copyable?: boolean
  muted?: boolean
}

function InfoRow({ label, value, mono = false, copyable = false, muted = false }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={`text-sm text-right break-all ${
            mono ? 'font-mono' : 'font-medium'
          } ${muted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}
        >
          {value}
        </span>
        {copyable && <CopyButton text={value} toast="Value copied" className="shrink-0" />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CidrCalculator() {
  const [raw, setRaw] = usePersistentState('tool-cidr-input', '192.168.1.0/24')

  const { info, error } = useMemo<{ info: CidrInfo | null; error: string }>(() => {
    if (!raw.trim()) return { info: null, error: '' }
    try {
      return { info: parseCidr(raw), error: '' }
    } catch (e) {
      return { info: null, error: (e as Error).message }
    }
  }, [raw])

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Input */}
      <div>
        <label htmlFor="cidr-input" className="label-text block mb-1">
          CIDR Notation or IP + Subnet Mask
        </label>
        <div className="flex gap-2">
          <input
            id="cidr-input"
            type="text"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="192.168.1.0/24  or  10.0.0.0 255.0.0.0"
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            spellCheck={false}
          />
          {raw && (
            <button
              onClick={() => setRaw('')}
              className="btn-secondary text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2 mt-2">
          {['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.100.0/26', '0.0.0.0/0'].map(ex => (
            <button
              key={ex}
              onClick={() => setRaw(ex)}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {info && (
        <div className="space-y-4">
          {/* Header badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-lg px-3 py-1.5">
              <Network size={15} />
              {info.inputIp}/{info.prefix}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Class <span className="font-semibold text-gray-700 dark:text-gray-200">{info.ipClass}</span>
            </span>
          </div>

          {/* Main info card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 divide-y-0">
            <InfoRow label="Network Address" value={info.networkAddr} mono copyable />
            <InfoRow label="Broadcast Address" value={info.broadcastAddr} mono copyable />
            <InfoRow label="Subnet Mask" value={`${info.subnetMask}  (${info.subnetMaskHex})`} mono copyable={false} />
            <InfoRow label="Wildcard Mask" value={info.wildcardMask} mono />
            <InfoRow label="First Usable Host" value={info.firstHost} mono copyable />
            <InfoRow label="Last Usable Host" value={info.lastHost} mono copyable />
            <InfoRow label="Total Hosts" value={`${info.totalHosts}  (2^${32 - info.prefix})`} />
            <InfoRow label="Usable Hosts" value={info.usableHosts} />
            <InfoRow label="CIDR Prefix" value={`/${info.prefix}`} mono />
            <InfoRow label="IP Class" value={info.ipClass} />
          </div>

          {/* Binary representation */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pt-3 pb-1">
              Binary Representation
            </p>
            <InfoRow
              label="Network"
              value={info.networkBinary}
              mono
              muted={false}
            />
            <InfoRow
              label="Mask"
              value={info.maskBinary}
              mono
              muted
            />
          </div>

          {/* CIDR range summary */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
            Range:{' '}
            <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
              {info.networkAddr}
            </span>
            {' '}&ndash;{' '}
            <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
              {info.broadcastAddr}
            </span>
          </div>
        </div>
      )}

      {!raw.trim() && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
          Enter a CIDR block above to calculate network details
        </div>
      )}
    </div>
  )
}
