'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { HealthStatus, Relationship, Conduct, WrongfulDeathResult } from '@/lib/wrongfulDeath'
import { calculateWrongfulDeath, WRONGFUL_DEATH_NOTE } from '@/lib/wrongfulDeath'
import { negligenceRuleForState, negligenceNoteForState } from '@/lib/negligence'
import { hasNonEconCap } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, NumberField, toNumber, Spinner, StaleNote } from './fields'

type Mode = 'simple' | 'advanced'
type YesNo = 'no' | 'yes'

const YES_NO: { value: YesNo; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
]

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string }[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child of the deceased' },
  { value: 'parent', label: 'Parent of the deceased' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other family member' },
]

const HEALTH_OPTIONS: { value: HealthStatus; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const CONDUCT_OPTIONS: { value: Conduct; label: string }[] = [
  { value: 'negligent', label: 'Negligent (ordinary carelessness)' },
  { value: 'reckless', label: 'Reckless (conscious disregard)' },
  { value: 'intentional', label: 'Intentional wrongdoing' },
  { value: 'criminal', label: 'Criminal conduct' },
]

interface Values {
  state: string
  ageAtDeath: string
  annualIncome: string
  yearsToRetirement: string
  relationship: Relationship
  dependents: string
  faultPercent: string
  lifeExpectancy: string
  healthStatus: HealthStatus
  medicalExpenses: string
  funeralCosts: string
  householdHoursPerWeek: string
  childcareHoursPerWeek: string
  homeMaintenance: YesNo
  conduct: Conduct
  punitiveEligible: YesNo
  primaryCoverage: string
  umbrellaCoverage: string
  umUimCoverage: string
}

// Purpose-built wrongful-death calculator. Its own engine: lost future earnings
// are reduced by a personal-consumption share and discounted to present value,
// household services are valued at replacement cost, and the result is reduced
// by the deceased's fault under the state rule then capped at available coverage.
export default function WrongfulDeathForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<WrongfulDeathResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    ageAtDeath: '',
    annualIncome: '',
    yearsToRetirement: '',
    relationship: 'spouse',
    dependents: '0',
    faultPercent: '0',
    lifeExpectancy: '78',
    healthStatus: 'good',
    medicalExpenses: '',
    funeralCosts: '10000',
    householdHoursPerWeek: '',
    childcareHoursPerWeek: '',
    homeMaintenance: 'no',
    conduct: 'negligent',
    punitiveEligible: 'no',
    primaryCoverage: '',
    umbrellaCoverage: '',
    umUimCoverage: '',
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      ageAtDeath: toNumber(values.ageAtDeath),
      lifeExpectancy: toNumber(values.lifeExpectancy),
      healthStatus: values.healthStatus,
      annualIncome: toNumber(values.annualIncome),
      yearsToRetirement: toNumber(values.yearsToRetirement),
      medicalExpenses: toNumber(values.medicalExpenses),
      funeralCosts: toNumber(values.funeralCosts),
      householdHoursPerWeek: toNumber(values.householdHoursPerWeek),
      childcareHoursPerWeek: toNumber(values.childcareHoursPerWeek),
      homeMaintenance: values.homeMaintenance === 'yes',
      relationship: values.relationship,
      dependents: toNumber(values.dependents),
      faultPercent: toNumber(values.faultPercent),
      negligenceRule: negligenceRuleForState(values.state),
      conduct: values.conduct,
      punitiveEligible: values.punitiveEligible === 'yes',
      primaryCoverage: toNumber(values.primaryCoverage),
      umbrellaCoverage: toNumber(values.umbrellaCoverage),
      umUimCoverage: toNumber(values.umUimCoverage),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateWrongfulDeath(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

  const optionLabel = (opts: { value: string; label: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? v

  async function handleDownload() {
    if (!result) return
    const breakdown: ReportField[] = [
      { label: 'Lost future earnings (present value)', value: formatUSD(result.lostEarnings) },
      { label: 'Lost household services', value: formatUSD(result.lostServices) },
      { label: 'Final expenses', value: formatUSD(result.finalExpenses) },
      { label: 'Loss of companionship', value: formatUSD(result.nonEconomic) },
    ]
    if (result.punitive > 0) breakdown.push({ label: 'Punitive damages', value: formatUSD(result.punitive) })
    if (result.cappedByCoverage) breakdown.push({ label: 'Note', value: 'Capped at available coverage' })
    const fields: ReportField[] = [
      { label: 'Age at death', value: String(toNumber(values.ageAtDeath)) },
      { label: 'Annual income', value: formatUSD(toNumber(values.annualIncome)) },
      { label: 'Years until retirement', value: String(toNumber(values.yearsToRetirement)) },
      { label: 'Relationship', value: optionLabel(RELATIONSHIP_OPTIONS, values.relationship) },
      { label: 'Dependents', value: String(toNumber(values.dependents)) },
      { label: "Deceased's share of fault", value: `${toNumber(values.faultPercent)}%` },
      { label: 'State', value: optionLabel(presets.state, values.state) },
    ]
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated settlement range',
      headlineLow: result.low,
      headlineHigh: result.high,
      breakdown,
      fields,
      stateNote: WRONGFUL_DEATH_NOTE,
    })
  }

  const rule = negligenceRuleForState(values.state)
  const barred = rule === 'contributory' && toNumber(values.faultPercent) > 0
  const notes = [negligenceNoteForState(values.state)]
  if (hasNonEconCap(values.state)) {
    notes.push(
      'This state may cap non-economic damages. Caps change often and vary by case type, so verify the current figure with an attorney.',
    )
  }
  if (result?.cappedByCoverage) {
    notes.push('The range was capped at the total coverage you entered, since a settlement rarely exceeds the money available to pay it.')
  }
  notes.push(WRONGFUL_DEATH_NOTE)
  const note = notes.join(' ')

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
            <SelectField label="Your relationship to the deceased" value={values.relationship} onChange={(v) => setField('relationship', v as Relationship)} options={RELATIONSHIP_OPTIONS} />
            <NumberField label="Age at time of death" value={values.ageAtDeath} onChange={(v) => setField('ageAtDeath', v)} suffix="yrs" />
            <MoneyField label="Annual income ($)" value={values.annualIncome} onChange={(v) => setField('annualIncome', v)} />
            <NumberField label="Years until retirement" value={values.yearsToRetirement} onChange={(v) => setField('yearsToRetirement', v)} suffix="yrs" />
            <NumberField label="Number of dependents" value={values.dependents} onChange={(v) => setField('dependents', v)} />
            <NumberField label="Deceased's share of fault" value={values.faultPercent} onChange={(v) => setField('faultPercent', v)} suffix="%" />

            {mode === 'advanced' && (
              <>
                <NumberField label="Life expectancy" value={values.lifeExpectancy} onChange={(v) => setField('lifeExpectancy', v)} suffix="yrs" />
                <SelectField label="Health before death" value={values.healthStatus} onChange={(v) => setField('healthStatus', v as HealthStatus)} options={HEALTH_OPTIONS} />
                <MoneyField label="Medical expenses before death ($)" value={values.medicalExpenses} onChange={(v) => setField('medicalExpenses', v)} />
                <MoneyField label="Funeral and burial costs ($)" value={values.funeralCosts} onChange={(v) => setField('funeralCosts', v)} />
                <NumberField label="Household services provided" value={values.householdHoursPerWeek} onChange={(v) => setField('householdHoursPerWeek', v)} suffix="hrs/wk" />
                <NumberField label="Childcare provided" value={values.childcareHoursPerWeek} onChange={(v) => setField('childcareHoursPerWeek', v)} suffix="hrs/wk" />
                <SelectField label="Did they handle home maintenance?" value={values.homeMaintenance} onChange={(v) => setField('homeMaintenance', v as YesNo)} options={YES_NO} />
                <SelectField label="Defendant's conduct" value={values.conduct} onChange={(v) => setField('conduct', v as Conduct)} options={CONDUCT_OPTIONS} />
                <SelectField label="Are punitive damages available?" value={values.punitiveEligible} onChange={(v) => setField('punitiveEligible', v as YesNo)} options={YES_NO} />
                <MoneyField label="Primary insurance limit ($)" value={values.primaryCoverage} onChange={(v) => setField('primaryCoverage', v)} />
                <MoneyField label="Umbrella / excess coverage ($)" value={values.umbrellaCoverage} onChange={(v) => setField('umbrellaCoverage', v)} />
                <MoneyField label="UM / UIM coverage ($)" value={values.umUimCoverage} onChange={(v) => setField('umUimCoverage', v)} />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            {barred
              ? 'This state follows contributory negligence, so any fault by the deceased can bar recovery entirely. The estimate will show zero.'
              : 'Future earnings are reduced by what the deceased would have spent on themselves, then discounted to present value. Open Advanced for household services, punitive damages, and insurance limits.'}
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
            <WdResultCard result={result} note={note} onDownload={handleDownload} />
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

function WdResultCard({
  result,
  note,
  onDownload,
}: {
  result: WrongfulDeathResult
  note: string
  onDownload: () => void
}) {
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
          <dt className="text-ink-faint">Lost earnings (today&apos;s value)</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.lostEarnings)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Lost household services</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.lostServices)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Final expenses</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.finalExpenses)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Loss of companionship</dt>
          <dd className="mt-1 font-semibold text-ink">{formatUSD(result.nonEconomic)}</dd>
        </div>
        {result.punitive > 0 && (
          <div>
            <dt className="text-ink-faint">Punitive damages</dt>
            <dd className="mt-1 font-semibold text-ink">{formatUSD(result.punitive)}</dd>
          </div>
        )}
      </dl>

      {note && (
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">{note}</p>
      )}

      <p className="mt-5 text-xs leading-5 text-ink-faint">
        This is an educational estimate, not legal advice or a guarantee. Actual wrongful
        death settlements depend on state statute, evidence, insurance limits, and negotiation.
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
