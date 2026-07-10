import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Neck and back (spine) claims are personal injury, but purpose-built: the
// NeckInjuryForm has its own engine where the multiplier is driven by the
// diagnosis, whether surgery happened, the number of disc levels, and
// permanence. No competitor tool models surgery status, yet "settlement without
// surgery" is the highest-volume modifier in this cluster.
export const neckInjury: CalculatorConfig = {
  slug: 'neck-injury-settlement-calculator',
  targetKeyword: 'neck injury settlement calculator',
  h1: 'Neck and Back Injury Settlement Calculator',
  injuryType: 'neck or back injury',
  metaTitle: 'Neck & Back Injury Settlement Calculator: Average Payouts',
  metaDescription:
    'Estimate a neck or back injury settlement in seconds. Free calculator covering herniated discs, whiplash, and spinal stenosis, with and without surgery, plus your state fault rule.',
  contentPath: 'neck-injury',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'neckInjury',
  labels: {
    accidentType: 'Type of accident',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical ($)',
    lostWages: 'Lost wages / income ($)',
    severity: 'What is the diagnosis?',
    faultLevel: 'Were you at fault?',
    dateOfAccident: 'Date of the accident',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets([{ value: 'neck-back', label: 'Neck or back injury' }], US_STATES),
  faqs: [
    {
      question: 'How is a neck or back injury settlement calculated?',
      answer:
        'Add up your economic damages (medical bills, future care, and lost income), then multiply by a factor set by the diagnosis and treatment. A whiplash strain treated with therapy sits near 1.5x, while a herniated disc that needed a fusion can reach 5x or more. Combine the two, then reduce the total by your share of fault under your state rule.',
    },
    {
      question: 'What is the average neck and back injury settlement without surgery?',
      answer:
        'Claims resolved without surgery settle for far less than surgical claims, because surgery is objective, documented, and expensive. Soft-tissue and conservatively treated disc injuries commonly land in the low five figures, while the same disc injury that required a discectomy or fusion frequently reaches six figures. This calculator asks about your treatment for exactly this reason.',
    },
    {
      question: 'How much does surgery increase a settlement?',
      answer:
        'It is the single largest factor in the calculator. Moving from conservative care to injections adds about 0.5 to the multiplier, a discectomy adds about 1.0, a single-level fusion about 1.5, and a multi-level fusion about 2.0. Surgery raises both the medical bills and the pain-and-suffering multiplier applied to them.',
    },
    {
      question: 'Does the spinal level (C4-C5, C5-C6, C6-C7) change the value?',
      answer:
        'The specific level matters far less than what was done about it. Insurers and juries respond to the diagnosis, the treatment, how many levels are involved, and whether the impairment is permanent. That is why this calculator asks for the number of affected levels rather than which vertebrae, since a two-level fusion is worth more than a single-level fusion at any level.',
    },
    {
      question: 'Is there a true average neck and back injury settlement?',
      answer:
        'Not a useful one. One law firm study of 702 published settlements reported an average of about $925,000 but a median of about $316,000. That gap shows the average is pulled up by a handful of catastrophic paralysis cases, so the median is the more honest midpoint, and your own range depends on your diagnosis, treatment, and evidence.',
    },
    {
      question: 'What if my neck injury happened at work?',
      answer:
        'Then it is a workers compensation claim, which is a completely different system: no fault, and no pain and suffering. The estimate here would not apply. Use the workers comp settlement calculator instead, which is built around wage replacement and your permanent impairment rating.',
    },
  ],
}
