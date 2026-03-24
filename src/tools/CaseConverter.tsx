import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'

const converters: { label: string; fn: (s: string) => string }[] = [
  { label: 'camelCase', fn: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { label: 'PascalCase', fn: s => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase()) },
  { label: 'snake_case', fn: s => s.replace(/\W+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() },
  { label: 'SCREAMING_SNAKE', fn: s => s.replace(/\W+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase() },
  { label: 'kebab-case', fn: s => s.replace(/\W+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() },
  { label: 'UPPER CASE', fn: s => s.toUpperCase() },
  { label: 'lower case', fn: s => s.toLowerCase() },
  { label: 'Title Case', fn: s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
  { label: 'Sentence case', fn: s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { label: 'dot.case', fn: s => s.replace(/\W+/g, '.').replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase() },
  { label: 'path/case', fn: s => s.replace(/\W+/g, '/').replace(/([a-z])([A-Z])/g, '$1/$2').toLowerCase() },
  { label: 'sPoNgEcAsE', fn: s => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
]

export default function CaseConverter() {
  const [input, setInput] = useState('hello world this is a case converter example')
  useShareableState(input, setInput)

  return (
    <div className="space-y-4">
      <div>
        <label className="tool-label block mb-1">Input Text</label>
        <FileDropTextarea className="h-24" placeholder="Enter your text here..." value={input} onChange={setInput} accept="text/*" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {converters.map(({ label, fn }) => {
          const result = input ? fn(input) : ''
          return (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 font-mono">{label}</span>
                <CopyButton text={result} toast={`${label} copied`} />
              </div>
              <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all min-h-[20px]">{result}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
