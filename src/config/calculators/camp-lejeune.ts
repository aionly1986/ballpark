import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Unlike every other tool here, the Camp Lejeune Elective Option pays a published
// government schedule. The calculator returns the exact figure, and refuses to
// return one at all when an eligibility gate fails.
export const campLejeune: CalculatorConfig = {
  slug: 'camp-lejeune-settlement-calculator',
  targetKeyword: 'camp lejeune settlement calculator',
  h1: 'Camp Lejeune Settlement Calculator',
  injuryType: 'Camp Lejeune',
  metaTitle: 'Camp Lejeune Settlement Calculator: Official Payout Amounts',
  metaDescription:
    'Look up your exact Camp Lejeune Elective Option payout from the official DOJ schedule. Tier 1 and Tier 2 amounts by exposure length, the death benefit, and what you keep after the statutory attorney fee cap.',
  contentPath: 'camp-lejeune',
  form: 'campLejeune',
  labels: {
    accidentType: 'Qualifying injury',
    state: 'State',
    medicalBills: 'Medical bills ($)',
    futureMedical: 'Future medical ($)',
    lostWages: 'Lost wages ($)',
    severity: 'Qualifying injury',
    faultLevel: 'Fault',
    dateOfAccident: 'Date of diagnosis',
    futureLostIncome: 'Future lost income ($)',
    propertyDamage: 'Property damage ($)',
    otherCosts: 'Other costs ($)',
  },
  presets: withSharedPresets([{ value: 'camp-lejeune', label: 'Camp Lejeune water contamination' }], US_STATES),
  faqs: [
    {
      question: 'Can I still file a Camp Lejeune claim?',
      answer:
        'No. The Camp Lejeune Justice Act required an administrative claim to be presented to the Department of the Navy by August 10, 2024, and the Navy no longer accepts new claims. If your claim was filed on time and later denied, you generally have 180 days from the date of that denial to file suit in federal court. Any website suggesting you can still start a new claim is out of date.',
    },
    {
      question: 'How much is the Camp Lejeune Elective Option worth?',
      answer:
        'It is a fixed published amount, not an estimate. For a Tier 1 injury it is $150,000 for 30 to 364 days of exposure, $300,000 for 1 to 5 years, and $450,000 for more than 5 years. For a Tier 2 injury it is $100,000, $250,000, and $400,000 for those same periods. If the qualifying injury caused death, an additional $100,000 is offered, making the maximum Elective Option offer $550,000.',
    },
    {
      question: 'Which illnesses qualify, and what is the difference between Tier 1 and Tier 2?',
      answer:
        'Tier 1 covers kidney cancer, liver cancer, non-Hodgkin lymphoma, leukemias, and bladder cancer, where the ATSDR found sufficient evidence of a causal link. Tier 2 covers multiple myeloma, Parkinson’s disease, kidney disease or end stage renal disease, and systemic sclerosis or scleroderma, where the evidence was found to be at equipoise and above. Kidney disease includes stage 4 and stage 5 chronic kidney disease. Cardiac birth defects are not included in the Elective Option.',
    },
    {
      question: 'What are the eligibility requirements?',
      answer:
        'You must have resided or worked at Camp Lejeune for at least 30 days between August 1, 1953 and December 31, 1987, including exposure in utero. The injury must have been first diagnosed or treated before August 10, 2022. The earliest diagnosis or treatment must be at least 2 years after your first exposure and no more than 35 years after your last exposure. And an administrative claim must have been properly presented to the Navy.',
    },
    {
      question: 'How much can a lawyer charge for a Camp Lejeune case?',
      answer:
        'Less than most people expect. The Department of Justice takes the position that the Federal Tort Claims Act fee cap applies, so a contingency fee cannot exceed 20% on an administrative claim or 25% on a suit filed in court. Those are statutory ceilings. A firm charging 33% or 40% on a Camp Lejeune case is charging more than the government says is permitted.',
    },
    {
      question: 'Will accepting the Elective Option affect my VA benefits?',
      answer:
        'No. Per the official guidance, accepting an Elective Option offer does not affect your VA benefits, and the settlement is not reduced by a VA offset or lien. That is a meaningful advantage over going to trial, where a statutory offset for VA benefits paid would apply to any recovery.',
    },
  ],
}
