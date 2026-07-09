'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel, SettlementResult } from '@/lib/settlement'
import { calculateSettlement } from '@/lib/settlement'
import type { CarrierType } from '@/lib/truckAccident'
import { truckPolicyCeiling, CARRIER_POLICY_DEFAULT } from '@/lib/truckAccident'
import { negligenceRuleForState } from '@/lib/negligence'
import { stateNote as buildStateNote, gatesPainSuffering } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, toNumber, Spinner, StaleNote } from './fields'
import ResultCard from './ResultCard'

type Mode = 'simple' | 'advanced'

const CARRIER_OPTIONS: { value: CarrierType; label: string }[] = [
  { value: 'interstate', label: 'Interstate carrier (most 18-wheelers)' },
  { value: 'hazmat', label: 'Hazmat / tanker' },
  { value: 'local', label: 'Local / intrastate truck' },
  { value: 'unknown', label: 'Not sure' },
]

interface Values {
  state: string
  carrier: CarrierType
  medicalBills: string
  futureMedical: string
  lostWages: string
  futureLostIncome: string
  propertyDamage: string
  otherCosts: string
  knownPolicy: string
  severity: Severity
  faultLevel: FaultLevel
}

// Purpose-built truck-accident calculator. Same tested settlement engine, but
// truck-specific: the carrier type sets a commercial policy-limit ceiling (far
// larger than a car policy), which the estimate is capped at.
export default function TruckAccidentForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<SettlementResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [stale, setStale] = useState(false)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    carrier: 'interstate',
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    futureLostIncome: '',
    propertyDamage: '',
    otherCosts: '',
    knownPolicy: '',
    severity: presets.severity[0].value,
    faultLevel: presets.faultLevel[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (result) setStale(true)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const policyLimit = truckPolicyCeiling(values.carrier, toNumber(values.knownPolicy))
    const input = {
      medicalBills: toNumber(values.medicalBills),
      futureMedical: toNumber(values.futureMedical),
      lostWages: toNumber(values.lostWages),
      futureLostIncome: toNumber(values.futureLostIncome),
      propertyDamage: toNumber(values.propertyDamage),
      otherCosts: toNumber(values.otherCosts),
      policyLimit,
      severity: values.severity,
      faultLevel: values.faultLevel,
      negligenceRule: negligenceRuleForState(values.state),
      noFaultGate: gatesPainSuffering(values.state, values.severity),
    }
    setCalculating(true)
    setTimeout(() => {
      setResult(calculateSettlement(input))
      setCalculating(false)
      setStale(false)
    }, 900)
  }

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
    money('Vehicle / property damage', values.propertyDamage)
    money('Other costs', values.otherCosts)
    f.push({ label: 'Carrier type', value: optionLabel(CARRIER_OPTIONS, values.carrier) })
    const ceiling = truckPolicyCeiling(values.carrier, toNumber(values.knownPolicy))
    if (ceiling > 0) f.push({ label: 'Policy ceiling used', value: formatUSD(ceiling) })
    f.push({ label: 'Injury severity', value: optionLabel(presets.severity, values.severity) })
    f.push({ label: 'Were you at fault?', value: optionLabel(presets.faultLevel, values.faultLevel) })
    f.push({ label: 'State', value: optionLabel(presets.state, values.state) })
    return f
  }

  async function handleDownload() {
    if (!result) return
    const breakdown: ReportField[] = [
      { label: 'Economic damages', value: formatUSD(result.economic) },
      { label: 'Pain and suffering', value: formatUSD(result.painSuffering) },
    ]
    if (result.cappedByPolicy) breakdown.push({ label: 'Note', value: 'Capped at the commercial policy ceiling' })
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated settlement range',
      headlineLow: result.low,
      headlineHigh: result.high,
      breakdown,
      fields: buildFields(),
      stateNote: buildStateNote(values.state, values.severity),
    })
  }

  const sNote = buildStateNote(values.state, values.severity)
  const defaultCeiling = CARRIER_POLICY_DEFAULT[values.carrier]
  const capNote = result?.cappedByPolicy
    ? 'Capped at the commercial policy ceiling. Truck claims can reach multiple insurers (driver, carrier, broker, shipper), so the real ceiling may be higher than one policy.'
    : ''
  const note = [capNote, sNote].filter(Boolean).join(' ')

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="Type of truck / carrier" value={values.carrier} onChange={(v) => setField('carrier', v as CarrierType)} options={CARRIER_OPTIONS} />
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
            <MoneyField label="Medical bills so far ($)" value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
            <MoneyField label="Lost wages / income ($)" value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
            {mode === 'advanced' && (
              <>
                <MoneyField label="Estimated future medical ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="Estimated future lost income ($)" value={values.futureLostIncome} onChange={(v) => setField('futureLostIncome', v)} />
                <MoneyField label="Vehicle / property damage ($)" value={values.propertyDamage} onChange={(v) => setField('propertyDamage', v)} />
                <MoneyField label="Other out-of-pocket costs ($)" value={values.otherCosts} onChange={(v) => setField('otherCosts', v)} />
              </>
            )}
            <SelectField label="How severe is the injury?" value={values.severity} onChange={(v) => setField('severity', v as Severity)} options={presets.severity} />
            <SelectField label="Were you at fault?" value={values.faultLevel} onChange={(v) => setField('faultLevel', v as FaultLevel)} options={presets.faultLevel} />
            {mode === 'advanced' && (
              <MoneyField label="Known policy limit ($, if any)" value={values.knownPolicy} onChange={(v) => setField('knownPolicy', v)} />
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            {values.carrier === 'unknown'
              ? 'Pick a carrier type to cap the estimate at a typical commercial policy. Interstate trucks carry at least $750,000 in federal coverage.'
              : `Estimate is capped near the ${formatUSD(defaultCeiling)} typical policy for this carrier, unless you enter a known limit in Advanced.`}
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
            <ResultCard result={result} note={note} onDownload={handleDownload} />
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
