import type { ComponentType } from 'react'
import PersonalInjury from './personal-injury.mdx'
import PainAndSuffering from './pain-and-suffering.mdx'

// Maps a config's `contentPath` to its statically-imported MDX component.
// Static imports keep pages fully SSG-friendly. Add one line per new calculator.
export const contentMap: Record<string, ComponentType> = {
  'personal-injury': PersonalInjury,
  'pain-and-suffering': PainAndSuffering,
}

export function getContent(contentPath: string): ComponentType | undefined {
  return contentMap[contentPath]
}
