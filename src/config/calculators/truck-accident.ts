import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Truck accidents reuse the tested settlement engine. Purpose-built part: the
// TruckAccidentForm caps the estimate at a commercial policy ceiling set by the
// carrier type (far larger than a personal auto policy).
export const truckAccident: CalculatorConfig = {
  slug: 'truck-accident-settlement-calculator',
  targetKeyword: 'truck accident settlement calculator',
  h1: 'Truck Accident Settlement Calculator',
  injuryType: 'truck accident',
  metaTitle: 'Truck Accident Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your truck accident settlement in seconds. Free calculator using medical bills, lost wages, injury severity, fault, and the trucking company commercial policy limit.',
  contentPath: 'truck-accident',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'truckAccident',
  labels: {
    accidentType: 'Type of truck / carrier',
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
  presets: withSharedPresets([{ value: 'truck', label: 'Truck / 18-wheeler' }], US_STATES),
  faqs: [
    {
      question: 'How is a truck accident settlement calculated?',
      answer:
        'Add up your economic damages (medical bills, future care, lost wages, and vehicle damage), multiply by a factor of 1.5 to 5 based on injury severity to estimate pain and suffering, reduce for any share of fault, and cap the result at the available commercial coverage. Truck cases often settle higher than car cases because the policies are much larger.',
    },
    {
      question: 'Why are truck accident settlements larger than car accidents?',
      answer:
        'Two reasons. Commercial trucks carry far more insurance: the FMCSA sets a $750,000 federal minimum for most interstate carriers, $1,000,000 is common, and hazmat loads can require $5,000,000. And truck crashes tend to cause more serious injuries. More available coverage plus more serious injuries means a higher ceiling.',
    },
    {
      question: 'Who can be held liable in a truck accident?',
      answer:
        'Often more than one party: the driver, the motor carrier (trucking company), a leasing company, the broker, or the company that loaded the cargo. Each can carry its own insurance, which stacks the coverage available to pay your claim. That is a key difference from a two-car crash.',
    },
    {
      question: 'What is the FMCSA minimum insurance for a truck?',
      answer:
        'For most interstate freight carriers the federal minimum is $750,000 in liability coverage. Many carry $1,000,000 or more, and trucks hauling hazardous materials can be required to carry $5,000,000. The calculator uses the carrier type to set a typical ceiling.',
    },
    {
      question: 'What if I was partly at fault for the crash?',
      answer:
        'Most states apply comparative negligence and reduce your recovery by your share of fault. A few contributory-negligence states can bar recovery entirely if you were even slightly at fault. The calculator applies your state rule automatically.',
    },
  ],
}
