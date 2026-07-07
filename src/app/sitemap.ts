import type { MetadataRoute } from 'next'
import { allCalculators } from '@/config/calculators'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ballpark.pages.dev'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    ...allCalculators.map((c) => ({
      url: `${BASE}/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
