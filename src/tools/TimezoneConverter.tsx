import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import { ArrowLeftRight, Clock } from 'lucide-react'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

function getUtcOffset(tz: string, date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
    const parts = formatter.formatToParts(date)
    const offsetPart = parts.find(p => p.type === 'timeZoneName')
    return offsetPart ? offsetPart.value : ''
  } catch {
    return ''
  }
}

function getDisplayLabel(tz: string, date: Date): string {
  const offset = getUtcOffset(tz, date)
  const city = tz.includes('/') ? tz.split('/').pop()!.replace(/_/g, ' ') : tz
  return `${offset} — ${city}`
}

function formatDatetime(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)
  } catch {
    return 'Invalid'
  }
}

function toLocalInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function TimezoneConverter() {
  const [datetime, setDatetime] = useState(toLocalInputValue(new Date()))
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState('America/New_York')
  const [result, setResult] = useState<{ converted: string; fromOffset: string; toOffset: string } | null>(null)
  const [error, setError] = useState('')

  const convert = () => {
    if (!datetime) { setError('Please enter a date and time.'); return }
    try {
      // Parse the datetime-local value as if it's in the "from" timezone.
      // Strategy: format a known UTC date in the from-tz and use the offset to adjust.
      const localDate = new Date(datetime)
      if (isNaN(localDate.getTime())) { setError('Invalid date/time.'); return }

      // Get the UTC offset of fromTz at this moment in minutes
      const fromOffset = getUtcOffsetMinutes(fromTz, localDate)
      const toOffset = getUtcOffsetMinutes(toTz, localDate)

      // Interpret datetime as fromTz wall-clock time → convert to UTC → then to toTz
      // datetime-local gives us a local (browser) time; we need to treat it as fromTz time
      // Approach: find the UTC time that corresponds to the wall-clock in fromTz
      const browserOffsetMinutes = -localDate.getTimezoneOffset()
      const utcMs = localDate.getTime() - (fromOffset - browserOffsetMinutes) * 60000
      const utcDate = new Date(utcMs)

      const converted = formatDatetime(utcDate, toTz)
      const fromOffsetStr = getUtcOffset(fromTz, utcDate)
      const toOffsetStr = getUtcOffset(toTz, utcDate)

      setResult({ converted, fromOffset: fromOffsetStr, toOffset: toOffsetStr })
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function getUtcOffsetMinutes(tz: string, date: Date): number {
    try {
      // Use Intl to figure out what the UTC offset is for this tz
      const utcFormatter = new Intl.DateTimeFormat('en', {
        timeZone: 'UTC',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })
      const tzFormatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })
      const utcParts = utcFormatter.formatToParts(date)
      const tzParts = tzFormatter.formatToParts(date)
      const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
        parseInt(parts.find(p => p.type === type)?.value ?? '0')

      const utcMins = get(utcParts, 'hour') * 60 + get(utcParts, 'minute')
      const tzMins = get(tzParts, 'hour') * 60 + get(tzParts, 'minute')
      let diff = tzMins - utcMins
      // Handle day boundary
      if (diff > 720) diff -= 1440
      if (diff < -720) diff += 1440
      return diff
    } catch {
      return 0
    }
  }

  const swap = () => {
    setFromTz(toTz)
    setToTz(fromTz)
    setResult(null)
  }

  const useNow = () => {
    setDatetime(toLocalInputValue(new Date()))
    setResult(null)
  }

  const refDate = new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={useNow} className="btn-secondary flex items-center gap-1.5">
          <Clock size={13} /> Use Current Time
        </button>
        <button onClick={convert} className="btn-primary ml-auto">Convert</button>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Date &amp; Time</label>
        <input
          type="datetime-local"
          className="tool-textarea h-auto py-2 w-full"
          value={datetime}
          onChange={e => { setDatetime(e.target.value); setResult(null) }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">From Timezone</label>
          <select
            className="tool-textarea h-auto py-2 w-full"
            value={fromTz}
            onChange={e => { setFromTz(e.target.value); setResult(null) }}
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{getDisplayLabel(tz, refDate)}</option>
            ))}
          </select>
        </div>
        <button
          onClick={swap}
          className="btn-ghost flex items-center justify-center gap-1 px-3 py-2 self-end"
          title="Swap timezones"
        >
          <ArrowLeftRight size={15} />
        </button>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">To Timezone</label>
          <select
            className="tool-textarea h-auto py-2 w-full"
            value={toTz}
            onChange={e => { setToTz(e.target.value); setResult(null) }}
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{getDisplayLabel(tz, refDate)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Result</div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">{result.converted}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{toTz} &nbsp;·&nbsp; {result.toOffset}</div>
            </div>
            <CopyButton text={result.converted} />
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">From offset</div>
              <div className="font-mono text-gray-700 dark:text-gray-300">{result.fromOffset}</div>
              <div className="text-xs text-gray-400 mt-0.5">{fromTz}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">To offset</div>
              <div className="font-mono text-gray-700 dark:text-gray-300">{result.toOffset}</div>
              <div className="text-xs text-gray-400 mt-0.5">{toTz}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
