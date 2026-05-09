---
title: "URL Encoding Cheatsheet: %20 vs +, Percent-Encoding, Common Pitfalls"
slug: "url-encoding-cheatsheet"
description: "Why your URLs break when they hit a Vietnamese name, why %20 and + both encode space (but not always), and the exact rules for which encoder to use where."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - url encoding
  - percent encoding
  - encodeuricomponent
  - urlencode
  - %20 vs +
  - url safe characters
tags:
  - Encoding
  - Web
  - Reference
cover: "/og-image.svg"
excerpt: "URL encoding looks like one rule until you realize space is %20 in paths and + in query strings, and there are four different JavaScript functions and they all do slightly different things."
---

URL encoding rules in one screen:

| Character | In path | In query value | In query value (form-style) |
|---|---|---|---|
| Space | `%20` | `%20` | `+` |
| `+` | `+` literal | `%2B` | `%2B` |
| `&` | `&` literal | `%26` | `%26` |
| `/` | `/` literal | `%2F` | `%2F` |
| `?` | `%3F` | `?` separator | `?` separator |
| `#` | `%23` | `#` fragment | `#` fragment |
| Vietnamese `à` | `%C3%A0` | `%C3%A0` | `%C3%A0` |

The rules behind that table are short. Three character classes, four JavaScript functions, two flavors of "encode a space." Once you've seen them in one place, the unexpected behaviors stop being unexpected.

## TL;DR

| Where | Space becomes | Use |
|---|---|---|
| Path segment | `%20` | `encodeURIComponent` |
| Query string value | `+` (or `%20`) | `encodeURIComponent`, then optionally `replace(/%20/g, '+')` |
| Form-urlencoded body | `+` | `URLSearchParams` (handles it for you) |
| Hash fragment | `%20` | `encodeURIComponent` |

In modern code: just use `URLSearchParams` and `URL`. They handle encoding correctly. Hand-rolling URL strings is where bugs live.

## What is URL encoding, actually

URLs use a restricted character set: ASCII letters, digits, and a handful of safe punctuation (`-_.~`). Anything else, spaces, accented letters, emoji, query separators inside values, has to be **percent-encoded**: each byte represented as `%` followed by two hex digits.

A space (byte `0x20`) becomes `%20`. The Vietnamese letter `à` is two UTF-8 bytes (`0xC3 0xA0`), so it becomes `%C3%A0`. Multiplied across a 100-character query string in Vietnamese, this is why URLs in `google.com.vn` look like a wall of percent signs.

Percent-encoding operates on **bytes**, not characters. The string is encoded to UTF-8 first, then each non-safe byte is escaped. Get this wrong (e.g., encode UTF-16 instead of UTF-8) and your encoding is invalid.

## The character classes

The URI spec (RFC 3986) classifies every ASCII character into one of three buckets:

### Unreserved (always safe)

```
A-Z  a-z  0-9  -  _  .  ~
```

These characters are **never** percent-encoded.

### Reserved (have meaning in URIs)

```
:  /  ?  #  [  ]  @           (gen-delims)
!  $  &  '  (  )  *  +  ,  ;  =   (sub-delims)
```

These are encoded **only when they appear in a context where they'd otherwise be parsed**. A `/` in a path is a path separator. A `/` in a query string value is just data and must be `%2F`.

### Everything else

Encoded as `%HH` where `HH` is the hex value of the byte (or, for non-ASCII, each UTF-8 byte).

## %20 vs +

This is the famous one. **Space can be encoded two ways**:

- `%20`, works everywhere
- `+`, works **only in query strings and form bodies**

The reason is historical: HTML form submissions (`application/x-www-form-urlencoded`) use `+` for space. The W3C spec for forms predates and conflicts with the URI spec. Both rules survive in 2026 because changing either would break the web.

Practical effect:

```
https://example.com/search?q=hello+world      ✅ valid (form-style)
https://example.com/search?q=hello%20world    ✅ valid (URI-style)
https://example.com/search/hello+world         ❌ "+" stays literal in path
https://example.com/search/hello%20world       ✅ space in path
```

If the path contains a literal `+` (e.g., a "C++" tutorial page), it must be `%2B`:

```
https://example.com/topics/c%2B%2B    → C++
```

## The JavaScript functions

JavaScript has **four** URL-related encoding functions. They differ in which characters they consider safe:

| Function | Encodes |
|---|---|
| `encodeURI` | Everything except gen-delims, sub-delims, and unreserved |
| `encodeURIComponent` | Everything except unreserved (most aggressive) |
| `escape` (deprecated) | Don't use, uses `%uHHHH` for non-ASCII, not UTF-8 |
| `URLSearchParams.toString()` | Form-urlencoded (space → `+`) |

