interface TrustBadgeProps {
  text: string
}

// A small, neutral trust pill. Monochrome to match the design system. Caller
// controls placement/alignment. Text must be truthful.
export default function TrustBadge({ text }: TrustBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-4 py-1.5 text-sm font-medium text-ink-soft shadow-card">
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-ink" aria-hidden="true">
        <path
          d="M10 2.5 3.5 5v4c0 3.5 2.6 6.3 6.5 8 3.9-1.7 6.5-4.5 6.5-8V5L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="m7.5 10 1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </span>
  )
}
