import type { ExampleScenario } from '@/lib/types'
import { calculateSettlement } from '@/lib/settlement'
import { formatUSD } from '@/lib/format'

interface ExampleEstimatesProps {
  examples: ExampleScenario[]
}

// Highlighted panel of worked examples below the tool. Numbers are computed by
// the shared engine at build time (so they are correct and in the static HTML).
// Fault is treated as none, which keeps the figures state-independent.
export default function ExampleEstimates({ examples }: ExampleEstimatesProps) {
  if (!examples.length) return null

  return (
    <section className="mt-12 rounded-2xl border border-surface-border bg-surface-muted p-6 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">Example estimates</h2>
      <p className="mt-2 max-w-content text-sm leading-6 text-ink-soft">
        A few realistic scenarios to show how the range moves with injury severity.
        Each uses the same formula as the calculator above, with no fault deducted.
        Your own numbers will differ.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {examples.map((ex) => {
          const result = calculateSettlement({
            medicalBills: ex.medicalBills,
            futureMedical: ex.futureMedical,
            lostWages: ex.lostWages,
            severity: ex.severity,
            faultLevel: 'none',
            negligenceRule: 'modified',
          })
          const economic = ex.medicalBills + ex.futureMedical + ex.lostWages
          return (
            <div
              key={ex.label}
              className="rounded-xl border border-surface-border bg-surface p-5 shadow-card"
            >
              <p className="text-sm font-semibold text-ink">{ex.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">{ex.detail}</p>
              <p className="mt-3 text-xs text-ink-faint">
                {formatUSD(economic)} economic damages
              </p>
              <p className="mt-3 text-xl font-bold tracking-tight text-ink">
                {formatUSD(result.low)} to {formatUSD(result.high)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
