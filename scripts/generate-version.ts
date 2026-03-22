import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'

const changelog = JSON.parse(readFileSync('public/changelog.json', 'utf-8'))
const fallbackVersion = changelog[0]?.version ?? 'v1.0'

let version = fallbackVersion
try {
  version = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim()
} catch {}

writeFileSync('src/version.ts', `export const LATEST_VERSION = '${version}'\n`)
console.log(`Version: ${version}`)
