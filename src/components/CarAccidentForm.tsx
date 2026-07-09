'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel, SettlementResult } from '@/lib/settlement'
import { calculateSettlement } from '@/lib/settlement'
import { negligenceRuleForState } from '@/lib/negligence'
import { stateNote as buildStateNote, gatesPainSuffering } from '@/lib/states'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, toNumber } from './fields'
import ResultCard from './ResultCard'

type Mode = 'simple' | 'advanced'

interface Values {
  state: string
  medicalBills: string
  futureMedical: string
  lostWages: string
  futureLostIncome: string
  propertyDamage: string
  otherCosts: string
  policyLimit: string
  severity: Severity
  faultLevel: FaultLevel
}

// Purpose-built car-accident settlement calculator. Same settlement math, but
// car-specific: vehicle-damage line item and an insurance policy-limit cap (a
// settlement rarely exceeds the at-fault driver's coverage).
export default function CarAccidentForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<SettlementResult | null>(null)
  const [values, setValues] = useState<Values>({
    state: presets.state[0].value,
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    futureLostIncome: '',
    propertyDamage: '',
    otherCosts: '',
    policyLimit: '',
    severity: presets.severity[0].value,
    faultLevel: presets.faultLevel[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setResult(null)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setResult(
      calculateSettlement({
        medicalBills: toNumber(values.medicalBills),
        futureMedical: toNumber(values.futureMedical),
        lostWages: toNumber(values.lostWages),
        futureLostIncome: toNumber(values.futureLostIncome),
        propertyDamage: toNumber(values.propertyDamage),
        otherCosts: toNumber(values.otherCosts),
        policyLimit: toNumber(values.policyLimit),
        severity: values.severity,
        faultLevel: values.faultLevel,
        negligenceRule: negligenceRuleForState(values.state),
        noFaultGate: gatesPainSuffering(values.state, values.severity),
      }),
    )
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
    money('Policy limit', values.policyLimit)
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
    if (result.cappedByPolicy) breakdown.push({ label: 'Note', value: 'Capped at the policy limit' })
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
  const capNote = result?.cappedByPolicy
    ? 'Capped at the policy limit you entered, since a settlement rarely exceeds the at-fault driver’s available coverage.'
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
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
            {mode === 'advanced' && (
              <MoneyField label="At-fault driver's policy limit ($, if known)" value={values.policyLimit} onChange={(v) => setField('policyLimit', v)} />
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            Add the at-fault driver&apos;s policy limit in Advanced to cap the estimate at
            their available coverage, which is what a settlement rarely exceeds.
          </p>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Calculate estimate
          </button>
        </form>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
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
