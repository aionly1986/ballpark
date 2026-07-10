import { describe, it, expect } from 'vitest'
import {
  calculateNeckInjury,
  neckMultiplier,
  levelsBump,
  effectiveLevels,
  severityFor,
  NECK_MULT_MAX,
  type NeckInjuryInput,
} from '@/lib/neckInjury'

function base(overrides: Partial<NeckInjuryInput> = {}): NeckInjuryInput {
  return {
    medicalBills: 20000,
    futureMedical: 0,
    lostWages: 0,
    futureLostIncome: 0,
    otherCosts: 0,
    diagnosis: 'herniatedDisc',
    treatment: 'conservative',
    levels: 1,
    permanent: false,
    state: 'CA',
    faultLevel: 'none',
    negligenceRule: 'pure',
    ...overrides,
  }
}

describe('levelsBump', () => {
  it('adds nothing for a single level', () => {
    expect(levelsBump(1)).toBe(0)
  })
  it('adds 0.5 for two levels and 0.75 for three or more', () => {
    expect(levelsBump(2)).toBe(0.5)
    expect(levelsBump(3)).toBe(0.75)
    expect(levelsBump(5)).toBe(0.75)
  })
})

describe('effectiveLevels', () => {
  it('floors a multi-level fusion at two levels', () => {
    expect(effectiveLevels('fusionMulti', 1)).toBe(2)
    expect(effectiveLevels('fusionMulti', 3)).toBe(3)
  })
  it('leaves other treatments alone', () => {
    expect(effectiveLevels('fusionSingle', 1)).toBe(1)
    expect(effectiveLevels('conservative', 1)).toBe(1)
  })
  it('a multi-level fusion therefore always carries the levels bump', () => {
    // herniated 3 + fusionMulti 2 + (floored) 2 levels 0.5 = 5.5
    expect(neckMultiplier({ diagnosis: 'herniatedDisc', treatment: 'fusionMulti', levels: 1, permanent: false })).toBe(5.5)
  })
})

describe('neckMultiplier', () => {
  it('uses the diagnosis base when treated conservatively', () => {
    expect(neckMultiplier({ diagnosis: 'softTissue', treatment: 'conservative', levels: 1, permanent: false })).toBe(1.5)
    expect(neckMultiplier({ diagnosis: 'herniatedDisc', treatment: 'conservative', levels: 1, permanent: false })).toBe(3)
  })

  it('surgery is the single largest bump', () => {
    // herniated disc 3 + fusionSingle 1.5 = 4.5
    expect(neckMultiplier({ diagnosis: 'herniatedDisc', treatment: 'fusionSingle', levels: 1, permanent: false })).toBe(4.5)
    // vs injections: 3 + 0.5 = 3.5
    expect(neckMultiplier({ diagnosis: 'herniatedDisc', treatment: 'injections', levels: 1, permanent: false })).toBe(3.5)
  })

  it('stacks levels and permanence', () => {
    // herniated 3 + fusionMulti 2 + 2 levels 0.5 + permanent 0.5 = 6
    expect(neckMultiplier({ diagnosis: 'herniatedDisc', treatment: 'fusionMulti', levels: 2, permanent: true })).toBe(6)
  })

  it('clamps at the maximum', () => {
    // fracture 5 + fusionMulti 2 + 3 levels 0.75 + permanent 0.5 = 8.25 raw
    expect(neckMultiplier({ diagnosis: 'fracture', treatment: 'fusionMulti', levels: 3, permanent: true })).toBe(NECK_MULT_MAX)
  })

  it('never drops below the floor', () => {
    expect(neckMultiplier({ diagnosis: 'softTissue', treatment: 'conservative', levels: 1, permanent: false })).toBe(1.5)
  })
})

describe('severityFor', () => {
  it('treats conservatively-managed whiplash as minor', () => {
    expect(severityFor('softTissue', 'conservative', false)).toBe('minor')
  })
  it('permanence lifts whiplash out of minor', () => {
    expect(severityFor('softTissue', 'conservative', true)).toBe('moderate')
  })
  it('any surgery is severe', () => {
    expect(severityFor('herniatedDisc', 'discectomy', false)).toBe('severe')
    expect(severityFor('bulgingDisc', 'fusionSingle', false)).toBe('severe')
  })
  it('fracture or spinal cord injury is catastrophic', () => {
    expect(severityFor('fracture', 'conservative', false)).toBe('catastrophic')
  })
})

describe('calculateNeckInjury', () => {
  it('herniated disc, no surgery, no fault', () => {
    // 20000 economic x 3 = 60000 general, subtotal 80000 -> 60000..100000
    const r = calculateNeckInjury(base())
    expect(r.economic).toBe(20000)
    expect(r.multiplier).toBe(3)
    expect(r.generalDamages).toBe(60000)
    expect(r.low).toBe(60000)
    expect(r.high).toBe(100000)
    expect(r.severity).toBe('moderate')
  })

  it('the same disc with a single-level fusion is worth materially more', () => {
    // 20000 x 4.5 = 90000 general, subtotal 110000 -> 82500..137500
    const r = calculateNeckInjury(base({ treatment: 'fusionSingle' }))
    expect(r.multiplier).toBe(4.5)
    expect(r.low).toBe(82500)
    expect(r.high).toBe(137500)
    expect(r.severity).toBe('severe')
  })

  it('two-level fusion with permanence', () => {
    // 3 + 2 + 0.5 + 0.5 = 6 -> general 120000, subtotal 140000 -> 105000..175000
    const r = calculateNeckInjury(base({ treatment: 'fusionMulti', levels: 2, permanent: true }))
    expect(r.multiplier).toBe(6)
    expect(r.generalDamages).toBe(120000)
    expect(r.low).toBe(105000)
    expect(r.high).toBe(175000)
  })

  it('sums every economic line item', () => {
    const r = calculateNeckInjury(
      base({ medicalBills: 10000, futureMedical: 5000, lostWages: 3000, futureLostIncome: 1500, otherCosts: 500 }),
    )
    expect(r.economic).toBe(20000)
  })

  it('applies comparative fault (partial = 25%)', () => {
    // subtotal 80000 x 0.75 = 60000 -> 45000..75000
    const r = calculateNeckInjury(base({ faultLevel: 'partial', negligenceRule: 'pure' }))
    expect(r.low).toBe(45000)
    expect(r.high).toBe(75000)
  })

  it('contributory negligence bars recovery at any fault', () => {
    const r = calculateNeckInjury(base({ faultLevel: 'partial', negligenceRule: 'contributory' }))
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })

  it('no-fault gate zeroes pain and suffering but keeps economic damages', () => {
    // gate on -> general 0, subtotal = economic 20000 -> 15000..25000
    const r = calculateNeckInjury(base({ diagnosis: 'softTissue', noFaultGate: true }))
    expect(r.generalDamages).toBe(0)
    expect(r.low).toBe(15000)
    expect(r.high).toBe(25000)
  })
})
