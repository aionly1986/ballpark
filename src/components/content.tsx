import type { ReactNode } from 'react'

// Reusable content components for the guide sections below each tool. Low-key
// colorful: navy + indigo + soft tints, color-coded for skimmability. Used from
// MDX (registered in mdx-components.tsx).

// Shared prose reset so markdown nested inside a box looks compact and on-brand.
const PROSE =
  '[&>p]:m-0 [&>p+p]:mt-2 text-sm leading-6 text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2'

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v4.5M10 6.6h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M10 2.5 18.5 17H1.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v3.5M10 14.2h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// A color-coded callout box. variant 'info' (indigo) or 'warn' (amber).
export function Callout({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'warn'
  title: string
  children: ReactNode
}) {
  const s =
    variant === 'warn'
      ? { box: 'border-amber-200 bg-amber-50', head: 'text-amber-700' }
      : { box: 'border-accent/20 bg-accent-soft', head: 'text-accent-ink' }
  return (
    <div className={`my-6 rounded-xl border p-5 ${s.box}`}>
      <p className={`flex items-center gap-2 text-sm font-semibold ${s.head}`}>
        {variant === 'warn' ? <WarnIcon /> : <InfoIcon />}
        {title}
      </p>
      <div className={`mt-2 ${PROSE}`}>{children}</div>
    </div>
  )
}

// A soft tinted panel with an optional title (feature boxes, key summaries).
export function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-surface-border bg-surface-muted p-5">
      {title && <p className="mb-2 text-sm font-semibold text-brand-navy">{title}</p>}
      <div className={PROSE}>{children}</div>
    </div>
  )
}

// A formula box: a monospace formula plus an example line. `formula` is a plain
// string prop (not children) so MDX does not wrap it in a paragraph.
export function Formula({ formula, example }: { formula: string; example?: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-accent/20 bg-accent-soft p-5">
      <p className="font-mono text-sm font-semibold text-accent-ink sm:text-base">{formula}</p>
      {example && <p className="mt-2 text-sm text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">{example}</p>}
    </div>
  )
}

// A numbered step with an indigo circle badge.
export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="mt-5 flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-navy">{title}</p>
        <div className={`mt-1 ${PROSE}`}>{children}</div>
      </div>
    </div>
  )
}

// A worked-example card with an optional method badge.
export function Example({ title, badge, children }: { title: string; badge?: string; children: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-surface-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-brand-navy">{title}</p>
        {badge && (
          <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink">
            {badge}
          </span>
        )}
      </div>
      <div className={`mt-2 ${PROSE}`}>{children}</div>
    </div>
  )
}
