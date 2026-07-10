'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { FaultLevel, SettlementResult } from '@/lib/settlement'
import type { TbiSeverity, LocDuration, BrainInjuryResult } from '@/lib/brainInjury'
import { calculateBrainInjury, severityBandFor } from '@/lib/brainInjury'
import { negligenceRuleForState } from '@/lib/negligence'
import { stateNote as buildStateNote, gatesPainSuffering } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, toNumber, Spinner, StaleNote } from './fields'
import ResultCard from './ResultCard'

type Mode = 'simple' | 'advanced'
type YesNo = 'no' | 'yes'

const SEVERITY_OPTIONS: { value: TbiSeverity; label: string }[] = [
  { value: 'mild', label: 'Mild (concussion, post-concussion syndrome)' },
  { value: 'moderate', label: 'Moderate (extended symptoms, some deficits)' },
  { value: 'severe', label: 'Severe (long-term impairment)' },
  { value: 'catastrophic', label: 'Catastrophic (permanent, life-altering)' },
]

// Loss of consciousness duration: the first marker the ER records and the first
// thing an adjuster looks for.
const LOC_OPTIONS: { value: LocDuration; label: string }[] = [
  { value: 'none', label: 'No loss of consciousness' },
  { value: 'under30min', label: 'Under 30 minutes' },
  { value: 'under24h', label: 'Under 24 hours' },
  { value: 'over24h', label: 'Over 24 hours' },
]

const YES_NO: { value: YesNo; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
]

interface Values {
  state: string
  severity: TbiSeverity
  loc: LocDuration
  imagingPositive: YesNo
  permanentCognitiveDeficit: YesNo
  medicalBills: string
  futureMedical: string
  lostWages: string
  futureLostIncome: string
  lifeCareCosts: string
  faultLevel: FaultLevel
}

// Purpose-built brain-injury (TBI) calculator. Its own engine: the multiplier is
// driven by TBI severity, loss-of-consciousness duration, whether imaging shows
// objective findings, and whether a permanent cognitive deficit is documented,
// then reduced by the state's comparative-fault rule.
export default function BrainInjuryForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<BrainInjuryResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    severity: 'mild',
    loc: 'none',
    imagingPositive: 'no',
    permanentCognitiveDeficit: 'no',
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    futureLostIncome: '',
    lifeCareCosts: '',
    faultLevel: presets.faultLevel[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  const imagingPositive = values.imagingPositive === 'yes'
  const cognitiveDeficit = values.permanentCognitiveDeficit === 'yes'
  const severity = severityBandFor(values.severity, values.loc, imagingPositive, cognitiveDeficit)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      medicalBills: toNumber(values.medicalBills),
      futureMedical: toNumber(values.futureMedical),
      lostWages: toNumber(values.lostWages),
      futureLostIncome: toNumber(values.futureLostIncome),
      lifeCareCosts: toNumber(values.lifeCareCosts),
      severity: values.severity,
      loc: values.loc,
      imagingPositive,
      permanentCognitiveDeficit: cognitiveDeficit,
      faultLevel: values.faultLevel,
      negligenceRule: negligenceRuleForState(values.state),
      noFaultGate: gatesPainSuffering(values.state, severity),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateBrainInjury(input))
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
    money('Lifetime care costs', values.lifeCareCosts)
    f.push({ label: 'TBI severity', value: optionLabel(SEVERITY_OPTIONS, values.severity) })
    f.push({ label: 'Loss of consciousness', value: optionLabel(LOC_OPTIONS, values.loc) })
    f.push({ label: 'Imaging shows findings', value: imagingPositive ? 'Yes' : 'No' })
    f.push({ label: 'Permanent cognitive deficit', value: cognitiveDeficit ? 'Yes' : 'No' })
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

  const isMild = values.severity === 'mild'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="How severe is the brain injury?" value={values.severity} onChange={(v) => setField('severity', v as TbiSeverity)} options={SEVERITY_OPTIONS} />
            <SelectField label="Was consciousness lost, and for how long?" value={values.loc} onChange={(v) => setField('loc', v as LocDuration)} options={LOC_OPTIONS} />
            <SelectField label="Did a CT or MRI show findings?" value={values.imagingPositive} onChange={(v) => setField('imagingPositive', v as YesNo)} options={YES_NO} />
            <MoneyField label="Medical bills so far ($)" value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
            <MoneyField label="Lost wages / income ($)" value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
            {mode === 'advanced' && (
              <>
                <MoneyField label="Estimated future medical ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="Estimated future lost income ($)" value={values.futureLostIncome} onChange={(v) => setField('futureLostIncome', v)} />
                <MoneyField label="Lifetime care costs ($)" value={values.lifeCareCosts} onChange={(v) => setField('lifeCareCosts', v)} />
                <SelectField label="Documented permanent cognitive deficit?" value={values.permanentCognitiveDeficit} onChange={(v) => setField('permanentCognitiveDeficit', v as YesNo)} options={YES_NO} />
              </>
            )}
            <SelectField label="Were you at fault?" value={values.faultLevel} onChange={(v) => setField('faultLevel', v as FaultLevel)} options={presets.faultLevel} />
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            {isMild
              ? 'A mild TBI (concussion) is the hardest injury class to prove, because the symptoms are real but invisible. Objective imaging and formal neuropsychological testing are what move the number. Open Advanced to add a documented cognitive deficit and lifetime care costs.'
              : 'The value of a serious TBI is driven by lasting deficits and lifetime care costs, not just the bills so far. Open Advanced to add future care, future lost income, and a documented cognitive deficit.'}
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
