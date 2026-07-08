import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Pain and suffering is the non-economic component our engine already computes
// (economic damages x severity multiplier). This tool leads with that number.
export const painAndSuffering: CalculatorConfig = {
  slug: 'pain-and-suffering-calculator',
  targetKeyword: 'pain and suffering calculator',
  h1: 'Pain and Suffering Calculator',
  injuryType: 'pain and suffering',
  metaTitle: 'Pain and Suffering Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your pain and suffering settlement in seconds. Free calculator using the multiplier method, your injury severity, medical bills, lost wages, and state fault rules.',
  contentPath: 'pain-and-suffering',
  trustBadge: 'Used to run 3,200+ estimates',
  resultEmphasis: 'painSuffering',
  form: 'painSuffering',
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
      label: 'Whiplash',
      detail: 'Soft-tissue neck injury, full recovery, not at fault.',
      medicalBills: 8000,
      futureMedical: 0,
      lostWages: 2000,
      severity: 'minor',
    },
    {
      label: 'Broken wrist, surgery',
      detail: 'Fracture needing surgery and months of therapy, not at fault.',
      medicalBills: 20000,
      futureMedical: 8000,
      lostWages: 12000,
      severity: 'moderate',
    },
    {
      label: 'Herniated disc, surgery',
      detail: 'Spinal surgery with lasting impairment, not at fault.',
      medicalBills: 60000,
      futureMedical: 50000,
      lostWages: 30000,
      severity: 'severe',
    },
  ],
  faqs: [
    {
      question: 'How is pain and suffering calculated?',
      answer:
        'Two methods are common, and this calculator does both. The multiplier method adds up your economic damages (medical bills, future care, lost wages) and multiplies them by a number, usually 1.5 to 5, based on how severe the injury is. The per diem method assigns a daily dollar amount to your pain and multiplies it by the number of days you are affected. Switch between them with the tabs.',
    },
    {
      question: 'What multiplier should I use?',
      answer:
        'The more serious and lasting the injury, the higher the multiplier. Minor soft-tissue injuries sit near 1.5, moderate injuries around 3, severe injuries needing surgery around 4, and catastrophic, life-altering injuries at 5 or more. Documentation, permanence, and the effect on your daily life all push it up.',
    },
    {
      question: 'What is the average pain and suffering settlement?',
      answer:
        'There is no single average because it depends entirely on the injury. Rough ranges run from a few thousand dollars for minor whiplash to hundreds of thousands or more for surgeries, and into the millions for brain and spinal cord injuries. Treat any average as a loose ballpark, not a target.',
    },
    {
      question: 'Does being partly at fault reduce pain and suffering?',
      answer:
        'Usually yes. Most states apply comparative negligence and reduce your recovery, including pain and suffering, by your share of fault. A few contributory-negligence states can bar recovery entirely if you were even slightly at fault. This calculator applies your state’s rule.',
    },
    {
      question: 'Are pain and suffering damages taxable?',
      answer:
        'Compensation for a physical injury or sickness, including the pain and suffering tied to it, is generally not taxable under federal law. Punitive damages and interest usually are. Confirm your specific situation with a tax professional.',
    },
    {
      question: 'Do I need a lawyer to claim pain and suffering?',
      answer:
        'Not legally. People settle small, clear claims on their own. For serious injuries or disputed fault, represented claimants often recover more even after fees, because pain and suffering is the part insurers fight hardest to minimize.',
    },
  ],
}
