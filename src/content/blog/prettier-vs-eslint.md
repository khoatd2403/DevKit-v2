---
title: "Prettier vs ESLint: Stop Confusing Formatting with Linting"
slug: "prettier-vs-eslint"
description: "Prettier formats. ESLint catches bugs. They're not competitors and you almost certainly need both. Here's what each does, why they sometimes conflict, and the 2026 setup."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - prettier vs eslint
  - eslint configuration
  - code formatting javascript
  - eslint stylistic rules
  - eslint config 2026
tags:
  - Tooling
  - Formatting
  - Comparison
cover: "/og-image.svg"
excerpt: "Prettier and ESLint do different jobs. Half the JavaScript ecosystem treats them as alternatives. The other half configures both badly and they fight. Here's how to wire them up so they don't."
---

A new project. You install Prettier. You install ESLint. You run them. Prettier reformats your code one way, ESLint complains about the new formatting. You fix the ESLint warnings. Prettier reformats again. Welcome to the second-most-common JavaScript tooling fight (after "should we use TypeScript").

The good news: Prettier and ESLint do **different things**, and once you set them up correctly, they don't fight. The bad news: half of all tutorials describe how to make them fight better.

## What each one actually does

### Prettier: a formatter

Prettier reads your code, throws away your formatting, and re-prints the AST with its own opinionated rules. Tabs vs spaces, line width, trailing commas — Prettier decides. You get a small handful of options:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

That's mostly it. The point is consistency, not flexibility. Prettier's pitch: by removing every formatting choice, your team stops bikeshedding and reviewers stop nitpicking.

### ESLint: a linter

ESLint reads your code and flags potential **bugs** and **anti-patterns**:

- `no-unused-vars` — you imported it, never used it
- `no-undef` — referencing a variable that doesn't exist
- `react/exhaustive-deps` — `useEffect` dependency array is incomplete
- `@typescript-eslint/no-explicit-any` — using `any`
- `eqeqeq` — using `==` instead of `===`

These are **semantic** rules. They have nothing to do with how your code looks; they're about what your code does or doesn't do.

ESLint also has stylistic rules (`indent`, `semi`, `quotes`) that overlap with Prettier. **This is where they fight.** The fix: turn off ESLint's stylistic rules and let Prettier handle them.

## How they fight

Suppose your ESLint config has:

```json
{
  "rules": { "indent": ["error", 4] }
}
```

And Prettier has:

```json
{ "tabWidth": 2 }
```

You write code. Prettier formats with 2-space indent. ESLint flags the result as "expected 4 spaces." You're stuck.

The official fix is **`eslint-config-prettier`** — a config that disables all of ESLint's stylistic rules:

```js
// eslint.config.js (flat config, modern)
import prettierConfig from 'eslint-config-prettier'

export default [
  // your usual ESLint configs
  prettierConfig  // last — turns off conflicting rules
]
```

After this, ESLint only flags semantic bugs. Prettier handles all formatting. They never disagree because their domains no longer overlap.

## The 2026 setup

```bash
npm install --save-dev prettier eslint eslint-config-prettier
```

`prettier.config.js`:

```js
export default {
  printWidth: 100,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
}
```

`eslint.config.js`:

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier  // disable ESLint's stylistic rules
)
```

`package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "lint": "eslint .",
    "check": "prettier --check . && eslint ."
  }
}
```

Add a pre-commit hook (`husky` + `lint-staged`):

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"]
  }
}
```

Now: Prettier formats on save (configure your editor), ESLint catches bugs, and pre-commit ensures both pass. No fighting.

## Why some teams skip Prettier

A few reasons, all valid:

### Stylistic ESLint covers it

ESLint's `@stylistic/eslint-plugin` (the formatting rules, since 2023 split out from core ESLint) can do most of what Prettier does. Some teams prefer it because:

- One tool instead of two
- More configurable (you can disagree on `if-curly` vs `no-curly`)
- Better integration with custom rules

The downside: configuration is longer. Prettier is "no opinions allowed"; stylistic ESLint is "every opinion negotiable."

### Built-in formatters

If you use Biome, Deno, or Bun, they have built-in formatters and linters in one tool. Single binary, no config wars. Worth considering for new projects:

- **Biome** — formatter + linter, drop-in replacement for both
- **Deno fmt + Deno lint** — built into Deno
- **Bun's bunfig.toml fmt** — Bun's formatter

