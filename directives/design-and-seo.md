# Directive: Design and SEO

Clean design is a trust and ranking lever here, not decoration. One shared design
system across every calculator.

## The design system is documented — use it
`docs/design/` is the source of truth for look and feel:
- `design-principles.md` — the philosophy and the rules.
- `design-tokens.md` — exact colors/type/spacing/component values (mirror of
  `tailwind.config.ts`).
- `references/` — screenshots of the product we model (Cal.com). Open them and
  compare when unsure.
- `ui-review-checklist.md` — run this against every new/changed screen during the
  fresh-eyes review. The builder does not self-approve the UI.

Match it. If you need to deviate, update the principles/tokens (and ask first) —
don't let the look drift.

## Design tokens (cal.com-clean / Notion-minimal)
- Defined in `tailwind.config.ts`. Reuse them — do not introduce one-off colors.
  - `accent` — the single accent color, used for CTAs and emphasis only.
  - `ink` / `ink-soft` / `ink-faint` — headings, body, captions.
  - `surface` / `surface-muted` / `surface-border` — backgrounds and borders.
- Generous white space. One accent color. Big, legible result numbers. Zero
  clutter. Mobile-first (design the small screen first, enhance up).

## Performance
- LCP under 2.5s. Pages are statically generated (SSG) — crawlers get clean
  server-rendered HTML; the calculation runs client-side and instantly.
- No third-party scripts, no analytics, no ad tags (unless the operator adds them
  later). System font stack — no web-font network fetch.

## SEO
- One page per one search term. `targetKeyword`, `metaTitle`, `metaDescription`,
  and a canonical URL come from the config.
- Unique on-page content per page — no boilerplate reused across calculators.
- FAQ schema: keep FAQs in the config's `faqs` array so they render on-page and
  emit `FAQPage` JSON-LD (see `src/lib/schema.ts`).
- Interlink hub and spokes: the home page links to every calculator; calculators
  should link back to the hub and to closely related calculators.

## Accessibility
- Labels on every input, sufficient contrast, focus-visible states (the shared
  input styles already include focus rings). Keyboard-usable throughout.

## Keep it current
Update this directive when a token or pattern changes — ask before overwriting.
