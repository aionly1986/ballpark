// Per-state legal facts that change the settlement math, sourced from the
// operator's state-by-state research (2026). Hard facts (negligence rule,
// no-fault status) drive the engine; volatile figures (cap dollars) are only
// flagged, never hard-coded, because they index annually and get struck down.

import { negligenceRuleForState, negligenceNoteForState } from './negligence'
import type { Severity } from './settlement'

// True no-fault (PIP) states with an injury threshold. A below-threshold minor
// soft-tissue injury generally CANNOT claim pain and suffering here. Choice
// states (KY, NJ, PA) are excluded because the tort election varies.
const NO_FAULT = new Set(['FL', 'HI', 'KS', 'MA', 'MI', 'MN', 'NY', 'ND', 'UT'])

// States that currently cap non-economic damages in ordinary injury cases (not
// just med-mal), per the research. Used only to surface a "verify" note, never
// to hard-code a dollar cap (these index annually and several are contested).
const NON_ECON_CAP = new Set(['AK', 'CO', 'HI', 'ID', 'MD', 'MI', 'MS', 'OH', 'OK', 'TN'])

export function isNoFaultState(state: string): boolean {
  return NO_FAULT.has(state.toUpperCase())
}

export function hasNonEconCap(state: string): boolean {
  return NON_ECON_CAP.has(state.toUpperCase())
}

// No-fault states gate pain and suffering for a minor (below-threshold) injury.
export function gatesPainSuffering(state: string, severity: Severity): boolean {
  return severity === 'minor' && isNoFaultState(state)
}

// The plain-language note shown under the result: fault rule, plus a no-fault
// gate note and a damages-cap flag where they apply.
export function stateNote(state: string, severity: Severity): string {
  const notes = [negligenceNoteForState(state)]
  if (gatesPainSuffering(state, severity)) {
    notes.push(
      'This is a no-fault state, so a minor injury that does not cross the state injury threshold generally cannot claim pain and suffering.',
    )
  }
  if (hasNonEconCap(state)) {
    notes.push(
      'This state may cap non-economic (pain and suffering) damages. Caps change often and vary by case type, so verify the current figure with an attorney.',
    )
  }
  return notes.join(' ')
}

export { negligenceRuleForState }
