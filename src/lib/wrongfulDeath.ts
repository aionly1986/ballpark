// Deterministic wrongful-death settlement estimator. Purpose-built: a wrongful
// death claim is not an injury claim with a bigger multiplier. Its largest
// component is the income the deceased would have earned over a working
// lifetime, which real forensic economists compute two ways no competitor
// calculator bothers with:
//   (1) a personal-consumption deduction (the deceased would have spent part of
//       that income on themselves, so survivors never would have received it), and
//   (2) present-value discounting (a dollar earned in 2050 is worth less today).
// Skipping either overstates the claim badly. We also value lost household
// services, add a non-economic component for the survivors' loss, allow a
// punitive uplift for egregious conduct, apply the state's comparative-fault
// rule, and cap the result at the available insurance coverage.
// Educational approximation, not legal advice. Any change here must be reflected
// in tests/wrongfulDeath.test.ts.

import type { NegligenceRule } from './negligence'
import { reductionForRule } from './settlement'

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor'
export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
export type Conduct = 'negligent' | 'reckless' | 'intentional' | 'criminal'

export interface WrongfulDeathInput {
  // Deceased.
  ageAtDeath: number
  lifeExpectancy: number
  healthStatus: HealthStatus
  annualIncome: number
  yearsToRetirement: number
  // Final expenses.
  medicalExpenses: number
  funeralCosts: number
  // Household services the deceased provided.
  householdHoursPerWeek: number
  childcareHoursPerWeek: number
  homeMaintenance: boolean
  // Survivors.
  relationship: Relationship
  dependents: number
  // Liability.
  /** The deceased's own share of fault, 0 to 100 (%). */
  faultPercent: number
  negligenceRule: NegligenceRule
  conduct: Conduct
  /** Punitive damages are only added when the operator marks them as available. */
  punitiveEligible: boolean
  // Coverage. 0 means unknown, so no cap is applied.
  primaryCoverage: number
  umbrellaCoverage: number
  umUimCoverage: number
}

export interface WrongfulDeathResult {
  lostEarnings: number
  lostServices: number
  finalExpenses: number
  economic: number
  nonEconomic: number
  punitive: number
  /** Total after the fault reduction, before the range and the coverage cap. */
  total: number
  low: number
  high: number
  cappedByCoverage: boolean
  totalCoverage: number
  /** Years of remaining life used to value household services. */
  yearsRemaining: number
}

/**
 * Net real discount rate: a market discount rate (roughly 4 to 5%) offset by
 * expected wage growth (roughly 2 to 3%). Courts commonly land near 2% net.
 * Approximate, and the single most consequential assumption in this engine.
 */
export const NET_DISCOUNT_RATE = 0.02

/**
 * Share of income the deceased would have consumed on themselves rather than
 * passed to survivors. Falls as the household grows, because more of the income
 * supported other people.
 */
export function consumptionShare(dependents: number): number {
  if (dependents >= 3) return 0.18
  if (dependents === 2) return 0.22
  if (dependents === 1) return 0.28
  return 0.35
}

// Replacement-cost rates for services the deceased performed for the household.
export const HOUSEHOLD_HOURLY = 15
export const CHILDCARE_HOURLY = 18
export const HOME_MAINTENANCE_ANNUAL = 5000

// Health shifts the remaining life expectancy used to value household services.
export const HEALTH_ADJUSTMENT: Record<HealthStatus, number> = {
  excellent: 3,
  good: 0,
  fair: -3,
  poor: -8,
}

// Non-economic loss (companionship, guidance, society), as a factor applied to
// economic damages. Closer relationships lose more.
export const RELATIONSHIP_FACTOR: Record<Relationship, number> = {
  spouse: 1,
  child: 0.8,
  parent: 0.8,
  sibling: 0.4,
  other: 0.3,
}

