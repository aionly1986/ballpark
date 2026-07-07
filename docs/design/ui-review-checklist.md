# UI Review Checklist (the feedback loop)

Run this against every new or changed screen during the fresh-eyes review, with
`references/` open beside you. The builder does not self-approve. If an item
fails, fix it or raise it explicitly — don't let the look drift.

## Compare to the reference first
- [ ] Open the screenshots in `references/`. Does this screen feel like the same
      product? If a stranger saw both, would they believe they're from one team?

## Restraint
- [ ] The whole tool (inputs + result) fits **above the fold** on a typical
      desktop, or is as compact as the content reasonably allows.
- [ ] **No em dashes (—)** anywhere in the copy (global content rule).
- [ ] The screen is **mostly neutral** (near-black / white / gray). Every use of
      color carries meaning (link, selected, status), none is decorative.
- [ ] Exactly **one primary action**, and it's the near-black button. No two
      competing solid buttons.
- [ ] Nothing on screen that the user doesn't need here. Advanced/optional
      controls are hidden, collapsed, or toggled off by default.

## Hierarchy & type
- [ ] Clear hierarchy: one page title, quiet section headings, small medium
      labels, comfortable body line-height.
- [ ] On result screens, the **estimate range is the visual hero** (biggest,
      boldest element).
- [ ] ≤ ~3 type sizes in the view. One sans-serif family only.

## Structure & spacing
- [ ] Content is in a comfortable max-width column, not edge-to-edge.
- [ ] Groups separated by **hairlines + whitespace**, not nested cards/heavy
      shadows.
- [ ] Generous, consistent spacing (tokens, not arbitrary values). Not cramped.

## Components & tokens
- [ ] Inputs: labeled, white, hairline border, `rounded-xl`, accent focus ring.
- [ ] Buttons/toggles/badges/cards match `design-tokens.md` (radius, color,
      shadow). No new hex values, radii, shadows, or fonts introduced.
- [ ] Icons are simple line icons, consistent weight, monochrome.

## Trust (YMYL)
- [ ] Looks credible enough to enter medical/financial details into. No clutter,
      no gimmicks, no aggressive color.
- [ ] Disclaimer/legal text present where required, quiet but readable.
- [ ] Lead form is calm and clear; consent checkbox is **not** pre-ticked.

## Responsive & performance
- [ ] Mobile-first: clean single-column on small screens, enhances up.
- [ ] Tap targets ≥ 44px. No horizontal scroll.
- [ ] LCP < 2.5s; server-rendered content; no unnecessary scripts.

## Decision hygiene
- [ ] Any intentional deviation from the principles is **documented** in
      `design-principles.md` / `design-tokens.md` (and asked about first), not
      silently introduced.
