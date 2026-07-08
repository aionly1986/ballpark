'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel, SettlementResult } from '@/lib/settlement'
import { calculateSettlement } from '@/lib/settlement'
import { negligenceRuleForState, negligenceNoteForState } from '@/lib/negligence'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, DateField, toNumber } from './fields'
import ResultCard from './ResultCard'

type Option = { value: string; label: string }
const optionLabel = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? v

type Mode = 'simple' | 'advanced'

interface Values {
  accidentType: string
  state: string
  medicalBills: string
  futureMedical: string
  lostWages: string
  futureLostIncome: string
  propertyDamage: string
  otherCosts: string
  severity: Severity
  faultLevel: FaultLevel
  dateOfAccident: string
}

interface CalculatorFormProps {
  config: CalculatorConfig
}

// Client component. Two modes (Simple / Advanced). The estimate is computed only
// when the user presses Calculate (a deliberate action, and the moment we can
// later surface providers / offers below the result). Changing any input clears
// the result so the displayed number is never stale.
export default function CalculatorForm({ config }: CalculatorFormProps) {
  const { labels, presets } = config
  const [mode, setMode] = useState<Mode>('simple')
  const [result, setResult] = useState<SettlementResult | null>(null)

  const [values, setValues] = useState<Values>({
    accidentType: presets.accidentType[0].value,
    state: presets.state[0].value,
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    futureLostIncome: '',
    propertyDamage: '',
    otherCosts: '',
    severity: presets.severity[0].value,
    faultLevel: presets.faultLevel[0].value,
    dateOfAccident: '',
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
        severity: values.severity,
        faultLevel: values.faultLevel,
        negligenceRule: negligenceRuleForState(values.state),
      }),
    )
  }

  function buildFields(): ReportField[] {
    const f: ReportField[] = [
      { label: labels.accidentType, value: optionLabel(presets.accidentType, values.accidentType) },
      { label: labels.state, value: optionLabel(presets.state, values.state) },
    ]
    const money = (label: string, raw: string) => {
      const n = toNumber(raw)
      if (n > 0) f.push({ label, value: formatUSD(n) })
    }
    money(labels.medicalBills, values.medicalBills)
    money(labels.futureMedical, values.futureMedical)
    money(labels.lostWages, values.lostWages)
    money(labels.futureLostIncome, values.futureLostIncome)
    money(labels.propertyDamage, values.propertyDamage)
    money(labels.otherCosts, values.otherCosts)
    f.push({ label: labels.severity, value: optionLabel(presets.severity, values.severity) })
    f.push({ label: labels.faultLevel, value: optionLabel(presets.faultLevel, values.faultLevel) })
    if (values.dateOfAccident) f.push({ label: labels.dateOfAccident, value: values.dateOfAccident })
    return f
  }

  async function handleDownload() {
    if (!result) return
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      result,
      fields: buildFields(),
      stateNote: negligenceNoteForState(values.state),
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
            <SelectField label={labels.accidentType} value={values.accidentType} onChange={(v) => setField('accidentType', v)} options={presets.accidentType} />
            <SelectField label={labels.state} value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />

            <MoneyField label={labels.medicalBills} value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
            {mode === 'advanced' && (
              <MoneyField label={labels.futureMedical} value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
            )}
            <MoneyField label={labels.lostWages} value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
            {mode === 'advanced' && (
              <>
                <MoneyField label={labels.futureLostIncome} value={values.futureLostIncome} onChange={(v) => setField('futureLostIncome', v)} />
                <MoneyField label={labels.propertyDamage} value={values.propertyDamage} onChange={(v) => setField('propertyDamage', v)} />
                <MoneyField label={labels.otherCosts} value={values.otherCosts} onChange={(v) => setField('otherCosts', v)} />
              </>
            )}

            <SelectField label={labels.severity} value={values.severity} onChange={(v) => setField('severity', v as Severity)} options={presets.severity} />
            <SelectField label={labels.faultLevel} value={values.faultLevel} onChange={(v) => setField('faultLevel', v as FaultLevel)} options={presets.faultLevel} />

            {mode === 'advanced' && (
              <DateField label={labels.dateOfAccident} value={values.dateOfAccident} onChange={(v) => setField('dateOfAccident', v)} />
            )}
          </div>

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
            <ResultCard result={result} note={negligenceNoteForState(values.state)} onDownload={handleDownload} emphasis={config.resultEmphasis} />
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
