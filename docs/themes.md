# Themes

Four themes ship with `@puranderdua/ui`: **Base** (the default grey and Inter), **Corporate**, **Nature** and **Quirky** (D-053). A theme is only tokens: `tokens/themes/<name>/{color,dimension,effects,typography}.json`. Components never branch on the theme (D-048). Every theme defines exactly Base's keys; `pnpm tokens:check` fails on a missing key or a failing contrast pair.

> Status: **S29 proposal.** Values and fonts below are the starting point for the maintainer's review in Storybook. S30 (Corporate, Nature) and S31 (Quirky) apply the feedback and finalise this page.

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

Weights 400 to 700 are the ones the tokens use. `next/font` snippets for each theme are added in S30.

| Theme     | Heading             | Body                |
| --------- | ------------------- | ------------------- |
| Base      | Inter               | Inter               |
| Corporate | IBM Plex Sans       | IBM Plex Sans       |
| Nature    | Fraunces (serif)    | Nunito Sans         |
| Quirky    | Bricolage Grotesque | Bricolage Grotesque |

## Directions and rationale

Palettes are built in OKLCH (fixed lightness per step, chroma and hue per theme, chroma reduced until the colour fits sRGB) and converted to hex. The key set is Base's: `brand` 50–900, `neutral` 0–950, `red` 50/600/700, plus `white` and `scrim`.

|                     | Corporate                                                                           | Nature                                                                     | Quirky                                               |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Brand (hue)         | navy-blue (255), primary `#1762b6`                                                  | forest and moss (150), primary `#2f7442`                                   | violet (295), primary `#703dc6`                      |
| Neutrals            | cool blue-grey (255)                                                                | warm earth (90); canvas is ivory `#fffefa`                                 | violet-tinted (300)                                  |
| Danger              | red (27)                                                                            | brick (30)                                                                 | coral-red (22)                                       |
| Radius sm / md / lg | 2 / 4 / 6px                                                                         | 6 / 12 / 20px                                                              | 12 / 20 / 28px                                       |
| Border widths       | 1 / 2px                                                                             | 1 / 2px                                                                    | 2 / 3px                                              |
| Focus ring          | 2px, offset 2px                                                                     | 2px, offset 2px                                                            | 3px, offset 2px                                      |
| Shadows             | crisp: 1px/2px and 4px/10px, low alpha                                              | diffuse: 2px/8px and 12px/40px, warm tint                                  | hard offset, no blur: 2px 2px and 6px 6px, solid ink |
| Density             | compact: space steps from 3 up about 12% tighter, controls 28 / 36px, sidebar 15rem | relaxed: steps from 3 up 12–25% roomier, controls 36 / 44px, sidebar 17rem | Base spacing, controls 36 / 44px                     |
| Type scale          | 12–40px, line height 1.45                                                           | 12–52px, base 17px, line height 1.6                                        | 12–56px, tight 1.1 headings, letter spacing -0.03em  |
| Motion              | 80 / 150ms, standard curves                                                         | 200 / 350ms, slow in and out                                               | 150 / 300ms, overshooting curves (bounce)            |

Pointer targets never go below `size.target.min` (24px, WCAG 2.5.8): Corporate's smallest control is 28px.

### Known gap: Quirky's coral accent

The direction asks for a violet primary with a coral accent. The semantic contract has no accent role (only brand, neutral and danger), so the coral lives in Quirky's `red` scale for now. A real accent needs a new semantic role and contrast pairs for every tone; that is a decision for the maintainer (see PROGRESS, S29).

## Contrast

`pnpm tokens:check` runs the full matrix (every tone × role, from `tokens/contrast-pairs.json`) for each theme: **180 checks per theme, all pass for all four**, with no token adjustments needed. Headline ratios (text 4.5:1, UI 3:1):

| Pair                                              | Base  | Corporate | Nature | Quirky |
| ------------------------------------------------- | ----- | --------- | ------ | ------ |
| text.primary on canvas                            | 16.88 | 16.90     | 16.72  | 16.97  |
| text.muted on subtle                              | 6.07  | 5.50      | 5.52   | 5.51   |
| text.link on canvas                               | 9.59  | 8.58      | 8.04   | 9.27   |
| text.on-brand on surface.brand (= primary action) | 7.00  | 6.07      | 5.63   | 6.62   |
| focus.ring on canvas (3:1)                        | 7.00  | 6.07      | 5.63   | 6.62   |
| border.control on subtle (3:1)                    | 4.14  | 3.92      | 3.94   | 3.93   |
| feedback.danger.fg on canvas                      | 7.42  | 8.83      | 8.67   | 8.84   |

Storybook runs axe on the **Theme specimen** story once per theme (`Foundations/Theme specimen`: Base, Corporate, Nature, Quirky), so the story test run covers all four. Checking every component story in each theme is S30/S31.
