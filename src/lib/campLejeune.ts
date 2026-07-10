// Camp Lejeune Justice Act (CLJA) Elective Option calculator.
//
// This tool is DIFFERENT from every other calculator on this site. Everywhere else
// we estimate a negotiated settlement, so we output a wide range. Here the payout
// is a published government schedule, so the correct answer is an exact figure.
// Inventing a range around it would be less accurate, not more.
//
// SOURCE: "Public Guidance on the Elective Option for Camp Lejeune Justice Act
// Claims", issued by the U.S. Department of Justice and the Department of the Navy
// on September 6, 2023 (updated September 15, 2023), with the FAQ updated
// January 21, 2025. The Elective Option Grid, the $100,000 death benefit, the
// $550,000 maximum, the qualifying-injury tiers, and the eligibility gates below
// are quoted from that document.
//
// IMPORTANT AND NON-NEGOTIABLE: the CLJA administrative claim filing deadline was
// August 10, 2024. The Department of the Navy no longer accepts new claims. This
// calculator is for people whose claim was already filed. Any page rendering this
// must say so prominently.
//
// Any change here must be reflected in tests/campLejeune.test.ts.

/** Statutory exposure window: CLJA covers exposure at Camp Lejeune in this period. */
export const EXPOSURE_WINDOW_START = 'August 1, 1953'
export const EXPOSURE_WINDOW_END = 'December 31, 1987'
/** The CLJA applies only to claims accruing before the date of enactment. */
export const ONSET_CUTOFF = 'August 10, 2022'
/** Administrative claims had to be presented to the Navy by this date. */
export const FILING_DEADLINE = 'August 10, 2024'

export type Tier = 1 | 2

// Qualifying Injuries, verbatim from the Public Guidance Document.
export type QualifyingInjury =
  | 'kidneyCancer'
  | 'liverCancer'
  | 'nonHodgkinLymphoma'
  | 'leukemia'
  | 'bladderCancer'
  | 'multipleMyeloma'
  | 'parkinsons'
  | 'kidneyDisease'
  | 'systemicSclerosis'

export const INJURY_TIER: Record<QualifyingInjury, Tier> = {
  kidneyCancer: 1,
  liverCancer: 1,
  nonHodgkinLymphoma: 1,
  leukemia: 1,
  bladderCancer: 1,
  multipleMyeloma: 2,
  parkinsons: 2,
  kidneyDisease: 2,
  systemicSclerosis: 2,
}

/** The three Duration of Exposure categories defined by the Elective Option. */
export type ExposureBand = 'days30to364' | 'years1to5' | 'over5years'

/**
 * The Elective Option Grid, exactly as published:
 *                 30 to 364 Days | 1 year to 5 years | More than 5 years
 *   Tier 1            $150,000   |     $300,000      |     $450,000
 *   Tier 2            $100,000   |     $250,000      |     $400,000
 */
export const ELECTIVE_OPTION_GRID: Record<Tier, Record<ExposureBand, number>> = {
  1: { days30to364: 150_000, years1to5: 300_000, over5years: 450_000 },
  2: { days30to364: 100_000, years1to5: 250_000, over5years: 400_000 },
}

/** "claims that show a Qualifying Injury resulting in death will be offered an additional $100,000" */
export const DEATH_BENEFIT = 100_000
/** "Accordingly, the maximum EO offer is $550,000." */
export const MAX_ELECTIVE_OPTION_OFFER = 550_000

/**
 * Attorney fee caps. Per DOJ, the FTCA fee cap at 28 U.S.C. 2678 applies to CLJA
 * claims: contingency fees cannot exceed 20% for an administrative claim or 25%
 * for a suit filed in court. These are statutory ceilings, not our estimates.
 */
export type Representation = 'administrative' | 'litigation' | 'none'
export const FEE_CAP: Record<Representation, number> = {
  administrative: 0.2,
  litigation: 0.25,
  none: 0,
}

