'use client'

import { useState } from 'react'

// The estimate context we attach to the lead so it arrives pre-qualified.
export interface LeadContext {
  slug: string
  accidentType: string
  state: string
  severity: string
  faultLevel: string
  hasLawyer: string
  estimateLow: number
  estimateHigh: number
}

interface LeadCaptureFormProps {
  context: LeadContext
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

// TODO(operator): replace with lawyer-reviewed TCPA consent wording before launch.
const CONSENT_TEXT =
  'By checking this box I agree to be contacted by a partner law firm about my ' +
  'potential claim, including by phone, text, and email. [TODO: replace with ' +
  'lawyer-reviewed TCPA consent language.]'

export default function LeadCaptureForm({ context }: LeadCaptureFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    if (!data.get('consent')) {
      setError('Please check the consent box so an attorney can contact you.')
      return
    }

    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          consent: true,
          context,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-card sm:p-8">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <h3 className="mt-3 text-xl font-semibold text-ink">You&apos;re all set</h3>
        <p className="mt-2 text-ink-soft">
          A local attorney will review your details and reach out shortly with a free,
          no-obligation assessment.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card sm:p-8">
      <h3 className="text-xl font-semibold tracking-tight text-ink">
        Get a free attorney review of your estimate
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        A licensed attorney in your state can tell you what your claim may actually be
        worth, free and with no obligation.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field name="name" label="Full name" type="text" autoComplete="name" required />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="phone" label="Phone" type="tel" autoComplete="tel" required />

        <label className="flex items-start gap-3 text-xs leading-5 text-ink-soft">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-accent"
          />
          <span>{CONSENT_TEXT}</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Get my free review'}
        </button>
      </form>
    </div>
  )
}

interface FieldProps {
  name: string
  label: string
  type: string
  autoComplete?: string
  required?: boolean
}

function Field({ name, label, type, autoComplete, required }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}