// Punitive uplift, applied to compensatory damages, only when the conduct was
// worse than ordinary negligence AND punitive damages are actually available.
export const CONDUCT_UPLIFT: Record<Conduct, number> = {
  negligent: 0,
  reckless: 0.3,
  intentional: 0.5,
  criminal: 0.7,
}

/**
 * Present value of $1 per year for `years` years at rate `r`.
 * PV factor = (1 - (1 + r)^-n) / r, and simply `n` when r is 0.
 */
export function annuityFactor(years: number, rate: number = NET_DISCOUNT_RATE): number {
  if (years <= 0) return 0
  if (rate === 0) return years
  return (1 - Math.pow(1 + rate, -years)) / rate
}

export function calculateWrongfulDeath(input: WrongfulDeathInput): WrongfulDeathResult {
  // 1. Lost future earnings, net of personal consumption, discounted to today.
  const keptShare = 1 - consumptionShare(input.dependents)
  const lostEarnings = input.annualIncome * keptShare * annuityFactor(input.yearsToRetirement)

  // 2. Lost household services, valued at replacement cost over remaining life.
  const adjustedLifeExpectancy = input.lifeExpectancy + HEALTH_ADJUSTMENT[input.healthStatus]
  const yearsRemaining = Math.max(0, adjustedLifeExpectancy - input.ageAtDeath)
  const servicesAnnual =
    input.householdHoursPerWeek * 52 * HOUSEHOLD_HOURLY +
    input.childcareHoursPerWeek * 52 * CHILDCARE_HOURLY +
    (input.homeMaintenance ? HOME_MAINTENANCE_ANNUAL : 0)
  const lostServices = servicesAnnual * annuityFactor(yearsRemaining)

  // 3. Final expenses.
  const finalExpenses = input.medicalExpenses + input.funeralCosts

  const economic = lostEarnings + lostServices + finalExpenses

  // 4. Non-economic loss to the survivors.
  const dependentBump = Math.min(0.4, input.dependents * 0.1)
  const nonEconomic = economic * (RELATIONSHIP_FACTOR[input.relationship] + dependentBump)

  // 5. Punitive damages, only for conduct beyond ordinary negligence.
  const compensatory = economic + nonEconomic
  const punitive =
    input.punitiveEligible && input.conduct !== 'negligent'
      ? compensatory * CONDUCT_UPLIFT[input.conduct]
      : 0

  // 6. The deceased's comparative fault, under the state's rule. Contributory
  //    states can bar the claim entirely.
  const faultShare = Math.min(1, Math.max(0, input.faultPercent / 100))
  const reduction = reductionForRule(input.negligenceRule, faultShare)
  const total = (compensatory + punitive) * (1 - reduction)

  // 7. A settlement rarely exceeds the coverage available to pay it.
  let low = Math.round(total * 0.7)
  let high = Math.round(total * 1.3)
  const totalCoverage = input.primaryCoverage + input.umbrellaCoverage + input.umUimCoverage
  let cappedByCoverage = false
  if (totalCoverage > 0) {
    if (high > totalCoverage) {
      high = totalCoverage
      cappedByCoverage = true
    }
    if (low > totalCoverage) low = totalCoverage
  }

  return {
    lostEarnings: Math.round(lostEarnings),
    lostServices: Math.round(lostServices),
    finalExpenses: Math.round(finalExpenses),
    economic: Math.round(economic),
    nonEconomic: Math.round(nonEconomic),
    punitive: Math.round(punitive),
    total: Math.round(total),
    low,
    high,
    cappedByCoverage,
    totalCoverage,
    yearsRemaining,
  }
}

// Plain-language caveat shown under the result (no em dashes, global rule).
export const WRONGFUL_DEATH_NOTE =
  'This estimate discounts future earnings to present value and deducts what the ' +
  'deceased would have spent on themselves, which is how economists actually value ' +
  'these claims. Who may file, which damages are allowed, and whether punitive ' +
  'damages or non-economic caps apply are all set by state statute, so confirm your ' +
  'state rules with a wrongful death attorney.'
