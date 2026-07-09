import { describe, it, expect } from 'vitest'
import { CARRIER_POLICY_DEFAULT, truckPolicyCeiling } from '@/lib/truckAccident'

describe('CARRIER_POLICY_DEFAULT', () => {
  it('reflects commercial coverage tiers', () => {
    expect(CARRIER_POLICY_DEFAULT.interstate).toBe(1_000_000)
    expect(CARRIER_POLICY_DEFAULT.local).toBe(300_000)
    expect(CARRIER_POLICY_DEFAULT.hazmat).toBe(5_000_000)
    expect(CARRIER_POLICY_DEFAULT.unknown).toBe(0)
  })
})

describe('truckPolicyCeiling', () => {
  it('prefers an explicit known limit', () => {
    expect(truckPolicyCeiling('interstate', 2_000_000)).toBe(2_000_000)
  })
  it('falls back to the carrier-type default', () => {
    expect(truckPolicyCeiling('interstate', 0)).toBe(1_000_000)
    expect(truckPolicyCeiling('hazmat', 0)).toBe(5_000_000)
  })
  it('returns 0 (no cap) when carrier and limit are unknown', () => {
    expect(truckPolicyCeiling('unknown', 0)).toBe(0)
  })
})
