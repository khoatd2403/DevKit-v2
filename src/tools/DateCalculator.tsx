import { useState } from 'react'
import CopyButton from '../components/CopyButton'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function rangeHasLeapYear(d1: Date, d2: Date): boolean {
  const start = Math.min(d1.getFullYear(), d2.getFullYear())
  const end = Math.max(d1.getFullYear(), d2.getFullYear())
  for (let y = start; y <= end; y++) {
    if (isLeapYear(y)) return true
  }
  return false
}

function dateDiff(d1: Date, d2: Date) {
  const [earlier, later] = d1 <= d2 ? [d1, d2] : [d2, d1]
  const msPerDay = 86400000
  const totalDays = Math.round((later.getTime() - earlier.getTime()) / msPerDay)
  const weeks = Math.floor(totalDays / 7)
  const approxMonths = Math.floor(totalDays / 30.4375)
  const approxYears = Math.floor(totalDays / 365.25)

  // Exact breakdown: years, months, days
  let y = later.getFullYear() - earlier.getFullYear()
  let m = later.getMonth() - earlier.getMonth()
  let day = later.getDate() - earlier.getDate()
  if (day < 0) {
    m--
    // days in the previous month of "later"
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0)
    day += prevMonth.getDate()
  }
  if (m < 0) { y--; m += 12 }

  return { totalDays, weeks, approxMonths, approxYears, years: y, months: m, days: day, earlier, later }
}

function addToDate(date: Date, value: number, unit: string, op: 'add' | 'subtract'): Date {
  const n = op === 'add' ? value : -value
  const result = new Date(date)
  if (unit === 'days') result.setDate(result.getDate() + n)
  else if (unit === 'weeks') result.setDate(result.getDate() + n * 7)
  else if (unit === 'months') result.setMonth(result.getMonth() + n)
  else if (unit === 'years') result.setFullYear(result.getFullYear() + n)
  return result
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysFromToday(d: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export default function DateCalculator() {
  const [mode, setMode] = useState<'diff' | 'add'>('diff')

  // Diff mode
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')

  // Add/subtract mode
  const [startDate, setStartDate] = useState('')
  const [amount, setAmount] = useState('7')
  const [unit, setUnit] = useState('days')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')

  const diffResult = (() => {
    if (!date1 || !date2) return null
    const d1 = new Date(date1 + 'T00:00:00')
    const d2 = new Date(date2 + 'T00:00:00')
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null
    return dateDiff(d1, d2)
  })()

  const addResult = (() => {
    if (!startDate || !amount) return null
    const d = new Date(startDate + 'T00:00:00')
    const n = parseInt(amount)
    if (isNaN(d.getTime()) || isNaN(n)) return null
    return addToDate(d, n, unit, operation)
  })()

  const tabs = [
    { key: 'diff', label: 'Date Difference' },
    { key: 'add', label: 'Add / Subtract' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`px-4 py-1.5 transition-colors ${mode === t.key ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Start Date</label>
              <input
                type="date"
                className="tool-textarea h-auto py-2 w-full"
                value={date1}
                onChange={e => setDate1(e.target.value)}
              />
              {date1 && !isNaN(new Date(date1 + 'T00:00:00').getTime()) && (
                <div className="text-xs text-gray-400 mt-1 pl-1">{DAYS[new Date(date1 + 'T00:00:00').getDay()]}</div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">End Date</label>
              <input
                type="date"
                className="tool-textarea h-auto py-2 w-full"
                value={date2}
                onChange={e => setDate2(e.target.value)}
              />
              {date2 && !isNaN(new Date(date2 + 'T00:00:00').getTime()) && (
                <div className="text-xs text-gray-400 mt-1 pl-1">{DAYS[new Date(date2 + 'T00:00:00').getDay()]}</div>
              )}
            </div>
          </div>

          {diffResult && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Difference</div>
              <div className="text-2xl font-bold font-mono text-primary-600 dark:text-primary-400">
                {diffResult.years > 0 && <span>{diffResult.years}y </span>}
                {diffResult.months > 0 && <span>{diffResult.months}mo </span>}
                <span>{diffResult.days}d</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Days', value: diffResult.totalDays.toLocaleString() },
                  { label: 'Weeks', value: diffResult.weeks.toLocaleString() },
                  { label: 'Approx. Months', value: diffResult.approxMonths.toLocaleString() },
                  { label: 'Approx. Years', value: diffResult.approxYears.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                    <div className="font-mono font-semibold text-gray-800 dark:text-gray-200">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>
                  {DAYS[diffResult.earlier.getDay()]}, {formatDate(diffResult.earlier)}
                  {' → '}
                  {DAYS[diffResult.later.getDay()]}, {formatDate(diffResult.later)}
                </span>
                {rangeHasLeapYear(diffResult.earlier, diffResult.later) && (
                  <span className="ml-auto text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                    Includes leap year
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'add' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Start Date</label>
            <input
              type="date"
              className="tool-textarea h-auto py-2 w-full"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Operation</label>
              <select
                className="tool-textarea h-auto py-2 w-full"
                value={operation}
                onChange={e => setOperation(e.target.value as 'add' | 'subtract')}
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Amount</label>
              <input
                type="number"
                min="0"
                className="tool-textarea h-auto py-2 w-full"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit</label>
              <select
                className="tool-textarea h-auto py-2 w-full"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {addResult && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Result</div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">{formatDate(addResult)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{DAYS[addResult.getDay()]}</div>
                </div>
                <CopyButton text={formatDate(addResult)} />
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 text-sm text-gray-500 dark:text-gray-400">
                {(() => {
                  const diff = daysFromToday(addResult)
                  if (diff === 0) return 'That is today'
                  if (diff === 1) return '1 day from today'
                  if (diff === -1) return '1 day ago'
                  if (diff > 0) return `${diff.toLocaleString()} days from today`
                  return `${Math.abs(diff).toLocaleString()} days ago`
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
