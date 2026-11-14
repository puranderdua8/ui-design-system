# Themes

Four themes ship with `@puranderdua/ui`: **Base** (the default grey and Inter), **Corporate**, **Nature** and **Quirky** (D-053). A theme is only tokens: `tokens/themes/<name>/{color,dimension,effects,typography}.json`. Components never branch on the theme (D-048). Every theme defines exactly Base's keys; `pnpm tokens:check` fails on a missing key or a failing contrast pair.

> Status: **all four themes are final (S30, S31)** and ship in 0.7.0. The maintainer reviewed Corporate, Nature and Quirky in Storybook on 2026-11-13 with no adjustments; every story passes axe under each theme.

## Using a theme

Import `foundations.css` plus **one** theme file, and load the theme's fonts (the package ships no font files):

```css
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@import "@puranderdua/ui/themes/nature.css";
```

To switch at run time, apply the resolved var map from `@puranderdua/ui/themes/<name>.json` (`vars`) as inline CSS variables, for example with `ThemeScope`. Storybook does this with the **Theme** toolbar; portals (Select) stay themed because `ThemeScope` is their container.

## Fonts

All fonts are free Google Fonts. The theme token names the family with a system fallback; the consumer loads the font. Plain `<link>` for all of them (what Storybook does, in `apps/docs/.storybook/preview-head.html`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap"
/>
```

Weights 400 to 700 are the ones the tokens use. If your site sends a Content-Security-Policy, allow `https://fonts.googleapis.com` in `style-src` and `https://fonts.gstatic.com` in `font-src` (this repo's site does, in `apps/site/next.config.ts`).

Other themes, same pattern (swap the `family=` parts):

- Corporate: `family=IBM+Plex+Sans:wght@400;500;600;700`
- Quirky: `family=Bricolage+Grotesque:wght@400;500;600;700`

### With `next/font` (Next.js)

`next/font` self-hosts the files, so no CSP change is needed and there is no request to Google at run time. Give each font a CSS variable and map it onto the theme's family vars in your global CSS. Nature:

```tsx
// app/layout.tsx
import { Fraunces, Nunito_Sans } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});
const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* globals.css, after the theme import */
:root {
  --ds-font-family-heading: var(--font-fraunces), Georgia, serif;
  --ds-font-family-body: var(--font-nunito), system-ui, sans-serif;
}
```

Corporate uses `IBM_Plex_Sans` for both vars (`variable: "--font-plex"`); Quirky uses `Bricolage_Grotesque` (`--font-bricolage`). Both families are mapped onto the same two `--ds-font-family-*` vars. If you switch themes at run time with a JSON map, the map sets those vars too, and an inline value beats your `:root` mapping. The map names the family ("Fraunces, Georgia, serif"), which `next/font` does not use (it generates its own family name), so map it yourself when applying the vars: replace the leading family with `var(--font-fraunces)` and keep the fallback stack.

**How this repo's site does it (S32):** `apps/site/src/app/layout.tsx` declares all five fonts with `next/font` (Inter preloads, the others set `preload: false`, so a page downloads a theme's font file only once text uses it). `apps/site/src/lib/theme.ts` `import()`s the chosen `themes/<name>.json` (one chunk per theme), swaps the two font-family vars as above, applies the map inline on `<html>` and caches it in `localStorage` (`ds-theme`). A small inline script in `<head>` applies the cached map before first paint, so a reload does not flash Base.

| Theme     | Heading             | Body                |
| --------- | ------------------- | ------------------- |
| Base      | Inter               | Inter               |
| Corporate | IBM Plex Sans       | IBM Plex Sans       |
| Nature    | Fraunces (serif)    | Nunito Sans         |
| Quirky    | Bricolage Grotesque | Bricolage Grotesque |

## Directions and rationale

Palettes are built in OKLCH (fixed lightness per step, chroma and hue per theme, chroma reduced until the colour fits sRGB) and converted to hex. The key set is Base's: `brand` 50–900, `accent` 50–900, `neutral` 0–950, `red` 50/600/700, plus `white` and `scrim`.

