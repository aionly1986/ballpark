// Deterministic medical-malpractice settlement estimator. Purpose-built, because
// a malpractice claim is different from an ordinary injury claim in one decisive
// way: CAUSATION. The defendant did not cause the patient's underlying illness or
// injury, so the cost of treating that ORIGINAL condition is NOT compensable.
// Only the ADDITIONAL harm caused by the negligence (extra medical care, extra
// lost income, ongoing caregiver and life-care costs) is recoverable. On top of
// that, most states cap NON-economic damages in medical malpractice specifically.
// Educational approximation, not legal advice. Any change here must be reflected
// in tests/medMalpractice.test.ts.

import { hasNonEconCap } from './states'

export type MalpracticeType =
  | 'misdiagnosis'
  | 'surgicalError'
  | 'medicationError'
  | 'birthInjury'
  | 'anesthesiaError'
  | 'failureToTreat'
  | 'hospitalNegligence'
  | 'erError'

export type MalSeverity = 'minor' | 'moderate' | 'severe' | 'catastrophic'

export interface MedMalpracticeInput {
  /** Cost of treating the patient's ORIGINAL condition. NOT compensable: the
   *  defendant did not cause the underlying illness. Echoed back for contrast. */
  originalMedical: number
  /** Additional medical cost caused by the negligence. Compensable. */
  additionalMedical: number
  /** Lost wages caused by the negligence. Compensable. */
  lostWages: number
  /** Caregiver and life-care costs caused by the negligence. Compensable. */
  caregiverLifeCare: number
  malpracticeType: MalpracticeType
  severity: MalSeverity
  /** Recovery / treatment duration in months. Longer harm nudges the multiplier. */
  recoveryMonths: number
  /** Attorney contingency fee, 0-100 (%). */
  contingencyPercent: number
  state: string
}

export interface MedMalpracticeResult {
  /** Compensable economic damages (original condition cost excluded). */
  economic: number
  /** The original-condition cost, echoed back only for contrast. Not compensable. */
  originalMedicalExcluded: number
  multiplier: number
  nonEconomic: number
  grossLow: number
  grossHigh: number
  netLow: number
  netHigh: number
  /** True if the state generally caps non-economic damages in med-mal. */
  capState: boolean
}

// Base non-economic multiplier by how serious the added harm is.
export const SEVERITY_BASE: Record<MalSeverity, number> = {
  minor: 1.5,
  moderate: 3,
  severe: 4.5,
  catastrophic: 6,
}

// Small bump by malpractice type. Birth injury carries the highest bump because
// it typically means lifelong care; anesthesia and surgical errors follow.
export const TYPE_BUMP: Record<MalpracticeType, number> = {
  birthInjury: 1.0,
  anesthesiaError: 0.5,
  surgicalError: 0.3,
  misdiagnosis: 0.3,
  failureToTreat: 0.3,
  medicationError: 0.2,
  erError: 0.2,
  hospitalNegligence: 0.2,
}

export const MAL_MULT_MIN = 1.5
export const MAL_MULT_MAX = 8

// Longer recovery / lasting treatment adds to the non-economic multiplier.
export function durationBump(recoveryMonths: number): number {
  return recoveryMonths >= 24 ? 0.5 : recoveryMonths >= 12 ? 0.25 : 0
}

// Clamp the composed multiplier into the allowed band.
export function clampMultiplier(raw: number): number {
  return Math.min(MAL_MULT_MAX, Math.max(MAL_MULT_MIN, raw))
}

export function calculateMedMalpractice(input: MedMalpracticeInput): MedMalpracticeResult {
  // CAUSATION: originalMedical is deliberately excluded from damages. The
  // defendant did not cause the underlying illness, so only the additional harm
  // caused by the negligence is compensable.
  const economic = input.additionalMedical + input.lostWages + input.caregiverLifeCare

  const multiplier = clampMultiplier(
    SEVERITY_BASE[input.severity] + TYPE_BUMP[input.malpracticeType] + durationBump(input.recoveryMonths),
  )

  const nonEconomic = economic * multiplier
  const gross = economic + nonEconomic
  const grossLow = Math.round(gross * 0.75)
  const grossHigh = Math.round(gross * 1.25)

  const fee = Math.min(100, Math.max(0, input.contingencyPercent)) / 100
  const netLow = Math.round(grossLow * (1 - fee))
  const netHigh = Math.round(grossHigh * (1 - fee))

  return {
    economic: Math.round(economic),
    originalMedicalExcluded: Math.round(input.originalMedical),
    multiplier,
    nonEconomic: Math.round(nonEconomic),
    grossLow,
    grossHigh,
    netLow,
    netHigh,
    capState: hasNonEconCap(input.state),
  }
}

// Plain-language caveat shown under the result (no em dashes, global rule).
export const MED_MAL_NOTE =
  'A medical malpractice claim only pays for the additional harm the negligence ' +
  'caused, not the cost of treating the condition you already had, so the original ' +
  'treatment cost is excluded here. Most states also cap non-economic (pain and ' +
  'suffering) damages in medical malpractice specifically, and med-mal contingency ' +
  'fees commonly run 33 to 40%, with several states capping the fee by statute. ' +
  'Confirm the current cap and fee rules in your state with a malpractice attorney.'
