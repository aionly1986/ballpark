import Link from 'next/link'
import { allCalculators } from '@/config/calculators'

// Hub index. Interlinks to every calculator (hub-and-spoke for SEO).
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-content">
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Free settlement calculators
        </h1>
        <p className="mt-3 text-lg leading-8 text-ink-soft">
          Instant, private estimates for personal injury claims. Pick a calculator to see
          a low-to-high range in seconds.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {allCalculators.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${c.slug}`}
              className="block rounded-2xl border border-surface-border bg-surface p-6 shadow-card transition hover:border-ink/30"
            >
              <span className="text-lg font-semibold text-ink">{c.h1}</span>
              <span className="mt-1 block text-sm text-ink-soft">
                {c.metaDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
