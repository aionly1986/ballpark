import type { SelectPreset, InputPresets } from '@/lib/types'
import type { Severity, FaultLevel } from '@/lib/settlement'

// Severity and fault options map 1:1 to the engine's types. Their labels are
// shared across calculators; accident-type and state options vary per config.

export const SEVERITY_PRESETS: SelectPreset<Severity>[] = [
  { value: 'minor', label: 'Minor (full recovery expected)' },
  { value: 'moderate', label: 'Moderate (lasting effects)' },
  { value: 'severe', label: 'Severe (surgery, long-term)' },
  { value: 'catastrophic', label: 'Catastrophic (permanent)' },
]

export const FAULT_PRESETS: SelectPreset<FaultLevel>[] = [
  { value: 'none', label: 'Not at fault' },
  { value: 'partial', label: 'Partially at fault' },
  { value: 'mostly', label: 'Mostly at fault' },
]

// Convenience: the presets shared by most PI calculators. A config may override
// accidentType/state as needed.
export function withSharedPresets(
  accidentType: SelectPreset[],
  state: SelectPreset[],
): InputPresets {
  return {
    accidentType,
    state,
    severity: SEVERITY_PRESETS,
    faultLevel: FAULT_PRESETS,
  }
}
