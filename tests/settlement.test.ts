import { describe, it, expect } from 'vitest'
import { calculateSettlement } from '@/lib/settlement'

// Known-input cases hand-computed from the documented formula. These cover
// every severity band and every fault level, the state negligence rules, and
// a rounding check.
describe('calculateSettlement', () => {
  it('minor severity, no fault', () => {
    // economic 10000 -> PS 15000 -> subtotal 25000 -> total 25000
    const r = calculateSettlement({
      medicalBills: 10000, futureMedical: 0, lostWages: 0,
      severity: 'minor', faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.economic).toBe(10000)
    expect(r.painSuffering).toBe(15000)
    expect(r.low).toBe(18750)
    expect(r.high).toBe(31250)
    // Pain-and-suffering range (no fault): 15000 x 0.75/1.25
    expect(r.painSufferingLow).toBe(11250)
    expect(r.painSufferingHigh).toBe(18750)
  })

  it('moderate severity, partial fault (25% reduction)', () => {
    // economic 20000 -> PS 60000 -> subtotal 80000 -> total 60000
    const r = calculateSettlement({
      medicalBills: 10000, futureMedical: 5000, lostWages: 5000,
      severity: 'moderate', faultLevel: 'partial', negligenceRule: 'modified',
    })
    expect(r.economic).toBe(20000)
    expect(r.painSuffering).toBe(60000)
    expect(r.low).toBe(45000)
    expect(r.high).toBe(75000)
  })

  it('severe severity, mostly at fault, PURE comparative (60% reduction)', () => {
    // economic 50000 -> PS 200000 -> subtotal 250000 -> total 100000
    const r = calculateSettlement({
      medicalBills: 20000, futureMedical: 20000, lostWages: 10000,
      severity: 'severe', faultLevel: 'mostly', negligenceRule: 'pure',
    })
    expect(r.economic).toBe(50000)
    expect(r.painSuffering).toBe(200000)
    expect(r.low).toBe(75000)
    expect(r.high).toBe(125000)
    // Pain-and-suffering after 60% fault: 200000 x 0.4 = 80000, then x 0.75/1.25
    expect(r.painSufferingLow).toBe(60000)
    expect(r.painSufferingHigh).toBe(100000)
  })

  it('catastrophic severity, no fault', () => {
    // economic 350000 -> PS 1750000 -> subtotal 2100000 -> total 2100000
    const r = calculateSettlement({
      medicalBills: 100000, futureMedical: 200000, lostWages: 50000,
      severity: 'catastrophic', faultLevel: 'none', negligenceRule: 'pure',
    })
    expect(r.economic).toBe(350000)
    expect(r.painSuffering).toBe(1750000)
    expect(r.low).toBe(1575000)
    expect(r.high).toBe(2625000)
  })

  it('rounds fractional dollar amounts to whole dollars', () => {
    // economic 1000 -> PS 1500 -> subtotal 2500 -> total 1875
    // low = round(1406.25) = 1406, high = round(2343.75) = 2344
    const r = calculateSettlement({
      medicalBills: 1000, futureMedical: 0, lostWages: 0,
      severity: 'minor', faultLevel: 'partial', negligenceRule: 'modified',
    })
    expect(r.low).toBe(1406)
    expect(r.high).toBe(2344)
  })

  it('MODIFIED comparative bars recovery when mostly at fault', () => {
    // Same inputs as the pure case, but modified rule bars 60% fault -> $0.
    const r = calculateSettlement({
      medicalBills: 20000, futureMedical: 20000, lostWages: 10000,
      severity: 'severe', faultLevel: 'mostly', negligenceRule: 'modified',
    })
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })

  it('CONTRIBUTORY negligence bars recovery at any fault', () => {
    // Even a 25% partial share bars recovery entirely -> $0.
    const r = calculateSettlement({
      medicalBills: 10000, futureMedical: 5000, lostWages: 5000,
      severity: 'moderate', faultLevel: 'partial', negligenceRule: 'contributory',
    })
    expect(r.low).toBe(0)
    expect(r.high).toBe(0)
  })

  it('sums the Advanced economic line items into the estimate', () => {
    // economic = 10000 + 5000 + 8000 + 4000 + 3000 + 1000 = 31000
    // minor x1.5 -> PS 46500 -> subtotal 77500 -> total 77500
    const r = calculateSettlement({
      medicalBills: 10000, futureMedical: 5000, lostWages: 8000,
      futureLostIncome: 4000, propertyDamage: 3000, otherCosts: 1000,
      severity: 'minor', faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.economic).toBe(31000)
    expect(r.painSuffering).toBe(46500)
    expect(r.low).toBe(58125)
    expect(r.high).toBe(96875)
  })

  it('caps the range at the insurance policy limit', () => {
    // economic 40000 -> PS 120000 -> subtotal 160000 -> total 160000
    // range 120000..200000; policy limit 150000 caps the high end.
    const r = calculateSettlement({
      medicalBills: 20000, futureMedical: 5000, lostWages: 15000,
      severity: 'moderate', faultLevel: 'none', negligenceRule: 'modified',
      policyLimit: 150000,
    })
    expect(r.low).toBe(120000)
    expect(r.high).toBe(150000)
    expect(r.cappedByPolicy).toBe(true)
  })

  it('does not cap when no policy limit is given', () => {
    const r = calculateSettlement({
      medicalBills: 20000, futureMedical: 5000, lostWages: 15000,
      severity: 'moderate', faultLevel: 'none', negligenceRule: 'modified',
    })
    expect(r.cappedByPolicy).toBe(false)
    expect(r.high).toBe(200000)
  })

  it('no-fault gate zeroes pain and suffering (settlement = economic only)', () => {
    // minor injury in a no-fault state: economic 10000, PS = 0, total = 10000
    const r = calculateSettlement({
      medicalBills: 8000, futureMedical: 0, lostWages: 2000,
      severity: 'minor', faultLevel: 'none', negligenceRule: 'pure',
      noFaultGate: true,
    })
    expect(r.painSuffering).toBe(0)
    expect(r.low).toBe(7500)
    expect(r.high).toBe(12500)
    expect(r.painSufferingLow).toBe(0)
  })

  it('CONTRIBUTORY negligence does not bar a no-fault claim', () => {
    // No fault -> no reduction, same as any other rule.
    const r = calculateSettlement({
      medicalBills: 10000, futureMedical: 0, lostWages: 0,
      severity: 'minor', faultLevel: 'none', negligenceRule: 'contributory',
    })
    expect(r.low).toBe(18750)
    expect(r.high).toBe(31250)
  })
})
