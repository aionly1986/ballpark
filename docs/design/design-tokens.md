# Design Tokens

Concrete values behind `design-principles.md`. These map 1:1 to
`tailwind.config.ts` — if you change one, change both, and note why. Reuse these;
do not hardcode one-off hex values in components.

## Color

| Token             | Hex       | Use                                             |
| ----------------- | --------- | ----------------------------------------------- |
| `ink`             | `#111827` | Headings, primary text, **primary button bg**   |
| `ink-soft`        | `#4b5563` | Body copy                                        |
| `ink-faint`       | `#9ca3af` | Captions, placeholders, disabled text           |
| `surface`         | `#ffffff` | Content backgrounds (inputs, cards)              |
| `surface-muted`   | `#f9fafb` | Page background, preview panel                   |
| `surface-border`  | `#e5e7eb` | Hairline borders & dividers                      |
| `accent`          | `#4f46e5` | Reserved for the **future** primary lead CTA. **Unused now** (traffic-first phase is fully monochrome) |
| `accent-soft`     | `#eef2ff` | Faint accent fill — reserved with `accent`       |
| `accent-ink`      | `#3730a3` | Text on accent-soft — reserved with `accent`     |

**Semantic (use sparingly, only to carry status):**

| Meaning   | Suggested          | Use                                   |
| --------- | ------------------ | ------------------------------------- |
| Success   | green-600 `#16a34a` | Confirmed / booked check + label      |
| Attention | amber-500 `#f59e0b` | "Upgrade" / needs-action badges       |
| Error     | red-600 `#dc2626`   | Validation messages only              |

> The live UI is currently **fully monochrome** (Cal-style): near-black / white /
> gray, with red reserved for destructive/errors and green for a success check.
> Links, focus rings, and hovers are all **neutral**, not colored. The `accent`
> hue is held entirely in reserve for the future primary lead CTA — see
> `design-principles.md` §3.

## Typography

- **Family:** system sans stack (`ui-sans-serif, system-ui, -apple-system, …`).
  No web-font network fetch.
- **Sizes (Tailwind):** page title `text-3xl`→`text-4xl` semibold/bold; section
  heading `text-xl`/`text-2xl` semibold; body `text-base`/`leading-7`; label
  `text-sm font-medium`; caption `text-xs`. The result range is the largest thing
  on the page (`text-3xl`→`text-4xl` bold).
- **Max ~3 sizes per view.**

## Spacing & radius

- **Radius:** inputs/selects/buttons `rounded-lg`; cards `rounded-2xl`;
  badges/pills `rounded-full` or `rounded-md`.
- **Rhythm:** section gaps `gap-6`/`space-y-6`; field gaps `gap-4`/`gap-5`;
  card padding `p-6` (mobile) → `p-8` (desktop).
- **Reading width:** text/forms cap at `max-w-content` (48rem).

## Elevation

- One soft card shadow only: `shadow-card`
  (`0 1px 3px rgba(17,24,39,.06), 0 8px 24px rgba(17,24,39,.04)`).
- No heavier shadows. Depth comes from hairline borders + whitespace, not blur.

## Controls

- **Focus ring:** neutral — `focus:border-ink focus:ring-2 focus:ring-ink/10`.
- **Toggle:** off = gray track; on = `ink` (near-black) track.
- **Primary button:** `bg-ink text-white rounded-xl` + `hover:opacity-90` +
  `disabled:opacity-60`.
- **Secondary button:** `bg-surface border border-surface-border text-ink`.

## Mobile-first

Design the small screen first. Single column, then enhance to the
controls-plus-preview split at `lg`. Tap targets ≥ 44px. LCP < 2.5s.
