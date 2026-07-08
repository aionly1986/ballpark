import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// The hub page. Every future calculator (car accident, slip and fall, etc.) is
// a new file like this one plus a matching content file — no new engine code.
export const personalInjury: CalculatorConfig = {
  slug: 'personal-injury-settlement-calculator',
  targetKeyword: 'personal injury settlement calculator',
  h1: 'Personal Injury Settlement Calculator',
  injuryType: 'personal injury',
  metaTitle: 'Personal Injury Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your personal injury settlement in seconds. Free calculator using medical bills, lost wages, injury severity, and fault to show a low-to-high range.',
  contentPath: 'personal-injury',
  // TODO(operator): confirm wording. Must stay truthful (no fabricated user counts).
  trustBadge: 'Based on the standard settlement formula',
  labels: {
    accidentType: 'What type of accident?',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical costs ($)',
    lostWages: 'Lost wages / income ($)',
    severity: 'How severe is the injury?',
    faultLevel: 'Were you at fault?',
    dateOfAccident: 'Date of the accident',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Property damage, e.g. vehicle ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets(
    [
      { value: 'car', label: 'Car accident' },
      { value: 'truck', label: 'Truck accident' },
      { value: 'motorcycle', label: 'Motorcycle accident' },
      { value: 'slip-fall', label: 'Slip and fall' },
      { value: 'workplace', label: 'Workplace injury' },
      { value: 'medical', label: 'Medical malpractice' },
      { value: 'product', label: 'Defective product' },
      { value: 'dog-bite', label: 'Dog bite' },
      { value: 'other', label: 'Other' },
    ],
    US_STATES,
  ),
  examples: [
    {
      label: 'Minor injury',
      detail: 'Whiplash from a rear-end crash, full recovery, not at fault.',
      medicalBills: 6000,
      futureMedical: 0,
      lostWages: 2000,
      severity: 'minor',
    },
    {
      label: 'Moderate injury',
      detail: 'Broken wrist needing surgery, months of therapy, not at fault.',
      medicalBills: 20000,
      futureMedical: 8000,
      lostWages: 12000,
      severity: 'moderate',
    },
    {
      label: 'Severe injury',
      detail: 'Spinal surgery with lasting impairment, not at fault.',
      medicalBills: 60000,
      futureMedical: 50000,
      lostWages: 30000,
      severity: 'severe',
    },
  ],
  faqs: [
    {
      question: 'How accurate is this settlement calculator?',
      answer:
        'It gives a data-informed estimate range based on the common damages-and-multiplier method insurers use as a starting point. Real settlements depend on evidence, policy limits, jurisdiction, and negotiation, so treat the range as a ballpark, not a promise.',
    },
    {
      question: 'What is the multiplier method?',
      answer:
        'Economic damages (medical bills, future care, and lost wages) are added up, then multiplied by a factor that reflects injury severity to approximate pain and suffering. The two are combined and adjusted for your share of fault.',
    },
    {
      question: 'Does being partly at fault reduce my settlement?',
      answer:
        'Usually yes. Most states apply comparative negligence, reducing your recovery by your percentage of fault. A few states bar recovery entirely if you are 50% or 51% or more at fault.',
    },
    {
      question: 'Are pain and suffering damages taxable?',
      answer:
        'Compensation for physical injury or sickness is generally not taxable under federal law, but punitive damages and interest usually are. Confirm your situation with a tax professional.',
    },
    {
      question: 'How long do I have to file a claim?',
      answer:
        'Each state sets a statute of limitations, commonly one to three years from the accident date. Missing it can bar your claim entirely, so check your state deadline early.',
    },
    {
      question: 'Do I need a lawyer to settle?',
      answer:
        'Not legally. Many people settle small, clear-cut claims on their own by dealing directly with the insurer. For serious injuries or disputed fault, represented claimants often recover more even after fees, so consulting one can be worthwhile.',
    },
  ],
}
