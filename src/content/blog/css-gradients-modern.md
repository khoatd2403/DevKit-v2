---
title: "CSS Gradients Beyond linear-gradient(): Conic, Radial, and Color Spaces"
slug: "css-gradients-modern"
description: "CSS gradients in 2026 support conic, radial, multiple colors, OKLCH, hue interpolation, and gradient masks. Here's the syntax, the gotchas, and the cases where each one is the right tool."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - css gradient
  - conic gradient
  - radial gradient
  - oklch gradient
  - css color spaces
tags:
  - CSS
  - Color
  - Tutorial
cover: "/og-image.svg"
excerpt: "linear-gradient() is the gradient most teams know about. CSS has three more gradient types and a new color-space system that produces dramatically smoother gradients. Most teams don't use them."
---

If you've used CSS for any length of time, you know `linear-gradient()`. Background fades from one color to another. Done. What you may not have caught up on: in 2026, CSS has four gradient functions, supports a dozen color spaces for interpolation, lets you control hue interpolation explicitly, and produces results that look genuinely different from the gradients of five years ago.

This is the practical tour.

## The four gradient functions

```css
background: linear-gradient(to right, red, blue);
background: radial-gradient(circle, red, blue);
background: conic-gradient(red, blue);
background: repeating-linear-gradient(45deg, red 0 10px, blue 10px 20px);
```

Each is also available with `repeating-` prefix for tile-style patterns.

### linear-gradient

```css
background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
```

Direction: `to top`, `to right`, `to bottom right`, or an explicit angle (`45deg`). Default: `to bottom`.

Multiple stops:

```css
background: linear-gradient(to right,
  #ef4444 0%,
  #f59e0b 25%,
  #10b981 50%,
  #3b82f6 75%,
  #8b5cf6 100%
);
```

This is the rainbow gradient. Use specific percentages when you want crisp transitions; omit them for even spacing.

### radial-gradient

```css
background: radial-gradient(circle, #fbbf24, #ef4444);
background: radial-gradient(circle at top right, #fbbf24, #ef4444);
background: radial-gradient(ellipse 80% 60% at center, #fbbf24, #ef4444);
```

Use for: spotlight effects, sunbursts, vignettes. The position controls where the center is.

### conic-gradient

```css
background: conic-gradient(red, yellow, green, blue, red);
```

Sweeps colors around a point like a pie chart. Especially useful for:

- Color wheels
- Pie charts in pure CSS
- Loading spinners
- Card-style angled effects

```css
.pie-chart {
  background: conic-gradient(
    #3b82f6 0% 25%,
    #8b5cf6 25% 60%,
    #ec4899 60% 100%
  );
  border-radius: 50%;
}
```

A pie chart, no SVG, no JS. Three lines of CSS.

[CSS Gradient Generator](/color-tools/css-gradient/) supports all three with visual editors — drag color stops, pick angles, copy ready-to-use CSS.

## The new color-space system

Until 2024, CSS gradients interpolated colors in **sRGB**, the historical RGB space. The result: gradients that go through grey or muddy colors in the middle.

```css
/* Old sRGB interpolation */
background: linear-gradient(to right, blue, yellow);
/* Goes through a muddy grey-green in the middle */
```

In 2024, CSS Color Module 4 added `in <color-space>` syntax:

```css
background: linear-gradient(in oklch to right, blue, yellow);
/* Goes through saturated cyan/green — perceptually smoother */
```

Common color spaces for gradients:

- **`oklch`** — perceptually uniform, the modern default. Best for "smooth" gradients.
- **`oklab`** — like oklch but with cartesian (a, b) instead of polar (chroma, hue) coordinates.
- **`hsl`** — hue-based, often preferred for rainbow effects.
- **`srgb`** — the legacy default. Use when you specifically need backward compat.
- **`hsl shorter hue`** — pick the shorter direction around the hue wheel.
- **`hsl longer hue`** — go the long way around for full-spectrum sweeps.

The single biggest visual upgrade you can make to a CSS gradient in 2026: add `in oklch`. It's free.

## Hue interpolation: short vs long

For hue-based color spaces (HSL, OKLCH), CSS lets you pick which direction around the color wheel to go:

```css
/* Goes via cyan (shorter on the hue wheel) */
background: linear-gradient(in oklch shorter hue, blue, red);

/* Goes via yellow/green (longer on the hue wheel) */
background: linear-gradient(in oklch longer hue, blue, red);

/* Always increasing hue values */
background: linear-gradient(in oklch increasing hue, blue, red);

/* Always decreasing hue values */
background: linear-gradient(in oklch decreasing hue, blue, red);
```

