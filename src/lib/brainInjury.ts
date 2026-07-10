// Deterministic traumatic-brain-injury (TBI) settlement estimator. Purpose-built
// for the brain-injury calculator. What makes a TBI claim different from a generic
// injury claim is a credibility problem: the symptoms of a mild TBI (concussion)
// are real but invisible, and a normal-looking scan lets insurers argue nothing
// happened. So the value drivers here are the objective proof points:
//   (1) severity of the brain injury,
//   (2) how long consciousness was lost,
//   (3) whether imaging shows objective findings, and
//   (4) whether a permanent cognitive deficit is documented.
// Educational approximation, not legal advice. Any change here must be reflected
// in tests/brainInjury.test.ts.

import type { Severity, FaultLevel } from './settlement'
import type { NegligenceRule } from './negligence'
import { FAULT_SHARES, reductionForRule } from './settlement'

export type TbiSeverity = 'mild' | 'moderate' | 'severe' | 'catastrophic'

/** Loss of consciousness, a first-line marker of how serious a TBI is. */
export type LocDuration = 'none' | 'under30min' | 'under24h' | 'over24h'

export interface BrainInjuryInput {
  // Economic damages, in dollars.
  medicalBills: number
  futureMedical: number
  lostWages: number
  futureLostIncome: number
  /** Lifetime care costs (a life-care plan), which drive catastrophic TBI values. */
  lifeCareCosts: number
  severity: TbiSeverity
  loc: LocDuration
  /** CT or MRI shows objective findings (bleed, contusion, shear injury). */
  imagingPositive: boolean
  /** Documented permanent cognitive deficit (memory, executive function). */
  permanentCognitiveDeficit: boolean
  faultLevel: FaultLevel
  negligenceRule: NegligenceRule
  /** No-fault (PIP) state bars pain and suffering for a below-threshold injury. */
  noFaultGate?: boolean
}

export interface BrainInjuryResult {
  economic: number
  multiplier: number
  generalDamages: number
  low: number
  high: number
  /** Severity band derived from the clinical picture, for state rules. */
  severity: Severity
}

// Base non-economic multiplier by TBI severity. A mild TBI still carries real
// non-economic value, but nowhere near a diffuse axonal or penetrating injury.
export const TBI_SEVERITY_BASE: Record<TbiSeverity, number> = {
  mild: 2,
  moderate: 3.5,
  severe: 5,
  catastrophic: 6.5,
}

// Loss of consciousness duration is the first thing an ER records and the first
// thing an adjuster looks for. Longer LOC is harder to dispute and worth more.
export const LOC_BUMP: Record<LocDuration, number> = {
  none: 0,
  under30min: 0.25,
  under24h: 0.5,
  over24h: 1.0,
}

// Objective imaging findings are the single biggest credibility factor in a mild
// TBI claim: they turn an invisible injury into something on a film.
export const IMAGING_BUMP = 0.5

// A documented permanent cognitive deficit (from formal neuropsychological
// testing) is what separates a settled concussion from a life-altering one.
export const COGNITIVE_BUMP = 1.0

export const TBI_MULT_MIN = 1.5
export const TBI_MULT_MAX = 10

export function brainMultiplier(input: {
  severity: TbiSeverity
  loc: LocDuration
  imagingPositive: boolean
  permanentCognitiveDeficit: boolean
}): number {
  const raw =
    TBI_SEVERITY_BASE[input.severity] +
    LOC_BUMP[input.loc] +
    (input.imagingPositive ? IMAGING_BUMP : 0) +
    (input.permanentCognitiveDeficit ? COGNITIVE_BUMP : 0)
  return Math.min(TBI_MULT_MAX, Math.max(TBI_MULT_MIN, raw))
}

/**
 * Map the clinical picture onto the shared Severity band, so the existing,
 * tested state rules (no-fault gating, damages-cap notes) apply unchanged. A mild
 * TBI only counts as a below-threshold "minor" injury when there is no objective
 * proof at all: no loss of consciousness, no imaging finding, and no documented
 * cognitive deficit. Any one of those lifts it to moderate.
 */
export function severityBandFor(
  severity: TbiSeverity,
  loc: LocDuration,
  imagingPositive: boolean,
  permanentCognitiveDeficit: boolean,
): Severity {
  if (severity === 'catastrophic') return 'catastrophic'
  if (severity === 'severe') return 'severe'
  if (severity === 'moderate') return 'moderate'
  // mild
  if (loc === 'none' && !imagingPositive && !permanentCognitiveDeficit) return 'minor'
  return 'moderate'
}

export function calculateBrainInjury(input: BrainInjuryInput): BrainInjuryResult {
  const economic =
    input.medicalBills +
    input.futureMedical +
    input.lostWages +
    input.futureLostIncome +
    input.lifeCareCosts

  const multiplier = brainMultiplier(input)
  const severity = severityBandFor(
    input.severity,
    input.loc,
    input.imagingPositive,
    input.permanentCognitiveDeficit,
  )

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

// Shown on the page and in the form: the core, counter-intuitive truth of TBI
// claims. No em dashes (global content rule).
export const TBI_NOTE =
  'A mild TBI (a concussion) is the hardest injury class to prove, because the symptoms are real but invisible and the scans often look normal. What moves the number is objective evidence: imaging findings plus formal neuropsychological testing that documents the deficit.'
