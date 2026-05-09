---
title: "HTML Entity Encoding: A Practical Guide to Avoiding XSS"
slug: "html-entity-encoding-xss"
description: "When to encode &amp; vs &lt; vs &#39;, why your framework probably handles it but might not, and the contexts where you must encode by hand to prevent cross-site scripting."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - html entity encoding
  - xss prevention
  - escape html
  - htmlspecialchars
  - innerhtml safe
tags:
  - Encoding
  - Security
  - Tutorial
cover: "/og-image.svg"
excerpt: "Modern frameworks escape HTML for you in JSX, templates, and components. They don't escape it in URL attributes, inline styles, or anything you build with innerHTML. That's where XSS lives."
---

If you write React, Vue, Svelte, or any framework with a JSX-style template, you almost never think about HTML escaping. Type `{user.name}` and the framework escapes it. Type `<div>{user.bio}</div>` and bytes-go-through-without-becoming-tags. The whole problem of cross-site scripting feels solved.

It's not. The framework only escapes in **specific contexts**. Reach for `innerHTML`, `dangerouslySetInnerHTML`, URL attributes, or inline styles, and the safety is gone. This is where most modern XSS lives, not in raw template injection, but in escape hatches.

## What HTML entity encoding actually does

HTML entity encoding replaces characters that have special meaning in HTML with safe equivalents:

| Character | Encoded | Why |
|---|---|---|
| `&` | `&amp;` | Starts an entity reference |
| `<` | `&lt;` | Starts a tag |
| `>` | `&gt;` | Closes a tag (only really matters inside `<script>`) |
| `"` | `&quot;` | Closes attribute values quoted with `"` |
| `'` | `&#39;` or `&apos;` | Closes attribute values quoted with `'` |

When a browser sees `&lt;`, it renders `<` but **doesn't treat it as a tag opener**. That's the whole trick. Done correctly, user-supplied text shows up as text, not as markup.

The five characters above are the minimum. If your encoder is doing more (e.g., entity-encoding non-ASCII characters), it's being defensive, which is fine, but only those five are required for safety.

## The contexts where escaping is automatic

In any of these, your framework or template engine handles HTML encoding:

- **JSX text**: `<div>{userInput}</div>` ✅
- **Attribute values**: `<img alt={userInput} />` ✅ (in JSX)
- **Vue/Svelte/Angular text bindings**: `{{ userInput }}` ✅
- **Server templates** (Jinja, Handlebars, EJS in default mode): ✅
- **Rust's askama / Tera, Go's html/template, Java's Thymeleaf**: ✅

Don't add `escape()` calls in these spots, you'll double-escape, and `O'Brien` becomes `O&#39;Brien` shown literally to users.

## The contexts where you must escape yourself

This is the dangerous half:

### 1. `innerHTML` and `dangerouslySetInnerHTML`

```js
element.innerHTML = userInput
```

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

These bypass escaping entirely. **The name `dangerouslySetInnerHTML` is in there for a reason.** If you use either:

- Pass already-trusted HTML (e.g., from a Markdown renderer that escapes user input internally)
- Pass user input ONLY after sanitizing with a library like `DOMPurify`

```js
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

`DOMPurify` strips `<script>` tags, `on*` event handlers, `javascript:` URLs, and many other XSS vectors while preserving safe HTML.

### 2. URL attributes (`href`, `src`, `formaction`, etc.)

```jsx
<a href={userUrl}>Click</a>
```

JSX escapes `&`, `<`, etc., but `userUrl` could be `javascript:alert(1)`, and that's not an HTML problem; it's a URL parsing problem. Validate the protocol:

```js
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return '#'
    }
    return parsed.href
  } catch {
    return '#'
  }
}
```

### 3. Inline `<script>` content

If you insert user data into a `<script>` tag (Server-side rendering with bootstrap data is a common case):

```html
<script>
  window.__INITIAL_DATA__ = {{ data | safe }};
