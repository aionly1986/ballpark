import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Disc-specific spoke of the neck-and-back calculator. It reuses the same tested
// engine (calculateNeckInjury) narrowed to bulging and herniated discs, and owns
// the disc keywords so the two pages never compete: bulging vs herniated, the
// number of discs, discectomy vs fusion, and the spinal levels.
export const herniatedDisc: CalculatorConfig = {
  slug: 'herniated-disc-settlement-calculator',
  targetKeyword: 'herniated disc settlement calculator',
  h1: 'Herniated Disc Settlement Calculator',
  injuryType: 'herniated disc',
  metaTitle: 'Herniated Disc Settlement Calculator: With and Without Surgery',
  metaDescription:
    'Estimate a herniated or bulging disc settlement in seconds. Free calculator covering one, two, or three discs, discectomy versus fusion, and claims settled without surgery.',
  contentPath: 'herniated-disc',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'herniatedDisc',
  labels: {
    accidentType: 'Type of accident',
    state: 'What state did it happen in?',
    medicalBills: 'Medical bills so far ($)',
    futureMedical: 'Estimated future medical ($)',
    lostWages: 'Lost wages / income ($)',
    severity: 'Bulging or herniated disc?',
    faultLevel: 'Were you at fault?',
    dateOfAccident: 'Date of the accident',
    futureLostIncome: 'Estimated future lost income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets([{ value: 'herniated-disc', label: 'Herniated disc' }], US_STATES),
  faqs: [
    {
      question: 'How much is a herniated disc settlement worth?',
      answer:
        'Add up your economic damages (medical bills, future care, and lost income), then multiply by a factor that starts at 3 for a herniated disc and rises with treatment. Conservative care adds nothing, injections add about 0.5, a discectomy about 1.0, a single-level fusion about 1.5, and a multi-level fusion about 2.0. A second disc adds another 0.5. With $20,000 in economic damages and no surgery, that points to roughly $60,000 to $100,000.',
    },
    {
      question: 'How much is a 2 herniated disc settlement?',
      answer:
        'A second affected disc adds about 0.5 to the multiplier, and a third adds 0.75. On $20,000 in economic damages, one herniated disc treated without surgery estimates near $60,000 to $100,000, while two discs move that to roughly $67,500 to $112,500. Two discs that required a fusion move much higher, because the surgery itself is the larger driver.',
    },
    {
      question: 'What is a herniated disc settlement without surgery?',
      answer:
        'Meaningfully less than a surgical claim, because an insurer prices what the records show. A disc treated with physical therapy, chiropractic care, and medication carries the base multiplier with no surgical bump. That is not a judgment about your pain, it is a reflection of what is documented and objectively verifiable.',
    },
    {
      question: 'Is a bulging disc worth less than a herniated disc?',
      answer:
        'Generally yes. A bulging disc is contained and carries a base multiplier near 2.5, while a herniated (ruptured) disc carries about 3.0. But treatment matters far more than the label: a bulging disc that required a fusion is worth more than a herniated disc treated with therapy alone.',
    },
    {
      question: 'Does the spinal level (C4-C5, C5-C6, C6-C7, L4-L5, L5-S1) change the value?',
      answer:
        'Far less than people expect. Insurers and juries respond to the diagnosis, how many discs are involved, what treatment was needed, and whether the impairment is permanent. That is why this calculator asks how many discs are affected rather than which vertebrae. A two-disc fusion is worth more than a single-disc fusion at any level.',
    },
    {
      question: 'How does my state affect a disc settlement?',
      answer:
        'Most states reduce your recovery by your share of fault. A few contributory-negligence states can bar recovery entirely if you were even slightly at fault. Several no-fault states also bar pain and suffering for an injury that does not cross the state threshold. The calculator applies your state rule automatically.',
    },
  ],
}
