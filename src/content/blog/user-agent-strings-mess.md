---
title: "User-Agent Strings Are a Mess: Parsing Them Without Pulling Your Hair Out"
slug: "user-agent-strings-mess"
description: "Why the User-Agent string contains the word 'Mozilla' on every browser, why parsing it is fundamentally lossy, and what to use instead in 2026."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - user agent string
  - parse user agent
  - user-agent header
  - browser detection
  - user-agent client hints
tags:
  - HTTP
  - Web
  - Problem-solving
cover: "/og-image.svg"
excerpt: "The User-Agent string is a 30-year-old archaeology site. Every browser still claims to be Mozilla 5.0. Chrome claims to be Safari. The reasons are historical and the parsing is a tax we still pay."
---

Here's a User-Agent string from a 2026 Chrome on a 2026 MacBook:

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
```

Read it carefully. It claims to be Mozilla. It mentions AppleWebKit. It says "like Gecko" (Gecko is Firefox's engine). It says it's Safari. And, at the end, it admits to being Chrome.

Every word in this string except "Chrome" is a lie. They're all there because removing any of them would break some website that does crude string matching. This is the User-Agent string. It is broken by design and the design is fixed.

## A quick history

In 1993, Netscape (a.k.a. Mozilla) was the popular browser. Servers checked the UA for "Mozilla" and served fancy frames. When Microsoft launched IE in 1995, IE wanted to load those same fancy pages — so IE's UA included "Mozilla."

Then Safari came along, wanting to be served the JavaScript that IE got. So Safari claimed to be "like Gecko" (Mozilla's rendering engine).

Then Chrome came along. Chrome is built on WebKit (originally), then Blink (forked from WebKit). To be served the same code as Safari, Chrome's UA includes "AppleWebKit" and "Safari."

The result: every browser carries 30 years of identifier baggage to be backward-compatible with sniffing code that nobody maintains.

You can see your own UA in [User-Agent Parser](/web-tools/user-agent-parser/) — paste the raw string and see the parsed components.

## The structure

The conventional format:

```
Mozilla/5.0 (system info) Engine/version (KHTML, like Gecko) Browser/version Extras
```

For Chrome on Mac:

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
```

For Firefox on Linux:

```
Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0
```

For Safari on iPhone:

```
Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1
```

For Edge on Windows (Chromium-based, post-2020):

```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0
```

Edge claims to be Chrome which claims to be Safari which claims to be Mozilla. Each browser tacks its own identifier at the end.

## What you can reasonably extract

Despite the chaos, parsers can pull out:

- **Browser name** (Chrome, Firefox, Safari, Edge, etc.) — match the **last** identifier
- **Browser version** — match the version after the browser name
- **Operating system** (macOS, Windows, iOS, Android, Linux) — pattern match the system info section
- **Device type** (desktop, mobile, tablet) — heuristic from "Mobile" / "Tablet" tokens

What you **can't** reliably extract:

- **OS version on iOS** — Safari on iPhone reports `iPhone OS 17_5`, but iPad Safari may report `Mac OS X` (since iPadOS 13)
- **CPU architecture** — `Intel Mac OS X 10_15_7` is a Chrome lie. Apple Silicon Macs all report Intel for compatibility
- **Specific iPhone model** — `iPhone15,2` doesn't appear; only "iPhone"
- **Whether the user is in private mode**

## Use a library, never a regex

User-Agent parsing is the kind of thing that looks easy and is full of edge cases. Don't roll your own:

- **JavaScript**: `ua-parser-js` is the standard. Maintained, ~50KB.
- **Python**: `user-agents` (Pelle Krøgh) — wraps the same regexes used by `ua-parser-js`.
- **Go**: `mileusna/useragent` is small and fast.
- **Server-side log analysis**: most analytics tools (GA, Plausible) parse for you.

The maintained regex sets in these libraries handle thousands of UA variations including bots, embedded browsers, and obscure mobile OSes.

```js
import UAParser from 'ua-parser-js'

const ua = navigator.userAgent
const parser = new UAParser(ua)
const result = parser.getResult()
// {
//   browser: { name: 'Chrome', version: '130.0.0.0' },
//   os: { name: 'Mac OS', version: '10.15.7' },
//   device: { type: undefined, model: undefined, vendor: undefined }
// }
```

## What to use instead

