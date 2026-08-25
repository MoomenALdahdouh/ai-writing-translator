import type { LanguageCode } from '../languages.ts'

export const PROFILE_VERSION = 1
export const PROFILE_STORAGE_KEY = 'lingoProfile'
export const TEMPORARY_PAUSE_MS = 60 * 60 * 1000

export type UserProfile = {
  enabled: boolean
  shortcutEnabled: boolean
  liveEnabled: boolean
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  excludedDomains: string[]
  pausedUntil: number
}

export type HydratedProfile = {
  profile: UserProfile
  recovered: boolean
}
