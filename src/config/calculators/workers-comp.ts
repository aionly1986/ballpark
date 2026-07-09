import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Workers' comp is fundamentally different: no fault, no pain and suffering. The
// WorkersCompForm has its own engine (wage replacement + permanent disability +
// medical). Most InputLabels/presets below are unused filler to satisfy the
// shared config type; the form supplies its own fields.
export const workersComp: CalculatorConfig = {
  slug: 'workers-comp-settlement-calculator',
  targetKeyword: 'workers comp settlement calculator',
  h1: 'Workers Comp Settlement Calculator',
  injuryType: 'workers comp',
  metaTitle: 'Workers Comp Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your workers comp settlement in seconds. Free calculator using your weekly wage, weeks out of work, permanent impairment rating, and medical costs. No fault, no pain and suffering.',
  contentPath: 'workers-comp',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'workersComp',
  labels: {
    accidentType: 'Type of injury',
    state: 'What state are you in?',
    medicalBills: 'Total medical expenses ($)',
    futureMedical: 'Future medical to buy out ($)',
    lostWages: 'Pre-injury weekly wage ($)',
    severity: 'Injury severity',
    faultLevel: 'Fault',
    dateOfAccident: 'Date of the injury',
    futureLostIncome: 'Future lost income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Other costs ($)',
  },
  presets: withSharedPresets([{ value: 'workplace', label: 'Workplace injury' }], US_STATES),
  faqs: [
    {
      question: 'How is a workers comp settlement calculated?',
      answer:
        'Workers comp is no-fault and has no pain and suffering. The settlement is built from wage-replacement benefits (about two-thirds of your average weekly wage for the time you are out of work), a permanent-disability award based on your impairment rating, and any future medical the settlement buys out. Every state sets its own rates and caps.',
    },
    {
      question: 'Does workers comp pay for pain and suffering?',
      answer:
        'No. Unlike a personal injury claim, workers comp does not pay anything for pain and suffering or emotional distress. In exchange for that trade-off, you receive benefits regardless of who was at fault for the injury. This is why a workers comp estimate looks very different from a car or dog-bite estimate.',
    },
    {
      question: 'What is the two-thirds rule?',
      answer:
        'While you are unable to work, most states pay a weekly benefit equal to about two-thirds (66.7%) of your average weekly wage before the injury, up to a state maximum that changes each year. If you earned $900 a week, the benefit is roughly $600 a week, subject to your state cap.',
    },
    {
      question: 'What is an impairment rating and how does it affect my settlement?',
      answer:
        'After you reach maximum medical improvement, a doctor assigns a permanent impairment rating, a percentage that reflects lasting loss of function. That percentage is multiplied by a set number of weeks of benefits under your state schedule to produce the permanent-disability portion of the settlement. A higher rating means a larger award.',
    },
    {
      question: 'Why does my state matter so much?',
      answer:
        'Benefit rates, weekly maximums, and the disability schedules that turn an impairment rating into dollars are all set by state statute and change annually. This calculator uses common national figures for a rough estimate, so treat the range as a starting point and confirm your state numbers with a workers comp attorney.',
    },
  ],
}
