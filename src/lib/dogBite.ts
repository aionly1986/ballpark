// Deterministic dog-bite settlement estimator. Purpose-built for the dog-bite
// calculator. Dog-bite claims differ from ordinary injury claims in two ways:
//  (1) scarring / disfigurement, facial injuries, and child victims drive the
//      non-economic value well above the base severity multiplier, and
//  (2) liability turns on the state's dog-bite rule (strict liability vs. the
//      one-bite rule) plus defenses like provocation and trespassing, not
//      comparative fault alone.
// Educational approximation, not legal advice. Any change here must be reflected
// in tests/dogBite.test.ts.

export type DogBiteSeverity = 'minor' | 'moderate' | 'severe' | 'disfiguring'

export interface DogBiteInput {
  // Economic damages, in dollars.
  medicalBills: number
  futureMedical: number
  lostEarnings: number
  futureLostIncome: number
  otherCosts: number
  severity: DogBiteSeverity
  // Non-economic aggravating factors. Each nudges the multiplier up.
  facialInjury: boolean
  permanentScarring: boolean
  nerveDamage: boolean
  infection: boolean
  emotionalTrauma: boolean
  childVictim: boolean
  // Liability.
  state: string
  provoked: boolean
  trespassing: boolean
  /** Owner knew the dog was dangerous. Establishes liability in a one-bite state. */
  priorAggression: boolean
  /** Leash-law / fencing / ordinance violation. Supports a negligence theory. */
  ownerNegligent: boolean
}

export interface DogBiteResult {
  economic: number
  multiplier: number
  generalDamages: number
  liabilityFactor: number
  low: number
  high: number
}

// Base non-economic multiplier by bite severity. Dog bites skew higher than
// generic injuries because of the scarring / disfigurement component.
export const DOG_BITE_SEVERITY: Record<DogBiteSeverity, number> = {
  minor: 1.5, // level 1-2, no or shallow puncture, quick recovery
  moderate: 3, // punctures requiring stitches, some lasting mark
  severe: 4.5, // deep lacerations, surgery, tissue damage
  disfiguring: 6, // permanent scarring / disfigurement, reconstruction
}

// Aggravating-factor bumps added to the base multiplier.
export const DOG_BITE_PREMIUMS = {
  facialInjury: 0.5,
  permanentScarring: 1.0,
  nerveDamage: 0.5,
  infection: 0.25,
  emotionalTrauma: 0.5,
  childVictim: 0.5,
} as const

export const DOG_BITE_MULT_MIN = 1.5
export const DOG_BITE_MULT_MAX = 8

// The majority of states impose strict liability for a dog bite (the owner is
// liable regardless of the dog's history). A minority follow the "one-bite rule"
// (the owner is liable only if they knew, or should have known, the dog was
// dangerous). This list is an educational approximation; several states are
// mixed and the rule is contested, so the tool always surfaces a "verify" note.
const ONE_BITE = new Set(['AR', 'ID', 'KS', 'MS', 'NV', 'NM', 'NY', 'ND', 'OR', 'SD', 'TX', 'VA', 'WY'])

export function dogBiteRuleForState(state: string): 'strict' | 'one-bite' {
  return ONE_BITE.has(state.toUpperCase()) ? 'one-bite' : 'strict'
}

export function calculateDogBite(input: DogBiteInput): DogBiteResult {
  const economic =
    input.medicalBills +
    input.futureMedical +
    input.lostEarnings +
    input.futureLostIncome +
    input.otherCosts

  let multiplier = DOG_BITE_SEVERITY[input.severity]
  if (input.facialInjury) multiplier += DOG_BITE_PREMIUMS.facialInjury
  if (input.permanentScarring) multiplier += DOG_BITE_PREMIUMS.permanentScarring
  if (input.nerveDamage) multiplier += DOG_BITE_PREMIUMS.nerveDamage
  if (input.infection) multiplier += DOG_BITE_PREMIUMS.infection
  if (input.emotionalTrauma) multiplier += DOG_BITE_PREMIUMS.emotionalTrauma
  if (input.childVictim) multiplier += DOG_BITE_PREMIUMS.childVictim
  multiplier = Math.min(DOG_BITE_MULT_MAX, Math.max(DOG_BITE_MULT_MIN, multiplier))

  const generalDamages = economic * multiplier
  const subtotal = economic + generalDamages

  // Liability factor. Strict-liability states start at full value. One-bite
  // states start reduced unless the owner knew the dog was dangerous or broke a
  // leash / fencing law. Provocation and trespassing are recognized defenses
  // that weaken (but here never fully zero) the claim.
  let liabilityFactor = 1
  if (dogBiteRuleForState(input.state) === 'one-bite' && !input.priorAggression && !input.ownerNegligent) {
    liabilityFactor = 0.5
  }
  if (input.provoked) liabilityFactor *= 0.4
  if (input.trespassing) liabilityFactor *= 0.5
  liabilityFactor = Math.max(0.1, liabilityFactor)

  const total = subtotal * liabilityFactor
  return {
    economic,
    multiplier,
    generalDamages: Math.round(generalDamages),
    liabilityFactor,
    low: Math.round(total * 0.75),
    high: Math.round(total * 1.25),
  }
}

// Plain-language note on the state's dog-bite rule (no em dashes, global rule).
export function dogBiteStateNote(state: string): string {
  const rule = dogBiteRuleForState(state)
  const base =
    rule === 'one-bite'
      ? 'This state generally follows the one-bite rule, so recovery is easier to prove when the owner already knew the dog was dangerous or broke a leash or fencing law.'
      : 'This state generally imposes strict liability for dog bites, so the owner is usually responsible even without any prior history.'
  return (
    base +
    ' Dog-bite statutes vary and several states are mixed, so confirm the current rule and any provocation or trespassing exceptions with a local attorney.'
  )
}
