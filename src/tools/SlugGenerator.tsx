import { useState } from 'react'
import CopyButton from '../components/CopyButton'

interface Options {
  separator: '-' | '_'
  lowercase: boolean
  removeAccents: boolean
  truncate: boolean
  maxLength: number
}

function generateSlug(text: string, opts: Options): string {
  let s = text

  if (opts.removeAccents) {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  if (opts.lowercase) {
    s = s.toLowerCase()
  }

  // Replace non-alphanumeric characters with separator
  s = s
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .replace(/[\s\-_]+/g, opts.separator)

  if (opts.truncate && s.length > opts.maxLength) {
    s = s.slice(0, opts.maxLength)
    // Avoid ending with a separator
    s = s.replace(new RegExp(`[${opts.separator}]+$`), '')
  }

  return s
}

export default function SlugGenerator() {
  const [input, setInput] = useState('Hello World! This is a Sample Blog Post Title')
  const [options, setOptions] = useState<Options>({
    separator: '-',
    lowercase: true,
    removeAccents: true,
    truncate: false,
    maxLength: 100,
  })

  const slug = input ? generateSlug(input, options) : ''

  const setOpt = <K extends keyof Options>(key: K, value: Options[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Input Text
        </label>
        <textarea
          className="tool-textarea h-24"
          placeholder="Enter text to slugify, e.g. Hello World! My Title Here"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Options</p>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {/* Separator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Separator:</span>
            <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
              {(['-', '_'] as const).map(sep => (
                <button
                  key={sep}
                  onClick={() => setOpt('separator', sep)}
                  className={`px-3 py-1 font-mono transition-colors ${options.separator === sep ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {sep === '-' ? 'hyphen (-)' : 'underscore (_)'}
                </button>
              ))}
            </div>
          </div>

          {/* Lowercase */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary-600"
              checked={options.lowercase}
              onChange={e => setOpt('lowercase', e.target.checked)}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Lowercase</span>
          </label>

          {/* Remove accents */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary-600"
              checked={options.removeAccents}
              onChange={e => setOpt('removeAccents', e.target.checked)}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Remove accents / diacritics</span>
          </label>

          {/* Truncate */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary-600"
              checked={options.truncate}
              onChange={e => setOpt('truncate', e.target.checked)}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Truncate to max length</span>
          </label>

          {options.truncate && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Max chars:</span>
              <input
                type="number"
                min={1}
                max={9999}
                className="w-20 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={options.maxLength}
                onChange={e => setOpt('maxLength', Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Slug Output
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {slug.length} char{slug.length !== 1 ? 's' : ''}
            </span>
            <CopyButton text={slug} />
          </div>
        </div>
        <input
          type="text"
          readOnly
          value={slug}
          placeholder="Slug will appear here..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm focus:outline-none"
        />
      </div>
    </div>
  )
}
