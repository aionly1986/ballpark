import { describe, it, expect } from 'vitest'
import {
  calculateWrongfulDeath,
  annuityFactor,
  consumptionShare,
  NET_DISCOUNT_RATE,
  type WrongfulDeathInput,
} from '@/lib/wrongfulDeath'

// 40-year-old earning $60k, 25 years to retirement, 2 dependents, spouse filing,
// $10k funeral, no household services, no fault, no punitive, no coverage cap.
function base(overrides: Partial<WrongfulDeathInput> = {}): WrongfulDeathInput {
  return {
    ageAtDeath: 40,
    lifeExpectancy: 78,
    healthStatus: 'good',
    annualIncome: 60000,
    yearsToRetirement: 25,
    medicalExpenses: 0,
    funeralCosts: 10000,
    householdHoursPerWeek: 0,
    childcareHoursPerWeek: 0,
    homeMaintenance: false,
    relationship: 'spouse',
    dependents: 2,
    faultPercent: 0,
    negligenceRule: 'pure',
    conduct: 'negligent',
    punitiveEligible: false,
    primaryCoverage: 0,
    umbrellaCoverage: 0,
    umUimCoverage: 0,
    ...overrides,
  }
}

describe('annuityFactor', () => {
  it('is the years themselves at a zero discount rate', () => {
    expect(annuityFactor(25, 0)).toBe(25)
  })
  it('discounts a stream of future dollars', () => {
    // (1 - 1.02^-25) / 0.02
    expect(annuityFactor(25)).toBeCloseTo(19.5234564, 5)
    expect(annuityFactor(38)).toBeCloseTo(26.4406406, 5)
  })
  it('a discounted stream is always worth less than its nominal sum', () => {
    expect(annuityFactor(25)).toBeLessThan(25)
  })
  it('returns zero for no remaining years', () => {
    expect(annuityFactor(0)).toBe(0)
    expect(annuityFactor(-5)).toBe(0)
  })
  it('uses a 2% net real discount rate', () => {
    expect(NET_DISCOUNT_RATE).toBe(0.02)
  })
})

describe('consumptionShare', () => {
  it('falls as the household grows', () => {
    expect(consumptionShare(0)).toBe(0.35)
    expect(consumptionShare(1)).toBe(0.28)
    expect(consumptionShare(2)).toBe(0.22)
    expect(consumptionShare(3)).toBe(0.18)
    expect(consumptionShare(6)).toBe(0.18)
  })
})

describe('calculateWrongfulDeath', () => {
  it('baseline: discounted earnings net of personal consumption', () => {
    // 60000 x 0.78 x 19.5234564 = 913,698
    const r = calculateWrongfulDeath(base())
    expect(r.lostEarnings).toBe(913698)
    expect(r.lostServices).toBe(0)
    expect(r.finalExpenses).toBe(10000)
    expect(r.economic).toBe(923698)
    // spouse 1.0 + 2 dependents x 0.1 = 1.2
    expect(r.nonEconomic).toBe(1108437)
    expect(r.total).toBe(2032135)
    expect(r.low).toBe(1422495)
    expect(r.high).toBe(2641776)
    expect(r.yearsRemaining).toBe(38)
  })

  it('never pays the full nominal earnings, because of consumption and discounting', () => {
    const r = calculateWrongfulDeath(base())
    const nominal = 60000 * 25 // 1,500,000 undiscounted, pre-consumption
    expect(r.lostEarnings).toBeLessThan(nominal)
  })

  it('values household services at replacement cost over remaining life', () => {
    // (10h x 52 x $15) + (5h x 52 x $18) + $5,000 = 7800 + 4680 + 5000 = 17,480/yr
    // x annuityFactor(38) = 26.4406406 -> 462,182
    const r = calculateWrongfulDeath(
      base({ householdHoursPerWeek: 10, childcareHoursPerWeek: 5, homeMaintenance: true }),
    )
    expect(r.lostServices).toBe(462182)
    expect(r.economic).toBe(1385880)
    expect(r.low).toBe(2134255)
    expect(r.high).toBe(3963617)
  })

  it('health status shifts the years used to value services', () => {
    // poor health: 78 - 8 = 70, minus age 60 -> 10 remaining years
    const r = calculateWrongfulDeath(
      base({ ageAtDeath: 60, healthStatus: 'poor', annualIncome: 0, yearsToRetirement: 0, funeralCosts: 0, householdHoursPerWeek: 10, dependents: 0 }),
    )
    expect(r.yearsRemaining).toBe(10)
    expect(r.lostEarnings).toBe(0)
    expect(r.lostServices).toBe(70064)
  })

  it('applies pure comparative fault', () => {
    // 2,032,135 x 0.7 = 1,422,495
    const r = calculateWrongfulDeath(base({ faultPercent: 30, negligenceRule: 'pure' }))
    expect(r.total).toBe(1422495)
    expect(r.low).toBe(995746)
    expect(r.high).toBe(1849243)
  })

  it('contributory negligence bars the claim entirely', () => {
    const r = calculateWrongfulDeath(base({ faultPercent: 30, negligenceRule: 'contributory' }))
    expect(r.total).toBe(0)
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })

  it('modified comparative bars the claim at half fault', () => {
    expect(calculateWrongfulDeath(base({ faultPercent: 50, negligenceRule: 'modified' })).total).toBe(0)
    expect(calculateWrongfulDeath(base({ faultPercent: 49, negligenceRule: 'modified' })).total).toBeGreaterThan(0)
  })

  it('adds a punitive uplift only for egregious conduct AND eligibility', () => {
    // compensatory 2,032,135 x 0.3 = 609,641
    const r = calculateWrongfulDeath(base({ conduct: 'reckless', punitiveEligible: true }))
    expect(r.punitive).toBe(609641)
    expect(r.total).toBe(2641776)
  })

  it('adds no punitive damages when they are not available', () => {
    const r = calculateWrongfulDeath(base({ conduct: 'criminal', punitiveEligible: false }))
    expect(r.punitive).toBe(0)
    expect(r.total).toBe(2032135)
  })

  it('adds no punitive damages for ordinary negligence even if marked eligible', () => {
    const r = calculateWrongfulDeath(base({ conduct: 'negligent', punitiveEligible: true }))
    expect(r.punitive).toBe(0)
  })

  it('caps the recovery at the total available coverage', () => {
    const r = calculateWrongfulDeath(base({ primaryCoverage: 500000, umbrellaCoverage: 500000 }))
    expect(r.totalCoverage).toBe(1000000)
    expect(r.cappedByCoverage).toBe(true)
    expect(r.high).toBe(1000000)
  })

  it('does not cap when coverage is unknown', () => {
    const r = calculateWrongfulDeath(base())
    expect(r.cappedByCoverage).toBe(false)
    expect(r.high).toBe(2641776)
  })

  it('a closer relationship raises the non-economic loss', () => {
    const spouse = calculateWrongfulDeath(base({ dependents: 0 })).nonEconomic
    const sibling = calculateWrongfulDeath(base({ dependents: 0, relationship: 'sibling' })).nonEconomic
    expect(spouse).toBeGreaterThan(sibling)
  })
})
