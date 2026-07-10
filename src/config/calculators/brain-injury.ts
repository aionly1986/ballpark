import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Brain injury (TBI) claims are personal injury, but purpose-built: the
// BrainInjuryForm has its own engine where the multiplier is driven by TBI
// severity, loss-of-consciousness duration, whether imaging shows objective
// findings, and whether a permanent cognitive deficit is documented. A mild TBI
// (concussion) is the hardest injury class to prove, so the tool is built around
// the objective proof points that actually move an insurer.
export const brainInjury: CalculatorConfig = {
  slug: 'brain-injury-settlement-calculator',
  targetKeyword: 'brain injury settlement calculator',
  h1: 'Brain Injury Settlement Calculator',
  injuryType: 'brain injury',
  metaTitle: 'Brain Injury Settlement Calculator: TBI Payout Estimate',
  metaDescription:
    'Estimate a traumatic brain injury settlement in seconds. Free TBI settlement calculator covering concussion and mild TBI through catastrophic injury, imaging findings, cognitive deficits, and your state fault rule.',
  contentPath: 'brain-injury',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'brainInjury',
  labels: {
    accidentType: 'Type of accident',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical ($)',
    lostWages: 'Lost wages / income ($)',
    severity: 'How severe is the brain injury?',
    faultLevel: 'Were you at fault?',
    dateOfAccident: 'Date of the accident',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Lifetime care costs ($)',
  },
  presets: withSharedPresets([{ value: 'brain-injury', label: 'Brain injury' }], US_STATES),
  faqs: [
    {
      question: 'How is a brain injury settlement calculated?',
      answer:
        'Add up your economic damages (medical bills, future care, lost income, and any lifetime care costs), then multiply by a factor set by how serious the TBI is. A mild concussion sits near 2x, while a catastrophic brain injury with a documented deficit can reach 9x or more. Combine the two, then reduce the total by your share of fault under your state rule. This TBI settlement calculator does that math for you instantly.',
    },
    {
      question: 'What is the average mild TBI or concussion settlement?',
      answer:
        'There is no reliable single average, and a mild TBI is the hardest injury class to value because the symptoms are real but invisible. Concussion and post-concussion claims with clear documentation often land in the mid five to low six figures, while claims with no objective proof settle for much less. What separates the two is imaging findings and formal neuropsychological testing, which is exactly what this calculator asks about.',
    },
    {
      question: 'Why do insurers fight mild TBI claims so hard?',
      answer:
        'Because a mild TBI often does not show up on a standard CT or MRI, and the person can look completely normal. That lets an adjuster argue that nothing serious happened, or that the symptoms are exaggerated. The counter is objective evidence: a positive scan, a documented loss of consciousness, and neuropsychological testing that puts a number on the deficit.',
    },
    {
      question: 'What raises a TBI settlement the most?',
      answer:
        'Objective proof and lasting harm. In this calculator, positive imaging adds to the multiplier, a longer loss of consciousness adds more, and a documented permanent cognitive deficit adds the most of any single factor. For serious injuries, a life-care plan that prices out decades of future care is what pushes catastrophic cases into the millions.',
    },
    {
      question: 'How do lifetime care costs affect a catastrophic brain injury value?',
      answer:
        "They often dominate it. A severe or catastrophic TBI can require attendant care, therapy, and supervision for life, and a life-care plan prices that out over the person's lifetime. Because those costs are economic damages, they both add to the base and get multiplied, which is why catastrophic TBI settlements frequently reach seven or eight figures.",
    },
    {
      question: 'Does my state change my brain injury settlement?',
      answer:
        'Yes. If you were partly at fault, your state comparative-fault rule reduces the settlement, and in a few states any fault can bar recovery entirely. No-fault (PIP) states also gate pain and suffering for injuries that do not cross the state threshold. The calculator applies your state rule automatically once you select it.',
    },
  ],
}
