import type { FaqItem } from './types'

// JSON-LD builders for rich results. Rendered as <script type="application/ld+json">.

export function faqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function webAppSchema(name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    applicationCategory: 'FinanceApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}