Browsers added a replacement around 2020-2022: **User-Agent Client Hints**.

Instead of one string, the browser sends multiple headers when asked:

```
Sec-CH-UA: "Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"
Sec-CH-UA-Mobile: ?0
Sec-CH-UA-Platform: "macOS"
```

Cleaner, structured, and the server can request more detail with `Accept-CH`:

```
Accept-CH: Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch
```

Subsequent requests include those headers.

In 2026, Chrome / Edge / Brave support Client Hints fully. Firefox and Safari are partial. The User-Agent string has been gradually frozen — Chrome no longer puts the minor OS version there, for instance — to push developers to Client Hints.

Practical take: read Client Hints if available, fall back to UA parsing for older clients. Most modern analytics libraries do this transparently.

## When to actually parse User-Agent

Despite all of the above, there are still real reasons:

### Server-side analytics

Knowing 60% of traffic is Chrome on Windows informs feature decisions. Use a maintained parser, accept the occasional misclassification.

### Bot detection

Most bots identify themselves: `Googlebot/2.1`, `bingbot/2.0`, `facebookexternalhit/1.1`. Worth filtering for analytics.

Watch out: malicious bots also lie. They claim to be Chrome 130. UA-based bot detection catches honest bots but not adversarial ones. For real bot defense, use Cloudflare Bot Management or similar.

### Feature compatibility (use sparingly)

If you genuinely can't feature-detect, you may UA-sniff. But "I can't feature-detect" is rare in 2026. Most things JavaScript can do, you can check at runtime:

```js
if ('serviceWorker' in navigator) { ... }
if (CSS.supports('display: grid')) { ... }
```

Far more reliable than UA matching.

### A/B serving different bundles

Modern build systems can ship `nomodule` and `type="module"` bundles, letting old browsers download a different bundle by virtue of `<script type="module">` only being recognized by modern browsers. No UA sniffing needed.

For more granular cases (e.g., serve WASM only to Chrome 100+), Client Hints are cleaner than UA strings.

## Common mistakes

### Detecting "mobile" by UA

```js
const isMobile = /Mobile/.test(navigator.userAgent)  // ❌
```

iPad Safari since iPadOS 13 doesn't include "Mobile." It reports as macOS Safari. Many "mobile detection" libraries miss iPads. Use viewport size or `(pointer: coarse)` media query for actual touch detection.

### Detecting Apple Silicon Mac

`navigator.userAgent` says `Intel Mac OS X` even on M1/M2/M3. To detect Apple Silicon:

```js
// Client Hints (Chrome/Edge)
const hints = await navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness'])
if (hints.architecture === 'arm') { /* Apple Silicon */ }
```

This is the only reliable method. UA string lies on purpose.

### Showing different content to "old" browsers

```js
const isOldBrowser = parseInt(uaParser.getBrowser().version) < 80
```

This breaks every time a browser ships a new major version. Use feature detection instead.

### Logging UA strings without anonymization

The UA can contain enough info to fingerprint a user (browser version + OS version + screen size + ...). For GDPR-friendly logs, log a parsed summary (`Chrome 130 / macOS / desktop`) not the raw string.

## Recommended workflow

1. **Inspect a UA**: paste into [User-Agent Parser](/web-tools/user-agent-parser/). Auto-detects your own UA.
2. **For analytics**: use `ua-parser-js` or equivalent. Accept occasional miss.
3. **For feature detection**: use `'feature' in object` or `CSS.supports()`. Don't reach for UA.
4. **For modern detection**: prefer User-Agent Client Hints (`navigator.userAgentData`). Fall back to UA for older clients.
5. **For bot detection**: check obvious bots in UA, use Cloudflare/equivalent for the adversarial ones.

The summary: User-Agent is a 30-year accumulation of compatibility hacks. It's lossy, lies on purpose, and is gradually being replaced. Parse it when you have to, with a maintained library. Reach for Client Hints or feature detection when you can.

---

**Related tools on DevTools Online:**

- [User-Agent Parser](/web-tools/user-agent-parser/) — paste UA, see parsed structure
- [HTTP Request Builder](/web-tools/http-request-builder/) — send custom UA strings for testing
- [HTTP Security Headers](/web-tools/http-headers-builder/) — `Accept-CH` and Client Hints
- [DNS Lookup](/web-tools/dns-lookup/) — for resolving hosts under different UA contexts
