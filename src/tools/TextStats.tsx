import { useMemo } from 'react'
import { useState } from 'react'
import {
  Type, Hash, AlignLeft, Clock, BookOpen, Mic, Star, Layers
} from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
}

function readingTime(words: number, wpm: number): string {
  const totalSecs = Math.round((words / wpm) * 60)
  if (totalSecs < 60) return `${totalSecs}s`
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function TextStats() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How valiantly did brave King Richard fight! The five boxing wizards jump quickly.')

  const stats = useMemo(() => {
    const text = input

    const charCount = text.length
    const charNoSpaces = text.replace(/\s/g, '').length

    const wordMatches = text.match(/\b\S+\b/g) ?? []
    const wordCount = wordMatches.length

    // Sentences: end with . ! ? (accounting for abbreviations imperfectly)
    const sentenceMatches = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : []
    const sentenceCount = sentenceMatches.length

    // Paragraphs: separated by blank lines or just single blocks
    const paragraphMatches = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : []
    const paragraphCount = paragraphMatches.length

    const lineMatches = text.split('\n')
    const lineCount = lineMatches.length
    const nonEmptyLines = lineMatches.filter(l => l.trim().length > 0).length

    const totalCharInWords = wordMatches.reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, '').length, 0)
    const avgWordLength = wordCount > 0 ? (totalCharInWords / wordCount).toFixed(1) : '0'
    const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0'

    // Unique words
    const uniqueWords = new Set(wordMatches.map(w => w.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')))
    uniqueWords.delete('')
    const uniqueWordCount = uniqueWords.size

    // Top 5 words (excluding very short ones < 3 chars)
    const freq = new Map<string, number>()
    for (const raw of wordMatches) {
      const w = raw.toLowerCase().replace(/[^a-zA-Z]/g, '')
      if (w.length < 3) continue
      freq.set(w, (freq.get(w) ?? 0) + 1)
    }
    const topWords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => `${word} (${count})`)

    return {
      charCount,
      charNoSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      lineCount,
      nonEmptyLines,
      avgWordLength,
      avgSentenceLength,
      uniqueWordCount,
      topWords,
      readTime200: readingTime(wordCount, 200),
      speakTime130: readingTime(wordCount, 130),
    }
  }, [input])

  const isEmpty = !input.trim()

  const cards: StatCard[] = [
    {
      icon: <Hash size={15} />,
      label: 'Characters',
      value: stats.charCount.toLocaleString(),
      sub: `${stats.charNoSpaces.toLocaleString()} without spaces`,
      color: 'text-blue-500',
    },
    {
      icon: <Type size={15} />,
      label: 'Words',
      value: stats.wordCount.toLocaleString(),
      sub: `${stats.uniqueWordCount.toLocaleString()} unique`,
      color: 'text-violet-500',
    },
    {
      icon: <AlignLeft size={15} />,
      label: 'Sentences',
      value: stats.sentenceCount.toLocaleString(),
      sub: `~${stats.avgSentenceLength} words/sentence`,
      color: 'text-emerald-500',
    },
    {
      icon: <Layers size={15} />,
      label: 'Paragraphs',
      value: stats.paragraphCount.toLocaleString(),
      sub: '',
      color: 'text-orange-500',
    },
    {
      icon: <AlignLeft size={15} />,
      label: 'Lines',
      value: stats.lineCount.toLocaleString(),
      sub: `${stats.nonEmptyLines.toLocaleString()} non-empty`,
      color: 'text-teal-500',
    },
    {
      icon: <BookOpen size={15} />,
      label: 'Avg Word Length',
      value: `${stats.avgWordLength} chars`,
      sub: '',
      color: 'text-pink-500',
    },
    {
      icon: <Clock size={15} />,
      label: 'Reading Time',
      value: isEmpty ? '—' : stats.readTime200,
      sub: '@ 200 wpm',
      color: 'text-amber-500',
    },
    {
      icon: <Mic size={15} />,
      label: 'Speaking Time',
      value: isEmpty ? '—' : stats.speakTime130,
      sub: '@ 130 wpm',
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">Input Text</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste or type your text here — stats update live..."
          className="h-44"
          accept="text/*"
        />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-1"
          >
            <div className={`flex items-center gap-1.5 ${card.color} mb-1`}>
              {card.icon}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-tight">
              {card.value}
            </div>
            {card.sub && (
              <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{card.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Top words */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={13} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Most Common Words (top 5, min 3 chars)
          </h3>
        </div>
        {stats.topWords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stats.topWords.map((w, i) => (
              <span
                key={w}
                className={`px-2.5 py-1 rounded-full text-sm font-mono font-medium border ${
                  i === 0
                    ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : i === 1
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {w}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-600">
            {isEmpty ? 'Enter text above to see statistics.' : 'No words long enough to rank.'}
          </p>
        )}
      </div>
    </div>
  )
}
