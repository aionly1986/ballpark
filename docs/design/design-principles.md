# Ballpark Design Principles

The single source of truth for how everything we build looks and feels. Derived
from the reference UI in `references/` (Cal.com — a product we're deliberately
modeling). When you design or review any screen, check it against this file and
the reference screenshots. If a new design pulls away from this, that's a
regression, not a style choice — fix it or raise it explicitly.

**North star:** *Everything you need is there; everything you don't is not.*
Minimalistic, trustworthy, modern — a Notion / Cal.com feel. On a money-and-legal
(YMYL) topic, restraint reads as competence. Clutter reads as a scam.

---

## 1. The five rules that matter most

1. **Monochrome first, hue last.** The interface is near-black, white, and grays.
   Color is a scarce resource used only to carry meaning (a link, a selected
   state, a status tag). A page should look almost entirely neutral.
2. **One primary action per view.** The most important action is a solid
   near-black button. Everything secondary is a bordered white button or a plain
   text link. Never two competing solid buttons.
3. **Progressive disclosure.** Show the common path; hide the advanced. Optional
   and rarely-used controls are collapsed, toggled off, or behind an "Edit".
   (See the booking-form screenshot: extra questions are toggled off by default.)
4. **Hairlines, not boxes-in-boxes.** Separate content with 1px light-gray
   borders and whitespace, not heavy cards, shadows, or filled panels.
5. **Generous, consistent whitespace.** When in doubt, add space. Cramped is the
   fastest way to look untrustworthy.

---

## 2. Layout

- **Roomy content column.** Content sits in a comfortable max-width column
  (~48rem for reading/forms), centered, never full-bleed text.
- **Group navigation by intent.** In the reference, the sidebar is grouped
  (Setup / Booking experience / Policies / …) with small uppercase group labels.
  Mirror that when we have multi-section settings.
- **Live preview on the right.** Where it helps (a calculator, a form), show the
  real thing beside the controls on a subtly muted background (`surface-muted`),
  so the user sees output as they change inputs. Our calculator already does this.
- **Section dividers.** Separate logical groups with a hairline and vertical
  space, not with nested cards.
- **Above the fold.** Prefer layouts where the whole tool (inputs + result) is
  visible without scrolling on a typical desktop. Keep forms compact (a 2-column
  grid, concise option labels) rather than long single-column stacks. Don't make
  the user scroll to reach the result.

---

## 3. Color

Neutral by default. See `design-tokens.md` for exact values.

- **Text:** near-black headings (`ink`), medium-gray body (`ink-soft`),
  light-gray captions/placeholders (`ink-faint`).
- **Surfaces:** white content on a very light gray page (`surface-muted`),
  hairline borders (`surface-border`).
- **Primary action = near-black.** Solid `ink` background, white text. This is
  the Cal.com "Save / Confirm" button. It is our default CTA color.
- **Two layers, two color rules.** The **tool** (the calculator itself: inputs,
  tabs, result card, buttons) stays **monochrome** near-black/white/gray. The
  **content/guide below the tool** gets a **low-key color layer**: navy headings
  (`brand-navy`), indigo accents (`accent`) for links/icons/badges/key numbers,
  soft indigo tints (`accent-soft`) for info boxes/formulas/feature panels, and
  amber (Tailwind `amber-50/200/700`) for warning callouts. Color here carries
  meaning (info vs warning) and hierarchy so the content is skimmable at a glance,
  never loud. Use the components in `components/content.tsx` (Callout, Panel,
  Formula, Step, Example), styled via `mdx-components.tsx`. Reference:
  `references/Screenshot 2026-07-08 at 11.52.*`.
- **Accent for the future CTA.** The primary lead CTA (when capture returns) still
  gets the accent hue as its one saturated element. It is the same indigo, now
  also used in the content layer.
- **Semantic tags, used sparingly.** Small pill badges: neutral for status
  (Required / Hidden / Optional), and at most a couple of tints (e.g. amber for
  "upgrade/attention", green for success/confirmed). Don't invent new colors.

> **Phase decision — traffic first (current):** we are NOT rendering any lead
> forms or CTAs yet. The pages are pure tools plus educational content, tuned to
> match search intent and to show Google and users zero monetization signals.
> All tool buttons are **near-black**. Capture is reintroduced only once we have
> traffic (one calculator, or globally).
>
> **When capture returns:** the *single primary lead CTA* is the ONE place a
> saturated **accent color** is allowed — it must be the only saturated color on
> the page and still pass the trust test. Every ordinary tool button stays
> near-black. Decide the accent once, then keep it identical across every page.

---

## 4. Typography

- **One sans-serif family** (system UI stack — no web-font fetch; keeps it fast).
- **Clear, restrained hierarchy:** large semibold page titles; medium-weight
  section headings; regular body at a comfortable line-height (~1.6).
- **Labels are small, medium-weight, near-black** — quiet but legible (see every
  field label in the reference).
- **Numbers are the hero on result screens** — the estimate range is the biggest,
  boldest thing on the calculator. Everything else defers to it.
- Don't use more than ~3 type sizes in a single view.

---

## 5. Components

- **Inputs:** white, hairline border, generously rounded (`rounded-xl`),
  comfortable padding, a subtle accent focus ring. Every input has a visible
  label above it.
- **Buttons:** rounded. Primary = solid near-black. Secondary = white + hairline
  border + dark text. Tertiary = plain text link. Disabled = reduced opacity.
- **Toggles:** pill switches that turn near-black when on (Cal.com style) — used
  to enable/disable optional fields.
- **Badges/pills:** small, rounded, quiet. Status words, not decoration.
- **Cards:** white, hairline border, soft (barely-there) shadow, rounded-2xl.
  Used for the result and the lead form. Avoid stacking cards inside cards.
- **Icons:** simple line icons (Lucide-style), consistent stroke weight, used to
  aid scanning — never filled or colorful.
- **Dialogs:** centered, compact, white, hairline border over a dimmed page (see
  `references/06-delete-modal.png`). A plain-text secondary (`Cancel`) next to a
  single filled primary. Don't overload a modal with content.
- **Destructive actions:** the ONE place red belongs — a filled red confirm
  button, always behind a confirmation dialog, never as the default focus. Red is
  reserved for destructive + error only; it is never decorative.

---

## 6. Motion & feedback

- Minimal, fast, functional. Instant results (no spinners for the calculation).
- Subtle transitions on hover/focus only. No bouncing, no decorative animation.
- Confirmation is calm and reassuring — a single check and a plain summary (see
  the "This meeting is scheduled" screenshot), not confetti.

---

## 7. Do / Don't

**Do**
- Default to neutral; earn every use of color.
- Give one clear primary action per screen.
- Hide advanced options until asked for.
- Keep the estimate range the visual hero.
- Reuse the shared tokens and components (`design-tokens.md`).

**Don't**
- Add gradients, multiple bright colors, drop-shadows-on-everything, or emoji as UI.
- Put two solid/competing buttons side by side.
- Crowd fields together or wrap content edge-to-edge.
- Introduce a new color, font, radius, or shadow without updating the tokens.
- Add anything the user doesn't need on this screen.
- Use em dashes (—) in page copy. Use commas, colons, periods, or parentheses
  (global content rule).
- Push the result below the fold when a compact layout would fit.

---

## 8. How this is enforced (the feedback loop)

Every new or changed screen is checked against `ui-review-checklist.md` during
the fresh-eyes review (see `directives/design-and-seo.md` and
`directives/build-calculator.md`). The reference screenshots in `references/` are
the visual anchor — when unsure, open them and compare. Update this file when we
make a real, intentional design decision; ask before overwriting it.
