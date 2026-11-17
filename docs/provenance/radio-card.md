# Provenance: RadioCard

- **Source:** none. shadcn/ui has no "radio card" file in `new-york-v4`. RadioCard is our own component, built on the adopted RadioGroup item (`docs/provenance/radio-group.md`) and recorded in D-146 (D-049 applies to adopted components only).
- **Written:** 2026-11-17
- **Our files:** `packages/ui/src/components/radio-card.tsx`, `radio-card.styles.ts`

## Dependencies

| Package                       | Why                                          |
| ----------------------------- | -------------------------------------------- |
| `@radix-ui/react-radio-group` | the `Item` primitive, as RadioGroupItem does |
| `lucide-react`                | `CheckIcon` for the selected mark            |

## Design

1. The card is the radio: a `RadioGroupPrimitive.Item` button, so the whole card is the pointer target and keyboard, roving focus and form behaviour are Radix's.
2. `label` is the accessible name (`aria-labelledby`); `description` is linked with `aria-describedby` and merged with a caller's. `media` is hidden from assistive technology.
3. The selected state is a heavier border (`ds-border-strong`) and a check mark, not colour alone. Invalid and disabled follow RadioGroupItem (`group-aria-invalid`, `disabled.*` tokens).
4. Colours are existing roles only (`input`, `border.control`, `primary`, `on primary`), so no new contrast pair or token is needed.
5. Use it inside `RadioGroup`, inside `Fieldset`.
