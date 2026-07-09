'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { SettlementResult } from '@/lib/settlement'
import type { DogBiteSeverity, DogBiteResult } from '@/lib/dogBite'
import { calculateDogBite, dogBiteStateNote } from '@/lib/dogBite'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, toNumber, Spinner, StaleNote } from './fields'
import ResultCard from './ResultCard'

type Mode = 'simple' | 'advanced'
type YesNo = 'no' | 'yes'

const YES_NO: { value: YesNo; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
]

const DOG_SEVERITY: { value: DogBiteSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor (shallow bite, quick recovery)' },
  { value: 'moderate', label: 'Moderate (punctures, stitches)' },
  { value: 'severe', label: 'Severe (deep wounds, surgery)' },
  { value: 'disfiguring', label: 'Disfiguring (permanent scarring)' },
]

interface Values {
  state: string
  medicalBills: string
  futureMedical: string
  lostEarnings: string
  futureLostIncome: string
  otherCosts: string
  severity: DogBiteSeverity
  facialInjury: YesNo
  permanentScarring: YesNo
  childVictim: YesNo
  nerveDamage: YesNo
  infection: YesNo
  emotionalTrauma: YesNo
  provoked: YesNo
  trespassing: YesNo
  priorAggression: YesNo
  ownerNegligent: YesNo
}

// Purpose-built dog-bite calculator with its own engine: severity plus
// aggravating-factor premiums (facial injury, scarring, child victim), and a
// liability factor driven by the state's dog-bite rule and provocation /
// trespassing defenses.
export default function DogBiteForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<DogBiteResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    medicalBills: '',
    futureMedical: '',
    lostEarnings: '',
    futureLostIncome: '',
    otherCosts: '',
    severity: 'moderate',
    facialInjury: 'no',
    permanentScarring: 'no',
    childVictim: 'no',
    nerveDamage: 'no',
    infection: 'no',
    emotionalTrauma: 'no',
    provoked: 'no',
    trespassing: 'no',
    priorAggression: 'no',
    ownerNegligent: 'no',
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  const yes = (v: YesNo) => v === 'yes'

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      medicalBills: toNumber(values.medicalBills),
      futureMedical: toNumber(values.futureMedical),
      lostEarnings: toNumber(values.lostEarnings),
      futureLostIncome: toNumber(values.futureLostIncome),
      otherCosts: toNumber(values.otherCosts),
      severity: values.severity,
      facialInjury: yes(values.facialInjury),
      permanentScarring: yes(values.permanentScarring),
      nerveDamage: yes(values.nerveDamage),
      infection: yes(values.infection),
      emotionalTrauma: yes(values.emotionalTrauma),
      childVictim: yes(values.childVictim),
      state: values.state,
      provoked: yes(values.provoked),
      trespassing: yes(values.trespassing),
      priorAggression: yes(values.priorAggression),
      ownerNegligent: yes(values.ownerNegligent),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateDogBite(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  // Adapt the dog-bite result to the shared ResultCard shape (general damages
  // read as the pain-and-suffering line).
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
    money('Lost earnings', values.lostEarnings)
    money('Future lost income', values.futureLostIncome)
    money('Other costs', values.otherCosts)
    f.push({ label: 'Bite severity', value: optionLabel(DOG_SEVERITY, values.severity) })
    const flags: string[] = []
    if (yes(values.facialInjury)) flags.push('facial injury')
    if (yes(values.permanentScarring)) flags.push('permanent scarring')
    if (yes(values.childVictim)) flags.push('child victim')
    if (yes(values.nerveDamage)) flags.push('nerve damage')
    if (yes(values.infection)) flags.push('infection')
    if (yes(values.emotionalTrauma)) flags.push('emotional trauma')
    if (flags.length) f.push({ label: 'Aggravating factors', value: flags.join(', ') })
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
      stateNote: dogBiteStateNote(values.state),
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
            <SelectField label="How severe was the bite?" value={values.severity} onChange={(v) => setField('severity', v as DogBiteSeverity)} options={DOG_SEVERITY} />
            <MoneyField label="Medical bills so far ($)" value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
            <MoneyField label="Lost earnings ($)" value={values.lostEarnings} onChange={(v) => setField('lostEarnings', v)} />
            <SelectField label="Facial, head, or neck injury?" value={values.facialInjury} onChange={(v) => setField('facialInjury', v as YesNo)} options={YES_NO} />
            <SelectField label="Permanent scarring or disfigurement?" value={values.permanentScarring} onChange={(v) => setField('permanentScarring', v as YesNo)} options={YES_NO} />
            <SelectField label="Was the victim a child (under 18)?" value={values.childVictim} onChange={(v) => setField('childVictim', v as YesNo)} options={YES_NO} />
            <SelectField label="Did you provoke or tease the dog?" value={values.provoked} onChange={(v) => setField('provoked', v as YesNo)} options={YES_NO} />

            {mode === 'advanced' && (
              <>
                <MoneyField label="Estimated future medical ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="Estimated future lost income ($)" value={values.futureLostIncome} onChange={(v) => setField('futureLostIncome', v)} />
                <MoneyField label="Other out-of-pocket costs ($)" value={values.otherCosts} onChange={(v) => setField('otherCosts', v)} />
                <SelectField label="Nerve damage or loss of sensation?" value={values.nerveDamage} onChange={(v) => setField('nerveDamage', v as YesNo)} options={YES_NO} />
                <SelectField label="Infection or complications?" value={values.infection} onChange={(v) => setField('infection', v as YesNo)} options={YES_NO} />
                <SelectField label="Severe emotional trauma or PTSD?" value={values.emotionalTrauma} onChange={(v) => setField('emotionalTrauma', v as YesNo)} options={YES_NO} />
                <SelectField label="Had the dog bitten or shown aggression before?" value={values.priorAggression} onChange={(v) => setField('priorAggression', v as YesNo)} options={YES_NO} />
                <SelectField label="Was the owner breaking a leash or fence law?" value={values.ownerNegligent} onChange={(v) => setField('ownerNegligent', v as YesNo)} options={YES_NO} />
                <SelectField label="Were you trespassing?" value={values.trespassing} onChange={(v) => setField('trespassing', v as YesNo)} options={YES_NO} />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            Scarring, facial injuries, and child victims raise the multiplier. Provocation
            and trespassing are defenses that lower it. Open Advanced for nerve damage,
            infection, and the owner-liability questions.
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
            <ResultCard result={adapted} note={dogBiteStateNote(values.state)} onDownload={handleDownload} />
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
