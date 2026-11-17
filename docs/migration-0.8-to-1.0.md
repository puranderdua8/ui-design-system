# Migrating from 0.8 to 1.0

1.0.0 is the 0.9.0 release with its deprecated names removed. Every breaking change landed in **0.9.0**; **1.0.0 only removes the three prop names that 0.9.0 still accepted with a warning**. So migrate in two steps and the second one is small:

1. **Upgrade to 0.9.0** and work through sections 1 to 6 below. In development the old prop names still work and log one warning each, so you can find every use.
2. **Upgrade to 1.0.0** once the console is quiet. Nothing else changes (see "1.0.0 itself").

From 1.0.0 the rules in [`versioning.md`](versioning.md) apply: breaking changes only in a major, deprecations overlap for one minor release.

## 1. Renamed props (the 0.9.0 names are removed in 1.0.0)

| Component | Old         | New            | Notes                                                                             |
| --------- | ----------- | -------------- | --------------------------------------------------------------------------------- |
| `Section` | `container` | `contentWidth` | A `ContainerSize`. `container` is now only the portal element of `SelectContent`. |
| `Banner`  | `container` | `contentWidth` | Default stays `lg`.                                                               |
| `Banner`  | `align`     | `justify`      | Position of the content on the column's main axis (`start` or `center`).          |
| `Sidebar` | `side`      | `sidebarSide`  | `start` or `end`. The `data-side` attribute is unchanged.                         |

Find them: `grep -rnE "<(Section|Banner)[^>]*\bcontainer=|<Banner[^>]*\balign=|<Sidebar[^>]*\bside=" src`. In 1.0.0 a TypeScript project reports each as a type error; plain JavaScript silently ignores the prop, so search first.

## 2. Removed (no replacement period)

