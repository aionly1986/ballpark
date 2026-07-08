import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allCalculators, getCalculatorBySlug } from '@/config/calculators'
import { getContent } from '@/content'
import { faqSchema, webAppSchema } from '@/lib/schema'
import CalculatorForm from '@/components/CalculatorForm'
import PainSufferingForm from '@/components/PainSufferingForm'
import ExampleEstimates from '@/components/ExampleEstimates'
import FaqSection from '@/components/FaqSection'
import TrustBadge from '@/components/TrustBadge'

interface PageProps {
  params: Promise<{ calculator: string }>
}

// Pre-render every calculator at build time (SSG) so crawlers get clean HTML.
export function generateStaticParams() {
  return allCalculators.map((c) => ({ calculator: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { calculator } = await params
  const config = getCalculatorBySlug(calculator)
  if (!config) return {}
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: { canonical: `/${config.slug}` },
  }
}

export default async function CalculatorPage({ params }: PageProps) {
  const { calculator } = await params
  const config = getCalculatorBySlug(calculator)
  if (!config) notFound()

  const Content = getContent(config.contentPath)
  const jsonLd = [
    webAppSchema(config.h1, config.metaDescription),
    faqSchema(config.faqs),
  ]

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8 max-w-content">
        {config.trustBadge && (
          <div className="mb-4">
            <TrustBadge text={config.trustBadge} />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {config.h1}
        </h1>
        <p className="mt-3 text-lg leading-8 text-ink-soft">
          Estimate a {config.injuryType} settlement in seconds. Enter your numbers below
          for an instant low-to-high range.
        </p>
      </div>

      {config.form === 'painSuffering' ? (
        <PainSufferingForm config={config} />
      ) : (
        <CalculatorForm config={config} />
      )}

      <ExampleEstimates examples={config.examples} emphasis={config.resultEmphasis} />

      {Content && (
        <article className="mt-14 max-w-content">
          <Content />
        </article>
      )}

      <div className="max-w-content">
        <FaqSection faqs={config.faqs} />
      </div>
    </div>
  )
}
