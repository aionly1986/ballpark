import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Wrongful death is not an injury claim with a bigger multiplier. Its own engine
// values a lost working lifetime the way forensic economists do: net of personal
// consumption and discounted to present value.
export const wrongfulDeath: CalculatorConfig = {
  slug: 'wrongful-death-settlement-calculator',
  targetKeyword: 'wrongful death settlement calculator',
  h1: 'Wrongful Death Settlement Calculator',
  injuryType: 'wrongful death',
  metaTitle: 'Wrongful Death Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate a wrongful death settlement in seconds. Free calculator with present-value lost earnings, household services, punitive damages, your state fault rule, and insurance limits.',
  contentPath: 'wrongful-death',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'wrongfulDeath',
  labels: {
    accidentType: 'Type of incident',
    state: 'What state did it happen in?',
    medicalBills: 'Medical expenses before death ($)',
    futureMedical: 'Future medical ($)',
    lostWages: 'Annual income ($)',
    severity: 'Severity',
    faultLevel: "Deceased's share of fault",
    dateOfAccident: 'Date of death',
    futureLostIncome: 'Lost future income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Funeral and burial costs ($)',
  },
  presets: withSharedPresets([{ value: 'wrongful-death', label: 'Wrongful death' }], US_STATES),
  faqs: [
    {
      question: 'How is a wrongful death settlement calculated?',
      answer:
        'Start with the income the deceased would have earned until retirement, subtract what they would have spent on themselves, and discount that stream to what it is worth today. Add the replacement cost of household services they provided, plus medical and funeral expenses. Then add a non-economic amount for the survivors loss of companionship, reduce for any fault of the deceased, and cap the result at the available insurance coverage.',
    },
    {
      question: 'What is the average wrongful death settlement?',
      answer:
        'There is no reliable single average. One published analysis reports an average near $973,000 but a median near $295,000. That three-to-one gap means a small number of catastrophic verdicts pull the average far above what a typical family recovers, so the median is the better reference point.',
    },
    {
      question: 'Why is my lost income smaller than salary times years?',
      answer:
        'Two reasons, and every honest economist applies both. First, the deceased would have spent part of that income on themselves, so survivors never would have received it. Second, money paid today is worth more than money earned decades from now, so future earnings are discounted to present value. A $60,000 salary over 25 years is not $1,500,000. In this calculator it is closer to $914,000.',
    },
    {
      question: 'Who can file a wrongful death claim?',
      answer:
        'Every state limits it by statute. Most commonly it is the surviving spouse, children, or parents, and in many states the claim must be brought by the personal representative of the estate on their behalf. Siblings and more distant relatives can file in only a minority of states. Check your state statute before assuming you have standing.',
    },
    {
      question: 'Can the deceased being partly at fault reduce or bar the claim?',
      answer:
        'Yes. Most states reduce the recovery by the deceased share of fault. A few contributory-negligence states (Alabama, Maryland, North Carolina, Virginia, and DC) can bar the claim entirely if the deceased was even slightly at fault. The calculator applies your state rule automatically.',
    },
    {
      question: 'What is the difference between wrongful death and a survival action?',
      answer:
        'A wrongful death claim compensates the survivors for what they lost, such as income and companionship. A survival action belongs to the estate and compensates for what the deceased suffered before dying, including their own pain and suffering and medical bills. Many states allow both, and they are calculated separately.',
    },
  ],
}
