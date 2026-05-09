---
title: "Favicon in 2026: Why /favicon.ico Isn't Enough Anymore"
slug: "favicon-2026-modern-setup"
description: "The minimum favicon setup for 2026 covers tab icons, iOS home screen, Android, dark mode, and PWA installs. Here's the modern stack and why most blog posts give bad advice."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - favicon
  - favicon 2026
  - apple touch icon
  - svg favicon dark mode
  - pwa icon
tags:
  - Web
  - Generators
  - Tutorial
cover: "/og-image.svg"
excerpt: "A single 16x16 ICO file used to be enough. Now you need PNG, SVG, multiple sizes, manifest entries, and a dark-mode variant. The good news: it's still ten lines of HTML."
---

Stop using "favicon generator" sites that output a folder of 16 PNG files. It is **2026**. We have SVG. We have *one* image format that scales infinitely, weighs 1KB, and supports dark mode via CSS media queries. And yet half the sites I open are still loading 9 different rasterized icon sizes because someone clicked "Generate" on a tool from 2014 that hasn't been updated.

The modern favicon stack is **five `<link>` tags** and a `manifest.json`. Not 30 tags. Not a folder of 47 PNG files. Five. Below is the setup, what each line does, and which obsolete advice you should ignore.

## The minimum 2026 favicon stack

Inside `<head>`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

Files at the root:

- `/favicon.svg`, modern browsers use this
- `/favicon-32.png` and `/favicon-16.png`, fallbacks for browsers that don't support SVG icons
- `/apple-touch-icon.png`, 180×180, for iOS home screen
- `/manifest.json`, PWA-style icon manifest

That's the whole setup. Five files, five `<link>` tags.

Generate the entire bundle from a single image with [Favicon Generator](/generator-tools/favicon-generator/), uploads stay in your browser, output is downloadable as a zip.

## Why SVG matters

SVG icons:

- **Scale to any size** without loss
- **Support dark mode** via `prefers-color-scheme` media queries
- **Are tiny**: usually 1-3KB

Browser support since 2022 is universal in modern browsers (Chrome 80+, Firefox 41+, Safari 16.4+). For older browsers, the PNG fallback handles them.

