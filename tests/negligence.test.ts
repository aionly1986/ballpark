import { describe, it, expect } from 'vitest'
import { negligenceRuleForState } from '@/lib/negligence'

describe('negligenceRuleForState', () => {
  it('classifies contributory-negligence jurisdictions', () => {
    for (const s of ['AL', 'DC', 'MD', 'NC', 'VA']) {
      expect(negligenceRuleForState(s)).toBe('contributory')
    }
  })

  it('classifies pure comparative states', () => {
    for (const s of ['CA', 'NY', 'WA', 'LA', 'MO']) {
      expect(negligenceRuleForState(s)).toBe('pure')
    }
  })

  it('defaults the rest to modified comparative', () => {
    // Includes Florida, which moved to modified comparative in 2023.
    for (const s of ['TX', 'IL', 'PA', 'GA', 'FL']) {
      expect(negligenceRuleForState(s)).toBe('modified')
    }
  })

  it('is case-insensitive and defaults unknown codes to modified', () => {
    expect(negligenceRuleForState('ca')).toBe('pure')
    expect(negligenceRuleForState('zz')).toBe('modified')
    expect(negligenceRuleForState('')).toBe('modified')
  })
})
