'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type {
  QualifyingInjury,
  ExposureBand,
  Representation,
  CampLejeuneResult,
} from '@/lib/campLejeune'
import { calculateCampLejeune, CAMP_LEJEUNE_NOTE, FILING_DEADLINE } from '@/lib/campLejeune'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, Spinner, StaleNote } from './fields'

type Mode = 'simple' | 'advanced'
type YesNo = 'no' | 'yes'

const YES_NO: { value: YesNo; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const INJURY_OPTIONS: { value: QualifyingInjury; label: string }[] = [
  { value: 'kidneyCancer', label: 'Kidney cancer (Tier 1)' },
  { value: 'liverCancer', label: 'Liver cancer (Tier 1)' },
  { value: 'nonHodgkinLymphoma', label: 'Non-Hodgkin lymphoma (Tier 1)' },
  { value: 'leukemia', label: 'Leukemia (Tier 1)' },
  { value: 'bladderCancer', label: 'Bladder cancer (Tier 1)' },
  { value: 'multipleMyeloma', label: 'Multiple myeloma (Tier 2)' },
  { value: 'parkinsons', label: "Parkinson's disease (Tier 2)" },
  { value: 'kidneyDisease', label: 'Kidney disease / ESRD, or stage 4-5 CKD (Tier 2)' },
  { value: 'systemicSclerosis', label: 'Systemic sclerosis / scleroderma (Tier 2)' },
]

const EXPOSURE_OPTIONS: { value: ExposureBand; label: string }[] = [
  { value: 'days30to364', label: '30 to 364 days' },
  { value: 'years1to5', label: '1 year to 5 years' },
  { value: 'over5years', label: 'More than 5 years' },
]

const REPRESENTATION_OPTIONS: { value: Representation; label: string }[] = [
  { value: 'administrative', label: 'Attorney, administrative claim (fee capped at 20%)' },
  { value: 'litigation', label: 'Attorney, suit filed in court (fee capped at 25%)' },
  { value: 'none', label: 'No attorney' },
]

interface Values {
  injury: QualifyingInjury
  exposure: ExposureBand
  resultedInDeath: YesNo
  representation: Representation
  claimFiledBeforeDeadline: YesNo
  metThirtyDays: YesNo
  onsetBeforeCutoff: YesNo
  meetsLatency: YesNo
}

// The Camp Lejeune Elective Option pays a published government schedule, so this
// tool returns an exact figure rather than a range, and refuses to return any
// figure at all when an eligibility gate fails.
export default function CampLejeuneForm({ config }: { config: CalculatorConfig }) {
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<CampLejeuneResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    injury: 'kidneyCancer',
    exposure: 'years1to5',
    resultedInDeath: 'no',
    representation: 'administrative',
    claimFiledBeforeDeadline: 'yes',
    metThirtyDays: 'yes',
    onsetBeforeCutoff: 'yes',
    meetsLatency: 'yes',
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  const yes = (v: YesNo) => v === 'yes'

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      injury: values.injury,
      exposure: values.exposure,
      resultedInDeath: yes(values.resultedInDeath),
      representation: values.representation,
      claimFiledBeforeDeadline: yes(values.claimFiledBeforeDeadline),
      metThirtyDays: yes(values.metThirtyDays),
      onsetBeforeCutoff: yes(values.onsetBeforeCutoff),
      meetsLatency: yes(values.meetsLatency),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateCampLejeune(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  const optionLabel = (opts: { value: string; label: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? v

  async function handleDownload() {
    if (!result || !result.eligible) return
    const breakdown: ReportField[] = [
      { label: `Tier ${result.tier} scheduled offer`, value: formatUSD(result.baseOffer) },
    ]
    if (result.deathBenefit > 0) breakdown.push({ label: 'Death benefit', value: formatUSD(result.deathBenefit) })
    breakdown.push({
      label: `Attorney fee (statutory cap ${Math.round(result.feeCapPercent * 100)}%)`,
      value: `-${formatUSD(result.attorneyFee)}`,
    })
    breakdown.push({ label: 'Net to you', value: formatUSD(result.netToClaimant) })
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Elective Option offer',
      headlineLow: result.electiveOptionOffer,
      headlineHigh: result.electiveOptionOffer,
      breakdown,
      fields: [
        { label: 'Qualifying injury', value: optionLabel(INJURY_OPTIONS, values.injury) },
        { label: 'Duration of exposure', value: optionLabel(EXPOSURE_OPTIONS, values.exposure) },
        { label: 'Resulted in death', value: yes(values.resultedInDeath) ? 'Yes' : 'No' },
        { label: 'Representation', value: optionLabel(REPRESENTATION_OPTIONS, values.representation) },
      ],
      stateNote: CAMP_LEJEUNE_NOTE,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            The filing deadline has passed
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Administrative claims had to be presented to the Department of the Navy by{' '}
            {FILING_DEADLINE}. The Navy no longer accepts new claims. This tool is for
            people whose claim was already filed. If a filed claim was denied, you
            generally have 180 days from the denial to file suit in federal court.
          </p>
        </div>

        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="Qualifying injury" value={values.injury} onChange={(v) => setField('injury', v as QualifyingInjury)} options={INJURY_OPTIONS} />
            <SelectField label="How long were you at Camp Lejeune?" value={values.exposure} onChange={(v) => setField('exposure', v as ExposureBand)} options={EXPOSURE_OPTIONS} />
            <SelectField label="Did the illness cause death?" value={values.resultedInDeath} onChange={(v) => setField('resultedInDeath', v as YesNo)} options={YES_NO} />
            <SelectField label="How is the claim represented?" value={values.representation} onChange={(v) => setField('representation', v as Representation)} options={REPRESENTATION_OPTIONS} />
            <SelectField label={`Was a claim filed before ${FILING_DEADLINE}?`} value={values.claimFiledBeforeDeadline} onChange={(v) => setField('claimFiledBeforeDeadline', v as YesNo)} options={YES_NO} />

            {mode === 'advanced' && (
              <>
                <SelectField label="At Camp Lejeune 30+ days between 1953 and 1987?" value={values.metThirtyDays} onChange={(v) => setField('metThirtyDays', v as YesNo)} options={YES_NO} />
                <SelectField label="Diagnosed or treated before August 10, 2022?" value={values.onsetBeforeCutoff} onChange={(v) => setField('onsetBeforeCutoff', v as YesNo)} options={YES_NO} />
                <SelectField label="Diagnosis 2 to 35 years after exposure?" value={values.meetsLatency} onChange={(v) => setField('meetsLatency', v as YesNo)} options={YES_NO} />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            This is not an estimate. The Elective Option pays a fixed amount published by
            the Department of Justice and the Department of the Navy, set by your injury
            tier and how long you were exposed. Open Advanced to check the onset and
            latency requirements.
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
              'Look up my Elective Option offer'
            )}
          </button>
        </form>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          {stale && result && !calculating && <StaleNote />}
          {result ? (
            <ClResultCard result={result} onDownload={handleDownload} />
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-6 text-center sm:p-10">
              <p className="text-sm leading-6 text-ink-faint">
                Your Elective Option offer will appear here. It is a published amount, not
                an estimate.
              </p>
            </div>
          )}

          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm font-medium text-ink-faint">
            <span>Free</span>
            <span aria-hidden="true">&middot;</span>
            <span>Official DOJ schedule</span>
            <span aria-hidden="true">&middot;</span>
            <span>No email required</span>
          </p>
        </div>
      </aside>
    </div>
  )
}

function ClResultCard({ result, onDownload }: { result: CampLejeuneResult; onDownload: () => void }) {
  if (!result.eligible) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
          Not eligible for the Elective Option
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">{result.ineligibleReason}</p>
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-faint">
          Failing an Elective Option requirement does not always mean you have no claim at
          all. Speak with a CLJA attorney about your options.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        Elective Option offer
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
        {formatUSD(result.electiveOptionOffer)}
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        Published amount for a Tier {result.tier} injury, not an estimate
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

      <dl className="mt-6 space-y-3 border-t border-surface-border pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-faint">Tier {result.tier} scheduled offer</dt>
          <dd className="font-semibold text-ink">{formatUSD(result.baseOffer)}</dd>
        </div>
        {result.deathBenefit > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-faint">Death benefit</dt>
            <dd className="font-semibold text-ink">+{formatUSD(result.deathBenefit)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink-faint">
            Attorney fee (capped at {Math.round(result.feeCapPercent * 100)}%)
          </dt>
          <dd className="font-semibold text-ink">
            {result.attorneyFee > 0 ? `-${formatUSD(result.attorneyFee)}` : formatUSD(0)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-surface-border pt-3">
          <dt className="font-medium text-ink">Net to you</dt>
          <dd className="text-base font-bold text-ink">{formatUSD(result.netToClaimant)}</dd>
        </div>
      </dl>

      <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">
        {CAMP_LEJEUNE_NOTE}
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
