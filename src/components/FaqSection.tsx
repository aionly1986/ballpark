import type { FaqItem } from '@/lib/types'

interface FaqSectionProps {
  faqs: FaqItem[]
}

// Renders on-page FAQs. Pairs with faqSchema() emitted in the page head.
export default function FaqSection({ faqs }: FaqSectionProps) {
  if (!faqs.length) return null
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface">
        {faqs.map((f) => (
          <details key={f.question} className="group px-6 py-4">
            <summary className="cursor-pointer list-none font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.question}
            </summary>
            <p className="mt-2 leading-7 text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
