import type { ComponentType } from 'react'
import PersonalInjury from './personal-injury.mdx'
import PainAndSuffering from './pain-and-suffering.mdx'
import CarAccident from './car-accident.mdx'
import DogBite from './dog-bite.mdx'
import TruckAccident from './truck-accident.mdx'
import WorkersComp from './workers-comp.mdx'
import NeckInjury from './neck-injury.mdx'
import WrongfulDeath from './wrongful-death.mdx'
import HerniatedDisc from './herniated-disc.mdx'
import MedicalMalpractice from './medical-malpractice.mdx'
import BrainInjury from './brain-injury.mdx'
import CampLejeune from './camp-lejeune.mdx'

// Maps a config's `contentPath` to its statically-imported MDX component.
// Static imports keep pages fully SSG-friendly. Add one line per new calculator.
export const contentMap: Record<string, ComponentType> = {
  'personal-injury': PersonalInjury,
  'pain-and-suffering': PainAndSuffering,
  'car-accident': CarAccident,
  'dog-bite': DogBite,
  'truck-accident': TruckAccident,
  'workers-comp': WorkersComp,
  'neck-injury': NeckInjury,
  'wrongful-death': WrongfulDeath,
  'herniated-disc': HerniatedDisc,
  'medical-malpractice': MedicalMalpractice,
  'brain-injury': BrainInjury,
  'camp-lejeune': CampLejeune,
}

export function getContent(contentPath: string): ComponentType | undefined {
  return contentMap[contentPath]
}
