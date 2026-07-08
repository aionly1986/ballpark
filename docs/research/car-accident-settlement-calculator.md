# SERP Synthesis: car accident settlement calculator

Operator provided two content references (no Ahrefs export yet, so metrics are
TBD): gunterinjurylaw.com/auto-settlement-calculator and
setcalc.com/guides/how-much-is-my-car-accident-worth. Scraped 2026-07-08.

## The car-accident-specific angle (what makes it not just a PI calculator)
- **Insurance policy limits cap the settlement.** A settlement rarely exceeds the
  at-fault driver's coverage. setcalc leans on this hard ("Check Policy Limits").
  Coverage varies by who hit you: minimum drivers $25k to $50k, typical personal
  $50k to $100k, rideshare $1M during a trip, truck/commercial $750k to $5M+.
- **Vehicle / property damage** is an economic line item competitors expose.
- **Accident type changes the ceiling**: truck and rideshare settle higher mainly
  because of bigger policies and more severe injuries, not different math.

## What we built (purpose-built)
- Extended the settlement engine with an optional **policyLimit** that caps the
  range, and a `cappedByPolicy` flag (tested). This is the car-specific logic.
- Bespoke `CarAccidentForm` (Simple/Advanced) with vehicle-damage labeling and a
  policy-limit input; result shows a "capped at the policy limit" note when it
  bites. Wired via config `form: 'carAccident'`.
- Content uses the color layer: severity/policy-coverage/injury-range/fault-rule
  tables, worked examples (engine-computed, including a policy-cap example), an
  insurance-ceiling callout, and after-a-crash steps.

## Deliberate scope calls
- **No fabricated averages.** setcalc lists precise by-state and by-accident-type
  averages ($287,000 NY, $103,654 truck, "+844%"). We use rough, framed ranges and
  qualitative "why higher/lower" instead, and real coverage facts (policy minimums,
  rideshare $1M). Add cited averages later only with a real source.
- No-fault/PIP mentioned in content but not modeled in the tool yet (state-specific
  thresholds vary; would need real per-state data).

## Ideas logged
- Accident-type spin-off pages (truck accident, motorcycle, rideshare, pedestrian)
  each rank and map to the policy-limit story. Strong low-competition expansion.
- Uninsured/underinsured-motorist angle is a distinct high-intent sub-topic.
- Get the Ahrefs export for this keyword to fill in KD/volume and the SERP snapshot.
