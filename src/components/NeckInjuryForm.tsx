'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { FaultLevel, SettlementResult } from '@/lib/settlement'
import type { Diagnosis, Treatment, NeckInjuryResult } from '@/lib/neckInjury'
import { calculateNeckInjury, severityFor } from '@/lib/neckInjury'
import { negligenceRuleForState } from '@/lib/negligence'
import { stateNote as buildStateNote, gatesPainSuffering } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, toNumber, Spinner, StaleNote } from './fields'
import ResultCard from './ResultCard'

type Mode = 'simple' | 'advanced'
type YesNo = 'no' | 'yes'

const DIAGNOSIS_OPTIONS: { value: Diagnosis; label: string }[] = [
  { value: 'softTissue', label: 'Whiplash or soft-tissue strain' },
  { value: 'bulgingDisc', label: 'Bulging disc' },
  { value: 'herniatedDisc', label: 'Herniated disc' },
  { value: 'radiculopathy', label: 'Radiculopathy / pinched nerve' },
  { value: 'stenosis', label: 'Spinal stenosis' },
  { value: 'fracture', label: 'Fracture or spinal cord injury' },
]

// The single biggest driver of a spine settlement, and the one no other
// calculator asks about.
const TREATMENT_OPTIONS: { value: Treatment; label: string }[] = [
  { value: 'conservative', label: 'No surgery (therapy, chiropractic, meds)' },
  { value: 'injections', label: 'Injections (epidural, ablation)' },
  { value: 'discectomy', label: 'Discectomy' },
  { value: 'fusionSingle', label: 'Single-level fusion' },
  { value: 'fusionMulti', label: 'Multi-level fusion' },
]

const LEVEL_OPTIONS = [
  { value: '1', label: 'One level' },
  { value: '2', label: 'Two levels' },
  { value: '3', label: 'Three or more levels' },
]

const YES_NO: { value: YesNo; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
]

interface Values {
  state: string
  diagnosis: Diagnosis
  treatment: Treatment
  levels: string
  permanent: YesNo
  medicalBills: string
  futureMedical: string
  lostWages: string
  futureLostIncome: string
  otherCosts: string
  faultLevel: FaultLevel
}

// Purpose-built neck-and-back injury calculator. Its own engine: the multiplier
// is driven by the diagnosis, whether surgery happened, how many disc levels are
// involved, and permanence, then reduced by the state's comparative-fault rule.
export default function NeckInjuryForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<NeckInjuryResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    diagnosis: 'herniatedDisc',
    treatment: 'conservative',
    levels: '1',
    permanent: 'no',
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    futureLostIncome: '',
    otherCosts: '',
    faultLevel: presets.faultLevel[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  const permanent = values.permanent === 'yes'
  const severity = severityFor(values.diagnosis, values.treatment, permanent)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      medicalBills: toNumber(values.medicalBills),
      futureMedical: toNumber(values.futureMedical),
      lostWages: toNumber(values.lostWages),
      futureLostIncome: toNumber(values.futureLostIncome),
      otherCosts: toNumber(values.otherCosts),
      diagnosis: values.diagnosis,
      treatment: values.treatment,
      levels: Number(values.levels),
      permanent,
      state: values.state,
      faultLevel: values.faultLevel,
      negligenceRule: negligenceRuleForState(values.state),
      noFaultGate: gatesPainSuffering(values.state, severity),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateNeckInjury(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  // Adapt to the shared ResultCard shape (general damages read as pain and suffering).
  const adapted: SettlementResult | null = result
    ? {
        economic: result.economic,
        painSuffering: result.generalDamages,
        low: result.low,
        high: result.high,
        painSufferingLow: 0,
        painSufferingHigh: 0,
        cappedByPolicy: false,
      }
    : null

  const optionLabel = (opts: { value: string; label: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? v

  function buildFields(): ReportField[] {
    const f: ReportField[] = []
    const money = (label: string, raw: string) => {
      const n = toNumber(raw)
      if (n > 0) f.push({ label, value: formatUSD(n) })
    }
    money('Medical bills', values.medicalBills)
    money('Future medical', values.futureMedical)
    money('Lost wages', values.lostWages)
    money('Future lost income', values.futureLostIncome)
    money('Other costs', values.otherCosts)
    f.push({ label: 'Diagnosis', value: optionLabel(DIAGNOSIS_OPTIONS, values.diagnosis) })
    f.push({ label: 'Treatment', value: optionLabel(TREATMENT_OPTIONS, values.treatment) })
    f.push({ label: 'Levels affected', value: optionLabel(LEVEL_OPTIONS, values.levels) })
    f.push({ label: 'Permanent impairment', value: permanent ? 'Yes' : 'No' })
    f.push({ label: 'Were you at fault?', value: optionLabel(presets.faultLevel, values.faultLevel) })
    f.push({ label: 'State', value: optionLabel(presets.state, values.state) })
    return f
  }

  async function handleDownload() {
    if (!result) return
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated settlement range',
      headlineLow: result.low,
      headlineHigh: result.high,
      breakdown: [
        { label: 'Economic damages', value: formatUSD(result.economic) },
        { label: 'Pain and suffering', value: `${formatUSD(result.generalDamages)} (${result.multiplier}x)` },
      ],
      fields: buildFields(),
      stateNote: buildStateNote(values.state, severity),
    })
  }

  const noSurgery = values.treatment === 'conservative'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="What is the diagnosis?" value={values.diagnosis} onChange={(v) => setField('diagnosis', v as Diagnosis)} options={DIAGNOSIS_OPTIONS} />
            <SelectField label="What treatment have you had?" value={values.treatment} onChange={(v) => setField('treatment', v as Treatment)} options={TREATMENT_OPTIONS} />
            <MoneyField label="Medical bills so far ($)" value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
            <MoneyField label="Lost wages / income ($)" value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
            {mode === 'advanced' && (
              <>
                <MoneyField label="Estimated future medical ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="Estimated future lost income ($)" value={values.futureLostIncome} onChange={(v) => setField('futureLostIncome', v)} />
                <MoneyField label="Other out-of-pocket costs ($)" value={values.otherCosts} onChange={(v) => setField('otherCosts', v)} />
                <SelectField label="How many disc levels are affected?" value={values.levels} onChange={(v) => setField('levels', v)} options={LEVEL_OPTIONS} />
                <SelectField label="Permanent impairment or restriction?" value={values.permanent} onChange={(v) => setField('permanent', v as YesNo)} options={YES_NO} />
              </>
            )}
            <SelectField label="Were you at fault?" value={values.faultLevel} onChange={(v) => setField('faultLevel', v as FaultLevel)} options={presets.faultLevel} />
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            {noSurgery
              ? 'Surgery is the single largest driver of a spine settlement. A claim treated without surgery settles for meaningfully less than the same disc injury that needed a discectomy or fusion.'
              : 'Surgery is documented, objective, and hard for an insurer to argue away, which is why it raises the multiplier more than any other factor. Open Advanced to add disc levels and permanence.'}
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
          {adapted ? (
            <ResultCard result={adapted} note={buildStateNote(values.state, severity)} onDownload={handleDownload} />
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
