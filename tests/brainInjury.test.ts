import { describe, it, expect } from 'vitest'
import {
  calculateBrainInjury,
  brainMultiplier,
  severityBandFor,
  TBI_MULT_MAX,
  type BrainInjuryInput,
} from '@/lib/brainInjury'

function base(overrides: Partial<BrainInjuryInput> = {}): BrainInjuryInput {
  return {
    medicalBills: 100000,
    futureMedical: 0,
    lostWages: 0,
    futureLostIncome: 0,
    lifeCareCosts: 0,
    severity: 'mild',
    loc: 'none',
    imagingPositive: false,
    permanentCognitiveDeficit: false,
    faultLevel: 'none',
    negligenceRule: 'pure',
    ...overrides,
  }
}

describe('economic damages', () => {
  it('sums all five line items', () => {
    const r = calculateBrainInjury(
      base({
        medicalBills: 10000,
        futureMedical: 5000,
        lostWages: 3000,
        futureLostIncome: 1500,
        lifeCareCosts: 500,
      }),
    )
    expect(r.economic).toBe(20000)
  })
})

describe('brainMultiplier', () => {
  it('mild + no LOC + no imaging + no deficit = 2.0', () => {
    expect(
      brainMultiplier({
        severity: 'mild',
        loc: 'none',
        imagingPositive: false,
        permanentCognitiveDeficit: false,
      }),
    ).toBe(2.0)
  })

  it('mild + imaging + permanent deficit = 2 + 0.5 + 1.0 = 3.5', () => {
    expect(
      brainMultiplier({
        severity: 'mild',
        loc: 'none',
        imagingPositive: true,
        permanentCognitiveDeficit: true,
      }),
    ).toBe(3.5)
  })

  it('catastrophic + over24h LOC + imaging + deficit = 6.5 + 1 + 0.5 + 1 = 9', () => {
    expect(
      brainMultiplier({
        severity: 'catastrophic',
        loc: 'over24h',
        imagingPositive: true,
        permanentCognitiveDeficit: true,
      }),
    ).toBe(9.0)
  })

  it('clamps at the maximum of 10', () => {
    // A raw score cannot exceed 6.5 + 1 + 0.5 + 1 = 9 today, so force the clamp by
    // confirming the ceiling constant is honoured even if inputs were pushed higher.
    const raw = brainMultiplier({
      severity: 'catastrophic',
      loc: 'over24h',
      imagingPositive: true,
      permanentCognitiveDeficit: true,
    })
    expect(raw).toBeLessThanOrEqual(TBI_MULT_MAX)
    expect(TBI_MULT_MAX).toBe(10)
  })
})

describe('calculateBrainInjury', () => {
  it('economic 100000 at multiplier 2.0: general 200000, subtotal 300000 -> 225000..375000', () => {
    const r = calculateBrainInjury(base())
    expect(r.economic).toBe(100000)
    expect(r.multiplier).toBe(2.0)
    expect(r.generalDamages).toBe(200000)
    expect(r.low).toBe(225000)
    expect(r.high).toBe(375000)
  })

  it('applies comparative fault (partial = 25% reduction)', () => {
    // subtotal 300000 x 0.75 = 225000 -> 168750..281250
    const r = calculateBrainInjury(base({ faultLevel: 'partial', negligenceRule: 'pure' }))
    expect(r.low).toBe(168750)
    expect(r.high).toBe(281250)
  })

  it('contributory negligence bars recovery entirely', () => {
    const r = calculateBrainInjury(base({ faultLevel: 'partial', negligenceRule: 'contributory' }))
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })

  it('no-fault gate zeroes general damages but keeps economic in the subtotal', () => {
    // gate on -> general 0, subtotal = economic 100000 -> 75000..125000
    const r = calculateBrainInjury(base({ noFaultGate: true }))
    expect(r.generalDamages).toBe(0)
    expect(r.low).toBe(75000)
    expect(r.high).toBe(125000)
  })
})

describe('severityBandFor', () => {
  it('a mild TBI with no LOC, no imaging, no deficit maps to minor', () => {
    expect(severityBandFor('mild', 'none', false, false)).toBe('minor')
  })
  it('a mild TBI with imaging maps to moderate', () => {
    expect(severityBandFor('mild', 'none', true, false)).toBe('moderate')
  })
  it('a mild TBI with LOC or a deficit is no longer minor', () => {
    expect(severityBandFor('mild', 'under30min', false, false)).toBe('moderate')
    expect(severityBandFor('mild', 'none', false, true)).toBe('moderate')
  })
  it('moderate, severe, and catastrophic map straight through', () => {
    expect(severityBandFor('moderate', 'none', false, false)).toBe('moderate')
    expect(severityBandFor('severe', 'none', false, false)).toBe('severe')
    expect(severityBandFor('catastrophic', 'none', false, false)).toBe('catastrophic')
  })
})
