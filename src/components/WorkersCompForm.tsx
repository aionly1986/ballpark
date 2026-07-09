'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { WorkersCompResult } from '@/lib/workersComp'
import { calculateWorkersComp, WORKERS_COMP_NOTE } from '@/lib/workersComp'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, NumberField, toNumber, Spinner, StaleNote } from './fields'

type Mode = 'simple' | 'advanced'

interface Values {
  averageWeeklyWage: string
  weeksOutOfWork: string
  impairmentRating: string
  futureMedical: string
  stateMaxWeekly: string
  state: string
}

// Purpose-built workers' compensation calculator. Its own engine: no fault, no
// pain and suffering. A settlement is wage-replacement (two-thirds of the
// average weekly wage) plus a permanent-disability award from the impairment
// rating, plus any future-medical buyout.
export default function WorkersCompForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<WorkersCompResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    averageWeeklyWage: '',
    weeksOutOfWork: '',
    impairmentRating: '',
    futureMedical: '',
    stateMaxWeekly: '',
    state: presets.state[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      averageWeeklyWage: toNumber(values.averageWeeklyWage),
      weeksOutOfWork: toNumber(values.weeksOutOfWork),
      medicalExpenses: 0, // past medical is paid separately, not part of the lump sum
      impairmentRating: toNumber(values.impairmentRating),
      futureMedical: toNumber(values.futureMedical),
      stateMaxWeekly: toNumber(values.stateMaxWeekly),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateWorkersComp(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  const optionLabel = (opts: { value: string; label: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? v

  async function handleDownload() {
    if (!result) return
    const breakdown: ReportField[] = [
      { label: 'Weekly benefit', value: `${formatUSD(result.weeklyBenefit)}/wk` },
      { label: 'Wage replacement', value: formatUSD(result.wageBenefit) },
      { label: 'Permanent disability', value: formatUSD(result.permanentBenefit) },
    ]
    if (result.medical > 0) breakdown.push({ label: 'Future medical', value: formatUSD(result.medical) })
    const fields: ReportField[] = [
      { label: 'Average weekly wage', value: formatUSD(toNumber(values.averageWeeklyWage)) },
      { label: 'Weeks out of work', value: String(toNumber(values.weeksOutOfWork)) },
      { label: 'Impairment rating', value: `${toNumber(values.impairmentRating)}%` },
    ]
    fields.push({ label: 'State', value: optionLabel(presets.state, values.state) })
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated settlement range',
      headlineLow: result.low,
      headlineHigh: result.high,
      breakdown,
      fields,
      stateNote: WORKERS_COMP_NOTE,
    })
  }

  const capNote = result?.cappedByStateMax
    ? 'Your weekly benefit was capped at the state maximum you entered. '
    : ''
  const note = capNote + WORKERS_COMP_NOTE

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <MoneyField label="Pre-injury weekly wage ($)" value={values.averageWeeklyWage} onChange={(v) => setField('averageWeeklyWage', v)} />
            <NumberField label="Weeks out of work" value={values.weeksOutOfWork} onChange={(v) => setField('weeksOutOfWork', v)} suffix="weeks" />
            <NumberField label="Permanent impairment rating" value={values.impairmentRating} onChange={(v) => setField('impairmentRating', v)} suffix="%" />
            {mode === 'advanced' && (
              <>
                <MoneyField label="Future medical to buy out ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="State max weekly benefit ($, if known)" value={values.stateMaxWeekly} onChange={(v) => setField('stateMaxWeekly', v)} />
                <SelectField label="What state are you in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            Workers comp has no pain and suffering. The estimate is about two-thirds of your
            weekly wage while you are out, plus a permanent-disability award from your
            impairment rating. Enter your state maximum in Advanced to cap the weekly rate.
          </p>

          <button
            type="submit"
            disabled={calculating}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-80"
          >
            {calculating ? (
              <>
                <Spinner />
                Calculating…
              </>
            ) : (
              'Calculate estimate'
            )}
          </button>
        </form>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          {stale && result && !calculating && <StaleNote />}
          {result ? (
            <WcResultCard result={result} note={note} onDownload={handleDownload} />
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-6 text-center sm:p-10">
              <p className="text-sm leading-6 text-ink-faint">
                Your estimated range will appear here. Fill in your details and press
                Calculate.
              </p>
            </div>
          )}

          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm font-medium text-ink-faint">
            <span>Free</span>
            <span aria-hidden="true">&middot;</span>
            <span>Instant estimate</span>
            <span aria-hidden="true">&middot;</span>
            <span>No email required</span>
          </p>
        </div>
      </aside>
    </div>
  )
}

interface WcResultCardProps {
  result: WorkersCompResult
  note: string
  onDownload: () => void
}

function WcResultCard({ result, note, onDownload }: WcResultCardProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        Estimated settlement range
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">
        {formatUSD(result.low)} - {formatUSD(result.high)}
      </p>

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

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-border pt-5 text-sm">
        <div>
          <dt className="text-ink-faint">Weekly benefit</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.weeklyBenefit)}/wk</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Wage replacement</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.wageBenefit)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Permanent disability</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.permanentBenefit)}</dd>
        </div>
        {result.medical > 0 && (
          <div>
            <dt className="text-ink-faint">Future medical</dt>
            <dd className="mt-1 font-semibold text-ink">{formatUSD(result.medical)}</dd>
          </div>
        )}
      </dl>

      {note && (
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">{note}</p>
      )}

      <p className="mt-5 text-xs leading-5 text-ink-faint">
        This is an educational estimate, not legal advice or a guarantee. Actual workers
        comp settlements depend on your state statute, disability rating, and negotiation.
      </p>
    </div>
  )
}

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-surface-border bg-surface-muted p-1">
      {(['simple', 'advanced'] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={
            'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ' +
            (mode === m ? 'bg-surface text-ink shadow-card' : 'text-ink-faint hover:text-ink')
          }
        >
          {m}
        </button>
      ))}
    </div>
  )
}