</script>
```

HTML entity encoding **is not enough** here. The contents of `<script>` aren't HTML — they're JavaScript. You need a JSON encoder that's safe for script context (e.g., escapes `</script>` to `<\/script>`).

```html
<script>
  window.__INITIAL_DATA__ = JSON.parse({{ json_dumps(data) }});
</script>
```

Wrap in `JSON.parse(...)` of a JSON string literal. The string is HTML-escaped, the parse is in script context, and `</script>` inside the string can't escape the tag.

### 4. CSS `style` attributes

```jsx
<div style={`color: ${userColor}`}>...</div>
```

User can set `color: red; background: url(javascript:alert(1))`. HTML escaping doesn't help; CSS injection is its own world. Use the React-style object syntax:

```jsx
<div style={{ color: userColor }}>...</div>
```

…and the framework will validate property names and quote values.

### 5. Plain DOM building outside frameworks

```js
const div = document.createElement('div')
div.innerHTML = '<p>' + userInput + '</p>'  // ❌ XSS

const div = document.createElement('div')
const p = document.createElement('p')
p.textContent = userInput  // ✅ safe
div.appendChild(p)
```

`textContent` is the modern equivalent of "set the text of this element." It does HTML escaping for you, by definition, text nodes can't contain markup.

## A working escape function

For the rare case you genuinely need to escape HTML in code:

```js
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))
}
```

That's the entire algorithm. Five characters, one regex, one lookup. Don't import a library for this.

For decoding:

```js
function decodeHtml(s) {
  const txt = document.createElement('textarea')
  txt.innerHTML = s
  return txt.value
}
```

Yes, the trick is to use a textarea, it parses entities but doesn't execute scripts. This is browser-only. For Node, `he` is the standard library.

You can also paste back and forth in [HTML Entity Encoder / Decoder](/encoding-tools/html-encode-decode/) when debugging.

## Common XSS vectors in 2026

- **Stored XSS**: user comment containing `<script>` saved in DB, rendered later. Mitigated by escaping output, not input.
- **Reflected XSS**: `?q=<script>` echoed in a search results page. Same mitigation.
- **DOM XSS**: `location.hash` written to `innerHTML`. Mitigated by `textContent` or sanitizer.
- **Mutation XSS**: sanitizer outputs HTML that the browser re-parses differently than expected. Use `DOMPurify` over hand-rolled sanitizers.
- **CSP bypass via JSON injection**: user data ends up in a `<script>` tag without proper JSON-safe encoding. Mitigated by always using `JSON.parse(...)` wrapping.

The best general defense remains a strict **Content Security Policy**:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
```

Build it once with [HTTP Security Headers](/web-tools/http-headers-builder/) and you've cut the impact of most XSS to "it tried but the browser blocked it." CSP doesn't prevent XSS; it limits what XSS can do.

## Recommended workflow

1. **Use a framework with default escaping** (React, Vue, Svelte, server-side templates with auto-escape on).
2. **Treat `innerHTML` and `dangerouslySetInnerHTML` as code smells.** Each use needs a written reason.
3. **Sanitize user-supplied HTML with DOMPurify** when you must accept HTML input (rich-text editors).
4. **Validate URL protocols** before putting them in `href` or `src`.
5. **Set a strict CSP**: last line of defense when something else slips through.
6. **For ad-hoc encoding/decoding**, paste into [HTML Entity Encoder / Decoder](/encoding-tools/html-encode-decode/).

The summary, from someone who has cleaned up too many XSS reports: framework escaping handles 95% of cases, and the remaining 5% is where every XSS report comes from. Audit the 5%.

---

**Related tools on DevTools Online:**

- [HTML Entity Encoder / Decoder](/encoding-tools/html-encode-decode/), paste, encode or decode
- [URL Encoder / Decoder](/encoding-tools/url-encode-decode/), for URL contexts
- [HTTP Security Headers](/web-tools/http-headers-builder/), build a strict CSP
- [Base64 Encode / Decode](/encoding-tools/base64-encode-decode/), sometimes paired with HTML encoding
