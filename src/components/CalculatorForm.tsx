'use client'

import { useMemo, useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel } from '@/lib/settlement'
import { calculateSettlement } from '@/lib/settlement'
import { negligenceRuleForState, negligenceNoteForState } from '@/lib/negligence'
import { SelectField, MoneyField, DateField, toNumber } from './fields'
import ResultCard from './ResultCard'
import TrustBadge from './TrustBadge'

type Mode = 'simple' | 'advanced'

interface CalculatorFormProps {
  config: CalculatorConfig
}

// Client component. Two modes: Simple (fast, above the fold) and Advanced (more
// economic line items). Both share one state; the estimate always uses whatever
// is filled and recomputes instantly.
export default function CalculatorForm({ config }: CalculatorFormProps) {
  const { labels, presets } = config
  const [mode, setMode] = useState<Mode>('simple')

  const [accidentType, setAccidentType] = useState(presets.accidentType[0].value)
  const [state, setState] = useState(presets.state[0].value)
  const [medicalBills, setMedicalBills] = useState('')
  const [futureMedical, setFutureMedical] = useState('')
  const [lostWages, setLostWages] = useState('')
  const [futureLostIncome, setFutureLostIncome] = useState('')
  const [propertyDamage, setPropertyDamage] = useState('')
  const [otherCosts, setOtherCosts] = useState('')
  const [severity, setSeverity] = useState<Severity>(presets.severity[0].value)
  const [faultLevel, setFaultLevel] = useState<FaultLevel>(presets.faultLevel[0].value)
  const [dateOfAccident, setDateOfAccident] = useState('')

  const result = useMemo(
    () =>
      calculateSettlement({
        medicalBills: toNumber(medicalBills),
        futureMedical: toNumber(futureMedical),
        lostWages: toNumber(lostWages),
        futureLostIncome: toNumber(futureLostIncome),
        propertyDamage: toNumber(propertyDamage),
        otherCosts: toNumber(otherCosts),
        severity,
        faultLevel,
        negligenceRule: negligenceRuleForState(state),
      }),
    [medicalBills, futureMedical, lostWages, futureLostIncome, propertyDamage, otherCosts, severity, faultLevel, state],
  )

  const stateNote = negligenceNoteForState(state)

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
          <ModeTabs mode={mode} onChange={setMode} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label={labels.accidentType} value={accidentType} onChange={setAccidentType} options={presets.accidentType} />
            <SelectField label={labels.state} value={state} onChange={setState} options={presets.state} />

            <MoneyField label={labels.medicalBills} value={medicalBills} onChange={setMedicalBills} />
            {mode === 'advanced' && (
              <MoneyField label={labels.futureMedical} value={futureMedical} onChange={setFutureMedical} />
            )}
            <MoneyField label={labels.lostWages} value={lostWages} onChange={setLostWages} />
            {mode === 'advanced' && (
              <>
                <MoneyField label={labels.futureLostIncome} value={futureLostIncome} onChange={setFutureLostIncome} />
                <MoneyField label={labels.propertyDamage} value={propertyDamage} onChange={setPropertyDamage} />
                <MoneyField label={labels.otherCosts} value={otherCosts} onChange={setOtherCosts} />
              </>
            )}

            <SelectField label={labels.severity} value={severity} onChange={(v) => setSeverity(v as Severity)} options={presets.severity} />
            <SelectField label={labels.faultLevel} value={faultLevel} onChange={(v) => setFaultLevel(v as FaultLevel)} options={presets.faultLevel} />

            {mode === 'advanced' && (
              <DateField label={labels.dateOfAccident} value={dateOfAccident} onChange={setDateOfAccident} />
            )}
          </div>
        </div>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          {config.trustBadge && <TrustBadge text={config.trustBadge} />}
          <ResultCard result={result} note={stateNote} />
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
