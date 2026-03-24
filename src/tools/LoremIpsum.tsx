import { useState } from 'react'
import CopyButton from '../components/CopyButton'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function randomWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]! }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function genParagraph(sentenceCount = 5) {
  return Array.from({ length: sentenceCount }, () => {
    const len = 8 + Math.floor(Math.random() * 10)
    const words = Array.from({ length: len }, randomWord)
    return capitalize(words.join(' ')) + '.'
  }).join(' ')
}

export default function LoremIpsum() {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState('')
  const [startWithLorem, setStartWithLorem] = useState(true)

  const generate = () => {
    let text = ''
    if (type === 'paragraphs') {
      const paras = Array.from({ length: count }, (_, i) => {
        const p = genParagraph()
        return i === 0 && startWithLorem ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + p : p
      })
      text = paras.join('\n\n')
    } else if (type === 'sentences') {
      const sents = Array.from({ length: count }, (_, i) => {
        const len = 8 + Math.floor(Math.random() * 10)
        const words = Array.from({ length: len }, randomWord)
        const s = capitalize(words.join(' ')) + '.'
        return i === 0 && startWithLorem ? 'Lorem ipsum dolor sit amet. ' : s
      })
      text = sents.join(' ')
    } else {
      const words = Array.from({ length: count }, (_, i) => i === 0 && startWithLorem ? 'Lorem' : randomWord())
      text = words.join(' ')
    }
    setOutput(text)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="tool-tabs">
          {(['paragraphs', 'sentences', 'words'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`tool-tab capitalize ${type === t ? 'active' : ''}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Count:</label>
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(+e.target.value)} className="w-16 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)} className="accent-primary-600" />
          Start with "Lorem ipsum"
        </label>
        <button onClick={generate} className="btn-primary">Generate</button>
      </div>

      {output && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{output.split(/\s+/).length} words, {output.length} chars</span>
            <CopyButton text={output} toast="Lorem ipsum copied" />
          </div>
          <textarea className="tool-textarea-output h-64" readOnly value={output} />
        </>
      )}
    </div>
  )
}
