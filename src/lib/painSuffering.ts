// Deterministic pain-and-suffering estimator. Purpose-built for the
// pain-and-suffering calculator (distinct from the settlement engine): it offers
// the two methods real adjusters use, plus a permanence factor. Any change here
// must be reflected in tests/painSuffering.test.ts.

import type { Severity, FaultLevel } from './settlement'
import type { NegligenceRule } from './negligence'
import { SEVERITY_MULTIPLIERS, FAULT_SHARES, reductionForRule } from './settlement'

export type PsMethod = 'multiplier' | 'perDiem'

export interface PainSufferingInput {
  method: PsMethod
  // Multiplier method:
  economicDamages: number
  severity: Severity
  /** A permanent injury nudges the multiplier up by 0.5. */
  permanent: boolean
  // Per diem method:
  dailyRate: number
  recoveryDays: number
  // Both:
  faultLevel: FaultLevel
  negligenceRule: NegligenceRule
}

export interface PainSufferingResult {
  method: PsMethod
  /** The multiplier used (multiplier method only). */
  multiplier: number | null
  /** Pain and suffering before fault reduction. */
  base: number
  /** Low end of the pain-and-suffering range, after fault (rounded). */
  low: number
  /** High end of the pain-and-suffering range, after fault (rounded). */
  high: number
}

/** Base severity multiplier, plus 0.5 for a permanent injury. */
export function multiplierFor(severity: Severity, permanent: boolean): number {
  return SEVERITY_MULTIPLIERS[severity] + (permanent ? 0.5 : 0)
}

export function calculatePainSuffering(input: PainSufferingInput): PainSufferingResult {
  let base: number
  let multiplier: number | null = null
  if (input.method === 'perDiem') {
    base = input.dailyRate * input.recoveryDays
  } else {
    multiplier = multiplierFor(input.severity, input.permanent)
    base = input.economicDamages * multiplier
  }
  const faultPct = reductionForRule(input.negligenceRule, FAULT_SHARES[input.faultLevel])
  const adjusted = base * (1 - faultPct)
  return {
    method: input.method,
    multiplier,
    base,
    low: Math.round(adjusted * 0.75),
    high: Math.round(adjusted * 1.25),
  }
}
