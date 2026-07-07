// Shared formatting helpers. Reuse these rather than inlining Intl calls.

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** Format a whole-dollar amount, e.g. 18750 -> "$18,750". */
export function formatUSD(amount: number): string {
  return currency.format(amount)
}
