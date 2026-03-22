import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import process from 'node:process'

type ChangeType = 'new' | 'fix' | 'improvement' | 'design'

interface ChangeEntry {
  type: ChangeType
  text: string
}

interface Version {
  version: string
  date: string
  badge?: 'latest' | 'recent'
  changes: ChangeEntry[]
}

function parseType(prefix: string): ChangeType | null {
  const map: Record<string, ChangeType> = {
    feat: 'new',
    feature: 'new',
    new: 'new',
    fix: 'fix',
    bug: 'fix',
    hotfix: 'fix',
    improve: 'improvement',
    improvement: 'improvement',
    perf: 'improvement',
    refactor: 'improvement',
    design: 'design',
    ui: 'design',
    style: 'design',
  }
  return map[prefix.toLowerCase()] ?? null
}

function getTagDate(tag: string): string {
  try {
    const iso = execSync(`git log -1 --format=%ai ${tag}`, { encoding: 'utf-8' }).trim()
    const d = new Date(iso)
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function getCommitsBetween(from: string, to: string): ChangeEntry[] {
  const range = from ? `${from}..${to}` : to
  let log = ''
  try {
    log = execSync(`git log ${range} --pretty=format:"%s" --no-merges`, { encoding: 'utf-8' })
  } catch {
    return []
  }

  const entries: ChangeEntry[] = []
  for (const line of log.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)/)
    if (!match) continue
    const type = parseType(match[1])
    if (!type) continue
    entries.push({ type, text: match[2].trim() })
  }
  return entries
}

// Get all version tags sorted
let tags: string[] = []
try {
  tags = execSync('git tag --sort=-version:refname', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(t => /^v\d/.test(t))
} catch { /* no git tags found */ }

if (tags.length === 0) {
  console.log('No version tags found. Create one with: git tag v1.0')
  process.exit(0)
}

const changelog: Version[] = []

for (let i = 0; i < tags.length; i++) {
  const tag = tags[i]
  const prevTag = tags[i + 1] ?? ''
  const changes = getCommitsBetween(prevTag, tag)
  if (changes.length === 0) continue

  changelog.push({
    version: tag,
    date: getTagDate(tag),
    badge: i === 0 ? 'latest' : i === 1 ? 'recent' : undefined,
    changes,
  })
}

writeFileSync('public/changelog.json', JSON.stringify(changelog, null, 2))
console.log(`Generated changelog with ${changelog.length} versions from git tags`)
