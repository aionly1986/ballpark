import { describe, it, expect } from 'vitest'
import { calculatePainSuffering, multiplierFor } from '@/lib/painSuffering'

describe('multiplierFor', () => {
  it('uses the base severity multiplier', () => {
    expect(multiplierFor('minor', false)).toBe(1.5)
    expect(multiplierFor('moderate', false)).toBe(3)
    expect(multiplierFor('catastrophic', false)).toBe(5)
  })
  it('adds 0.5 for a permanent injury', () => {
    expect(multiplierFor('moderate', true)).toBe(3.5)
    expect(multiplierFor('severe', true)).toBe(4.5)
  })
})

describe('calculatePainSuffering', () => {
  it('multiplier method, no fault', () => {
    // 40000 economic x 3 (moderate) = 120000 -> range 90000..150000
    const r = calculatePainSuffering({
      method: 'multiplier', economicDamages: 40000, severity: 'moderate', permanent: false,
      dailyRate: 0, recoveryDays: 0, faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.multiplier).toBe(3)
    expect(r.base).toBe(120000)
    expect(r.low).toBe(90000)
    expect(r.high).toBe(150000)
  })

  it('multiplier method with permanence bumps the factor', () => {
    // 40000 x 3.5 = 140000 -> 105000..175000
    const r = calculatePainSuffering({
      method: 'multiplier', economicDamages: 40000, severity: 'moderate', permanent: true,
      dailyRate: 0, recoveryDays: 0, faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.multiplier).toBe(3.5)
    expect(r.base).toBe(140000)
    expect(r.low).toBe(105000)
    expect(r.high).toBe(175000)
  })

  it('per diem method', () => {
    // $300/day x 180 days = 54000 -> 40500..67500
    const r = calculatePainSuffering({
      method: 'perDiem', economicDamages: 0, severity: 'minor', permanent: false,
      dailyRate: 300, recoveryDays: 180, faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.multiplier).toBeNull()
    expect(r.base).toBe(54000)
    expect(r.low).toBe(40500)
    expect(r.high).toBe(67500)
  })

  it('applies comparative fault (25% partial)', () => {
    // 120000 x 0.75 = 90000 -> 67500..112500
    const r = calculatePainSuffering({
      method: 'multiplier', economicDamages: 40000, severity: 'moderate', permanent: false,
      dailyRate: 0, recoveryDays: 0, faultLevel: 'partial', negligenceRule: 'modified',
    })
    expect(r.low).toBe(67500)
    expect(r.high).toBe(112500)
  })

  it('contributory negligence bars recovery at any fault', () => {
    const r = calculatePainSuffering({
      method: 'multiplier', economicDamages: 40000, severity: 'moderate', permanent: false,
      dailyRate: 0, recoveryDays: 0, faultLevel: 'partial', negligenceRule: 'contributory',
    })
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })
})
