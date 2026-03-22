import { readFileSync, writeFileSync } from 'fs'

type ChangeType = 'new' | 'fix' | 'improvement' | 'design'

const TYPE_MAP: Record<string, ChangeType> = {
  feat: 'new', feature: 'new', new: 'new', add: 'new',
  fix: 'fix', bug: 'fix', hotfix: 'fix',
  improve: 'improvement', improvement: 'improvement', perf: 'improvement', refactor: 'improvement', update: 'improvement',
  design: 'design', ui: 'design', style: 'design',
}

function parseCommit(msg: string): { type: ChangeType; text: string } | null {
  const match = msg.trim().match(/^(\w+):\s*(.+)/)
  if (!match) return null
  const type = TYPE_MAP[match[1].toLowerCase()]
  if (!type) return null
  return { type, text: match[2].trim() }
}

const commitMsg = process.argv[2] ?? ''
const change = parseCommit(commitMsg)

if (!change) {
  console.log('Skipping changelog: no conventional commit format detected')
  process.exit(0)
}

const changelogPath = 'public/changelog.json'
const changelog = JSON.parse(readFileSync(changelogPath, 'utf-8'))
const currentDate = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

const alreadyExists = changelog[0]?.changes?.some(
  (c: { type: string; text: string }) => c.text === change.text
)
if (alreadyExists) {
  console.log('Skipping changelog: entry already exists')
  process.exit(0)
}

if (changelog.length > 0 && changelog[0].date === currentDate) {
  changelog[0].changes.unshift(change)
} else {
  changelog.unshift({ date: currentDate, changes: [change] })
}

writeFileSync(changelogPath, JSON.stringify(changelog, null, 2))
console.log(`Changelog updated: [${change.type}] ${change.text}`)
