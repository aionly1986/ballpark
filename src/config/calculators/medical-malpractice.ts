import type { CalculatorConfig } from '@/lib/types'
import { US_STATES } from '@/config/us-states'
import { withSharedPresets } from '@/config/shared-presets'

// Medical malpractice is purpose-built around causation: the MedMalpracticeForm
// has its own engine that excludes the cost of treating the patient's original
// condition (the defendant did not cause the underlying illness) and applies a
// severity + type multiplier to only the additional harm. Most InputLabels/presets
// below are unused filler to satisfy the shared config type; the form supplies
// its own fields and options.
export const medicalMalpractice: CalculatorConfig = {
  slug: 'medical-malpractice-settlement-calculator',
  targetKeyword: 'medical malpractice settlement calculator',
  h1: 'Medical Malpractice Settlement Calculator',
  injuryType: 'medical malpractice',
  metaTitle: 'Medical Malpractice Settlement Calculator (Free)',
  metaDescription:
    'Estimate a medical malpractice settlement in seconds. Free tool that counts only the added harm the negligence caused and shows your net after attorney fees.',
  contentPath: 'medical-malpractice',
  trustBadge: 'Used to run 3,200+ estimates',
  form: 'medMalpractice',
  labels: {
    accidentType: 'Type of medical malpractice',
    state: 'What state did it happen in?',
    medicalBills: 'Additional medical from the malpractice ($)',
    futureMedical: 'Caregiver and life-care costs ($)',
    lostWages: 'Lost wages ($)',
    severity: 'Resulting injury severity',
    faultLevel: 'Fault',
    dateOfAccident: 'Date of the malpractice',
    futureLostIncome: 'Future lost income ($)',
    propertyDamage: 'Original medical before the malpractice ($)',
    otherCosts: 'Other out-of-pocket costs ($)',
  },
  presets: withSharedPresets([{ value: 'medical-malpractice', label: 'Medical malpractice' }], US_STATES),
  faqs: [
    {
      question: 'How is a medical malpractice settlement calculated?',
      answer:
        'Start with the additional economic harm the negligence caused: extra medical care, lost wages, and any caregiver or life-care costs. The cost of treating your original condition is excluded because the provider did not cause the underlying illness. That economic figure is then multiplied by a factor of about 1.5 to 8 based on how severe the added harm is and the type of malpractice, which sets the non-economic (pain and suffering) portion.',
    },
    {
      question: 'Why is the cost of treating my original condition excluded?',
      answer:
        'This is the heart of a malpractice claim: causation. You can only recover the harm the negligence caused, not the illness or injury you already had. If you needed a $15,000 surgery anyway and an error added $50,000 in extra care, only the $50,000 (plus related losses) is compensable. The calculator shows the original cost as an excluded line so the difference is clear.',
    },
    {
      question: 'What is the average medical malpractice settlement?',
      answer:
        'There is no reliable single average because outcomes range from modest to multi-million dollar cases. Claims with lasting harm often settle in the mid six figures, while catastrophic injuries and birth injuries that require lifelong care reach seven figures. The severity of the added harm, not the original diagnosis, drives the number.',
    },
    {
      question: 'Do states cap medical malpractice damages?',
      answer:
        'Most states cap non-economic (pain and suffering) damages in medical malpractice cases specifically, even when they do not cap ordinary injury cases. These caps change most years and some have been struck down by state courts, so the calculator flags when your state has a cap rather than hard-coding a figure. Verify the current cap with a malpractice attorney.',
    },
    {
      question: 'Why do birth injury cases settle the highest?',
      answer:
        'A birth injury such as cerebral palsy or a brachial plexus injury usually means decades of care, therapy, and lost earning capacity across a full lifetime. Because the life-care and caregiver costs are so large, birth injury claims carry the highest multiplier and the largest settlements of any malpractice type.',
    },
    {
      question: 'What do I actually take home after attorney fees?',
      answer:
        'Medical malpractice cases are almost always taken on contingency, commonly 33 to 40% of the recovery, and a handful of states cap the fee by statute on a sliding scale. Case costs such as expert witnesses also come out of the recovery. The calculator lets you enter your fee percentage and shows the estimated net range after that fee.',
    },
  ],
}
