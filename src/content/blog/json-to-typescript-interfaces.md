---
title: "JSON to TypeScript: Generating Type-Safe Interfaces from API Responses"
slug: "json-to-typescript-interfaces"
description: "How to turn an API JSON response into a TypeScript interface in seconds — with discriminated unions, nullable handling, and the gotchas that bite teams in production."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - json to typescript
  - generate typescript interface
  - api response types
  - typescript from json
  - typed api client
tags:
  - JSON
  - TypeScript
  - Tutorial
cover: "/og-image.svg"
excerpt: "Hand-typing TypeScript interfaces from a 4KB API payload is the work of a punished engineer. There are three good ways to skip that — pick the one that fits your trust level for the upstream API."
---

If you've ever opened a 4KB JSON payload in Postman and started hand-typing a TypeScript interface to match it, you know it's the kind of work that makes you reconsider your career. Twenty minutes in, you've got `field?: string | null | undefined`, you've forgotten which arrays were tuples versus lists, and you're pretty sure there was a typo on line 47. There's no glory in this.

The good news: in 2026 you have three solid ways to generate TypeScript types from JSON, and you don't have to hand-roll a single line.

## TL;DR

| Approach | Best for | Watch out for |
|---|---|---|
| **Quick paste-and-generate** | One-off API responses, prototyping | Inferred types are only as accurate as the sample |
| **JSON Schema → TS** | Stable APIs with a published schema | Schema drift between provider and consumer |
| **OpenAPI / tRPC / GraphQL codegen** | Full-stack typing across services | Build pipeline complexity |

If your API has a real schema, go to option 2 or 3. If you just got handed a payload and need types **right now**, option 1 is fine — just don't ship it without a second look.

## 1. Paste-and-generate (the fast path)

When you have a JSON response sitting in front of you and you need types in the next 30 seconds, the answer is a generator that infers types from a sample.

[**JSON to TypeScript on DevTools Online**](/json-tools/json-to-typescript/) does this in your browser — paste, copy, done. It handles nested objects, arrays of objects, optional fields, and basic union types.

For a payload like this:

```json
{
  "id": 42,
  "name": "Linh",
  "tags": ["pro", "verified"],
  "address": {
    "street": "12 Hoa Lan",
    "city": "Hanoi",
    "zip": null
  },
  "createdAt": "2026-04-12T08:30:00Z"
}
```

You get:

```ts
export interface User {
  id: number
  name: string
  tags: string[]
  address: Address
  createdAt: string
}

export interface Address {
  street: string
  city: string
  zip: string | null
}
```

That's a usable starting point. But — and this is the part most tutorials skip — **inference from a single sample is not the same as a real schema**. The generator can't tell:

- Whether a field is optional in some responses (it just saw it once and assumed required)
- Whether `zip: null` means "always nullable" or "this user happened to have no zip"
- Whether `id: 42` could ever come back as a string (some APIs return string IDs over JSON to avoid `Number.MAX_SAFE_INTEGER` issues)
- What the union type really is for a discriminator field

The fix is simple: paste **at least three or four sample responses, ideally including edge cases**. Most generators will widen types accordingly. If the API has paginated endpoints, paste an empty page, a partial page, and a full page — the differences will surface.

## 2. JSON Schema → TypeScript (the right way for stable APIs)

If the API ships a JSON Schema (most modern Python/Go/Java backends do, especially via OpenAPI), don't infer — translate.

The standard tool is `json-schema-to-typescript`:

```bash
npx json-schema-to-typescript schema.json -o types.ts
```

Input — a JSON Schema fragment from your backend:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "required": ["id", "name", "createdAt"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 },
    "tags": { "type": "array", "items": { "type": "string" } },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

Output:

```ts
export interface User {
  id: number
  name: string
  tags?: string[]
  createdAt: string
}
```

Notice `tags?` — because it wasn't in `required`, the generator correctly marked it optional. Inference can't do this.

Pair with [JSON Schema Validator](/json-tools/json-schema-validator/) for runtime checking and you've got both compile-time and runtime safety from the same source of truth.

## 3. Codegen pipelines (OpenAPI, tRPC, GraphQL)

For teams with multiple services, type-by-type generation is rinky-dink. You want:

