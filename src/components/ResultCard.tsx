import type { SettlementResult } from '@/lib/settlement'
import { formatUSD } from '@/lib/format'

interface ResultCardProps {
  result: SettlementResult
  /** Optional plain-language note about the selected state's fault rule. */
  note?: string
}

// Presentational. Big, legible result numbers are the point of the page.
export default function ResultCard({ result, note }: ResultCardProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        Estimated settlement range
      </p>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {formatUSD(result.low)}
        </span>
        <span className="text-xl font-medium text-ink-faint">to</span>
        <span className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {formatUSD(result.high)}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-border pt-5 text-sm">
        <div>
          <dt className="text-ink-faint">Economic damages</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.economic)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Pain &amp; suffering</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.painSuffering)}</dd>
        </div>
      </dl>

      {note && (
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">
          {note}
        </p>
      )}

      <p className="mt-5 text-xs leading-5 text-ink-faint">
        This is an educational estimate, not legal advice or a guarantee. Actual
        settlements depend on evidence, insurance limits, jurisdiction, and negotiation.
      </p>
    </div>
  )
}
