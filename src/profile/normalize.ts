import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  normalizeLanguage,
  swapLanguages,
  type LanguageCode,
} from '../languages.ts'
import { normalizeExcludedDomains } from '../safety/domains.ts'
import type { HydratedProfile, UserProfile } from './types.ts'
import { PROFILE_VERSION } from './types.ts'

export const DEFAULT_USER_PROFILE: UserProfile = {
  enabled: true,
  shortcutEnabled: true,
  liveEnabled: false,
  sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
  targetLanguage: DEFAULT_TARGET_LANGUAGE,
  excludedDomains: [],
  pausedUntil: 0,
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Record<string, unknown>
}

export function isCorruptedProfile(raw: unknown): boolean {
  if (raw == null) return false
  if (typeof raw !== 'object' || Array.isArray(raw)) return true
  const value = raw as Record<string, unknown>
  if ('version' in value && value.version !== PROFILE_VERSION && value.version !== undefined) {
    if (typeof value.version !== 'number') return true
  }
  for (const key of ['enabled', 'shortcutEnabled', 'liveEnabled'] as const) {
    if (key in value && typeof value[key] !== 'boolean' && value[key] !== undefined) {
      return true
    }
  }
  return false
}

export function normalizeUserProfile(raw: unknown): UserProfile {
  if (isCorruptedProfile(raw)) return { ...DEFAULT_USER_PROFILE }
  const value = asRecord(raw)
  if (!value) return { ...DEFAULT_USER_PROFILE }

  const sourceLanguage = normalizeLanguage(value.sourceLanguage, DEFAULT_SOURCE_LANGUAGE)
  let targetLanguage = normalizeLanguage(value.targetLanguage, DEFAULT_TARGET_LANGUAGE)
  if (targetLanguage === sourceLanguage) {
    targetLanguage =
      sourceLanguage === DEFAULT_TARGET_LANGUAGE
        ? DEFAULT_SOURCE_LANGUAGE
        : DEFAULT_TARGET_LANGUAGE
  }

  const pausedUntil =
    typeof value.pausedUntil === 'number' && Number.isFinite(value.pausedUntil)
      ? Math.max(0, value.pausedUntil)
      : 0

  return {
    enabled: value.enabled !== false,
    shortcutEnabled: value.shortcutEnabled !== false,
    liveEnabled: value.liveEnabled === true,
    sourceLanguage,
    targetLanguage,
    excludedDomains: normalizeExcludedDomains(value.excludedDomains),
    pausedUntil,
  }
}

export function isProductActive(
  profile: Pick<UserProfile, 'enabled' | 'pausedUntil'>,
  now = Date.now(),
): boolean {
  return profile.enabled && now >= (profile.pausedUntil || 0)
}

export function isShortcutEnabled(profile: Pick<UserProfile, 'shortcutEnabled'>): boolean {
  return profile.shortcutEnabled !== false
}

export function isLiveEnabled(profile: Pick<UserProfile, 'liveEnabled'>): boolean {
  return profile.liveEnabled === true
}

export function hydrateProfile(current: unknown): HydratedProfile {
  if (current != null && isCorruptedProfile(current)) {
    return { profile: { ...DEFAULT_USER_PROFILE }, recovered: true }
  }
  return { profile: normalizeUserProfile(current), recovered: false }
}

export function withSwappedLanguages(profile: UserProfile): UserProfile {
  const swapped = swapLanguages(profile.sourceLanguage, profile.targetLanguage)
  return normalizeUserProfile({ ...profile, ...swapped })
}

export function withLanguages(
  profile: UserProfile,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
): UserProfile {
  return normalizeUserProfile({ ...profile, sourceLanguage, targetLanguage })
}
