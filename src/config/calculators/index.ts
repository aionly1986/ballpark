import type { CalculatorConfig } from '@/lib/types'
import { personalInjury } from './personal-injury'
import { painAndSuffering } from './pain-and-suffering'
import { carAccident } from './car-accident'

// Registry of every calculator. Add one line here when you add a new config.
export const allCalculators: CalculatorConfig[] = [
  personalInjury,
  painAndSuffering,
  carAccident,
]

const bySlug = new Map(allCalculators.map((c) => [c.slug, c]))

export function getCalculatorBySlug(slug: string): CalculatorConfig | undefined {
  return bySlug.get(slug)
}