For most cases, `shorter hue` (the default) is what you want. `longer hue` is great for rainbow sweeps that traverse the full spectrum:

```css
.rainbow {
  background: linear-gradient(in hsl longer hue, red, red);
  /* Same color twice forces the gradient to go all the way around */
}
```

## Practical gradient recipes

### Subtle background tint

```css
background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
```

Useful for adding depth to flat designs without distracting from content.

### Glassmorphism backdrop

```css
.glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  backdrop-filter: blur(10px);
}
```

The semi-transparent gradient + blurred backdrop creates the "frosted glass" look.

### Animated gradient

```css
.animated-bg {
  background: linear-gradient(
    270deg,
    #3b82f6,
    #8b5cf6,
    #ec4899,
    #3b82f6
  );
  background-size: 400% 400%;
  animation: gradient-shift 8s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

Background size > 100% lets the animation slide the gradient across the visible area.

### Text gradient

```css
.gradient-text {
  background: linear-gradient(in oklch to right, #3b82f6, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

Renders text with a gradient fill. Works in all modern browsers; older versions need the `-webkit-` prefix.

### Border gradient

```css
.gradient-border {
  border: 4px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(in oklch 45deg, #3b82f6, #ec4899) border-box;
}
```

The trick is two backgrounds — one filling the padding (so the inside is solid), one filling the border (the gradient). Good for cards with branded borders.

### Gradient mask

```css
.fade-bottom {
  mask-image: linear-gradient(to bottom, black 70%, transparent);
}
```

Makes the bottom 30% of an element fade to transparent. Useful for "show more" effects on long content.

## Gotchas

### Performance

Gradients are GPU-friendly but not free. A page with 50 animated gradients will hit the GPU hard, especially on low-end mobile.

For static gradients, no concern. For animated ones, use `transform` and `will-change` hints, and don't animate `background-position` on huge elements.

### Banding on shallow gradients

A gradient with two very close colors (`#fff` to `#fefefe`) produces visible bands on screens with limited color depth — you'll see stripes instead of a smooth fade. Solutions:

- Use a third color stop in the middle to break up the bands
- Add a subtle noise overlay (a 20% opacity noise texture)
- Increase the contrast (if design allows)

### sRGB vs oklch on old browsers

`in oklch` is supported in all modern browsers (Safari 16.4+, Chrome 111+, Firefox 113+). For older browsers, the `in oklch` is ignored and sRGB interpolation is used. So your gradient will still render — it just won't be as smooth.

For mission-critical designs targeting old browsers, you might add an explicit middle color stop in sRGB-friendly form to compensate.

### Conic gradient browser support

`conic-gradient()` has been universal since 2022 — Chrome 69, Firefox 83, Safari 12.1. Older corporate browsers may still lack support, but you'd need to be supporting Internet Explorer to actually have a problem.

## Tools

- [CSS Gradient Generator](/color-tools/css-gradient/) — visual editor for linear, radial, conic
- [CSS Shadow Generator](/color-tools/css-shadow/) — pair with gradients for layered effects
- [Color Converter](/color-tools/color-converter/) — convert between sRGB, OKLCH, HSL
- [Color Palette Generator](/color-tools/color-palette/) — generate harmonious color stops

For browser-side experimentation, all of these run in the browser — copy your CSS, paste, iterate.

## Recommended workflow

1. **For background gradients**: use `linear-gradient` or `radial-gradient` with `in oklch`.
2. **For pie charts and color wheels**: `conic-gradient` is the right tool.
3. **For full-spectrum rainbow**: `linear-gradient(in hsl longer hue, red, red)`.
4. **For visual editing**: paste into [CSS Gradient Generator](/color-tools/css-gradient/), drag stops, copy CSS.
5. **For animation**: animate `background-position`, not `background` itself. Use `will-change` for hint.

The takeaway: most CSS gradients in production look the same as they did in 2018. `in oklch` is a free upgrade. Conic gradients are an underused tool. Modern color spaces produce smoother results, and the syntax has been stable since 2024 — there's no excuse to stay on sRGB anymore.

---

**Related tools on DevTools Online:**

- [CSS Gradient Generator](/color-tools/css-gradient/) — visual builder for all gradient types
- [CSS Shadow Generator](/color-tools/css-shadow/) — pair gradients with depth
- [Color Converter](/color-tools/color-converter/) — between RGB, HSL, OKLCH
- [Color Palette Generator](/color-tools/color-palette/) — design system colors
