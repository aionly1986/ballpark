'use client'

import { useState } from 'react'
import type { CalculatorConfig } from '@/lib/types'
import type { Severity, FaultLevel } from '@/lib/settlement'
import type { PsMethod, PainSufferingResult } from '@/lib/painSuffering'
import { calculatePainSuffering } from '@/lib/painSuffering'
import { negligenceRuleForState, negligenceNoteForState } from '@/lib/negligence'
import { formatUSD } from '@/lib/format'
import type { ReportField } from '@/lib/report'
import { SelectField, MoneyField, NumberField, toNumber } from './fields'

type Option = { value: string; label: string }
const optionLabel = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? v

const PERMANENT_OPTIONS: Option[] = [
  { value: 'no', label: 'No, expected to heal' },
  { value: 'yes', label: 'Yes, permanent effects' },
]

interface Values {
  method: PsMethod
  medicalBills: string
  futureMedical: string
  lostWages: string
  severity: Severity
  permanent: string
  dailyRate: string
  recoveryDays: string
  state: string
  faultLevel: FaultLevel
}

// Purpose-built pain-and-suffering calculator. Two methods (Multiplier / Per
// diem) with its own engine. Result leads with the pain-and-suffering range.
export default function PainSufferingForm({ config }: { config: CalculatorConfig }) {
  const { presets } = config
  const [result, setResult] = useState<PainSufferingResult | null>(null)
  const [values, setValues] = useState<Values>({
    method: 'multiplier',
    medicalBills: '',
    futureMedical: '',
    lostWages: '',
    severity: presets.severity[0].value,
    permanent: 'no',
    dailyRate: '',
    recoveryDays: '',
    state: presets.state[0].value,
    faultLevel: presets.faultLevel[0].value,
  })

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setResult(null)
  }

  const economicDamages =
    toNumber(values.medicalBills) + toNumber(values.futureMedical) + toNumber(values.lostWages)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setResult(
      calculatePainSuffering({
        method: values.method,
        economicDamages,
        severity: values.severity,
        permanent: values.permanent === 'yes',
        dailyRate: toNumber(values.dailyRate),
        recoveryDays: toNumber(values.recoveryDays),
        faultLevel: values.faultLevel,
        negligenceRule: negligenceRuleForState(values.state),
      }),
    )
  }

  function buildFields(): ReportField[] {
    const f: ReportField[] = [{ label: 'Method', value: values.method === 'perDiem' ? 'Per diem' : 'Multiplier' }]
    if (values.method === 'multiplier') {
      if (toNumber(values.medicalBills) > 0) f.push({ label: 'Medical bills', value: formatUSD(toNumber(values.medicalBills)) })
      if (toNumber(values.futureMedical) > 0) f.push({ label: 'Future medical', value: formatUSD(toNumber(values.futureMedical)) })
      if (toNumber(values.lostWages) > 0) f.push({ label: 'Lost wages', value: formatUSD(toNumber(values.lostWages)) })
      f.push({ label: 'Injury severity', value: optionLabel(presets.severity, values.severity) })
      f.push({ label: 'Permanent injury', value: values.permanent === 'yes' ? 'Yes' : 'No' })
    } else {
      f.push({ label: 'Daily rate', value: formatUSD(toNumber(values.dailyRate)) })
      f.push({ label: 'Recovery days', value: String(toNumber(values.recoveryDays)) })
    }
    f.push({ label: 'State', value: optionLabel(presets.state, values.state) })
    f.push({ label: 'Were you at fault?', value: optionLabel(presets.faultLevel, values.faultLevel) })
    return f
  }

  async function handleDownload() {
    if (!result) return
    const breakdown: ReportField[] =
      result.method === 'multiplier'
        ? [
            { label: 'Method', value: `Multiplier (${result.multiplier}x)` },
            { label: 'Economic damages', value: formatUSD(economicDamages) },
          ]
        : [
            { label: 'Method', value: 'Per diem' },
            { label: 'Daily rate', value: formatUSD(toNumber(values.dailyRate)) },
            { label: 'Recovery days', value: String(toNumber(values.recoveryDays)) },
          ]
    const { downloadEstimatePdf } = await import('@/lib/report')
    await downloadEstimatePdf({
      toolTitle: config.h1,
      headlineLabel: 'Estimated pain and suffering',
      headlineLow: result.low,
      headlineHigh: result.high,
      breakdown,
      fields: buildFields(),
      stateNote: negligenceNoteForState(values.state),
    })
  }

  const multiplier = values.method === 'multiplier'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8"
        >
          <MethodTabs method={values.method} onChange={(m) => setField('method', m)} />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {multiplier ? (
              <>
                <MoneyField label="Medical bills so far ($)" value={values.medicalBills} onChange={(v) => setField('medicalBills', v)} />
                <MoneyField label="Estimated future medical ($)" value={values.futureMedical} onChange={(v) => setField('futureMedical', v)} />
                <MoneyField label="Lost wages / income ($)" value={values.lostWages} onChange={(v) => setField('lostWages', v)} />
                <SelectField label="How severe is the injury?" value={values.severity} onChange={(v) => setField('severity', v as Severity)} options={presets.severity} />
                <SelectField label="Permanent injury?" value={values.permanent} onChange={(v) => setField('permanent', v)} options={PERMANENT_OPTIONS} />
              </>
            ) : (
              <>
                <MoneyField label="Daily rate for your pain ($)" value={values.dailyRate} onChange={(v) => setField('dailyRate', v)} />
                <NumberField label="Days affected" value={values.recoveryDays} onChange={(v) => setField('recoveryDays', v)} suffix="days" />
              </>
            )}
            <SelectField label="What state did it happen in?" value={values.state} onChange={(v) => setField('state', v)} options={presets.state} />
            <SelectField label="Were you at fault?" value={values.faultLevel} onChange={(v) => setField('faultLevel', v as FaultLevel)} options={presets.faultLevel} />
          </div>

          <p className="mt-4 text-xs leading-5 text-ink-faint">
            {multiplier
              ? 'Multiplier method: your economic damages times a factor set by injury severity (plus 0.5 for a permanent injury).'
              : 'Per diem method: a daily dollar value for your pain, times the number of days you are affected. A common daily rate is your normal daily wage.'}
          </p>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Calculate pain &amp; suffering
          </button>
        </form>
      </section>

      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          {result ? (
            <PsResultCard
              result={result}
              economicDamages={economicDamages}
              dailyRate={toNumber(values.dailyRate)}
              recoveryDays={toNumber(values.recoveryDays)}
              note={negligenceNoteForState(values.state)}
              onDownload={handleDownload}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-6 text-center sm:p-10">
              <p className="text-sm leading-6 text-ink-faint">
                Your pain and suffering estimate will appear here. Fill in your details and
                press Calculate.
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

function MethodTabs({ method, onChange }: { method: PsMethod; onChange: (m: PsMethod) => void }) {
  const tabs: { value: PsMethod; label: string }[] = [
    { value: 'multiplier', label: 'Multiplier' },
    { value: 'perDiem', label: 'Per diem' },
  ]
  return (
    <div className="inline-flex rounded-lg border border-surface-border bg-surface-muted p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={
            'rounded-md px-4 py-1.5 text-sm font-medium transition ' +
            (method === t.value ? 'bg-surface text-ink shadow-card' : 'text-ink-faint hover:text-ink')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

interface PsResultCardProps {
  result: PainSufferingResult
  economicDamages: number
  dailyRate: number
  recoveryDays: number
  note: string
  onDownload: () => void
}

function PsResultCard({ result, economicDamages, dailyRate, recoveryDays, note, onDownload }: PsResultCardProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
        Estimated pain &amp; suffering
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

      <dl className="mt-6 border-t border-surface-border pt-5 text-sm">
        {result.method === 'multiplier' ? (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-faint">Method</dt>
            <dd className="font-semibold text-ink">
              {formatUSD(economicDamages)} x {result.multiplier}
            </dd>
          </div>
        ) : (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-faint">Method</dt>
            <dd className="font-semibold text-ink">
              {formatUSD(dailyRate)}/day x {recoveryDays} days
            </dd>
          </div>
        )}
      </dl>

      {note && (
        <p className="mt-5 border-t border-surface-border pt-5 text-xs leading-5 text-ink-soft">{note}</p>
      )}

      <p className="mt-5 text-xs leading-5 text-ink-faint">
        This is an educational estimate, not legal advice or a guarantee. Actual pain and
        suffering awards depend on evidence, permanence, jurisdiction, and negotiation.
      </p>
    </div>
  )
}
