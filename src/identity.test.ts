import { describe, expect, it } from 'vitest'
import { BRAND, PAGE_MARKER, PRODUCT_ID, TRANSLATE_COMMAND, USAGE_PRODUCT_ID } from './brand.ts'
import {
  LICENSE_CACHE_STORAGE_KEY,
  LICENSE_KEY_STORAGE_KEY,
  TRIAL_SYNC_KEY,
  USAGE_STORAGE_KEY,
} from './entitlement/config.ts'
import { PROFILE_STORAGE_KEY } from './profile/types.ts'
import manifest from '../manifest.json' with { type: 'json' }

const FORBIDDEN = [
  'autofix',
  'autofixProfile',
  'autofixUsage',
  'autofixLicenseCache',
  'autofixFirstActivatedAt',
  'wordCacheV2',
  'FIX_CURRENT_TEXT',
  'Layfix',
  'mapLayout',
  'CHECK_WORD',
]

describe('product isolation', () => {
  it('uses lingo identity, not Autofix identity', () => {
    expect(BRAND.id).toBe('lingo')
    expect(BRAND.name).not.toMatch(/layfix|autofix/i)
    expect(PRODUCT_ID).toBe('LINGO')
    expect(USAGE_PRODUCT_ID).toBe('LINGO_USAGE')
    expect(TRANSLATE_COMMAND).toBe('TRANSLATE_CURRENT_TEXT')
    expect(PAGE_MARKER).toBe('lingo')
    expect(manifest.name).toBe('Lingo')
    expect(manifest.commands.TRANSLATE_CURRENT_TEXT).toBeTruthy()
    expect(manifest.commands).not.toHaveProperty('FIX_CURRENT_TEXT')
    expect(manifest.permissions).toEqual(['storage', 'activeTab'])
    expect(manifest.permissions).not.toContain('clipboardWrite')
  })

  it('uses isolated storage keys', () => {
    expect(PROFILE_STORAGE_KEY).toBe('lingoProfile')
    expect(USAGE_STORAGE_KEY).toBe('lingoUsage')
    expect(LICENSE_CACHE_STORAGE_KEY).toBe('lingoLicenseCache')
    expect(LICENSE_KEY_STORAGE_KEY).toBe('lingoLicenseKey')
    expect(TRIAL_SYNC_KEY).toBe('lingoFirstActivatedAt')
    for (const key of [
      PROFILE_STORAGE_KEY,
      USAGE_STORAGE_KEY,
      LICENSE_CACHE_STORAGE_KEY,
      LICENSE_KEY_STORAGE_KEY,
      TRIAL_SYNC_KEY,
    ]) {
      expect(key.startsWith('lingo')).toBe(true)
      expect(key.startsWith('autofix')).toBe(false)
    }
  })

  it('does not register Autofix identifiers in the public contract', () => {
    const blob = JSON.stringify({
      brand: BRAND,
      product: PRODUCT_ID,
      usage: USAGE_PRODUCT_ID,
      command: TRANSLATE_COMMAND,
      profile: PROFILE_STORAGE_KEY,
      usageKey: USAGE_STORAGE_KEY,
      manifest,
    }).toLowerCase()
    for (const item of FORBIDDEN) {
      expect(blob).not.toContain(item.toLowerCase())
    }
  })
})
