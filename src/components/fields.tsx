// Shared, presentational form controls. One source of truth for input styling
// (neutral near-black focus, matching Cal's monochrome UI). Reuse these.

export const CONTROL_BASE =
  'w-full rounded-lg border border-surface-border bg-surface text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10'
export const CONTROL = `${CONTROL_BASE} px-4 py-2.5`

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
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

interface MoneyFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function MoneyField({ label, value, onChange }: MoneyFieldProps) {
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

interface DateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <Field label={label}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL}
      />
    </Field>
  )
}

interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suffix?: string
}

export function NumberField({ label, value, onChange, placeholder, suffix }: NumberFieldProps) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '0'}
          className={`${CONTROL_BASE} py-2.5 pl-4 ${suffix ? 'pr-16' : 'pr-4'}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  )
}

export function toNumber(raw: string): number {
  const n = Number(raw.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}
