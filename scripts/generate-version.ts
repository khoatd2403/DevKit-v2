import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

let version = 'v1.0'
try {
  version = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim()
} catch {}

writeFileSync('src/version.ts', `export const LATEST_VERSION = '${version}'\n`)
console.log(`Version: ${version}`)
