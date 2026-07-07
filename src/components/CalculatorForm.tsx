'use client'

import { useMemo, useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel } from '@/lib/settlement'
import { calculateSettlement } from '@/lib/settlement'
import { negligenceRuleForState, negligenceNoteForState } from '@/lib/negligence'
import ResultCard from './ResultCard'

interface CalculatorFormProps {
  config: CalculatorConfig
}

// Shared control styling, one source of truth so every field is identical.
// Neutral (near-black) focus, matching Cal's monochrome UI.
const CONTROL_BASE =
  'w-full rounded-lg border border-surface-border bg-surface text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10'
const CONTROL = `${CONTROL_BASE} px-4 py-2.5`

// Client component. Holds the inputs, computes the estimate instantly on every
// change (no server round-trip), and shows the live result beside them. Kept
// compact (2-col) so the whole tool fits above the fold.
export default function CalculatorForm({ config }: CalculatorFormProps) {
  const { labels, presets } = config

  // Five fields feed the math; the rest add context for the estimate.
  const [medicalBills, setMedicalBills] = useState('')
  const [futureMedical, setFutureMedical] = useState('')
  const [lostWages, setLostWages] = useState('')
  const [severity, setSeverity] = useState<Severity>(presets.severity[0].value)
  const [faultLevel, setFaultLevel] = useState<FaultLevel>(presets.faultLevel[0].value)
  const [accidentType, setAccidentType] = useState(presets.accidentType[0].value)
  const [state, setState] = useState(presets.state[0].value)
  const [dateOfAccident, setDateOfAccident] = useState('')

  const result = useMemo(
    () =>
      calculateSettlement({
        medicalBills: toNumber(medicalBills),
        futureMedical: toNumber(futureMedical),
        lostWages: toNumber(lostWages),
        severity,
        faultLevel,
        negligenceRule: negligenceRuleForState(state),
      }),
    [medicalBills, futureMedical, lostWages, severity, faultLevel, state],
  )

  const stateNote = negligenceNoteForState(state)

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label={labels.accidentType}
              value={accidentType}
              onChange={setAccidentType}
              options={presets.accidentType}
            />
            <Select
              label={labels.state}
              value={state}
              onChange={setState}
              options={presets.state}
            />
            <Money label={labels.medicalBills} value={medicalBills} onChange={setMedicalBills} />
            <Money label={labels.futureMedical} value={futureMedical} onChange={setFutureMedical} />
            <Money label={labels.lostWages} value={lostWages} onChange={setLostWages} />
            <Field label={labels.dateOfAccident}>
              <input
                type="date"
                value={dateOfAccident}
                onChange={(e) => setDateOfAccident(e.target.value)}
                className={CONTROL}
              />
            </Field>
            <Select
              label={labels.severity}
              value={severity}
              onChange={(v) => setSeverity(v as Severity)}
              options={presets.severity}
            />
            <Select
              label={labels.faultLevel}
              value={faultLevel}
              onChange={(v) => setFaultLevel(v as FaultLevel)}
              options={presets.faultLevel}
            />
          </div>
        </div>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          <ResultCard result={result} note={stateNote} />
        </div>
      </aside>
    </div>
  )
}

function toNumber(raw: string): number {
  const n = Number(raw.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={CONTROL}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

interface MoneyProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function Money({ label, value, onChange }: MoneyProps) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          $
        </span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={`${CONTROL_BASE} py-2.5 pl-8 pr-4`}
        />
      </div>
    </Field>
  )
}
