import { describe, it, expect } from 'vitest'
import { calculateWorkersComp, TTD_RATE, PPD_WHOLE_PERSON_WEEKS } from '@/lib/workersComp'

describe('workers comp constants', () => {
  it('uses the two-thirds wage-replacement rate', () => {
    expect(TTD_RATE).toBeCloseTo(2 / 3)
  })
  it('uses 400 whole-person weeks for permanent disability', () => {
    expect(PPD_WHOLE_PERSON_WEEKS).toBe(400)
  })
})

describe('calculateWorkersComp', () => {
  it('temporary wage replacement only (no permanent rating)', () => {
    // 800 AWW -> 533.33/wk, x12 weeks = 6400
    const r = calculateWorkersComp({
      averageWeeklyWage: 800,
      weeksOutOfWork: 12,
      medicalExpenses: 25000,
      impairmentRating: 0,
      futureMedical: 0,
      stateMaxWeekly: 0,
    })
    expect(r.weeklyBenefit).toBe(533)
    expect(r.wageBenefit).toBe(6400)
    expect(r.permanentBenefit).toBe(0)
    expect(r.base).toBe(6400)
    expect(r.low).toBe(4480)
    expect(r.high).toBe(8320)
  })

  it('adds a permanent partial disability award from the impairment rating', () => {
    // 1200 AWW -> 800/wk. wage: 800*20 = 16000. PPD: 0.10*400*800 = 32000.
    const r = calculateWorkersComp({
      averageWeeklyWage: 1200,
      weeksOutOfWork: 20,
      medicalExpenses: 0,
      impairmentRating: 10,
      futureMedical: 0,
      stateMaxWeekly: 0,
    })
    expect(r.weeklyBenefit).toBe(800)
    expect(r.wageBenefit).toBe(16000)
    expect(r.permanentBenefit).toBe(32000)
    expect(r.base).toBe(48000)
    expect(r.low).toBe(33600)
    expect(r.high).toBe(62400)
  })

  it('caps the weekly benefit at the state maximum', () => {
    // 3000 AWW -> 2000/wk raw, capped to 1200.
    const r = calculateWorkersComp({
      averageWeeklyWage: 3000,
      weeksOutOfWork: 10,
      medicalExpenses: 0,
      impairmentRating: 5,
      futureMedical: 0,
      stateMaxWeekly: 1200,
    })
    expect(r.cappedByStateMax).toBe(true)
    expect(r.weeklyBenefit).toBe(1200)
    expect(r.wageBenefit).toBe(12000)
    expect(r.permanentBenefit).toBe(24000) // 0.05*400*1200
    expect(r.base).toBe(36000)
  })

  it('folds a future-medical buyout into the settlement', () => {
    // 900 AWW -> 600/wk. wage 4800, PPD 0.15*400*600=36000, medical 20000.
    const r = calculateWorkersComp({
      averageWeeklyWage: 900,
      weeksOutOfWork: 8,
      medicalExpenses: 5000,
      impairmentRating: 15,
      futureMedical: 20000,
      stateMaxWeekly: 0,
    })
    expect(r.wageBenefit).toBe(4800)
    expect(r.permanentBenefit).toBe(36000)
    expect(r.medical).toBe(20000)
    expect(r.base).toBe(60800)
    expect(r.low).toBe(42560)
    expect(r.high).toBe(79040)
  })

  it('clamps an impairment rating above 100%', () => {
    // rating 250 -> treated as 100. 800/wk, PPD = 1.0*400*800 = 320000.
    const r = calculateWorkersComp({
      averageWeeklyWage: 1200,
      weeksOutOfWork: 0,
      medicalExpenses: 0,
      impairmentRating: 250,
      futureMedical: 0,
      stateMaxWeekly: 0,
    })
    expect(r.permanentBenefit).toBe(320000)
  })

  it('does not cap when no state maximum is provided', () => {
    const r = calculateWorkersComp({
      averageWeeklyWage: 3000,
      weeksOutOfWork: 1,
      medicalExpenses: 0,
      impairmentRating: 0,
      futureMedical: 0,
      stateMaxWeekly: 0,
    })
    expect(r.cappedByStateMax).toBe(false)
    expect(r.weeklyBenefit).toBe(2000)
  })
})
