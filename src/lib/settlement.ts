// Deterministic personal-injury settlement estimator.
//
// This is the single source of truth for the math. Every calculator page
// configures inputs and labels; none of them re-implement this formula.
// Any change here must be reflected in tests/settlement.test.ts.

import type { NegligenceRule } from './negligence'

export type Severity = 'minor' | 'moderate' | 'severe' | 'catastrophic'
export type FaultLevel = 'none' | 'partial' | 'mostly'

export interface SettlementInput {
  /** Medical bills incurred to date, in dollars. */
  medicalBills: number
  /** Estimated future medical costs, in dollars. */
  futureMedical: number
  /** Lost wages / income to date, in dollars. */
  lostWages: number
  severity: Severity
  faultLevel: FaultLevel
  /** The claimant's state comparative-fault rule (see negligence.ts). */
  negligenceRule: NegligenceRule
  // Optional economic line items (used by the Advanced calculator). All default
  // to 0 and simply add to economic damages.
  /** Estimated future lost income / diminished earning capacity, in dollars. */
  futureLostIncome?: number
  /** Property damage (e.g. vehicle repair), in dollars. */
  propertyDamage?: number
  /** Other out-of-pocket costs, in dollars. */
  otherCosts?: number
  /**
   * The at-fault party's insurance policy limit, in dollars. If set (> 0), the
   * settlement range is capped at it (a settlement rarely exceeds available
   * coverage). Used by the car-accident calculator.
   */
  policyLimit?: number
}

export interface SettlementResult {
  /** Sum of all economic damages. */
  economic: number
  /** Pain-and-suffering (non-economic) component, before fault reduction. */
  painSuffering: number
  /** Low end of the total settlement range (rounded, whole dollars). */
  low: number
  /** High end of the total settlement range (rounded, whole dollars). */
  high: number
  /** Low end of the pain-and-suffering range, after fault (rounded). */
  painSufferingLow: number
  /** High end of the pain-and-suffering range, after fault (rounded). */
  painSufferingHigh: number
  /** True if the range was capped by the insurance policy limit. */
  cappedByPolicy: boolean
}

// Non-economic multiplier applied to economic damages, by injury severity.
export const SEVERITY_MULTIPLIERS: Record<Severity, number> = {
  minor: 1.5,
  moderate: 3,
  severe: 4,
  catastrophic: 5,
}

// The claimant's share of fault, by fault level.
export const FAULT_SHARES: Record<FaultLevel, number> = {
  none: 0,
  partial: 0.25,
  mostly: 0.6,
}

// Turn a fault share into the actual reduction, given the state's rule:
//  - contributory: any fault bars recovery (reduction = 1).
//  - modified:     barred once the claimant is ~half or more at fault.
//  - pure:         reduced by the fault share, no cutoff.
// Exported so other tools (e.g. the pain-and-suffering calculator) apply the
// same, tested fault logic.
export function reductionForRule(rule: NegligenceRule, faultShare: number): number {
  if (rule === 'contributory') return faultShare > 0 ? 1 : 0
  if (rule === 'modified') return faultShare >= 0.5 ? 1 : faultShare
  return faultShare
}

/**
 * Estimate a settlement range from the documented formula. Always returns a
 * low-to-high range, never a single number. A barred claim returns a $0 range.
 */
export function calculateSettlement(input: SettlementInput): SettlementResult {
  const economic =
    input.medicalBills +
    input.futureMedical +
    input.lostWages +
    (input.futureLostIncome ?? 0) +
    (input.propertyDamage ?? 0) +
    (input.otherCosts ?? 0)
  const multiplier = SEVERITY_MULTIPLIERS[input.severity]
  const painSuffering = economic * multiplier
  const subtotal = economic + painSuffering
  const faultShare = FAULT_SHARES[input.faultLevel]
  const faultPct = reductionForRule(input.negligenceRule, faultShare)
  const total = subtotal * (1 - faultPct)
  let low = Math.round(total * 0.75)
  let high = Math.round(total * 1.25)
  // A settlement rarely exceeds the at-fault party's coverage. Cap at the policy
  // limit if one was provided.
  let cappedByPolicy = false
  const limit = input.policyLimit ?? 0
  if (limit > 0) {
    if (high > limit) {
      high = limit
      cappedByPolicy = true
    }
    if (low > limit) low = limit
  }
  // Pain-and-suffering on its own, after the same fault reduction. This is the
  // hero number for the pain-and-suffering calculator.
  const adjustedPainSuffering = painSuffering * (1 - faultPct)
  const painSufferingLow = Math.round(adjustedPainSuffering * 0.75)
  const painSufferingHigh = Math.round(adjustedPainSuffering * 1.25)
  return { economic, painSuffering, low, high, painSufferingLow, painSufferingHigh, cappedByPolicy }
}
