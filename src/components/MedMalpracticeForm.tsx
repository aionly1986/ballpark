'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { MalpracticeType, MalSeverity, MedMalpracticeResult } from '@/lib/medMalpractice'
import { calculateMedMalpractice, MED_MAL_NOTE } from '@/lib/medMalpractice'
import { hasNonEconCap } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, NumberField, toNumber, Spinner, StaleNote } from './fields'

type Mode = 'simple' | 'advanced'

const TYPE_OPTIONS: { value: MalpracticeType; label: string }[] = [
  { value: 'misdiagnosis', label: 'Misdiagnosis or delayed diagnosis' },
  { value: 'surgicalError', label: 'Surgical error' },
  { value: 'medicationError', label: 'Medication or prescription error' },
  { value: 'birthInjury', label: 'Birth injury' },
  { value: 'anesthesiaError', label: 'Anesthesia error' },
  { value: 'failureToTreat', label: 'Failure to treat' },
  { value: 'hospitalNegligence', label: 'Hospital or nursing negligence' },
  { value: 'erError', label: 'Emergency room error' },
]

const SEVERITY_OPTIONS: { value: MalSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor (added harm, full recovery expected)' },
  { value: 'moderate', label: 'Moderate (lasting added effects)' },
  { value: 'severe', label: 'Severe (surgery, long-term disability)' },
  { value: 'catastrophic', label: 'Catastrophic (permanent, lifelong care)' },
]

interface Values {
  originalMedical: string
  additionalMedical: string
  lostWages: string
  caregiverLifeCare: string
  malpracticeType: MalpracticeType
  severity: MalSeverity
  recoveryMonths: string
  contingencyPercent: string
  state: string
}

