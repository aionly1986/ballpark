import type { CalculatorConfig } from '@/lib/types'
import { personalInjury } from './personal-injury'
import { painAndSuffering } from './pain-and-suffering'
import { carAccident } from './car-accident'
import { dogBite } from './dog-bite'
import { truckAccident } from './truck-accident'
import { workersComp } from './workers-comp'
import { neckInjury } from './neck-injury'
import { wrongfulDeath } from './wrongful-death'

// Registry of every calculator. Add one line here when you add a new config.
export const allCalculators: CalculatorConfig[] = [
  personalInjury,
  painAndSuffering,
  carAccident,
  dogBite,
  truckAccident,
  workersComp,
  neckInjury,
  wrongfulDeath,
]

const bySlug = new Map(allCalculators.map((c) => [c.slug, c]))

export function getCalculatorBySlug(slug: string): CalculatorConfig | undefined {
  return bySlug.get(slug)
}
