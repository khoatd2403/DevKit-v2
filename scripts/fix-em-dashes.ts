import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = join(__dirname, '../src/content/blog')

function fixContent(text: string): string {
  const lines = text.split('\n')
  let inCodeFence = false

  return lines.map(line => {
    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence
      return line
    }
    if (inCodeFence) return line

    let out = line

    // Pattern A: `**Label** — definition` → `**Label**: definition`
    out = out.replace(/(\*\*[^*\n]+?\*\*)\s+—\s+/g, '$1: ')

    // Pattern B: any-char + ` — ` + Capital → period split
    out = out.replace(/([a-z0-9.,;)\]"'`}])\s+—\s+([A-Z])/g, '$1. $2')

    // Pattern C: any-char + ` — ` + lowercase → comma
    out = out.replace(/([a-z0-9.,;)\]"'`}])\s+—\s+([a-z])/g, '$1, $2')

    // Pattern D: cleanup any leftover " , " (space-comma-space) that snuck in from previous runs
    // — but only outside inline code (rough check: skip if inside backticks)
    const inlineCodeSpans: { start: number; end: number }[] = []
    const codeRe = /`[^`]*`/g
    let m: RegExpExecArray | null
    while ((m = codeRe.exec(out)) !== null) {
      inlineCodeSpans.push({ start: m.index, end: m.index + m[0].length })
    }
    function isInsideCode(idx: number): boolean {
      return inlineCodeSpans.some(s => idx >= s.start && idx < s.end)
    }
    out = out.replace(/(\S) , /g, (match, p1, offset) => {
      if (isInsideCode(offset)) return match
      return `${p1}, `
    })

    // Pattern E: "( ," → " , " edge case where em-dash was after a quote or special
    // Already covered by D essentially.

    return out
  }).join('\n')
}

const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

let totalBefore = 0
let totalAfter = 0
let cleanupCount = 0

for (const file of files) {
  const path = join(BLOG_DIR, file)
  const original = readFileSync(path, 'utf-8')
  const before = (original.match(/—/g) || []).length
  const cleanupBefore = (original.match(/\S , /g) || []).length

  const result = fixContent(original)

  const after = (result.match(/—/g) || []).length
  const cleanupAfter = (result.match(/\S , /g) || []).length

  if (result !== original) {
    writeFileSync(path, result)
  }

  totalBefore += before
  totalAfter += after
  cleanupCount += (cleanupBefore - cleanupAfter)
}

console.log(`em-dash: ${totalBefore} → ${totalAfter}`)
console.log(`fixed " , " patterns: ${cleanupCount}`)
