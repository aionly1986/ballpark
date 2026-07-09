// Truck accidents reuse the shared, tested settlement engine (calculateSettlement
// in settlement.ts). What is truck-specific:
//  - Commercial insurance policies are far larger than personal auto policies.
//    The FMCSA sets a $750,000 federal minimum for most interstate carriers
//    ($1M is common; $5M for many hazmat loads), versus $25k-$100k for a car.
//  - Multiple parties can be liable (driver, motor carrier, broker, shipper),
//    which stacks more available coverage.
// The carrier type selects a default policy-limit ceiling for the estimate; the
// user can override it with a known limit. Any change here must be reflected in
// tests/truckAccident.test.ts.

export type CarrierType = 'interstate' | 'local' | 'hazmat' | 'unknown'

// Default liability-coverage ceiling by carrier type, in dollars. 0 = unknown,
// so no cap is applied to the estimate.
export const CARRIER_POLICY_DEFAULT: Record<CarrierType, number> = {
  interstate: 1_000_000, // FMCSA minimum $750k; $1M typical
  local: 300_000,
  hazmat: 5_000_000,
  unknown: 0,
}

// Resolve the policy ceiling to cap the estimate at: an explicit user-entered
// limit wins; otherwise fall back to the carrier-type default.
export function truckPolicyCeiling(carrier: CarrierType, knownLimit: number): number {
  if (knownLimit > 0) return knownLimit
  return CARRIER_POLICY_DEFAULT[carrier]
}
