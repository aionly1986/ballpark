import type { SettlementResult } from '@/lib/settlement'
import { formatUSD } from '@/lib/format'

interface ResultCardProps {
  result: SettlementResult
  /** Optional plain-language note about the selected state's fault rule. */
  note?: string
  /** If provided, shows a "Download PDF" button. */
  onDownload?: () => void
  /** Which number leads. Default 'total'. */
  emphasis?: 'total' | 'painSuffering'
}

// Presentational. Big, legible result numbers are the point of the page.
export default function ResultCard({ result, note, onDownload, emphasis = 'total' }: ResultCardProps) {
  const ps = emphasis === 'painSuffering'
  const heroLabel = ps ? 'Estimated pain & suffering' : 'Estimated settlement range'
  const heroLow = ps ? result.painSufferingLow : result.low
  const heroHigh = ps ? result.painSufferingHigh : result.high

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        {heroLabel}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">
        {formatUSD(heroLow)} - {formatUSD(heroHigh)}
      </p>

      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download PDF
        </button>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-border pt-5 text-sm">
        <div>
          <dt className="text-ink-faint">Economic damages</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.economic)}</dd>
        </div>
        {ps ? (
          <div>
            <dt className="text-ink-faint">Total settlement range</dt>
            <dd className="mt-1 font-semibold text-ink">
              {formatUSD(result.low)} - {formatUSD(result.high)}
            </dd>
          </div>
        ) : (
          <div>
            <dt className="text-ink-faint">Pain &amp; suffering</dt>
            <dd className="mt-1 font-semibold text-ink">{formatUSD(result.painSuffering)}</dd>
          </div>
        )}
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
