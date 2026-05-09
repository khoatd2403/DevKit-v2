---
title: "Validating JSON in 2026: JSON Schema, AJV, and the Browser-Native Approach"
slug: "json-validation-2026"
description: "Three layers of JSON validation, syntax, schema, and business rules, and which library to reach for. With code samples for AJV, Zod, and the runtime checks browsers added in 2024."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - json validation
  - json schema
  - ajv
  - zod
  - validate json
  - runtime type check
tags:
  - JSON
  - Validation
  - Tutorial
cover: "/og-image.svg"
excerpt: "Compile-time TypeScript types catch the typos. Runtime validators catch what the API actually sent. The trick is knowing which validator to reach for, and when validation belongs at the boundary."
---

JSON validation in 2026, at a glance:

| Layer | What it catches | Tools |
|---|---|---|
| 1. Syntactic | malformed JSON | `JSON.parse`, `jsonc-parser` |
| 2. Schema | structure mismatch | AJV, Zod, Valibot, io-ts |
| 3. Business | domain rule violation | hand-written, Zod refinements |

Most production bugs that "shouldn't happen" are layer-2 failures: the API said `null` instead of `0`, the user pasted a 700KB object into a 5KB-expecting form, the third-party service started returning a string ID where it used to be a number. TypeScript catches none of these — it's compile-time, those values arrive at runtime.

This is the reference for which validator to reach for, in which layer.

Skip any layer and the bugs fall through to wherever they fit. Let's look at when to use what.

## Layer 1: Syntactic validation

Before any structure check, the JSON has to parse. The default `JSON.parse` is the validator:

```js
try {
  const data = JSON.parse(input)
} catch (err) {
  // err.message: "Unexpected token } in JSON at position 47"
}
```

`JSON.parse` is fine for syntax. The error messages are **infamously bad**: "Unexpected token at position 47" doesn't tell you which line, doesn't show context, doesn't suggest a fix.