| Removed                                                                                                                                                                                     | Use instead                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sidebar` `sidebarClassName`                                                                                                                                                                | `sidebarProps={{ className }}`                                                                                                                                                                          |
| Exports `checkboxClasses`, `radioGroupItemClasses`, `tabsClasses`, `tabsListClasses`, `tabsTriggerClasses`, `tabsContentClasses`, `selectTriggerVariants`, `bannerVariants`, `cardVariants` | Pass `className` to the component, or use a variant type such as `ButtonVariant`. The public style exports are `textVariants`, `headingVariants`, `buttonVariants`, `linkVariants` and `inputVariants`. |
| `SelectScrollUpButton`, `SelectScrollDownButton`, `SelectScrollButtonProps`                                                                                                                 | Nothing: `SelectContent` renders them.                                                                                                                                                                  |
| The `BannerVideoProps` type                                                                                                                                                                 | `BannerVideoSource` (still exported).                                                                                                                                                                   |
| `Grid` with both `cols` and `minItemWidth`                                                                                                                                                  | Use one. It is a type error (and a development warning from JavaScript); `minItemWidth` used to win.                                                                                                    |

## 3. Behaviour changes to check

- **`Grid` with `cols`:** the outermost element is now a `w-full min-w-0` wrapper that takes `className`, `style` and `data-*`. `as`, `ref`, `role`, `id` and `aria-*` stay on the grid element inside it. A `className` such as `col-span-2` or `self-start` now works on the Grid itself. `cols` needs a parent with a definite width.
- **`CardTitle` and `CardDescription`** have their own `data-slot` (`card-title`, `card-description`; they were `heading` and `text`). Update any selector on `[data-slot="heading"]` or `[data-slot="text"]` that matched inside a Card.
- **`data-slot`** is set after your props, so you can no longer overwrite it (`SelectGroup` and `SelectValue` used to allow it).
- **`BannerVideo`** no longer starts on mount: it gets no `src` until it first comes into view (or the visitor presses Play), plays only while in view, and does not restart a video the visitor paused. Tests that expect playback right after render must scroll the video into view first.
- **`Field` `id`** is the control's id: a control inside a `Field` that sets its own `id` logs a development warning, and the Field's id wins. Check any `<Field id="a"><Input id="b" /></Field>`; set the id on the `Field` instead.
- **Overlays no longer portal into the theme scope.** `SelectContent` renders in `document.body` (or its `container`) through `ScopedPortal`, which re-applies the nearest `ThemeScope`'s theme, vars and `dir` plus the raised tone. A test or style that looked for an open `Select` list inside the scope element must look in `body`. `usePortalContainer()` returns `document.body` in the browser and `null` on the server, never a scope element; `ThemeScope` holds no state and is not a portal root. Use `ScopedPortal` for your own portals.
- **Control line-height:** `text-ds-control-sm|md` now also set `line-height` (1.5), so Button, Input, Select items and Tabs triggers no longer inherit it from where they sit.

## 4. Dependencies and CSS setup

- **Tailwind is a peer dependency** (`tailwindcss` `^4.0.0`). If your install line did not list it, add it.
- **Radix:** the `radix-ui` umbrella is replaced by six `@radix-ui/react-*` packages (slot, checkbox, radio-group, select, tabs, direction). You install about 6 Radix packages instead of about 60; no code change, but delete any lockfile pin you made on `radix-ui` for this package.
- **`@source` line:** `foundations.css` now scans its own folder, so the `@source` line for the package is no longer needed. Remove it, or keep it if your tooling cannot see the package's CSS (see the README).
- **Right-to-left:** Radix assumes `ltr`. For an RTL page give `ThemeScope` a `dir` or wrap the app in `DirectionProvider` (see the README).
- The README's "Supported CSS setups" lists the import order, the no-`prefix()` rule and the cascade-layer rule.

## 5. Custom themes and tokens

Skip this section if you only import the shipped themes.

- **Three new primitives** are required: `size.icon.sm`, `size.icon.md` and `size.menu.min` (the shipped themes use 0.875rem, 1rem and 8rem). A theme exported from the playground before 0.9.0 must be exported again.
- **New semantic tokens** (`icon.size.*`, `control.gap`, `control.font-weight`, `control.sm|md.line-height`, `menu.*` including `menu.highlight-bg|fg`, `link.underline-offset`, `selection.marker-width`) all have a default alias, so a theme may omit them.
- **DTCG 2025.10 format.** The token sources and the playground export use Design Tokens Format Module 2025.10: dimensions are `{ "value": 0.25, "unit": "rem" }`, durations `{ "value": 100, "unit": "ms" }`, colours `{ "colorSpace": "srgb", "components": [r, g, b], "hex": "#..." }`, and `font.letter-spacing.*` is a unitless number. **A theme folder written with the old strings (`"0.25rem"`, `"#ffffff"`, `"100ms"`, `"-0.02em"`) no longer validates.** Convert it, or export it again from the playground. `pnpm tokens:check` names every value it rejects.
- **Theme CSS selector** is `:root, [data-ds-mode="light"]` and sets `color-scheme: light`. A rule that targeted `:root` alone for theme variables still works.

## 6. Checklist

1. Install `@puranderdua/ui@0.9.0` (and `tailwindcss` ^4 if missing).
2. Run your app and tests in development; fix every `@puranderdua/ui:` console warning.
3. Search for the four renamed props (section 1) and the removed exports (section 2).
4. Check the behaviour list (section 3) against your tests and selectors.
5. If you have a custom theme, apply section 5.
6. Install `@puranderdua/ui@1.0.0` and run the type check.

## 1.0.0 itself

The only package changes in 1.0.0 are the removal of the deprecated `Section` and `Banner` `container`, `Banner` `align` and `Sidebar` `side`, and the removal of the development warning that accompanied them. There are no token or CSS changes; three dependencies are added for the new components (`@radix-ui/react-slider`, `@radix-ui/react-toggle-group`, `@radix-ui/react-alert-dialog`). New in this release: the `Slider`, `RadioCard`, `ToggleGroup` and `AlertDialog` components (additive; nothing to migrate), `CONTRIBUTING.md`, Storybook Docs pages (props tables with usage and accessibility notes) and development warnings for `Split` without exactly two children and for `Grid` given both `cols` and `minItemWidth`.