These are the future of "one tool" JS tooling. In 2026, Biome is mature; some teams have migrated and never looked back.

### Personal preference

Some senior devs hate Prettier's choices and want them tweaked. Prettier resists that. ESLint with stylistic rules lets you be picky. If your team is happy bikeshedding indent style, Prettier isn't for you.

## Non-JS files

Prettier handles more than JavaScript:

- **JSON** — formatting, no semantic checking
- **CSS / SCSS / Less** — yes
- **HTML / Markdown** — yes
- **YAML** — yes (good for config consistency)
- **GraphQL** — yes, when you install a plugin

For these formats:

- For JSON validation, paste into [JSON Formatter](/json-tools/json-formatter/) for syntax errors.
- For SQL, Prettier has a plugin but [SQL Formatter](/formatter-tools/sql-formatter/) is more SQL-specific.
- For CSS minification (separate from formatting), [CSS Minifier](/formatter-tools/css-minifier/) handles production builds.

## Common mistakes

### Running ESLint without `eslint-config-prettier`

Predictable result: stylistic rules fire on Prettier's output. Always include `eslint-config-prettier` last in your ESLint config.

### Using Prettier and `eslint-plugin-prettier` together

`eslint-plugin-prettier` runs Prettier inside ESLint. Useful if you want a single command, but it's slow and noisy. The recommended approach since 2023 is to run Prettier and ESLint **separately** — they're parallelizable, and the `--fix` flag on each handles auto-fixing without the cross-tool overhead.

### Different Prettier configs in different files of the project

If a sub-package has a different `.prettierrc`, you'll get inconsistent formatting at the boundary. Pick one config at the repo root unless you specifically need different rules for a specific subdirectory.

### Skipping pre-commit hooks because "they slow me down"

The whole point of formatters and linters is catching issues before review. If you push unformatted code, your reviewer wastes time on it. Pre-commit hooks are 200ms; review iterations are days.

### Editor not configured

VS Code: install Prettier + ESLint extensions, set "Format on Save," set "ESLint: Auto Fix on Save." Now your editor does the work continuously and you never see formatting issues.

WebStorm: built-in support for both, just enable in Preferences → Tools → Actions on Save.

## What about formatting other languages?

The same model — a formatter and a linter, separately — applies to most languages:

| Language | Formatter | Linter |
|---|---|---|
| Python | `black` or `ruff format` | `ruff` or `flake8` |
| Go | `gofmt` (built in) | `go vet` + `golangci-lint` |
| Rust | `rustfmt` (built in) | `clippy` |
| Java | `google-java-format` | `checkstyle`, `errorprone` |
| C# | `dotnet format` | Roslyn analyzers |
| SQL | [SQL Formatter](/formatter-tools/sql-formatter/) (online) or `sqlfluff` | `sqlfluff` |

The pattern is the same: formatter handles "looks consistent," linter handles "catches bugs." The tools are different per language but the role split is universal.

## Recommended workflow

1. **New JS/TS project**: Prettier + ESLint + `eslint-config-prettier`. Pre-commit via `lint-staged`.
2. **Editor**: enable format-on-save and lint-on-save. Don't manually run `npm run format` 100 times a day.
3. **Disagreements about formatting**: stop. Pick Prettier and move on. The 5 minutes you'd spend tuning indent rules are 5 minutes you don't get back.
4. **For other languages**: install the language's standard formatter + linter pair. Don't roll custom formatting.
5. **For online formatting**: paste into the right tool — [JSON Formatter](/json-tools/json-formatter/), [SQL Formatter](/formatter-tools/sql-formatter/), [HTML Minifier](/formatter-tools/html-minifier/).

The summary: formatter and linter are different jobs. Use both. Configure them so they don't overlap. The result: zero formatting arguments, fewer bugs, and the time you used to spend in CR comments is now available for actual work.

---

**Related tools on DevTools Online:**

- [JSON Formatter](/json-tools/json-formatter/) — for ad-hoc JSON
- [SQL Formatter](/formatter-tools/sql-formatter/) — beautify SQL queries
- [CSS Minifier](/formatter-tools/css-minifier/) — production CSS
- [HTML Minifier](/formatter-tools/html-minifier/) — strip whitespace from HTML
