# Phase 1 Spec — Personal Injury Settlement Calculators

> **PLACEHOLDER.** Operator: paste the full PI product spec here before any new
> calculator is built. The build directive requires this to exist and be filled
> in first (`build-calculator.md` → step 1).

A complete spec for each calculator should cover:

- **Target keyword** — the one search term the page ranks for.
- **Slug / H1 / meta** — URL, on-page headline, title, description.
- **Inputs** — the nine fields, with labels and any preset options specific to
  this injury type.
- **Formula** — confirmed against `src/lib/settlement.ts` (the single source of
  truth). Note any deviations (there should be none without a code + test change).
- **Content outline** — the 800–1500 words of unique on-page copy: how this
  settlement type is calculated, a worked example, what affects it, state notes,
  and 5–6 FAQs.
- **Acceptance criteria** — what the fresh-eyes review checks the page against.

The formula currently implemented (do not change without updating tests):

```
economic      = medicalBills + futureMedical + lostWages
multiplier    = { minor: 1.5, moderate: 3, severe: 4, catastrophic: 5 }[severity]
painSuffering = economic * multiplier
subtotal      = economic + painSuffering
faultPct      = { none: 0, partial: 0.25, mostly: 0.6 }[faultLevel]
total         = subtotal * (1 - faultPct)
low           = round(total * 0.75)
high          = round(total * 1.25)
```
