# Versioning and the public API (1.0.0 contract)

`@puranderdua/ui` follows [semantic versioning](https://semver.org). From 1.0.0 this file is the contract (D-096, R17): what is public, what counts as a breaking change, and how something is removed. Before 1.0.0 (0.x) minors may break, but H11–H19 already follow these rules so that 0.9.0 is the last breaking release before 1.0.0.

## The public surface

Everything below is public. Changing it incompatibly is a **major** change.

| Surface           | What is public                                                                                                                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package entries   | The `exports` map of `package.json`: `.` (components, hooks, types), `./foundations.css`, `./themes/<name>.css`, `./themes/<name>.json`, `./contrast-pairs.json`. Nothing under `dist/` outside it.                                                |
| Exports of `.`    | Every name exported from `src/index.ts`: components, their `*Props` types, the `<Name>Variant`/`<Name>Size` types, the `*Variants` functions named in R09, `cn`-free helpers such as `usePortalContainer`. A name that is not exported is private. |
| Props             | Prop names, accepted values, defaults, and the event/ref contract of every exported component. Typed refs follow D-034.                                                                                                                            |
| DOM contract      | `data-slot` values, `data-ds-theme`, and the roles, labels and keyboard behaviour a component documents.                                                                                                                                           |
| CSS classes       | `ds-*` recipe classes in `foundations.css` (for example `ds-tone-*`, `ds-layer-*`, `ds-hit-area`).                                                                                                                                                 |
| CSS variables     | `--ds-*` custom properties: their names and meaning. Their values belong to the theme.                                                                                                                                                             |
| Tokens            | Semantic token names (the role contract in `tokens/semantic/`) and the Tailwind utilities the bridge generates from them.                                                                                                                          |
| Theme JSON shape  | The structure of `themes/<name>.json` (`name`, `vars`) and the DTCG layout of a theme folder that `validate-tokens` accepts.                                                                                                                       |
| Peer requirements | React `^19`, Tailwind `^4`. Dropping a supported peer range is breaking.                                                                                                                                                                           |
| Module format     | **ESM only** (`"type": "module"`, an `import` condition and no `require`). Adding CommonJS later is not breaking; removing a format would be.                                                                                                      |

## Not public

Changing these is **not** breaking: the class strings a component applies (only the `ds-*` recipe class names are public, not which Tailwind utilities a component uses), the internal DOM structure beyond the `data-slot` and role contract, the exact **values** of tokens (a theme may change colours, sizes and fonts in a minor), generated files, private helpers, `sourcemap` and `dist` file names, test ids, and anything in `apps/`.

## What counts as breaking (major)

- Removing or renaming an export, a prop, a prop value, a `data-slot`, a `ds-*` class or a `--ds-*` variable.
- Changing a prop's meaning or default so that existing code behaves differently.
- Removing or renaming a semantic token, or changing the theme JSON shape.
- Making a themeable token **required** where custom themes did not need it (see below).
- Raising the minimum React or Tailwind major, or dropping a supported Node version for install.
- Changing a component's keyboard behaviour, role or accessible-name rules so that a previously passing consumer test or user flow fails.

## What is not breaking

- **Minor:** a new component, prop, prop value, export, token (with a default alias), `ds-*` class or theme; a new optional peer.
- **Patch:** a bug fix, including an accessibility fix that makes behaviour match the documented contract; a visual change inside a token value; a dependency update with no public effect.

When unsure, treat a change that can make a consumer's build, tests or layout fail as breaking.

## Deprecation

1. The release that deprecates names the replacement in the CHANGELOG and in the prop's JSDoc (`@deprecated`).
2. The old name keeps working for **one minor release of overlap** and logs a development-only warning (`console.warn` once per name when `process.env.NODE_ENV !== "production"`), naming the replacement.
3. The old name is removed in the **next major**. Nothing is removed in a minor or patch.

H16 applies this to the D-089 renames: `container` → `contentWidth`, Sidebar `side` → `sidebarSide`, Banner `align` → `justify` work with a warning in 0.9.0 (the overlap) and are removed in 1.0.0, the next major after 0.x. From 1.0.0 on, the one-minor overlap rule applies as written.

## New themeable tokens (D-095)

A new themeable semantic token must have a **default alias** to an existing primitive or token, so a custom theme keeps working without edits. A theme may define the token; it does not have to. `validate-tokens` warns, and does not fail, when a theme omits a token that has a default. This replaces the "copy these tokens into your theme" migration step used in 0.6.0 and 0.8.0. A token **without** a default is a breaking addition.

## Releases

Release steps, tags and provenance are in [`releasing.md`](releasing.md). Every release has a CHANGELOG entry that lists additions, deprecations (with the replacement), removals and a **Migration** section for anything that needs consumer action.
