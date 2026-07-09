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

## Dog bite settlement calculator

- **Target keyword.** "dog bite settlement calculator" (KD 0, US volume 450,
  traffic potential 350). Very easy, few referring domains. Also ranks for dog
  bite lawsuit (1.6K), dog bite compensation (400), dog bite settlement (300).
- **Slug / URL.** `/dog-bite-settlement-calculator`.
- **Purpose-built angle.** Dog-bite claims run on animal-liability law, not the
  generic PI multiplier alone. The tool distinguishes strict-liability states
  from one-bite-rule states, layers in premiums for scarring and disfigurement,
  facial injury, nerve damage, infection, and PTSD, adds a child-victim premium,
  and applies provocation and trespassing defenses. Note that a homeowner or
  renter insurance policy usually pays the claim.
- **Inputs.** Medical bills, future medical, lost earnings, future lost income,
  other costs, severity (minor / moderate / severe / disfiguring), yes/no
  factors (facial injury, permanent scarring, nerve damage, infection, emotional
  trauma, child under 18), state, provoked?, trespassing?, prior aggression?,
  owner negligent?.
- **Content outline.** How dog-bite settlements are calculated. Strict liability
  vs the one-bite rule, with a table of which states apply each. What drives
  value (scarring, facial injury, child victims). Two or three worked examples.
  A note on how state fault rules affect the payout. The homeowner-insurance-pays
  angle. Steps to take after a bite. Five or six FAQs.

## Truck accident settlement calculator

- **Target keyword.** "truck accident settlement calculator" (KD 1, US volume
  100, traffic potential 60). Low volume but high CPC ($6) and a strong parent
  cluster (car accident settlement calculator 1.2K, bodily injury claim
  calculator 1.2K). Parent topic: "semi truck accident settlement calculator".
- **Slug / URL.** `/truck-accident-settlement-calculator`.
- **Purpose-built angle.** Truck settlements are larger because commercial
  policies carry high limits and several parties can share liability. The tool
  applies a commercial insurance policy ceiling driven by FMCSA minimums ($750k
  minimum, $1M common, $5M for hazmat) and flags the multiple liable parties
  (driver, motor carrier, broker, shipper). It reuses the tested settlement
  engine, adding the commercial policy-limit cap.
- **Inputs.** Medical, future medical, lost wages, future lost income,
  vehicle/property damage, other costs, severity, at-fault level, state, carrier
  type (interstate / local / hazmat / unknown, which sets the default policy
  ceiling), and an optional known policy limit.
- **Formula note.** Same engine as the base calculator (economic + pain and
  suffering, fault reduction, low-to-high range), then capped at the commercial
  policy ceiling implied by carrier type or the entered policy limit.
- **Content outline.** Why truck settlements are larger than car-accident
  settlements. A commercial policy-limit table. Who can be held liable. FMCSA
  minimum coverage. Two or three worked examples. How comparative fault reduces
  the payout. Five or six FAQs.

## Workers comp settlement calculator

- **Target keyword.** "workers comp settlement calculator" (KD 1, US volume 900,
  traffic potential 1.4K, the highest value in this batch). Big cluster: how much
  does workers comp pay (2.6K), plus state settlement charts (CA 2.0K, NY 1.1K).
- **Slug / URL.** `/workers-comp-settlement-calculator`.
- **Purpose-built angle.** Workers compensation is no-fault and pays no pain and
  suffering, so the base PI engine does not apply. This calculator uses a
  separate wage-replacement model: a weekly benefit of two-thirds of the average
  weekly wage (capped by the state weekly maximum), temporary disability
  (weekly benefit times weeks out of work), permanent partial disability
  (impairment percent times roughly 400 weeks times the weekly benefit), plus a
  future medical buyout. Heavy disclaimer: benefit rates and weekly maximums are
  state statutes that change annually, so results are estimates only.
- **Inputs.** Average weekly wage, weeks out of work, total medical expenses
  (informational), permanent impairment rating percent, optional future medical,
  and an optional state weekly maximum.
- **Formula (separate engine, not the PI multiplier).**

```
weeklyBenefit = min(averageWeeklyWage * (2/3), stateWeeklyMax)
temporary     = weeklyBenefit * weeksOutOfWork
ppd           = (impairmentPct / 100) * 400 * weeklyBenefit
total         = temporary + ppd + futureMedical
low           = round(total * 0.75)
high          = round(total * 1.25)
```

- **Content outline.** How workers-comp settlements work and how they differ from
  personal injury. The two-thirds wage rule. Impairment ratings and permanent
  partial disability. Why there is no pain and suffering. The state-maximum
  caveat. Lump-sum vs structured settlements. Two or three worked examples. Steps
  to take. Five or six FAQs.