You almost always want **`encodeURIComponent`** for user-supplied values:

```js
const query = 'cá kho tộ'
const url = `https://example.com/search?q=${encodeURIComponent(query)}`
// → https://example.com/search?q=c%C3%A1%20kho%20t%E1%BB%99
```

Or, better, use `URLSearchParams`:

```js
const params = new URLSearchParams({ q: 'cá kho tộ' })
const url = `https://example.com/search?${params}`
// → https://example.com/search?q=c%C3%A1+kho+t%E1%BB%99
```

Note `URLSearchParams` produces `+` for spaces (form-urlencoded). `encodeURIComponent` produces `%20`. Both are valid in query strings; servers should accept either, but **some don't**. Test both if you don't control the consumer.

## Common pitfalls

### Encoding a URL twice

Easy to do by mistake:

```js
const part = encodeURIComponent('hello world')  // "hello%20world"
const url = encodeURIComponent(`?q=${part}`)    // "%3Fq%3Dhello%2520world"
//                                                          ^^^^ %25 is encoded %
```

Now the server sees a literal `%20` in the query, not a space. The fix: only encode the **values**, not the structure. Use `URLSearchParams` or `URL` and you can't make this mistake.

### Encoding `+` in a query value

If a user search term is literally `1+1=2`, naive encoding fails:

```js
// Wrong: + stays as + and is decoded as space by the server
'https://example.com/search?q=1+1=2'

// Right: + must be %2B in a query value
'https://example.com/search?q=1%2B1%3D2'
```

`encodeURIComponent` does this correctly:

```js
encodeURIComponent('1+1=2')  // → "1%2B1%3D2"
```

`URLSearchParams` also handles it:

```js
new URLSearchParams({ q: '1+1=2' }).toString()  // → "q=1%2B1%3D2"
```

Hand-concatenation does not. Don't hand-concatenate.

### Decoding too early or too late

Servers typically decode the path and query for you before your handler runs. **Don't decode again** unless you specifically need raw bytes. Double decoding turns a literal `%20` (which the user typed and meant) into a space (which is now invalid).

In Node.js with Express:

```js
app.get('/search', (req, res) => {
  const q = req.query.q  // already decoded
  // Do NOT decodeURIComponent(q) again
})
```

In Go:

```go
q := r.URL.Query().Get("q")  // already decoded
```

### Non-ASCII bytes in the URL host

The hostname has different rules, it uses **Punycode**, not percent-encoding. `häagen-dazs.com` becomes `xn--hagen-dazs-1ab.com`. Browsers handle this automatically, but if you're constructing URLs in code, use the URL constructor:

```js
new URL('https://häagen-dazs.com').hostname  // → "xn--hagen-dazs-1ab.com"
```

## Quick reference

```js
// Single value (query string, path component, hash)
encodeURIComponent('cá kho tộ')
// → "c%C3%A1%20kho%20t%E1%BB%99"

// Whole URL (preserves structural characters)
encodeURI('https://example.com/path with space?q=hi')
// → "https://example.com/path%20with%20space?q=hi"
//   (encodes space but not /, ?, =)

// Build a query string
new URLSearchParams({ q: 'hi there', tag: 'pho' }).toString()
// → "q=hi+there&tag=pho"

// Decode
decodeURIComponent('c%C3%A1%20kho%20t%E1%BB%99')
// → "cá kho tộ"
```

## Recommended workflow

1. **Building URLs in code**: use `URL` and `URLSearchParams`. Don't concatenate strings.
2. **Encoding a single value**: `encodeURIComponent`.
3. **Decoding a query parameter**: usually already done for you by the framework.
4. **Inspecting an unfamiliar URL**: paste into [URL Encoder / Decoder](/encoding-tools/url-encode-decode/) to see the structure.
5. **Debugging non-ASCII issues**: check that the source is UTF-8 (not Latin-1 or UTF-16).

The mental model that fixes 90% of bugs: **percent-encoding is a byte-level escape, not a character-level escape**. Once you internalize that, and stop hand-concatenating URLs, most of the strange behaviors stop making sense. They start having boring, mechanical reasons you can predict.

---

**Related tools on DevTools Online:**

- [URL Encoder / Decoder](/encoding-tools/url-encode-decode/), paste, encode or decode
- [HTML Entity Encoder](/encoding-tools/html-encode-decode/), different encoding, same idea
- [Base64 Encode / Decode](/encoding-tools/base64-encode-decode/), when URL-encoded isn't enough
- [JWT Decoder](/encoding-tools/jwt-decoder/). Base64URL is a sibling encoding
