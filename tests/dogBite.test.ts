import { describe, it, expect } from 'vitest'
import { calculateDogBite, dogBiteRuleForState, type DogBiteInput } from '@/lib/dogBite'

// A baseline input with no aggravating factors and clean liability.
function base(overrides: Partial<DogBiteInput> = {}): DogBiteInput {
  return {
    medicalBills: 8000,
    futureMedical: 2000,
    lostEarnings: 0,
    futureLostIncome: 0,
    otherCosts: 0,
    severity: 'moderate',
    facialInjury: false,
    permanentScarring: false,
    nerveDamage: false,
    infection: false,
    emotionalTrauma: false,
    childVictim: false,
    state: 'CA', // strict-liability
    provoked: false,
    trespassing: false,
    priorAggression: false,
    ownerNegligent: false,
    ...overrides,
  }
}

describe('dogBiteRuleForState', () => {
  it('defaults to strict liability', () => {
    expect(dogBiteRuleForState('CA')).toBe('strict')
    expect(dogBiteRuleForState('FL')).toBe('strict')
  })
  it('flags one-bite states', () => {
    expect(dogBiteRuleForState('TX')).toBe('one-bite')
    expect(dogBiteRuleForState('ny')).toBe('one-bite')
  })
})

describe('calculateDogBite', () => {
  it('moderate bite, strict state, no premiums or defenses', () => {
    // economic 10000, x3 -> general 30000, subtotal 40000, liability 1
    const r = calculateDogBite(base())
    expect(r.economic).toBe(10000)
    expect(r.multiplier).toBe(3)
    expect(r.generalDamages).toBe(30000)
    expect(r.liabilityFactor).toBe(1)
    expect(r.low).toBe(30000)
    expect(r.high).toBe(50000)
  })

  it('disfiguring facial scar on a child clamps at the max multiplier', () => {
    // 6 + facial 0.5 + scarring 1.0 + child 0.5 = 8.0 (at cap)
    const r = calculateDogBite(
      base({
        medicalBills: 15000,
        futureMedical: 10000,
        severity: 'disfiguring',
        facialInjury: true,
        permanentScarring: true,
        childVictim: true,
      }),
    )
    expect(r.economic).toBe(25000)
    expect(r.multiplier).toBe(8)
    expect(r.generalDamages).toBe(200000)
    expect(r.low).toBe(168750)
    expect(r.high).toBe(281250)
  })

  it('caps the multiplier at 8 even when premiums exceed it', () => {
    const r = calculateDogBite(
      base({
        severity: 'disfiguring', // 6
        facialInjury: true, // +0.5
        permanentScarring: true, // +1.0
        nerveDamage: true, // +0.5
        infection: true, // +0.25
        emotionalTrauma: true, // +0.5
        childVictim: true, // +0.5  => 9.25 raw
      }),
    )
    expect(r.multiplier).toBe(8)
  })

  it('one-bite state without owner knowledge halves liability', () => {
    // TX one-bite, no prior aggression / negligence -> factor 0.5
    const r = calculateDogBite(base({ state: 'TX' }))
    expect(r.liabilityFactor).toBe(0.5)
    expect(r.low).toBe(15000) // 40000 * 0.5 * 0.75
    expect(r.high).toBe(25000)
  })

  it('one-bite state with prior aggression restores full liability', () => {
    const r = calculateDogBite(base({ state: 'TX', priorAggression: true }))
    expect(r.liabilityFactor).toBe(1)
  })

  it('provocation weakens a strict-liability claim', () => {
    // factor 1 * 0.4 = 0.4 -> 40000 * 0.4 = 16000
    const r = calculateDogBite(base({ provoked: true }))
    expect(r.liabilityFactor).toBeCloseTo(0.4)
    expect(r.low).toBe(12000)
    expect(r.high).toBe(20000)
  })

  it('never drops liability below the 0.1 floor', () => {
    // one-bite 0.5 * provoked 0.4 * trespassing 0.5 = 0.1
    const r = calculateDogBite(base({ state: 'TX', provoked: true, trespassing: true }))
    expect(r.liabilityFactor).toBeCloseTo(0.1)
  })

  it('enforces the minor-severity floor', () => {
    const r = calculateDogBite(base({ medicalBills: 4000, futureMedical: 0, severity: 'minor' }))
    expect(r.multiplier).toBe(1.5)
    expect(r.low).toBe(7500) // (4000 + 6000) * 0.75
    expect(r.high).toBe(12500)
  })
})