|                     | Corporate                                                                           | Nature                                                                     | Quirky                                               |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Brand (hue)         | navy-blue (255), primary `#1762b6`                                                  | forest and moss (150), primary `#2f7442`                                   | violet (295), primary `#703dc6`                      |
| Neutrals            | cool blue-grey (255)                                                                | warm earth (90); canvas is ivory `#fffefa`                                 | violet-tinted (300)                                  |
| Accent (hue)        | teal (195)                                                                          | terracotta and ochre (55)                                                  | coral (38)                                           |
| Danger              | red (27)                                                                            | brick (30)                                                                 | crimson (25)                                         |
| Radius sm / md / lg | 2 / 4 / 6px                                                                         | 6 / 12 / 20px                                                              | 12 / 20 / 28px                                       |
| Border widths       | 1 / 2px                                                                             | 1 / 2px                                                                    | 2 / 3px                                              |
| Focus ring          | 2px, offset 2px                                                                     | 2px, offset 2px                                                            | 3px, offset 2px                                      |
| Shadows             | crisp: 1px/2px and 4px/10px, low alpha                                              | diffuse: 2px/8px and 12px/40px, warm tint                                  | hard offset, no blur: 2px 2px and 6px 6px, solid ink |
| Density             | compact: space steps from 3 up about 12% tighter, controls 28 / 36px, sidebar 15rem | relaxed: steps from 3 up 12–25% roomier, controls 36 / 44px, sidebar 17rem | Base spacing, controls 36 / 44px                     |
| Type scale          | 12–40px, line height 1.45                                                           | 12–52px, base 17px, line height 1.6                                        | 12–56px, tight 1.1 headings, letter spacing -0.03em  |
| Motion              | 80 / 150ms, standard curves                                                         | 200 / 350ms, slow in and out                                               | 150 / 300ms, overshooting curves (bounce)            |

Pointer targets never go below `size.target.min` (24px, WCAG 2.5.8): Corporate's smallest control is 28px.

### The accent role (0.8.0, D-084)

Every theme has a `color.accent` scale (Base steel-blue, hue 250, restrained beside the grey brand). Two semantic roles read it: `text.accent` (accent.700, 4.5:1) and `accent.border` (accent.600, 3:1), re-mapped in every surface tone through `on-raised`, `on-inverse` and `on-brand`. Components use it as a second voice for selection and highlight: the `Tabs` active label and bar, and `Card variant="accent"`. It never replaces the brand on an action. Utilities: `text-ds-accent`, `bg-ds-accent-border`, `border-ds-accent-border`. The site playground's accent knob (it generates `--ds-color-accent-50..900`) drives this role in `/playground` (the site is on 0.8.0).

## Contrast

`pnpm tokens:check` runs the full matrix (every tone × role, from `tokens/contrast-pairs.json`) for each theme: **200 checks per theme (180 before the accent role), all pass for all four**, with no token adjustments needed. Accent: `text.accent` on canvas 8.49 / 8.16 / 8.71 / 9.05 and `accent.border` on canvas 6.00 / 5.75 / 6.19 / 6.47 (Base / Corporate / Nature / Quirky). Headline ratios (text 4.5:1, UI 3:1):

| Pair                                              | Base  | Corporate | Nature | Quirky |
| ------------------------------------------------- | ----- | --------- | ------ | ------ |
| text.primary on canvas                            | 16.88 | 16.90     | 16.72  | 16.97  |
| text.muted on subtle                              | 6.07  | 5.50      | 5.52   | 5.51   |
| text.link on canvas                               | 9.59  | 8.58      | 8.04   | 9.27   |
| text.on-brand on surface.brand (= primary action) | 7.00  | 6.07      | 5.63   | 6.62   |
| focus.ring on canvas (3:1)                        | 7.00  | 6.07      | 5.63   | 6.62   |
| border.control on subtle (3:1)                    | 4.14  | 3.92      | 3.94   | 3.93   |
| feedback.danger.fg on canvas                      | 7.42  | 8.83      | 8.67   | 8.84   |

Storybook runs axe on the **Theme specimen** story once per theme (`Foundations/Theme specimen`: Base, Corporate, Nature, Quirky), so the story test run covers all four. To run every story under one theme: `VITE_DS_THEME=nature pnpm --filter docs exec vitest run` (unset means Base). S30 ran all 111 story tests under Corporate and Nature, 0 axe violations; S31 does Quirky.
