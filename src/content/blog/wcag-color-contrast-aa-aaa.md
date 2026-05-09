---
title: "WCAG Color Contrast: Passing AA, AAA, and What Designers Get Wrong"
slug: "wcag-color-contrast-aa-aaa"
description: "Why your light-grey body text fails accessibility, what AA and AAA contrast ratios actually mean, and the new APCA standard that's gradually replacing WCAG 2 contrast."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - wcag contrast
  - color contrast checker
  - accessibility ratio
  - aa aaa contrast
  - apca contrast
tags:
  - Accessibility
  - Color
  - Reference
cover: "/og-image.svg"
excerpt: "Light grey on white is the most common accessibility failure. Twenty percent of users can't read it. The fix is a 30-second check, but you have to know what to check for."
---

You design a clean, modern landing page. Body text is `#999` on white. It looks sophisticated. It also fails WCAG AA contrast — and about 20% of your users (older eyes, low-end displays, sunlight) literally can't read it.

Color contrast is one of the cheapest accessibility fixes available. The math is simple, the tooling is free, and once you know what passes, designing for it becomes second nature.

## TL;DR

| Type | WCAG 2 AA | WCAG 2 AAA |
|---|---|---|
| Normal text (under 18pt / 14pt bold) | 4.5:1 | 7:1 |
| Large text (18pt+ / 14pt+ bold) | 3:1 | 4.5:1 |
| UI elements / icons | 3:1 | (no AAA standard) |

If your body text against background is below 4.5:1, it fails. Period.

The most common failure: subtle grey body text. Some examples:

- `#999` on white = 2.85:1 ❌ fails AA
- `#777` on white = 4.48:1 ❌ fails AA (just barely)
- `#767676` on white = 4.54:1 ✅ passes AA
- `#595959` on white = 7.0:1 ✅ passes AAA

A few hex values determines whether 1 in 5 users can read your site.

## What contrast ratio actually means

The contrast ratio is computed by:

```
ratio = (L1 + 0.05) / (L2 + 0.05)
```

Where L1 is the lighter color's relative luminance and L2 is the darker. The numerator and denominator are normalized so:

- 1:1 = identical colors (no contrast at all)
- 21:1 = black on white (maximum)

WCAG 2 thresholds:

- **AA**: 4.5:1 (normal), 3:1 (large)
- **AAA**: 7:1 (normal), 4.5:1 (large)

The math involves gamma correction:

```
L = 0.2126 × R' + 0.7152 × G' + 0.0722 × B'
```

Where R', G', B' are gamma-decoded RGB. The coefficients (0.2126, 0.7152, 0.0722) reflect human perception — green looks brighter than red at the same intensity, blue darker.

You don't need to compute this by hand. Paste two colors into [Color Contrast Checker](/color-tools/color-contrast/) and see the ratio with pass/fail markers.

## The AAA target is realistic for most sites

A common pushback: "AAA is too strict for design." It isn't. AAA is mostly the same as AA for large headings (both at 4.5:1) and only requires 7:1 for body text — which is close to "use real black, not light grey."

If your design system aims for AAA on body text, you'll never accidentally fail AA. You'll also be readable to people with mild vision impairments (most older adults) without forcing them to crank up zoom.

Recommended targets in 2026:

- **Body text**: AAA (7:1)
- **Headings, large text**: AA (3:1) is fine
- **Captions, helper text**: AA (4.5:1) — these are still reading-critical

## Where contrast usually breaks

### Light grey body text on white

The classic. Designers use light grey to "tone down" body text, but the result is unreadable for many users. Solutions:

- Use a slightly darker grey (`#595959` for AAA, `#767676` for AA)
- Or commit to dark text (`#333` is essentially dark grey, passes everything)

### Subtle helper text

Form helper text often falls below 3:1. "Optional," "max 50 chars," "we'll never share your email" — these are crucial information and need to be readable.

### Disabled buttons

A common pattern: greyed-out buttons that look "off." If they're so grey they don't contrast with the background, users can't tell they exist (versus just being styled differently).

WCAG technically exempts disabled UI from contrast, but this exemption was probably a mistake — users still need to perceive that a control exists. Aim for at least 3:1 on disabled controls so they're visible but visually de-emphasized.

### Light text on photo backgrounds

Hero sections with text over an image. The contrast is variable across the image — high in some parts, terrible in others. Solutions:

- Add a dark overlay (e.g., `rgba(0,0,0,0.5)` over the image)
- Use a subtle text shadow
- Move text to a solid-colored area

### Color-only indicators

Required field marked only with red text. Color-blind users (8% of men) may not see "red text" as different from "regular text." Always pair color with another cue: an asterisk, an icon, italic, etc.

