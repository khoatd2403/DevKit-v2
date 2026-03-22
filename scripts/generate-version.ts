import { writeFileSync, readFileSync } from 'fs'

const changelog = JSON.parse(readFileSync('public/changelog.json', 'utf-8'))
const version = `v1.${changelog.length + 1}`

writeFileSync('src/version.ts', `export const LATEST_VERSION = '${version}'\n`)
console.log(`Version: ${version}`)
