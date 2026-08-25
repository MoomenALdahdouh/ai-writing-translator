export {
  DEFAULT_USER_PROFILE,
  hydrateProfile,
  isCorruptedProfile,
  isLiveEnabled,
  isProductActive,
  isShortcutEnabled,
  withLanguages,
  withSwappedLanguages,
} from './normalize.ts'
export { PROFILE_STORAGE_KEY, PROFILE_VERSION, TEMPORARY_PAUSE_MS } from './types.ts'
export type { HydratedProfile, UserProfile } from './types.ts'