## Special cases

### Logos and decorative content

Decorative graphics are exempt from contrast requirements. A logo that uses your brand colors doesn't need to pass 4.5:1. Buttons, links, and informational graphics do.

### Gradients

Text over a gradient: check contrast at the **darkest part** of the gradient (or wherever text appears). If gradient varies under text, default to whichever side is closer to the text color.

### Hover and focus states

Hover states often reduce contrast. A button that's blue on white but becomes light blue on hover may fail at hover. Test all states, not just default.

Focus indicators need contrast too — a focus ring that's light blue on a light background is invisible. Browser default focus rings are usually fine, but custom focus styles need the contrast check.

## The new standard: APCA

WCAG 2's contrast formula has known issues. It treats dark-on-light and light-on-dark identically (they're not perceptually identical). It penalizes some color combinations that look fine and accepts some that don't.

**APCA** (Accessible Perceptual Contrast Algorithm) is the proposed replacement. It's based on perceptual models and gives more accurate results, especially for dark-mode designs.

WCAG 3 (still in draft as of 2026) is expected to incorporate APCA. The threshold targets are different:

- **Lc 60+**: roughly equivalent to AA (good for body text)
- **Lc 75+**: roughly equivalent to AAA

Some teams (Microsoft Fluent, GitHub Primer) have already moved to APCA internally. For now, WCAG 2 ratios remain the legal/regulatory standard. APCA is the more accurate tool.

Practical advice: use WCAG 2 for compliance, APCA for design judgment. They mostly agree; when they disagree, APCA is usually right.

## Color blindness considerations

Roughly 8% of men have some form of color vision deficiency. The most common forms:

- **Deuteranopia / deuteranomaly** (red-green) — most common
- **Protanopia / protanomaly** (red-green, slightly different)
- **Tritanopia** (blue-yellow) — rare

Things to watch:

- **Red and green look similar** to deuteranopes. Don't pair them as the only differentiator (red = error, green = success). Add icons.
- **Bright red on dark background** can look brown. Use dark red on light or saturate the red.
- **Color-coded charts** — pie charts and graphs that rely on color need patterns, labels, or shape variation.

Tools like [Color Contrast Checker](/color-tools/color-contrast/) often include color-blindness simulation. Check your designs in deuteranopia mode at minimum.

## How to integrate contrast checks into workflow

### Design tools

- **Figma**: install the "Contrast" plugin or "Stark"
- **Sketch**: built-in or via plugin
- **Adobe XD**: built-in plugin

### Design tokens

Bake contrast into your design system. Define text colors at the token level with verified contrast:

```scss
:root {
  --color-text-primary: #1a1a1a;     // 17.4:1 on white — AAA
  --color-text-secondary: #4a4a4a;   // 9.7:1 on white — AAA
  --color-text-tertiary: #6b6b6b;    // 5.9:1 on white — AA
}
```

Anyone using a token gets known-good contrast.

### Browser tools

- Chrome DevTools "Contrast" panel (right-click an element → "Inspect" → look for contrast ratio in the styles panel)
- Firefox accessibility audit tool
- Lighthouse accessibility audit

These flag low-contrast text automatically.

### Manual testing

For ad-hoc checks: paste foreground and background colors into [Color Contrast Checker](/color-tools/color-contrast/). Get the ratio, see AA/AAA pass/fail, see live preview.

## Recommended workflow

1. **Define brand colors** with contrast verified at design time. Keep tokens for primary, secondary, tertiary text.
2. **For body text**: target AAA (7:1) — gives you margin for users with low-end displays.
3. **For UI elements**: 3:1 minimum, including borders and icons.
4. **Test dark mode** as carefully as light mode. Same rules apply, different colors.
5. **Run automated checks** — Lighthouse / axe / Stark — in your build or pre-commit. Fail builds on contrast regressions.
6. **For ad-hoc inspection**: [Color Contrast Checker](/color-tools/color-contrast/) — paste two hex codes, see result.

The summary: contrast is the cheapest accessibility win available. A 30-second check during design saves hours of post-launch retrofit. And it's not just about compliance — readable text helps **every** user, not just those with vision issues.

---

**Related tools on DevTools Online:**

- [Color Contrast Checker](/color-tools/color-contrast/) — paste 2 colors, see WCAG result
- [Color Converter](/color-tools/color-converter/) — between hex, RGB, HSL, OKLCH
- [Color Palette Generator](/color-tools/color-palette/) — design tokens with contrast in mind
- [CSS Filter Generator](/web-tools/css-filter-generator/) — for color-mode-aware tints
