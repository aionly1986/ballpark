import { describe, it, expect } from 'vitest'
import {
  calculateMedMalpractice,
  clampMultiplier,
  durationBump,
  SEVERITY_BASE,
  TYPE_BUMP,
  type MedMalpracticeInput,
} from '@/lib/medMalpractice'

// A baseline input: moderate surgical error, 12 months of added recovery, and a
// 33% contingency fee, in a state with no non-economic cap (CA is not in the
// NON_ECON_CAP set used by the engine).
function base(overrides: Partial<MedMalpracticeInput> = {}): MedMalpracticeInput {
  return {
    originalMedical: 0,
    additionalMedical: 50000,
    lostWages: 25000,
    caregiverLifeCare: 75000,
    malpracticeType: 'surgicalError',
    severity: 'moderate',
    recoveryMonths: 12,
    contingencyPercent: 33,
    state: 'CA',
    ...overrides,
  }
}

describe('causation: original condition cost is excluded', () => {
  it('excludes originalMedical from economic damages (the central point)', () => {
    // additional 50000 + lost 25000 + caregiver 75000 = 150000. The 15000 spent
    // treating the original condition is NOT added: economic is 150000, not 165000.
    const r = calculateMedMalpractice(
      base({
        originalMedical: 15000,
        additionalMedical: 50000,
        lostWages: 25000,
        caregiverLifeCare: 75000,
      }),
    )
    expect(r.economic).toBe(150000)
    expect(r.economic).not.toBe(165000)
    expect(r.originalMedicalExcluded).toBe(15000)
  })
})

describe('durationBump', () => {
  it('is 0 under 12 months', () => {
    expect(durationBump(6)).toBe(0)
    expect(durationBump(11)).toBe(0)
  })
  it('is 0.25 from 12 up to 24 months', () => {
    expect(durationBump(12)).toBe(0.25)
    expect(durationBump(23)).toBe(0.25)
  })
  it('is 0.5 at 24 months or more', () => {
    expect(durationBump(24)).toBe(0.5)
    expect(durationBump(48)).toBe(0.5)
  })
})

describe('multiplier composition and clamp', () => {
  it('composes severity base + type bump + duration bump', () => {
    // moderate 3 + surgicalError 0.3 + 12mo 0.25 = 3.55
    expect(SEVERITY_BASE.moderate + TYPE_BUMP.surgicalError + durationBump(12)).toBe(3.55)
    const r = calculateMedMalpractice(base())
    expect(r.multiplier).toBe(3.55)
  })
  it('clamps at the 8 ceiling and the 1.5 floor', () => {
    expect(clampMultiplier(9)).toBe(8)
    expect(clampMultiplier(1)).toBe(1.5)
    expect(clampMultiplier(3.55)).toBe(3.55)
  })
  it('keeps the strongest realistic combination under the ceiling', () => {
    // catastrophic 6 + birthInjury 1.0 + 24mo 0.5 = 7.5, below the 8 cap
    const r = calculateMedMalpractice(
      base({ severity: 'catastrophic', malpracticeType: 'birthInjury', recoveryMonths: 24 }),
    )
    expect(r.multiplier).toBe(7.5)
  })
  it('keeps the weakest realistic combination above the floor', () => {
    // minor 1.5 + medicationError 0.2 + 0mo 0 = 1.7, above the 1.5 floor
    const r = calculateMedMalpractice(
      base({ severity: 'minor', malpracticeType: 'medicationError', recoveryMonths: 6 }),
    )
    expect(r.multiplier).toBe(1.7)
  })
})

describe('gross and net figures', () => {
  it('moderate surgical error, 12mo, economic 150000', () => {
    // multiplier 3.55, nonEcon 150000 x 3.55 = 532500, gross 682500
    // grossLow 682500 x 0.75 = 511875, grossHigh 682500 x 1.25 = 853125
    const r = calculateMedMalpractice(base({ contingencyPercent: 0 }))
    expect(r.economic).toBe(150000)
    expect(r.multiplier).toBe(3.55)
    expect(r.nonEconomic).toBe(532500)
    expect(r.grossLow).toBe(511875)
    expect(r.grossHigh).toBe(853125)
  })

  it('applies a 40% contingency fee to the net range', () => {
    // netLow 511875 x 0.6 = 307125, netHigh 853125 x 0.6 = 511875
    const r = calculateMedMalpractice(base({ contingencyPercent: 40 }))
    expect(r.netLow).toBe(307125)
    expect(r.netHigh).toBe(511875)
  })

  it('a 0% fee leaves the net range equal to the gross range', () => {
    const r = calculateMedMalpractice(base({ contingencyPercent: 0 }))
    expect(r.netLow).toBe(r.grossLow)
    expect(r.netHigh).toBe(r.grossHigh)
  })
})

describe('non-economic cap flag', () => {
  it('flags states that cap non-economic damages', () => {
    expect(calculateMedMalpractice(base({ state: 'CA' })).capState).toBe(false)
    expect(calculateMedMalpractice(base({ state: 'MD' })).capState).toBe(true)
  })
})
