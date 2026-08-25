import { describe, expect, it } from 'vitest'
import {
  LICENSE_CACHE_TTL_MS,
  REFILL_AMOUNT_MS,
  REFILL_INTERVAL_MS,
  TRIAL_DURATION_MS,
  USAGE_STORAGE_KEY,
  LICENSE_CACHE_STORAGE_KEY,
  TRIAL_SYNC_KEY,
} from './config.ts'
import { createEntitlementEngine } from './engine.ts'
import { createMemoryEntitlementStore } from './memoryStore.ts'
import {
  applyRefills,
  createInitialUsageState,
  isInTrial,
  resolveEntitlement,
} from './usage.ts'

const DAY = 24 * 60 * 60 * 1000

function clock(start = 1_700_000_000_000) {
  let now = start
  return {
    now: () => now,
    add: (ms: number) => {
      now += ms
    },
    origin: start,
  }
}

describe('lingo usage isolation', () => {
  it('uses lingo storage keys, not Autofix keys', () => {
    expect(USAGE_STORAGE_KEY).toBe('lingoUsage')
    expect(LICENSE_CACHE_STORAGE_KEY).toBe('lingoLicenseCache')
    expect(TRIAL_SYNC_KEY).toBe('lingoFirstActivatedAt')
  })
})

describe('trial and free allowance', () => {
  it('starts a new install in trial', async () => {
    const time = clock()
    const api = createEntitlementEngine({
      now: time.now,
      isOnline: () => true,
      store: createMemoryEntitlementStore(),
    })
    const view = await api.ensureActivated()
    expect(view.state).toBe('TRIAL')
    expect(view.canIntervene).toBe(true)
    expect(isInTrial(createInitialUsageState(time.origin), time.origin + DAY)).toBe(true)
    expect(isInTrial(createInitialUsageState(time.origin), time.origin + TRIAL_DURATION_MS)).toBe(
      false,
    )
  })

  it('denies free usage after the balance is consumed', async () => {
    const time = clock()
    const expiredTrial = time.origin - TRIAL_DURATION_MS - 1
    const api = createEntitlementEngine({
      now: time.now,
      isOnline: () => true,
      store: createMemoryEntitlementStore({
        usage: {
          ...createInitialUsageState(expiredTrial),
          usageBalanceMs: 0,
          lastRefillAt: time.origin,
        },
        trialAnchor: expiredTrial,
      }),
    })
    const view = await api.snapshot()
    expect(view.state).toBe('FREE')
    expect(view.decision).toBe('DENY')
    expect(view.limitReached).toBe(true)
  })

  it('refills free balance on the configured interval', () => {
    const now = 1_700_000_000_000
    const state = {
      ...createInitialUsageState(now),
      usageBalanceMs: 0,
      lastRefillAt: now,
    }
    const refilled = applyRefills(state, now + REFILL_INTERVAL_MS)
    expect(refilled.usageBalanceMs).toBe(REFILL_AMOUNT_MS)
  })

  it('treats a verified license as Pro', () => {
    const now = 1_700_000_000_000
    const snapshot = resolveEntitlement(
      createInitialUsageState(now),
      { valid: true, status: 'active', verifiedAt: now },
      now + 1_000,
      true,
    )
    expect(snapshot.state).toBe('PRO')
    expect(snapshot.decision).toBe('ALLOW')
    expect(LICENSE_CACHE_TTL_MS).toBeGreaterThan(0)
  })
})
