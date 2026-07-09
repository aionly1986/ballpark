import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Dog-bite claims are personal injury, but purpose-built: the DogBiteForm has its
// own engine (severity plus scarring / facial / child premiums) and a liability
// factor from the state's dog-bite rule and provocation / trespassing defenses.
export const dogBite: CalculatorConfig = {
  slug: 'dog-bite-settlement-calculator',
  targetKeyword: 'dog bite settlement calculator',
  h1: 'Dog Bite Settlement Calculator',
  injuryType: 'dog bite',
  metaTitle: 'Dog Bite Settlement Calculator: Free Estimate Range',
  metaDescription:
    'Estimate your dog bite settlement in seconds. Free calculator using medical bills, scarring, facial injury, child victim, your state dog-bite rule, and provocation.',
  contentPath: 'dog-bite',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'dogBite',
  labels: {
    accidentType: 'Type of incident',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical ($)',
    lostWages: 'Lost earnings ($)',
    severity: 'How severe was the bite?',
    faultLevel: 'Did you provoke the dog?',
    dateOfAccident: 'Date of the bite',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Damaged personal items ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets([{ value: 'dog-bite', label: 'Dog bite' }], US_STATES),
  faqs: [
    {
      question: 'How is a dog bite settlement calculated?',
      answer:
        'Add up your economic damages (medical bills, future care, and lost earnings), then multiply by a factor of about 1.5 to 8 based on severity and aggravating factors like facial injury, permanent scarring, or a child victim. The result is then adjusted for liability: whether your state uses strict liability or the one-bite rule, and whether provocation or trespassing applies.',
    },
    {
      question: 'What is the average dog bite settlement?',
      answer:
        'There is no true average because the injury drives everything. Minor bites often settle in the low five figures, while cases with surgery, permanent facial scarring, or a young child can reach six figures or more. Homeowner or renter insurance usually pays, and those policies commonly carry $100,000 to $300,000 in coverage.',
    },
    {
      question: 'Does my state change the settlement?',
      answer:
        'Yes. Most states impose strict liability, meaning the owner is responsible even without any prior history. A minority follow the one-bite rule, where you generally must show the owner knew the dog was dangerous or broke a leash or fencing law. The calculator applies your state rule and flags that dog-bite statutes vary.',
    },
    {
      question: 'What if I provoked the dog or was trespassing?',
      answer:
        'Both are common defenses that reduce a claim. Provoking or teasing the dog, or being somewhere you were not allowed to be, can significantly lower the value and, in some states, defeat the claim entirely. The calculator lowers the estimate when either applies.',
    },
    {
      question: 'Who pays a dog bite claim?',
      answer:
        "It is usually the dog owner's homeowner or renter insurance, not the owner personally. If there is no policy, recovery comes from the owner's personal assets, which is often harder to collect.",
    },
  ],
}