For developer-facing tooling, use a library like `jsonc-parser` (Microsoft's, used by VS Code) or `jsonlint`:

```js
import { parse, ParseError } from 'jsonc-parser'

const errors: ParseError[] = []
parse(input, errors, { allowTrailingComma: false })
// errors → array of { error, offset, length }, with named codes
```

For end-user-facing tools, paste into [JSON Formatter](/json-tools/json-formatter/), the validator highlights the offending line with context, no scripting needed.

## Layer 2: Schema validation

Once the JSON parses, you need to verify its shape. This is where most of the interesting choices live, and the right answer depends on whether you have a **schema** to validate against.

### If you have a JSON Schema document. AJV

JSON Schema is the spec. AJV is the implementation everyone uses. It compiles a schema to a JIT-optimized validator that's roughly as fast as hand-rolled checks.

```js
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const schema = {
  type: 'object',
  required: ['email', 'age'],
  properties: {
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0, maximum: 150 },
    role: { enum: ['admin', 'user', 'guest'] }
  }
}

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

if (!validate(data)) {
  console.log(validate.errors)
  // [
  //   { instancePath: '/email', message: 'must match format "email"' },
  //   { instancePath: '/age', message: 'must be integer' }
  // ]
}
```

AJV is the right answer when:

- You already have a JSON Schema (from OpenAPI, from the API team, from a published spec)
- You want bidirectional usage, same schema generates [TypeScript types](/json-tools/json-to-typescript/) AND validates at runtime
- Performance matters, the JIT'd validator is fast

You can also paste your schema and a sample into [JSON Schema Validator](/json-tools/json-schema-validator/) to test interactively before wiring AJV into code.

### If you don't have a schema. Zod (or Valibot)

Most TypeScript codebases don't start with JSON Schema. They start with `interface User { ... }` and validation is an afterthought. Zod is built for this:

```ts
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'guest']).optional()
})

type User = z.infer<typeof UserSchema>
//   ↑ TypeScript type derived from the runtime schema

const result = UserSchema.safeParse(data)
if (!result.success) {
  console.log(result.error.issues)
} else {
  const user: User = result.data  // typed, validated
}
```

The killer feature: **one source of truth**. The TypeScript type and the runtime validator are the same definition. No drift.

Zod is the right answer when:

- You're in TypeScript and don't already have JSON Schema
- You want type inference from the validator
- You're validating user input forms, not just API responses

Valibot is a smaller alternative (~5x smaller bundle) for browser-heavy apps. Same idea, different ergonomics.

### If you're really minimal, io-ts or Yup

Both predate Zod. io-ts is more functional, Yup is more form-focused. Both are still maintained. If you have one in the codebase, keep it. For new code, Zod is the default.

## Layer 3: Business validation

Schema says "age is between 0 and 150." Business says "users under 13 can't sign up without parental consent." That's not in the schema, it's in your domain.

Don't try to encode this in JSON Schema. The spec supports `if/then/else` and `dependencies`, but readability collapses fast. Two clean approaches:

### Validation functions after schema

```ts
const result = UserSchema.safeParse(data)
if (!result.success) return { error: result.error }

if (result.data.age < 13 && !result.data.parentalConsent) {
  return { error: 'Users under 13 require parental consent' }
}
```

### Refinements in Zod

```ts
const SignupSchema = z.object({
  age: z.number(),
  parentalConsent: z.boolean().optional()
}).refine(
  data => data.age >= 13 || data.parentalConsent === true,
  { message: 'Users under 13 require parental consent', path: ['parentalConsent'] }
)
```

Refinements are nice when the rule is local to one schema. For cross-cutting rules (rate limits, business logic spanning multiple endpoints), keep validation outside the schema.

## What about runtime browser validation?

Browsers added a few JSON-shape primitives in 2024. They're useful but underpowered:

- `URL.canParse()` for URL strings
- `Number.isFinite()` and `Number.isSafeInteger()` for numeric edge cases
- `Intl.RelativeTimeFormat` and friends for date/time formats

These are good for one-off field validation but no replacement for a schema validator. Use them inside your schema's `.refine()` blocks.

## Where to validate

The other choice nobody mentions: **where in the system does validation run?**

The right answer is **at every trust boundary**, and not in between:

| Boundary | Validate? | Why |
|---|---|---|
| HTTP request body → handler | ✅ Yes | Don't trust clients, ever |
| Database row → application | ✅ Yes | Schema drift, manual edits |
| Internal function → internal function | ❌ No | TypeScript already handled it |
| Microservice → microservice | ✅ Yes | Independent deploys, schema drift |
| Trusted internal API in a monorepo | ❌ No | Compile-time types are enough if shared |

Adding validation at every step "to be safe" is a real way to slow down systems and bury bugs. Validate at boundaries, trust types in between.

## Performance

Some rough numbers for 1KB payloads on a 2024 M1 Mac:

| Approach | Validations per second |
|---|---|
| Native `JSON.parse` only (no schema) | ~2,000,000 |
| AJV (compiled, single schema) | ~500,000 |
| Zod (typical schema) | ~80,000 |
| Hand-rolled if-checks | ~1,000,000 |

Translation: validators are not the bottleneck for 99% of systems. Pick for ergonomics, not speed. If you really need the last 10× of performance, AJV with `allErrors: false` is the standard answer, but you've probably got bigger fish to fry.

## Recommended workflow

1. **TypeScript-only project**: Zod for new validators, infer types from schemas.
2. **Existing JSON Schema (OpenAPI, etc.)**: AJV. Don't double-define.
3. **Form validation in React**: Zod or Yup, paired with `react-hook-form`.
4. **Server-side, multiple languages**: JSON Schema + AJV (Node), `jsonschema` (Python), `jsonschema` (Java/Go).
5. **Ad-hoc inspection**: paste into [JSON Schema Validator](/json-tools/json-schema-validator/) before wiring code.

The mistake nobody warns about: writing your own validator. Loops of `if (typeof x === 'string')` look fine for two fields and become unreadable at ten. AJV and Zod exist because validation is harder than it looks. Use them.

---

**Related tools on DevTools Online:**

- [JSON Schema Validator](/json-tools/json-schema-validator/), paste schema + data, see errors
- [JSON Formatter](/json-tools/json-formatter/), syntactic validation with line context
- [JSON to TypeScript](/json-tools/json-to-typescript/), generate types to pair with your validator
- [JSON Diff](/json-tools/json-diff/), compare expected vs actual when validation fails
