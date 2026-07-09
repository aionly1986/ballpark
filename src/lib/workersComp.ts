// Deterministic workers' compensation settlement estimator. Workers' comp is
// fundamentally different from a personal-injury claim:
//  - It is a NO-FAULT system: fault and comparative negligence do not apply.
//  - There is NO pain-and-suffering / non-economic component.
// A settlement is built from wage-replacement benefits (about two-thirds of the
// average weekly wage), a permanent-disability award based on an impairment
// rating, and any future-medical buyout. Benefit rates and weekly maximums are
// set by each state's statute and change annually, so this is a rough national
// estimate, not a state-specific calculation. Any change here must be reflected
// in tests/workersComp.test.ts.

export interface WorkersCompInput {
  /** Average weekly wage before the injury, in dollars. */
  averageWeeklyWage: number
  /** Weeks unable to work (temporary total disability duration). */
  weeksOutOfWork: number
  /** Total medical costs to date. Informational: usually paid by the carrier,
   *  not part of the indemnity lump sum, so it does not add to the estimate. */
  medicalExpenses: number
  /** Permanent whole-person impairment rating, 0-100 (%). */
  impairmentRating: number
  /** Future medical the settlement would buy out. Adds to the lump sum. */
  futureMedical: number
  /** State maximum weekly benefit, if known. 0 = unknown (no cap applied). */
  stateMaxWeekly: number
}

export interface WorkersCompResult {
  /** Weekly benefit (2/3 of AWW, capped at the state max if provided). */
  weeklyBenefit: number
  /** Temporary wage-replacement total (weeklyBenefit x weeks out). */
  wageBenefit: number
  /** Permanent partial disability award. */
  permanentBenefit: number
  /** Future-medical buyout folded into the settlement. */
  medical: number
  /** Combined settlement base, before the range. */
  base: number
  low: number
  high: number
  /** True if the weekly benefit was limited by the state maximum. */
  cappedByStateMax: boolean
}

// Near-universal wage-replacement rate: two-thirds of the average weekly wage.
export const TTD_RATE = 2 / 3

// Weeks of benefits a 100% whole-person permanent disability maps to. States
// range from roughly 300 to 500 weeks; 400 is a representative national figure.
// Approximate, surfaced with a "varies by state" note, never treated as exact.
export const PPD_WHOLE_PERSON_WEEKS = 400

export function calculateWorkersComp(input: WorkersCompInput): WorkersCompResult {
  let weeklyBenefit = input.averageWeeklyWage * TTD_RATE
  let cappedByStateMax = false
  if (input.stateMaxWeekly > 0 && weeklyBenefit > input.stateMaxWeekly) {
    weeklyBenefit = input.stateMaxWeekly
    cappedByStateMax = true
  }

  const wageBenefit = weeklyBenefit * input.weeksOutOfWork
  // An impairment rating is a percentage; clamp to 0-100 so a stray entry cannot
  // produce a nonsensical award.
  const rating = Math.min(100, Math.max(0, input.impairmentRating))
  const permanentBenefit = (rating / 100) * PPD_WHOLE_PERSON_WEEKS * weeklyBenefit
  const medical = input.futureMedical
  const base = wageBenefit + permanentBenefit + medical

  return {
    weeklyBenefit: Math.round(weeklyBenefit),
    wageBenefit: Math.round(wageBenefit),
    permanentBenefit: Math.round(permanentBenefit),
    medical: Math.round(medical),
    base: Math.round(base),
    low: Math.round(base * 0.7),
    high: Math.round(base * 1.3),
    cappedByStateMax,
  }
}

// Plain-language caveat shown under the result (no em dashes, global rule).
export const WORKERS_COMP_NOTE =
  'Workers comp is a no-fault system with no pain-and-suffering award, and every ' +
  'state sets its own benefit rate, weekly maximum, and disability schedule, all of ' +
  'which change each year. Treat this as a rough national estimate and confirm your ' +
  'state figures with a workers comp attorney.'
