import { describe, it, expect } from 'vitest'
import { isNoFaultState, gatesPainSuffering, hasNonEconCap, stateNote } from '@/lib/states'

describe('no-fault states', () => {
  it('flags the true no-fault (PIP) states', () => {
    for (const s of ['FL', 'NY', 'MI', 'MA', 'HI', 'KS', 'MN', 'ND', 'UT']) {
      expect(isNoFaultState(s)).toBe(true)
    }
  })
  it('does not flag at-fault or choice states', () => {
    for (const s of ['CA', 'TX', 'GA', 'PA', 'NJ', 'KY']) {
      expect(isNoFaultState(s)).toBe(false)
    }
  })
})

describe('gatesPainSuffering', () => {
  it('gates a minor injury in a no-fault state', () => {
    expect(gatesPainSuffering('NY', 'minor')).toBe(true)
    expect(gatesPainSuffering('FL', 'minor')).toBe(true)
  })
  it('does not gate a moderate+ injury in a no-fault state', () => {
    expect(gatesPainSuffering('NY', 'moderate')).toBe(false)
    expect(gatesPainSuffering('NY', 'severe')).toBe(false)
  })
  it('does not gate any injury in an at-fault state', () => {
    expect(gatesPainSuffering('CA', 'minor')).toBe(false)
  })
})

describe('stateNote', () => {
  it('adds a no-fault note when the gate applies', () => {
    expect(stateNote('NY', 'minor')).toMatch(/no-fault/i)
  })
  it('flags non-economic damage caps', () => {
    expect(hasNonEconCap('MD')).toBe(true)
    expect(stateNote('MD', 'moderate')).toMatch(/cap/i)
  })
})
