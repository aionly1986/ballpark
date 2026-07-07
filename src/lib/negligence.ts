// US states apply different comparative-fault rules, which materially change a
// settlement when the claimant shares fault. This maps each state to its rule so
// the engine can apply it. Educational approximation, not legal advice.

export type NegligenceRule = 'pure' | 'modified' | 'contributory'

// Pure contributory negligence: any fault by the claimant can bar recovery.
const CONTRIBUTORY = new Set(['AL', 'DC', 'MD', 'NC', 'VA'])

// Pure comparative negligence: recovery is reduced by the claimant's fault
// share, with no cutoff.
const PURE = new Set(['AK', 'AZ', 'CA', 'KY', 'LA', 'MS', 'MO', 'NM', 'NY', 'RI', 'WA'])

// Everything else uses modified comparative negligence (recovery barred once the
// claimant reaches roughly half the fault). This is the majority of states and
// our default, so we only need to enumerate the two exceptions above.
export function negligenceRuleForState(state: string): NegligenceRule {
  const code = state.toUpperCase()
  if (CONTRIBUTORY.has(code)) return 'contributory'
  if (PURE.has(code)) return 'pure'
  return 'modified'
}

// A short, plain-language note on how the state's rule affects a claim.
// No em dashes (global content rule).
export function negligenceNoteForState(state: string): string {
  switch (negligenceRuleForState(state)) {
    case 'contributory':
      return 'This state follows contributory negligence, so being even partly at fault can bar recovery entirely.'
    case 'pure':
      return 'This state follows pure comparative negligence, so recovery is reduced by your share of fault with no cutoff.'
    default:
      return 'This state follows modified comparative negligence, so recovery is reduced by your share of fault and barred once you are mostly at fault.'
  }
}
