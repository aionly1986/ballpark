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

## Neck injury settlement calculator

- **Target keyword.** "neck injury settlement calculator" (KD 2, US volume 300,
  traffic potential 1.9K). Low direct volume but high traffic potential because
  the #1 page is a broad neck-and-back article, not a calculator. Parent topic:
  "average settlement for car accident back and neck injury" (3.4K). Traffic sits
  in content clusters: diagnosis and spinal-level terms (7.9K), average and
  how-much terms (7.8K), surgery (3.2K), workers comp (2.5K), and calculator
  terms only 720.
- **Slug / URL.** `/neck-injury-settlement-calculator`.
- **H1.** "Neck and Back Injury Settlement Calculator" (calculator-first, an
  operator decision). Big informational keywords are captured as exact-match H2s
  rather than in the H1.
- **Purpose-built angle.** No competitor models surgery status or spinal level,
  yet those are the highest-volume modifiers in the cluster. The tool makes
  diagnosis, treatment (surgery status), the number of affected levels, and the
  spinal level drive the multiplier. Gaps to exploit: "back injury settlement
  without surgery" (1.8K, KD 0, mileylegal ranks only #9) and spinal-level terms
  (C4-C5 700, C5-C6-C7 250) that the leading article never itemizes.
- **Inputs.** Diagnosis (whiplash / soft tissue, bulging disc, herniated disc,
  radiculopathy / pinched nerve, spinal stenosis, fracture / spinal cord),
  treatment (conservative care only, injections, discectomy, single-level fusion,
  multi-level fusion), number of affected levels, spinal level (C4-C5, C5-C6,
  C6-C7, L4-L5, L5-S1), permanent impairment yes/no, medical bills, future
  medical, lost wages, future lost income, other costs, state, fault level.
- **Formula (engine adjustments).** Multiplier = diagnosis base + surgery bump +
  levels bump + permanence, clamped to a 1.5 to 7 range. General damages =
  economic damages times the multiplier. Comparative fault applied by state. A
  no-fault gate suppresses inflated values for minor soft-tissue claims. Final
  output is a range of plus or minus 25%.
- **Content outline (exact-match H2s).** How a neck or back injury settlement is
  calculated. Neck and back injury settlement without surgery. Average settlement
  for a car accident back and neck injury (cite the mileylegal 702-case study
  with attribution, and explain the average $925,169 vs median $316,000 skew; do
  not present it as our own data). How much is a 2-level herniated disc
  settlement. C4-C5, C5-C6 and C6-C7 settlements. Spinal stenosis, radiculopathy
  and pinched nerve. Workers comp neck and back settlements (cross-link
  `/workers-comp-settlement-calculator`). Worked examples. How your state changes
  the number. Steps after a neck or back injury.

## Wrongful death settlement calculator

- **Target keyword.** "wrongful death settlement calculator" (KD 0, US volume
  400, traffic potential 1.4K). Very easy, few referring domains. The #1 result,
  scheuermanlaw, earns most of its traffic from the average and how-much cluster
  (3.2K volume) rather than the calculator term itself (1.1K).
- **Slug / URL.** `/wrongful-death-settlement-calculator`.
- **H1.** "Wrongful Death Settlement Calculator".
- **Purpose-built angle.** No competitor does the two things that actually drive
  a wrongful death number: present-value discounting of lost future earnings and
  a personal-consumption deduction (the share the deceased would have spent on
  themselves). The tool adds both, plus loss of household services, a punitive
  uplift for egregious conduct, comparative fault by state (contributory-negligence
  states can bar recovery entirely), and an insurance-coverage ceiling.
- **Inputs.** State, age at death, annual income, years until retirement,
  relationship to the survivor, number of dependents, and the deceased's share of
  fault (percent). Advanced inputs add life expectancy (default 78), health
  status, medical expenses before death, funeral costs (default $10,000),
  household service hours per week, childcare hours per week, home maintenance,
  defendant conduct, punitive eligibility, and primary, umbrella, and UM/UIM
  coverage limits.
- **Content outline (exact-match H2s).** How a wrongful death settlement is
  calculated. Average wrongful death settlement (cite the Thomson Reuters figures
  as reported by a law firm: average $973,054 vs median $294,728, and explain the
  skew; do not present these as our own data). Wrongful death settlement amounts
  by age and income. Who can file a wrongful death claim. Economic vs non-economic
  vs punitive damages. Wrongful death vs a survival action. How your state changes
  the number (contributory negligence, damages caps). Statute of limitations.
  Worked examples. Steps to take.

## Medical malpractice settlement calculator

- **Target keyword.** "medical malpractice settlement calculator" (KD 5, US
  volume 250, traffic potential 300). About six referring domains to reach the top
  ten. The #1 result, amicusplanners, is a thin 949-word three-step wizard.
- **Slug / URL.** `/medical-malpractice-settlement-calculator`.
- **H1.** "Medical Malpractice Settlement Calculator".
- **Purpose-built angle.** Med-mal turns on causation: only the ADDITIONAL harm
  caused by the negligence is compensable, not the cost of the underlying
  condition the patient already had. The tool separates original medical costs
  (shown for contrast, excluded from damages) from the additional costs caused by
  the malpractice, applies the state non-economic damage cap (which bites hardest
  in med-mal), and reports a net figure after the attorney contingency fee (med-mal
  fees run about 33 to 40 percent, and several states cap them by statute).
- **Inputs.** Original medical expenses (excluded from damages, shown for
  contrast), additional medical expenses caused by the malpractice, lost wages,
  caregiver and life-care costs, malpractice type, resulting injury severity,
  recovery duration, state, and attorney contingency fee percent.
- **Outputs.** Economic damages, non-economic damages, gross range, net range
  after fees, plus a state-cap warning.
- **Content outline.** How medical malpractice settlements are calculated. Why
  only the additional harm counts (causation). Average medical malpractice
  settlement amounts. Damage caps by state. Birth injury, surgical error, and
  misdiagnosis. Net vs gross after attorney fees. Worked examples.