export interface CampLejeuneInput {
  injury: QualifyingInjury
  exposure: ExposureBand
  /** The qualifying injury resulted in death. */
  resultedInDeath: boolean
  representation: Representation
  // Eligibility gates, each straight from the Public Guidance Document.
  /** Resided or worked at Camp Lejeune at least 30 days in the statutory window. */
  metThirtyDays: boolean
  /** First diagnosed or treated before August 10, 2022. */
  onsetBeforeCutoff: boolean
  /**
   * Latency: earliest diagnosis or treatment not less than 2 years after first
   * exposure and not greater than 35 years after last exposure.
   */
  meetsLatency: boolean
  /** An administrative claim was presented to the Navy before the deadline. */
  claimFiledBeforeDeadline: boolean
}

export interface CampLejeuneResult {
  eligible: boolean
  /** Which gate failed, in the order the guidance applies them. */
  ineligibleReason: string | null
  tier: Tier
  /** The scheduled Elective Option offer before the death benefit. */
  baseOffer: number
  deathBenefit: number
  /** Total Elective Option offer. Exact, not an estimate. */
  electiveOptionOffer: number
  /** Statutory maximum attorney fee, given the representation type. */
  attorneyFee: number
  /** What actually reaches the claimant. */
  netToClaimant: number
  feeCapPercent: number
}

const ZERO = {
  tier: 1 as Tier,
  baseOffer: 0,
  deathBenefit: 0,
  electiveOptionOffer: 0,
  attorneyFee: 0,
  netToClaimant: 0,
}

/**
 * Returns the exact Elective Option offer, or a zeroed, clearly-reasoned result
 * when an eligibility gate fails. Never guesses.
 */
export function calculateCampLejeune(input: CampLejeuneInput): CampLejeuneResult {
  const feeCapPercent = FEE_CAP[input.representation]

  if (!input.claimFiledBeforeDeadline) {
    return {
      ...ZERO,
      eligible: false,
      feeCapPercent,
      ineligibleReason: `The deadline to present an administrative claim to the Navy was ${FILING_DEADLINE}. The Navy no longer accepts new claims, so the Elective Option is not available for a claim that was never filed.`,
    }
  }
  if (!input.metThirtyDays) {
    return {
      ...ZERO,
      eligible: false,
      feeCapPercent,
      ineligibleReason: `The Elective Option requires that you resided or worked at Camp Lejeune for at least 30 days between ${EXPOSURE_WINDOW_START} and ${EXPOSURE_WINDOW_END}.`,
    }
  }
  if (!input.onsetBeforeCutoff) {
    return {
      ...ZERO,
      eligible: false,
      feeCapPercent,
      ineligibleReason: `The injury must have been first diagnosed or treated before ${ONSET_CUTOFF}, because the CLJA applies only to a claim accruing before the date the Act was enacted.`,
    }
  }
  if (!input.meetsLatency) {
    return {
      ...ZERO,
      eligible: false,
      feeCapPercent,
      ineligibleReason:
        'The earliest diagnosis or treatment must be at least 2 years after your first exposure and no more than 35 years after your last exposure.',
    }
  }

  const tier = INJURY_TIER[input.injury]
  const baseOffer = ELECTIVE_OPTION_GRID[tier][input.exposure]
  const deathBenefit = input.resultedInDeath ? DEATH_BENEFIT : 0
  // The guidance caps the maximum EO offer at $550,000.
  const electiveOptionOffer = Math.min(MAX_ELECTIVE_OPTION_OFFER, baseOffer + deathBenefit)
  const attorneyFee = Math.round(electiveOptionOffer * feeCapPercent)
  const netToClaimant = electiveOptionOffer - attorneyFee

  return {
    eligible: true,
    ineligibleReason: null,
    tier,
    baseOffer,
    deathBenefit,
    electiveOptionOffer,
    attorneyFee,
    netToClaimant,
    feeCapPercent,
  }
}

// Shown under the result. No em dashes (global content rule).
export const CAMP_LEJEUNE_NOTE =
  'These amounts are the published Elective Option schedule from the Department of ' +
  'Justice and the Department of the Navy, not an estimate. Accepting an Elective ' +
  'Option offer does not affect your VA benefits, and the settlement is not reduced ' +
  'by a VA offset or lien. Declining the Elective Option and proceeding in court may ' +
  'produce more or less, with no guarantee, and a statutory offset for VA benefits ' +
  'would then apply. Confirm your position with a CLJA attorney.'
