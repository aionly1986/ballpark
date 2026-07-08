import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Car accidents are personal injury settlements, so the math is the settlement
// engine. What is car-specific: vehicle damage and an insurance policy-limit cap.
export const carAccident: CalculatorConfig = {
  slug: 'car-accident-settlement-calculator',
  targetKeyword: 'car accident settlement calculator',
  h1: 'Car Accident Settlement Calculator',
  injuryType: 'car accident',
  metaTitle: 'Car Accident Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your car accident settlement in seconds. Free calculator using medical bills, lost wages, vehicle damage, injury severity, fault, and the at-fault driver’s policy limit.',
  contentPath: 'car-accident',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'carAccident',
  labels: {
    accidentType: 'What type of accident?',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical ($)',
    lostWages: 'Lost wages / income ($)',
    severity: 'How severe is the injury?',
    faultLevel: 'Were you at fault?',
    dateOfAccident: 'Date of the accident',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Vehicle / property damage ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets(
    [
      { value: 'car', label: 'Car accident' },
      { value: 'truck', label: 'Truck / 18-wheeler' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'rideshare', label: 'Rideshare (Uber / Lyft)' },
      { value: 'pedestrian', label: 'Pedestrian' },
      { value: 'bicycle', label: 'Bicycle' },
      { value: 'other', label: 'Other' },
    ],
    US_STATES,
  ),
  faqs: [
    {
      question: 'How is a car accident settlement calculated?',
      answer:
        'Add up your economic damages (medical bills, future care, lost wages, and vehicle damage), then multiply by a factor of 1.5 to 5 based on how serious the injury is to estimate pain and suffering. Combine the two, reduce for any share of fault, and cap the result at the at-fault driver’s insurance policy limit.',
    },
    {
      question: 'Can my settlement be more than the at-fault driver’s insurance?',
      answer:
        'Usually not directly. A settlement rarely exceeds the at-fault driver’s policy limit, because that is the money available. If your damages are higher, options include the driver’s personal assets, an umbrella policy, or your own underinsured-motorist coverage. This is why entering the policy limit refines the estimate.',
    },
    {
      question: 'Does vehicle damage count toward my settlement?',
      answer:
        'Vehicle repair or replacement is an economic damage, so it adds to the base the multiplier is applied to. It is usually handled as a property-damage claim separate from the injury claim, but it is part of your total losses.',
    },
    {
      question: 'What if I was partly at fault for the crash?',
      answer:
        'Most states apply comparative negligence and reduce your recovery by your share of fault. A few contributory-negligence states can bar recovery entirely if you were even slightly at fault. This calculator applies your state’s rule automatically.',
    },
    {
      question: 'Do truck and rideshare accidents settle higher?',
      answer:
        'Often, because commercial vehicles carry much larger policies (truck coverage can run into the millions, rideshare trips carry $1M) and their crashes tend to cause more serious injuries. Higher available coverage means a higher ceiling on the settlement.',
    },
    {
      question: 'Are car accident settlements taxable?',
      answer:
        'Compensation for physical injury, including the related pain and suffering, is generally not taxable under federal law. Punitive damages and interest usually are. Confirm your situation with a tax professional.',
    },
  ],
}
