import { describe, it, expect } from 'vitest'
import {
  calculateCampLejeune,
  ELECTIVE_OPTION_GRID,
  INJURY_TIER,
  DEATH_BENEFIT,
  MAX_ELECTIVE_OPTION_OFFER,
  FEE_CAP,
  type CampLejeuneInput,
} from '@/lib/campLejeune'

function base(overrides: Partial<CampLejeuneInput> = {}): CampLejeuneInput {
  return {
    injury: 'kidneyCancer', // Tier 1
    exposure: 'years1to5',
    resultedInDeath: false,
    representation: 'administrative',
    metThirtyDays: true,
    onsetBeforeCutoff: true,
    meetsLatency: true,
    claimFiledBeforeDeadline: true,
    ...overrides,
  }
}

describe('the published Elective Option Grid', () => {
  it('matches the DOJ / Navy guidance exactly', () => {
    expect(ELECTIVE_OPTION_GRID[1]).toEqual({ days30to364: 150000, years1to5: 300000, over5years: 450000 })
    expect(ELECTIVE_OPTION_GRID[2]).toEqual({ days30to364: 100000, years1to5: 250000, over5years: 400000 })
    expect(DEATH_BENEFIT).toBe(100000)
    expect(MAX_ELECTIVE_OPTION_OFFER).toBe(550000)
  })

  it('assigns each qualifying injury to the published tier', () => {
    // Tier 1: sufficient evidence of causation per ATSDR.
    expect(INJURY_TIER.kidneyCancer).toBe(1)
    expect(INJURY_TIER.liverCancer).toBe(1)
    expect(INJURY_TIER.nonHodgkinLymphoma).toBe(1)
    expect(INJURY_TIER.leukemia).toBe(1)
    expect(INJURY_TIER.bladderCancer).toBe(1)
    // Tier 2: equipoise and above.
    expect(INJURY_TIER.multipleMyeloma).toBe(2)
    expect(INJURY_TIER.parkinsons).toBe(2)
    expect(INJURY_TIER.kidneyDisease).toBe(2)
    expect(INJURY_TIER.systemicSclerosis).toBe(2)
  })

  it('uses the statutory FTCA attorney fee caps', () => {
    expect(FEE_CAP.administrative).toBe(0.2)
    expect(FEE_CAP.litigation).toBe(0.25)
    expect(FEE_CAP.none).toBe(0)
  })
})

describe('calculateCampLejeune: exact scheduled offers', () => {
  it('Tier 1, 1 to 5 years, no death', () => {
    const r = calculateCampLejeune(base())
    expect(r.eligible).toBe(true)
    expect(r.tier).toBe(1)
    expect(r.baseOffer).toBe(300000)
    expect(r.deathBenefit).toBe(0)
    expect(r.electiveOptionOffer).toBe(300000)
    // 20% administrative fee cap
    expect(r.attorneyFee).toBe(60000)
    expect(r.netToClaimant).toBe(240000)
  })

  it('Tier 2, 30 to 364 days, no death', () => {
    const r = calculateCampLejeune(base({ injury: 'parkinsons', exposure: 'days30to364' }))
    expect(r.tier).toBe(2)
    expect(r.electiveOptionOffer).toBe(100000)
    expect(r.netToClaimant).toBe(80000)
  })

  it('adds the $100,000 death benefit', () => {
    const r = calculateCampLejeune(base({ exposure: 'over5years', resultedInDeath: true }))
    expect(r.baseOffer).toBe(450000)
    expect(r.deathBenefit).toBe(100000)
    // 450,000 + 100,000 = 550,000, exactly the published maximum
    expect(r.electiveOptionOffer).toBe(MAX_ELECTIVE_OPTION_OFFER)
  })

  it('never exceeds the $550,000 maximum offer', () => {
    const r = calculateCampLejeune(base({ injury: 'bladderCancer', exposure: 'over5years', resultedInDeath: true }))
    expect(r.electiveOptionOffer).toBeLessThanOrEqual(MAX_ELECTIVE_OPTION_OFFER)
    expect(r.electiveOptionOffer).toBe(550000)
  })

  it('applies the 25% cap for a suit filed in court', () => {
    const r = calculateCampLejeune(base({ representation: 'litigation' }))
    expect(r.feeCapPercent).toBe(0.25)
    expect(r.attorneyFee).toBe(75000)
    expect(r.netToClaimant).toBe(225000)
  })

  it('pays the full offer when unrepresented', () => {
    const r = calculateCampLejeune(base({ representation: 'none' }))
    expect(r.attorneyFee).toBe(0)
    expect(r.netToClaimant).toBe(300000)
  })

  it('a Tier 2 death claim with over 5 years reaches $500,000', () => {
    const r = calculateCampLejeune(base({ injury: 'multipleMyeloma', exposure: 'over5years', resultedInDeath: true }))
    expect(r.electiveOptionOffer).toBe(500000) // 400,000 + 100,000
  })
})

describe('eligibility gates', () => {
  it('an unfiled claim is barred by the passed deadline', () => {
    const r = calculateCampLejeune(base({ claimFiledBeforeDeadline: false }))
    expect(r.eligible).toBe(false)
    expect(r.electiveOptionOffer).toBe(0)
    expect(r.ineligibleReason).toMatch(/August 10, 2024/)
  })

  it('requires at least 30 days at Camp Lejeune', () => {
    const r = calculateCampLejeune(base({ metThirtyDays: false }))
    expect(r.eligible).toBe(false)
    expect(r.ineligibleReason).toMatch(/30 days/)
  })

  it('requires onset before August 10, 2022', () => {
    const r = calculateCampLejeune(base({ onsetBeforeCutoff: false }))
    expect(r.eligible).toBe(false)
    expect(r.ineligibleReason).toMatch(/August 10, 2022/)
  })

  it('requires the 2 to 35 year latency window', () => {
    const r = calculateCampLejeune(base({ meetsLatency: false }))
    expect(r.eligible).toBe(false)
    expect(r.ineligibleReason).toMatch(/2 years/)
  })

  it('checks the filing deadline before any other gate', () => {
    // Everything fails at once: the deadline is the reason we surface.
    const r = calculateCampLejeune(
      base({ claimFiledBeforeDeadline: false, metThirtyDays: false, onsetBeforeCutoff: false, meetsLatency: false }),
    )
    expect(r.ineligibleReason).toMatch(/August 10, 2024/)
  })

  it('an ineligible claim never reports an offer', () => {
    for (const gate of ['claimFiledBeforeDeadline', 'metThirtyDays', 'onsetBeforeCutoff', 'meetsLatency'] as const) {
      const r = calculateCampLejeune(base({ [gate]: false }))
      expect(r.electiveOptionOffer).toBe(0)
      expect(r.netToClaimant).toBe(0)
      expect(r.eligible).toBe(false)
    }
  })
})
