import type { Severity, FaultLevel } from './settlement'

// A selectable option rendered as a <select>/radio choice.
export interface SelectPreset<T extends string = string> {
  value: T
  label: string
}

// Human-readable labels for the nine input fields. These compute the estimate
// AND qualify the lead.
export interface InputLabels {
  accidentType: string
  state: string
  medicalBills: string
  futureMedical: string
  lostWages: string
  severity: string
  faultLevel: string
  dateOfAccident: string
  // Advanced-only economic line items.
  futureLostIncome: string
  propertyDamage: string
  otherCosts: string
}

// The presets/options that drive the form's select fields.
export interface InputPresets {
  accidentType: SelectPreset[]
  state: SelectPreset[]
  severity: SelectPreset<Severity>[]
  faultLevel: SelectPreset<FaultLevel>[]
}

// A FAQ entry surfaced on the page and in FAQ schema.
export interface FaqItem {
  question: string
  answer: string
}

/**
 * Everything needed to render one calculator page from data alone. Every future
 * calculator is one new CalculatorConfig plus one content file — no new engine
 * code.
 */
export interface CalculatorConfig {
  /** URL segment, e.g. "personal-injury-settlement-calculator". */
  slug: string
  /** The single search term this page targets. */
  targetKeyword: string
  /** On-page H1. */
  h1: string
  /** Short human label for the injury type, e.g. "personal injury". */
  injuryType: string
  /** <title> tag. */
  metaTitle: string
  /** <meta name="description">. */
  metaDescription: string
  /** Key into the content registry (src/content) for unique page copy. */
  contentPath: string
  /** Optional short trust line shown above the result. Must be truthful. */
  trustBadge?: string
  /**
   * Which number is the hero of the examples panel. 'total' (default) or
   * 'painSuffering'.
   */
  resultEmphasis?: 'total' | 'painSuffering'
  /**
   * Which interactive calculator to render. Each tool is purpose-built:
   * 'settlement' (default) is the settlement/PI form; 'painSuffering' is the
   * dedicated multiplier/per-diem pain-and-suffering form.
   */
  form?: 'settlement' | 'painSuffering' | 'carAccident'
  /** Labels for the nine input fields. */
  labels: InputLabels
  /** Options for the select-style inputs. */
  presets: InputPresets
  /** FAQs rendered on-page and emitted as FAQ schema. */
  faqs: FaqItem[]
}