- **OpenAPI**: `openapi-typescript` reads `openapi.yaml`, emits `paths`, request bodies, response shapes. Use with `openapi-fetch` for a fully typed client.
- **tRPC**: types flow from server to client at compile time — no codegen, no schema files. Best for monorepos where backend and frontend share a `tsconfig`.
- **GraphQL**: `graphql-codegen` is the standard. Generates query types, fragment types, and React hook signatures.

These tools are overkill for a single endpoint, but past about 5 endpoints they pay for themselves. The build wires up once, and every API change becomes a TypeScript error in the consumer until it's fixed.

## Common gotchas

### Numbers larger than `Number.MAX_SAFE_INTEGER`

`Number.MAX_SAFE_INTEGER` is 2^53 − 1. Snowflake IDs (Twitter, Discord), some 64-bit DB primary keys, and Unix timestamps in nanoseconds all exceed this.

If your API returns these, the JSON parser silently loses precision:

```js
JSON.parse('{"id": 9007199254740993}').id  // → 9007199254740992 ❌
```

Fix: the API should serialize big IDs as strings (`"id": "9007199254740993"`) and your TypeScript type should reflect that. Don't trust the inferred `number` type for IDs from any API you don't control.

### `Date` objects

`Date` doesn't survive `JSON.stringify`. APIs almost always return ISO 8601 strings:

```ts
createdAt: string  // ✅ accurate — it's a string after parse
createdAt: Date    // ❌ wrong — JSON.parse returns a string
```

If you want to use it as a `Date`, parse it explicitly: `new Date(json.createdAt)`. Branded types (e.g., `string & { __brand: 'ISODate' }`) are a clean way to encode this distinction without runtime cost.

### Discriminated unions

Inferred types miss tagged unions. If your API returns:

```json
{ "type": "credit_card", "last4": "4242" }
{ "type": "paypal", "email": "user@example.com" }
```

A naive generator emits:

```ts
interface PaymentMethod {
  type: string
  last4?: string
  email?: string
}
```

What you actually want:

```ts
type PaymentMethod =
  | { type: 'credit_card'; last4: string }
  | { type: 'paypal'; email: string }
```

This is a manual edit. After every regen, re-apply the union — or write a small post-processor. The TypeScript team's been talking about pattern-based unions in the language itself for years; until that lands, post-processing is the move.

### `null` versus `undefined`

JSON has only `null`. TypeScript has `null` and `undefined` and they're different. Most teams settle on:

- **`null`** — explicitly absent value (the API sent `null`)
- **`undefined`** — field wasn't present at all

Be consistent. Mixing them is a debugging nightmare:

```ts
function isMissing<T>(v: T | null | undefined): boolean {
  return v == null  // matches both null and undefined
}
```

The `== null` (with double equals) check is one of the very few cases where loose equality is the right answer.

## Recommended workflow

1. **Prototyping or one-off endpoint**: paste into [JSON to TypeScript](/json-tools/json-to-typescript/), copy the output, hand-fix discriminated unions and big-ID strings.
2. **Stable API with a schema**: run `json-schema-to-typescript` in your build.
3. **Multiple services or full-stack TS**: `openapi-typescript`, tRPC, or `graphql-codegen` — pick one and commit.
4. **For C# / .NET clients**: [JSON to C# Classes](/dotnet-tools/json-to-csharp/) handles `Newtonsoft.Json` and `System.Text.Json` attributes.
5. **For other languages**: [JSON to Code](/json-tools/json-to-code/) outputs Python, PHP, Go, Ruby, Java.

The boring takeaway: don't hand-type interfaces. The 30 seconds it takes to paste into a generator pays for itself the first time you're tracking down a runtime error caused by a typo in a property name.

---

**Related tools on DevTools Online:**

- [JSON to TypeScript](/json-tools/json-to-typescript/) — paste JSON, get types
- [JSON Schema Validator](/json-tools/json-schema-validator/) — runtime validation against a schema
- [JSON to C# Classes](/dotnet-tools/json-to-csharp/) — .NET equivalent with Newtonsoft attributes
- [JSON to Code](/json-tools/json-to-code/) — Python, PHP, Go, Ruby, Java
- [JSON Formatter](/json-tools/json-formatter/) — paste and format the response first