// Purpose-built medical-malpractice calculator. Its causation twist: the cost of
// treating the patient's original condition is excluded from damages (the
// defendant did not cause the underlying illness). Only the additional harm the
// negligence caused is compensable, and most states cap non-economic damages.
export default function MedMalpracticeForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<MedMalpracticeResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    originalMedical: '',
    additionalMedical: '',
    lostWages: '',
    caregiverLifeCare: '',
    malpracticeType: TYPE_OPTIONS[0].value,
    severity: SEVERITY_OPTIONS[1].value,
    recoveryMonths: '',
    contingencyPercent: '33',
    state: presets.state[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      originalMedical: toNumber(values.originalMedical),
      additionalMedical: toNumber(values.additionalMedical),
      lostWages: toNumber(values.lostWages),
      caregiverLifeCare: toNumber(values.caregiverLifeCare),
      malpracticeType: values.malpracticeType,
      severity: values.severity,
      recoveryMonths: toNumber(values.recoveryMonths),
      contingencyPercent: values.contingencyPercent === '' ? 33 : toNumber(values.contingencyPercent),
      state: values.state,
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateMedMalpractice(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  const optionLabel = (opts: { value: string; label: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? v

  async function handleDownload() {
    if (!result) return
    const breakdown: ReportField[] = [
      { label: 'Economic damages (compensable)', value: formatUSD(result.economic) },
      { label: 'Non-economic damages', value: formatUSD(result.nonEconomic) },
      { label: 'Net to you after fees', value: `${formatUSD(result.netLow)} to ${formatUSD(result.netHigh)}` },
    ]
    if (result.originalMedicalExcluded > 0) {
      breakdown.push({ label: 'Original condition cost (not compensable)', value: formatUSD(result.originalMedicalExcluded) })
    }
    const fields: ReportField[] = []
    const money = (label: string, raw: string) => {
      const n = toNumber(raw)
      if (n > 0) fields.push({ label, value: formatUSD(n) })
    }
    money('Additional medical (from malpractice)', values.additionalMedical)
    money('Lost wages', values.lostWages)
    money('Caregiver and life-care costs', values.caregiverLifeCare)
    money('Original condition cost (excluded)', values.originalMedical)
    fields.push({ label: 'Type of malpractice', value: optionLabel(TYPE_OPTIONS, values.malpracticeType) })
    fields.push({ label: 'Resulting severity', value: optionLabel(SEVERITY_OPTIONS, values.severity) })
    fields.push({ label: 'State', value: optionLabel(presets.state, values.state) })
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated settlement range',
      headlineLow: result.grossLow,
      headlineHigh: result.grossHigh,
      breakdown,
      fields,
      stateNote: MED_MAL_NOTE,
    })
  }

  const capNote = hasNonEconCap(values.state)
    ? 'This state generally caps non-economic (pain and suffering) damages in medical malpractice cases. Caps change often and are sometimes struck down, so verify the current figure with an attorney. '
    : ''
  const note = capNote + MED_MAL_NOTE

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <MoneyField label="Additional medical from the malpractice ($)" value={values.additionalMedical} onChange={(v) => setField('additionalMedical', v)} />
            <MoneyField label="Lost wages ($)" value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
            {mode === 'advanced' && (
              <>
                <MoneyField label="Original medical before the malpractice ($)" value={values.originalMedical} onChange={(v) => setField('originalMedical', v)} />
                <MoneyField label="Caregiver and life-care costs ($)" value={values.caregiverLifeCare} onChange={(v) => setField('caregiverLifeCare', v)} />
              </>
            )}
            <SelectField label="Type of medical malpractice" value={values.malpracticeType} onChange={(v) => setField('malpracticeType', v as MalpracticeType)} options={TYPE_OPTIONS} />
            <SelectField label="Resulting injury severity" value={values.severity} onChange={(v) => setField('severity', v as MalSeverity)} options={SEVERITY_OPTIONS} />
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
            {mode === 'advanced' && (
              <>
                <NumberField label="Recovery / treatment duration" value={values.recoveryMonths} onChange={(v) => setField('recoveryMonths', v)} suffix="months" />
                <NumberField label="Attorney contingency fee" value={values.contingencyPercent} onChange={(v) => setField('contingencyPercent', v)} suffix="%" />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            Enter only the additional harm the malpractice caused. The cost of treating your
            original condition is not compensable, so add it in Advanced only to see it
            excluded for contrast.
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
            <MalResultCard result={result} note={note} onDownload={handleDownload} />
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

interface MalResultCardProps {
  result: MedMalpracticeResult
  note: string
  onDownload: () => void
}

function MalResultCard({ result, note, onDownload }: MalResultCardProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        Estimated settlement range
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">
        {formatUSD(result.grossLow)} - {formatUSD(result.grossHigh)}
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
          <dt className="text-ink-faint">Economic damages</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.economic)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Non-economic damages</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.nonEconomic)}</dd>
        </div>
        {result.originalMedicalExcluded > 0 && (
          <div className="col-span-2">
            <dt className="text-ink-faint">Original condition cost (not compensable)</dt>
            <dd className="mt-1 font-semibold text-ink-soft line-through">{formatUSD(result.originalMedicalExcluded)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 rounded-xl border border-accent/20 bg-accent-soft p-4">
        <dt className="text-xs font-medium uppercase tracking-wide text-accent-ink">Net to you after fees</dt>
        <dd className="mt-1 text-lg font-bold text-ink">
          {formatUSD(result.netLow)} - {formatUSD(result.netHigh)}
        </dd>
      </div>

      {result.capState && (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-700">
          <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <path d="M10 2.5 18.5 17H1.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 8v3.5M10 14.2h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          This state generally caps non-economic damages in medical malpractice cases, so the real payout may be lower than the range shown.
        </p>
      )}

      {note && (
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">{note}</p>
      )}

      <p className="mt-5 text-xs leading-5 text-ink-faint">
        This is an educational estimate, not legal advice or a guarantee. Actual malpractice
        settlements depend on causation, expert testimony, your state caps, and negotiation.
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
