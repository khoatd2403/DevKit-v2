import { writeFileSync, chmodSync, existsSync } from 'fs'
import { join } from 'path'

if (!existsSync('.git')) {
  console.log('Not a git repo, skipping hooks setup')
  process.exit(0)
}

const hook = `#!/bin/sh
LOCK=".git/changelog-hook.lock"
if [ -f "$LOCK" ]; then exit 0; fi
touch "$LOCK"

MSG=$(git log -1 --pretty=%B)
npx tsx scripts/update-changelog-entry.ts "$MSG"

if [ -n "$(git diff public/changelog.json)" ]; then
  git add public/changelog.json
  git commit --amend --no-edit --no-verify
fi

rm -f "$LOCK"
`

const hookPath = join('.git', 'hooks', 'post-commit')
writeFileSync(hookPath, hook)
try { chmodSync(hookPath, 0o755) } catch {}
console.log('Git post-commit hook installed')