A dark-mode-aware SVG favicon:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .icon { fill: #111827; }
    @media (prefers-color-scheme: dark) {
      .icon { fill: #f3f4f6; }
    }
  </style>
  <circle class="icon" cx="16" cy="16" r="14"/>
</svg>
```

Light tabs get dark icon; dark tabs get light icon. Without this, your icon either disappears or has poor contrast in one of the two modes.

## What the manifest does

`/manifest.json` (also called Web App Manifest) tells browsers and OS:

```json
{
  "name": "DevTools Online",
  "short_name": "DevTools",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

This enables:

- **"Add to home screen"** on Android (and iOS, partially)
- **PWA install prompt**
- **Custom theme color** in browser chrome
- **Splash screen** on launch

Even if you don't intend to make a PWA, having a manifest with icons makes "add to home screen" produce a nice-looking shortcut.

## Maskable icons

Android's adaptive icon system applies a shape mask (circle, rounded square, etc.) to your icon. If your icon's content is too close to the edge, the mask cuts it off.

A "maskable" icon has its content in the **safe zone** (center 80%) so any mask shape preserves the logo:

```
+-------------+
| safe zone   |  ← icon content stays in center
|   ┌─────┐   |
|   │ ▼ │   |
|   └─────┘   |
+-------------+
```

In the manifest, mark which icons are maskable:

```json
{ "src": "/icons/icon-maskable.png", "sizes": "512x512", "purpose": "maskable" }
```

Without a maskable icon, Android may add white padding around your icon to ensure the mask doesn't crop. That's fine but looks slightly off-brand. With a maskable icon, you control exactly what's inside the mask.

## Apple Touch Icon

iOS doesn't use the manifest as much (Safari has its own conventions). For iOS home-screen and bookmark icons:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

180×180 is the right size for iPhone. iPad uses 152×152, but 180 scales down fine.

iOS doesn't honor SVG for touch icons. PNG only. iOS also applies a rounded-corner mask automatically, make your design with that in mind. Don't add rounded corners yourself; iOS will add them, and you'll get double rounding.

## Browser tab quirks

### Safari pinned tabs

Safari supports a separate **monochrome SVG** for pinned tabs:

```html
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
```

This is an SVG with a single color (Safari recolors it). Mostly used by sites that get pinned often (Gmail, GitHub). Optional for everyone else.

### Edge / Windows

Windows tile icons (for "pin to taskbar / start menu"):

```html
<meta name="msapplication-TileColor" content="#3b82f6" />
<meta name="msapplication-TileImage" content="/mstile-144x144.png" />
```

Largely legacy (Windows 8 era), but still respected by Edge for some integrations. Skip unless you have specific Windows users.

## Sizes, what's actually used in 2026

Forget the old "20 favicon sizes" generator output. Here's what each size is actually for:

| Size | Purpose | Required? |
|---|---|---|
| 16×16 | Browser tab (legacy) | Yes (PNG fallback) |
| 32×32 | Browser tab (high DPI) | Yes |
| 48×48 | Windows taskbar | No (auto-scaled) |
| 180×180 | iOS home screen | Yes |
| 192×192 | Android home screen | Yes (manifest) |
| 512×512 | PWA splash, Android | Yes (manifest) |
| SVG | Modern browsers | Yes (universal) |

Six sizes. The old advice to provide 16, 32, 48, 96, 144, 152, 192, 256, 512 + ICO is obsolete, modern systems pick from the 6 above.

## .ICO is mostly historical

The `.ico` format from 1999 is still recognized but largely unnecessary in 2026. Browsers prefer the explicit `<link rel="icon">` tags over the magic `/favicon.ico` lookup.

If you want maximum compatibility with very old systems and corporate proxies, you can still drop a `/favicon.ico` at the root. It's a 5KB file. But for modern browsers, your `<link>` tags do the work.

## Common mistakes

### Cache busting on icon updates

Browsers aggressively cache favicons. Update your logo, deploy, users still see old icon. The fix: query string busting:

```html
<link rel="icon" href="/favicon.svg?v=2" />
```

Bump `v=2` whenever you change the icon. Safari has historical bugs around this; sometimes a hard reload is required.

### Not testing dark mode

Your icon might look great on white tabs and disappear on dark tabs. Always test:

- Chrome tab in dark mode
- Firefox tab in dark mode
- macOS Safari with dark theme
- iOS dark mode home screen

Use the `@media (prefers-color-scheme: dark)` block in SVG to swap colors.

### Forgetting the manifest

Without a manifest, "add to home screen" produces a generic icon. With one, the user gets your branded icon. Five minutes of setup, lifetime of payoff.

### Using PNG only, no SVG

PNG looks crisp at one size only. On high-DPI screens, larger tab sizes, or split-screen views, the icon gets pixelated. SVG fixes this, it's tiny, modern, and supported.

### Including a `<link rel="shortcut icon">`

The `shortcut icon` rel was a Microsoft IE-ism from 1999. Modern browsers ignore the `shortcut` part. Use just `<link rel="icon">`.

## Quick checklist

Before launching:

- [ ] `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- [ ] `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />`
- [ ] `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />`
- [ ] `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`
- [ ] `<link rel="manifest" href="/manifest.json" />` with at least 192 and 512 PNG icons
- [ ] Icon visible on both light and dark tabs
- [ ] `theme-color` meta tag matches brand
- [ ] Test "Add to home screen" on Android and iOS

## Recommended workflow

1. **Design once** at 512×512 (Figma, Illustrator, anything). Export as SVG and PNG.
2. **Generate the bundle** with [Favicon Generator](/generator-tools/favicon-generator/), upload your SVG, get all sizes.
3. **Wire 5 link tags** in `<head>`. Don't add 30, the modern stack is smaller.
4. **Add a manifest.json** with at least 192 and 512 icons.
5. **Test dark mode** by toggling browser theme. Adjust SVG colors if needed.

The takeaway: the favicon is the smallest visible piece of your brand, and most teams ship a half-broken setup that misses iOS, dark mode, or PWA. The 2026 setup fits in five `<link>` tags. Get it right once, never touch again.

---

**Related tools on DevTools Online:**

- [Favicon Generator](/generator-tools/favicon-generator/), generate the full bundle
- [Color Converter](/color-tools/color-converter/), pick brand colors for theme-color
- [SVG Previewer](/web-tools/svg-icons/), preview SVG icons before deploy
- [HTML Minifier](/formatter-tools/html-minifier/), minify the final markup
