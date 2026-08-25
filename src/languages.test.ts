import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  swapLanguages,
} from './languages.ts'
import { DEFAULT_USER_PROFILE } from './profile/index.ts'
import { normalizeUserProfile, withSwappedLanguages } from './profile/normalize.ts'

describe('language registry', () => {
  it('exposes the MVP set and rejects unknown codes', () => {
    const codes = SUPPORTED_LANGUAGES.map((item) => item.code)
    expect(codes).toEqual(['en', 'ar', 'tr', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'zh', 'ja', 'ko'])
    expect(isSupportedLanguage('ar')).toBe(true)
    expect(isSupportedLanguage('xx')).toBe(false)
    expect(DEFAULT_SOURCE_LANGUAGE).toBe('ar')
    expect(DEFAULT_TARGET_LANGUAGE).toBe('en')
  })

  it('swaps source and target', () => {
    expect(swapLanguages('ar', 'en')).toEqual({ sourceLanguage: 'en', targetLanguage: 'ar' })
    const swapped = withSwappedLanguages(DEFAULT_USER_PROFILE)
    expect(swapped.sourceLanguage).toBe('en')
    expect(swapped.targetLanguage).toBe('ar')
  })

  it('recovers a corrupted profile without inheriting Autofix layout fields', () => {
    const profile = normalizeUserProfile({
      enabled: 'yes',
      sourceLayout: 'en-US-qwerty',
      enabledLayouts: ['ar-101'],
    })
    expect(profile.sourceLanguage).toBe('ar')
    expect(profile.targetLanguage).toBe('en')
    expect(profile.liveEnabled).toBe(false)
    expect(profile.shortcutEnabled).toBe(true)
    expect(profile).not.toHaveProperty('sourceLayout')
  })
})
