// Deterministic neck-and-back injury settlement estimator. Purpose-built for the
// neck-injury calculator. What makes spine claims different from a generic injury
// claim is that the two biggest value drivers are clinical, not financial:
//   (1) whether the injury was treated conservatively or required surgery, and
//   (2) the diagnosis and how many disc levels are involved.
// No competitor tool models either, yet "settlement without surgery" and
// level-specific terms (C4-C5, C5-C6-C7) are the highest-volume searches.
// Educational approximation, not legal advice. Any change here must be reflected
// in tests/neckInjury.test.ts.

import type { Severity, FaultLevel } from './settlement'
import type { NegligenceRule } from './negligence'
import { FAULT_SHARES, reductionForRule } from './settlement'

export type Diagnosis =
  | 'softTissue' // whiplash, cervical/lumbar strain
  | 'bulgingDisc'
  | 'herniatedDisc'
  | 'radiculopathy' // pinched nerve, sciatica
  | 'stenosis'
  | 'fracture' // fracture or spinal cord injury

export type Treatment =
  | 'conservative' // physical therapy, chiropractic, medication only
  | 'injections' // epidural steroid injection, radiofrequency ablation
  | 'discectomy'
  | 'fusionSingle'
  | 'fusionMulti'

export interface NeckInjuryInput {
  // Economic damages, in dollars.
  medicalBills: number
  futureMedical: number
  lostWages: number
  futureLostIncome: number
  otherCosts: number
  diagnosis: Diagnosis
  treatment: Treatment
  /** Number of affected disc levels (1 = single level). */
  levels: number
  /** Permanent impairment or lasting restriction. */
  permanent: boolean
  state: string
  faultLevel: FaultLevel
  negligenceRule: NegligenceRule
  /** No-fault (PIP) state bars pain and suffering for a below-threshold injury. */
  noFaultGate?: boolean
}

export interface NeckInjuryResult {
  economic: number
  multiplier: number
  generalDamages: number
  low: number
  high: number
  /** Severity band derived from the diagnosis and treatment, for state rules. */
  severity: Severity
}

// Base non-economic multiplier by diagnosis.
export const DIAGNOSIS_BASE: Record<Diagnosis, number> = {
  softTissue: 1.5,
  bulgingDisc: 2.5,
  herniatedDisc: 3,
  radiculopathy: 3.5,
  stenosis: 3.5,
  fracture: 5,
}

// Treatment escalates value more than almost any other single factor. Surgery is
// objective, documented, and hard for an insurer to argue away.
export const TREATMENT_BUMP: Record<Treatment, number> = {
  conservative: 0,
  injections: 0.5,
  discectomy: 1,
  fusionSingle: 1.5,
  fusionMulti: 2,
}

export const PERMANENCE_BUMP = 0.5
export const NECK_MULT_MIN = 1.5
export const NECK_MULT_MAX = 7

/** Additional disc levels add value, with diminishing effect. */
export function levelsBump(levels: number): number {
  if (levels >= 3) return 0.75
  if (levels === 2) return 0.5
  return 0
}

/**
 * A multi-level fusion involves at least two disc levels by definition, so the
 * levels input can never imply fewer. Without this floor, picking "multi-level
 * fusion" while leaving levels at the default of one produces a lower estimate
 * than the procedure itself implies.
 */
export function effectiveLevels(treatment: Treatment, levels: number): number {
  return treatment === 'fusionMulti' ? Math.max(2, levels) : levels
}

export function neckMultiplier(input: {
  diagnosis: Diagnosis
  treatment: Treatment
  levels: number
  permanent: boolean
}): number {
  const raw =
    DIAGNOSIS_BASE[input.diagnosis] +
    TREATMENT_BUMP[input.treatment] +
    levelsBump(effectiveLevels(input.treatment, input.levels)) +
    (input.permanent ? PERMANENCE_BUMP : 0)
  return Math.min(NECK_MULT_MAX, Math.max(NECK_MULT_MIN, raw))
}

/**
 * Map the clinical picture onto the shared Severity band, so the existing,
 * tested state rules (no-fault gating, damages-cap notes) apply unchanged.
 */
export function severityFor(
  diagnosis: Diagnosis,
  treatment: Treatment,
  permanent: boolean,
): Severity {
  if (diagnosis === 'fracture') return 'catastrophic'
  if (treatment === 'fusionMulti' || treatment === 'fusionSingle' || treatment === 'discectomy') {
    return 'severe'
  }
  if (diagnosis === 'softTissue' && treatment === 'conservative' && !permanent) return 'minor'
  return 'moderate'
}

export function calculateNeckInjury(input: NeckInjuryInput): NeckInjuryResult {
  const economic =
    input.medicalBills +
    input.futureMedical +
    input.lostWages +
    input.futureLostIncome +
    input.otherCosts

  const multiplier = neckMultiplier(input)
  const severity = severityFor(input.diagnosis, input.treatment, input.permanent)

  // No-fault states bar pain and suffering for a below-threshold minor injury.
  const generalDamages = input.noFaultGate ? 0 : economic * multiplier
  const subtotal = economic + generalDamages

  const faultPct = reductionForRule(input.negligenceRule, FAULT_SHARES[input.faultLevel])
  const total = subtotal * (1 - faultPct)

  return {
    economic,
    multiplier,
    generalDamages: Math.round(generalDamages),
    low: Math.round(total * 0.75),
    high: Math.round(total * 1.25),
    severity,
  }
}
