---
title: "Why Your JSON Has a BOM (Byte Order Mark) and How to Strip It"
slug: "json-bom-byte-order-mark"
description: "Your JSON parser fails at character 0 with no useful error. Odds are it's a UTF-8 BOM. Here's how to detect, strip, and prevent the byte that haunts cross-platform pipelines."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - json bom
  - utf-8 bom
  - byte order mark
  - unexpected character at position 0
  - strip bom javascript
tags:
  - JSON
  - Encoding
  - Problem-solving
cover: "/og-image.svg"
excerpt: "Your JSON parser fails at character 0 and the error message tells you nothing. Nine times out of ten, it's a UTF-8 BOM that some Windows tool added when you weren't looking."
---

You export a CSV from Excel, save it as JSON in your editor, push it to a Linux service, and the parser fails with `Unexpected token in JSON at position 0`. You stare at the file. It looks fine. Notepad shows clean JSON. You re-save it twice.

The bytes lie. There's an invisible three-byte sequence at the start: `EF BB BF`. That's a UTF-8 BOM, and it has been ruining Windows-to-Linux JSON pipelines since the late 90s.

## What's a BOM, actually?

A Byte Order Mark (BOM) is a magic prefix that tells a text reader two things: which UTF encoding the file uses (UTF-8, UTF-16-LE, UTF-16-BE, UTF-32), and which byte order. For UTF-16, it actually matters. For UTF-8, **byte order is meaningless** — bytes are bytes — and the BOM is purely a "this is UTF-8" flag.

The Unicode standard says UTF-8 BOMs are allowed but not required. Some tools add one anyway:

| Tool | Adds UTF-8 BOM? |
|---|---|
| Notepad (classic, pre-Windows 11) | Yes, by default |
| Excel "Save as CSV (UTF-8)" | Yes |
| PowerShell `Out-File -Encoding utf8` (Windows PS 5.1) | Yes |
| PowerShell `Out-File -Encoding utf8` (PS 7+) | No (changed in PS 6) |
| VS Code | Configurable, default no |
| Linux `cat`, `vim`, `nano` | No |
| Most programming languages writing UTF-8 | No |

JSON's spec is unambiguous: **JSON parsers MUST NOT add a BOM, and they MAY treat a leading BOM as an error**. Most parsers accept it, but `JSON.parse` in JavaScript does not:

```js
JSON.parse('﻿{"name":"hello"}')
// SyntaxError: Unexpected token  in JSON at position 0
```

The position is 0 because the BOM is character 0. Useless error. This is the bug.

## Detect a BOM

Three reliable ways:

```js
// In JavaScript, after reading the file
const text = await fs.readFile('data.json', 'utf-8')
const hasBom = text.charCodeAt(0) === 0xFEFF
```

```bash
# In a shell — check for the EF BB BF sequence
head -c 3 data.json | od -An -c
# If you see   357 273 277, that's a BOM.
```

```bash
# Even simpler with file(1)
file data.json
# data.json: UTF-8 Unicode (with BOM) text
```

## Strip a BOM

The cleanest fix is at the read site, since you can't always control the writer.

### JavaScript / Node

```js
function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text
}

const json = JSON.parse(stripBom(text))
```

There's also a tiny package called `strip-bom` that does exactly this. It's 4 lines of code; pick a side on whether that's a dependency or a copy-paste.

### Python

```python
import json

with open('data.json', encoding='utf-8-sig') as f:
    data = json.load(f)
```

The `utf-8-sig` codec is the trick — it reads UTF-8 but transparently strips a leading BOM. There's no equivalent "strip BOM" flag in `json` itself; it's the codec that handles it.

### PowerShell (modern)

```powershell
$content = Get-Content data.json -Encoding utf8NoBOM -Raw
$json = $content | ConvertFrom-Json
```

Note `utf8NoBOM` is PS 6+ only. On Windows PowerShell 5.1, you need `[System.IO.File]::ReadAllText('data.json')` and then strip manually.

### `jq` and `sed`

Sometimes you just want the BOM gone in a file:

```bash
sed -i '1s/^\xef\xbb\xbf//' data.json
```

Or, to pipe through `jq` after stripping:

```bash
sed 's/^\xef\xbb\xbf//' data.json | jq .
```

### Online — when you don't want to install anything

Paste the content into a [JSON Formatter](/json-tools/json-formatter/) — pasting strips the BOM by virtue of the browser only copying the visible text. That's a slightly accidental fix, but it works for one-off cases.

## Prevent BOMs at the source

Stripping at read is defensive; the better fix is to stop the BOM from being written in the first place.

- **Excel**: when saving as CSV, choose **"CSV UTF-8 (Comma delimited)"**, but be aware Excel still writes a BOM. To avoid, save as plain CSV and convert externally — or use `csv-to-json` tools that handle BOM input gracefully.
- **PowerShell**: prefer PS 7+, or use `[System.IO.File]::WriteAllText($path, $text, [System.Text.UTF8Encoding]::new($false))` — that `$false` is the BOM flag.
- **VS Code**: bottom-right encoding selector → **"Save with Encoding"** → **UTF-8** (without BOM). The default is no-BOM unless you've configured otherwise.
- **Build pipelines**: validate. Most CI lint setups can include a BOM check in pre-commit.

A simple shell check that fails the build if any tracked file has a BOM:

```bash
git ls-files '*.json' '*.ts' '*.tsx' | while read f; do
  if [ "$(head -c 3 "$f" | od -An -c | tr -d ' ')" = "357273277" ]; then
    echo "BOM found in $f"
    exit 1
  fi
done
```

Drop it in `.husky/pre-commit` or a CI step. Catches BOMs the day they enter the repo, not in production three weeks later.

## Why does this still happen in 2026?

Because Excel still adds a BOM by default when exporting "CSV UTF-8" — the most common path between non-engineers and JSON pipelines. Because Windows PowerShell 5.1 ships on every Windows machine and emits BOM by default. Because the BOM is invisible in every editor and shows up in cmd.exe as `?`.

The Unicode committee acknowledged in 2024 that recommending **against** BOMs in UTF-8 was overdue, but the existing tools haven't all caught up. Until they do, write defensive parsers.

## Recommended workflow

1. **Reading external JSON in code**: always strip a leading BOM before parsing. Cheap, defensive, no downsides.
2. **Reading external JSON ad hoc**: paste into a [JSON Formatter](/json-tools/json-formatter/), it'll show you parse errors with context.
3. **Writing JSON**: never add a BOM. Set your tools' defaults once.
4. **Pre-commit**: validate no tracked text file starts with `EF BB BF`.

The unsexy truth: BOMs are a cross-platform pollution problem, and the only defense is layered. Strip on read, never write, and check in CI. None of these is sufficient alone.

---

**Related tools on DevTools Online:**

- [JSON Formatter](/json-tools/json-formatter/) — paste and format, BOM stripped automatically
- [JSON Validator](/json-tools/json-formatter/) — finds malformed JSON beyond just the BOM case
- [CSV to JSON](/formatter-tools/csv-to-json/) — converts Excel exports correctly
- [String Inspector](/string-tools/string-inspector/) — see invisible characters byte by byte
